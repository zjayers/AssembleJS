/**
 * Enhanced Task Execution Service
 * Service for executing tasks with real code operations
 */

const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const aiService = require('./aiService');
const filesystemService = require('./filesystemService');
const gitService = require('./gitService');
const codeAnalyzerService = require('./codeAnalyzerService');
const fileDB = require('../models/fileDB');
const tasksDB = require('../models/tasksDB');
const analytics = require('../models/analytics');
const { createError } = require('../utils/errorUtils');

/**
 * Enhanced Task Execution Service
 * Advanced task execution pipeline that performs real file operations
 */
class EnhancedTaskExecutionService {
  constructor() {
    // Repository root
    this.repositoryRoot = process.env.REPOSITORY_ROOT || 
      path.resolve(__dirname, '../../../');
      
    // Running tasks map
    this.runningTasks = new Map();
    
    // Flag to track initialization
    this.initialized = false;
    
    // Load agent configurations (reuse from existing task execution service)
    this.agentConfigs = require('./taskExecutionService').getAgentConfigs 
      ? require('./taskExecutionService').getAgentConfigs()
      : require('./taskExecutionService').AGENT_CONFIG;
      
    // Define agent colors (reuse from existing task execution service)
    this.agentColors = require('./taskExecutionService').getAgentColors
      ? require('./taskExecutionService').getAgentColors()
      : require('./taskExecutionService').AGENT_COLORS;
    
    console.log('Enhanced Task Execution Service initializing');
  }

  /**
   * Get all agent configurations
   * @returns {Object} Agent configurations
   */
  getAgentConfigs() {
    return this.agentConfigs;
  }

  /**
   * Get agent colors
   * @returns {Object} Agent colors
   */
  getAgentColors() {
    return this.agentColors;
  }

  /**
   * Get color for a specific agent
   * @param {string} agentName - Name of the agent
   * @returns {string} Color hex code
   */
  getAgentColor(agentName) {
    return this.agentColors[agentName] || '#000000';
  }

  /**
   * Initialize the service
   * @returns {Promise<boolean>} Success or failure
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }
    
    try {
      // Initialize file system service
      await filesystemService.initialize();
      
      // Initialize git service
      await gitService.initialize();
      
      // Track initialization in analytics
      await analytics.trackEvent(analytics.EVENT_TYPES.SYSTEM_STATUS, {
        system: "EnhancedTaskExecutionService",
        action: "initialization",
        status: "success",
        timestamp: new Date().toISOString(),
      });
      
      this.initialized = true;
      console.log('Enhanced Task Execution Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize EnhancedTaskExecutionService:', error);
      
      // Track error in analytics
      await analytics.trackEvent(analytics.EVENT_TYPES.SYSTEM_ERROR, {
        system: "EnhancedTaskExecutionService",
        action: "initialization",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      
      return false;
    }
  }

  /**
   * Start a task execution
   * @param {string} taskId - ID of the task to execute
   * @returns {Promise<boolean>} Success or failure
   */
  async startTaskExecution(taskId) {
    // Ensure the service is initialized
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Check if task exists
    const task = await tasksDB.getTaskById(taskId);
    if (!task) {
      throw createError(`Task ${taskId} not found`, 'NOT_FOUND');
    }
    
    // Check if task is already running
    if (this.runningTasks.has(taskId)) {
      throw createError(`Task ${taskId} is already running`, 'TASK_RUNNING');
    }
    
    // Add task to running tasks
    this.runningTasks.set(taskId, {
      status: 'running',
      startTime: Date.now(),
      steps: [],
    });
    
    // Add initial log entry
    await tasksDB.addTaskLog(taskId, 'Task execution started with enhanced pipeline');
    
    // Update task status
    await tasksDB.updateTaskStatus(taskId, 'analyzing');
    
    // Track task started event
    await analytics.trackEvent(analytics.EVENT_TYPES.TASK_STARTED, {
      taskId,
      description: task.description,
      timestamp: new Date().toISOString(),
    });
    
    // Execute the task pipeline
    try {
      await this._executeTaskPipeline(task);
      
      // Get updated task
      const updatedTask = await tasksDB.getTaskById(taskId);
      
      // Mark as completed if not failed or cancelled
      if (!['failed', 'cancelled'].includes(updatedTask.status)) {
        await tasksDB.updateTaskStatus(
          taskId,
          'completed',
          'Task completed successfully'
        );
        
        // Track task completion
        await analytics.trackEvent(analytics.EVENT_TYPES.TASK_COMPLETED, {
          taskId,
          description: task.description,
          startTime: this.runningTasks.get(taskId).startTime,
          endTime: Date.now(),
          status: 'completed',
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Error executing task ${taskId}:`, error);
      
      await tasksDB.addTaskLog(taskId, `Error: ${error.message}`);
      await tasksDB.updateTaskStatus(
        taskId,
        'failed',
        `Task failed: ${error.message}`
      );
      
      // Track task failure
      await analytics.trackEvent(analytics.EVENT_TYPES.TASK_FAILED, {
        taskId,
        description: task.description,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      
      return false;
    } finally {
      // Remove from running tasks
      this.runningTasks.delete(taskId);
    }
  }

  /**
   * Execute the entire task pipeline
   * @param {Object} task - The task object
   * @private
   */
  async _executeTaskPipeline(task) {
    // 1. Admin agent analyzes the task
    const analysis = await this._analyzeTask(task);
    
    // 2. Update task status
    await tasksDB.updateTaskStatus(task.id, 'planning');
    
    // 3. Build codebase understanding
    const codebaseContext = await this._buildCodebaseContext(task, analysis);
    
    // 4. Create a detailed implementation plan
    const plan = await this._createImplementationPlan(task, analysis, codebaseContext);
    
    // 5. Update task status
    await tasksDB.updateTaskStatus(task.id, 'executing');
    
    // 6. Execute the implementation plan
    await this._executeImplementation(task, plan, codebaseContext);
    
    // 7. Update task status
    await tasksDB.updateTaskStatus(task.id, 'validating');
    
    // 8. Validate the implementation
    const validationResult = await this._validateImplementation(task);
    
    // 9. Create pull request if requested and implementation is valid
    if (task.create_pr && validationResult.valid) {
      await this._createPullRequest(task, plan, validationResult);
    } else {
      await tasksDB.addTaskLog(
        task.id, 
        `Pull request creation skipped: ${task.create_pr ? 'Validation failed' : 'Not requested'}`
      );
    }
  }

  /**
   * Analyze the task using the Admin agent
   * @param {Object} task - The task object
   * @returns {Promise<string>} Analysis result
   * @private
   */
  async _analyzeTask(task) {
    await tasksDB.addTaskLog(
      task.id,
      'Admin agent analyzing task...'
    );
    
    // Record step start
    const stepStart = Date.now();
    
    try {
      // Get Admin agent config
      const adminConfig = this.agentConfigs.Admin;
      
      // Create analysis prompt
      const analysisPrompt = `
${adminConfig.systemPrompt}

# Task
${task.title || 'Task Analysis'}

${task.description}

# Analysis Requirements
1. Analyze what this task is asking for in detail
2. Determine which parts of the codebase will need to be examined (specific directories or files)
3. Identify which specialist agents should be involved based on their expertise domains:
   - Analyzer: Performance optimization, /src/analyzer/
   - Browser: Frontend architecture, /src/browser/
   - Bundler: Build systems, /src/bundler/
   - Config: Configuration and system settings
   - Developer: Development tooling, /src/developer/
   - Generator: Code scaffolding, /src/generator/
   - Git: Repository management, PR creation
   - Pipeline: GitHub Actions workflows, CI/CD pipelines
   - Docs: Documentation
   - Server: Backend architecture, /src/server/
   - Testbed: Testbed project management, /testbed/
   - Types: Type system design, /src/types/
   - Utils: Utility functions, /src/utils/
   - Validator: Quality assurance, testing
   - Version: Package versioning, dependency management

4. Assess the complexity and potential challenges
5. Provide an overall assessment and approach

Your analysis:
`;

      // Start AI request timer
      const aiStartTime = Date.now();
      
      // Generate analysis with AI
      const analysisResult = await aiService.generateCompletion({
        prompt: analysisPrompt,
        model: adminConfig.model,
        provider: adminConfig.provider,
        temperature: adminConfig.temperature,
      });
      
      // Calculate AI request duration
      const aiDuration = Date.now() - aiStartTime;
      
      // Add completion to task logs
      await tasksDB.addTaskLog(
        task.id,
        `Admin agent completed analysis in ${Math.round(aiDuration / 1000)} seconds`
      );
      
      // Store analysis in agent's knowledge
      await fileDB.addAgentKnowledge('Admin', {
        document: analysisResult,
        metadata: {
          type: 'task_analysis',
          task_id: task.id,
          timestamp: new Date().toISOString(),
        },
      });
      
      // Record step in running tasks
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: 'Admin',
          action: 'analyze_task',
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          aiDuration,
          status: 'completed',
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      return analysisResult;
    } catch (error) {
      console.error(`Error in Admin analysis for task ${task.id}:`, error);
      
      await tasksDB.addTaskLog(
        task.id,
        `Error in Admin analysis: ${error.message}`
      );
      
      // Record failed step
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: 'Admin',
          action: 'analyze_task',
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          status: 'failed',
          error: error.message,
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      throw error;
    }
  }

  /**
   * Build context about the codebase
   * @param {Object} task - The task object
   * @param {string} analysis - Task analysis from Admin agent
   * @returns {Promise<Object>} Codebase context
   * @private
   */
  async _buildCodebaseContext(task, analysis) {
    await tasksDB.addTaskLog(
      task.id,
      'Building codebase context...'
    );
    
    // Record step start
    const stepStart = Date.now();
    
    try {
      // Parse the analysis to extract relevant directories and files
      const relevantPaths = this._extractRelevantPathsFromAnalysis(analysis);
      
      await tasksDB.addTaskLog(
        task.id,
        `Identified ${relevantPaths.directories.length} relevant directories and ${relevantPaths.files.length} files`
      );
      
      const codebaseContext = {
        directories: {},
        files: {},
        structure: {},
        summary: {}
      };
      
      // Process relevant directories
      for (const dir of relevantPaths.directories) {
        // List files in directory
        const files = await filesystemService.listFiles(dir, {
          recursive: true,
          extensions: ['.js', '.ts', '.jsx', '.tsx']
        });
        
        codebaseContext.directories[dir] = files;
        
        await tasksDB.addTaskLog(
          task.id,
          `Found ${files.length} files in directory ${dir}`
        );
      }
      
      // Process specific files
      for (const file of relevantPaths.files) {
        // Check if file exists
        if (await filesystemService.fileExists(file)) {
          // Read the file
          const content = await filesystemService.readFile(file);
          
          // Parse the file with code analyzer
          try {
            const fileInfo = {};
            
            // Get file structure based on extension
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
              // For TypeScript files, get interfaces and types
              const { interfaces, types } = await codeAnalyzerService.findInterfacesAndTypes(file);
              fileInfo.interfaces = interfaces;
              fileInfo.types = types;
            }
            
            // Get common elements for all files
            fileInfo.classes = await codeAnalyzerService.findClasses(file);
            fileInfo.functions = await codeAnalyzerService.findFunctions(file);
            fileInfo.imports = await codeAnalyzerService.findImports(file);
            fileInfo.exports = await codeAnalyzerService.findExports(file);
            fileInfo.metrics = await codeAnalyzerService.getFileMetrics(file);
            
            // Store the file structure in context
            codebaseContext.files[file] = {
              content: content,
              structure: fileInfo
            };
            
            // Add to structure summary
            codebaseContext.structure[file] = {
              classes: fileInfo.classes.map(c => c.name),
              functions: fileInfo.functions.map(f => f.name),
              exports: fileInfo.exports.flatMap(e => 
                e.items ? e.items.map(i => i.name) : [e.name]
              )
            };
          } catch (parseError) {
            console.error(`Error parsing file ${file}:`, parseError);
            
            // Store just the content if parsing fails
            codebaseContext.files[file] = {
              content: content,
              parseError: parseError.message
            };
          }
        }
      }
      
      // Generate summary information
      codebaseContext.summary = {
        directoryCount: Object.keys(codebaseContext.directories).length,
        fileCount: Object.keys(codebaseContext.files).length,
        classCount: Object.values(codebaseContext.files)
          .filter(f => f.structure && f.structure.classes)
          .reduce((sum, f) => sum + f.structure.classes.length, 0),
        functionCount: Object.values(codebaseContext.files)
          .filter(f => f.structure && f.structure.functions)
          .reduce((sum, f) => sum + f.structure.functions.length, 0)
      };
      
      await tasksDB.addTaskLog(
        task.id,
        `Built codebase context with ${codebaseContext.summary.fileCount} files containing ${codebaseContext.summary.classCount} classes and ${codebaseContext.summary.functionCount} functions`
      );
      
      // Record step in running tasks
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: 'Analyzer',
          action: 'build_codebase_context',
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          status: 'completed',
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      return codebaseContext;
    } catch (error) {
      console.error(`Error building codebase context for task ${task.id}:`, error);
      
      await tasksDB.addTaskLog(
        task.id,
        `Error building codebase context: ${error.message}`
      );
      
      // Record failed step
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: 'Analyzer',
          action: 'build_codebase_context',
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          status: 'failed',
          error: error.message,
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      throw error;
    }
  }

  /**
   * Extract relevant paths from the analysis
   * @param {string} analysis - Task analysis from Admin agent
   * @returns {Object} Relevant directories and files
   * @private
   */
  _extractRelevantPathsFromAnalysis(analysis) {
    // Default directories to check if none specified
    const defaultDirs = ['src'];
    
    // Initialize result
    const result = {
      directories: [],
      files: []
    };
    
    // Look for directory paths like "/src/browser"
    const dirMatches = analysis.match(/(?:\/[a-zA-Z0-9_-]+)+\/?/g) || [];
    
    // Look for file paths like "file.js" or "/src/file.js"
    const fileMatches = analysis.match(/(?:\/[a-zA-Z0-9_-]+)*\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+/g) || [];
    
    // Process directory matches
    for (const match of dirMatches) {
      // Clean up and normalize path
      const normalizedPath = match.replace(/\/$/, ''); // Remove trailing slash
      
      // Add to directories if not already included
      if (!result.directories.includes(normalizedPath)) {
        result.directories.push(normalizedPath);
      }
    }
    
    // Process file matches
    for (const match of fileMatches) {
      // Clean up and normalize path
      const normalizedPath = match;
      
      // Add to files if not already included
      if (!result.files.includes(normalizedPath)) {
        result.files.push(normalizedPath);
      }
    }
    
    // If no directories were found, use defaults
    if (result.directories.length === 0) {
      result.directories = defaultDirs;
    }
    
    return result;
  }

  /**
   * Create an implementation plan
   * @param {Object} task - The task object
   * @param {string} analysis - Task analysis from Admin agent
   * @param {Object} codebaseContext - Codebase context
   * @returns {Promise<Object>} Implementation plan
   * @private
   */
  async _createImplementationPlan(task, analysis, codebaseContext) {
    await tasksDB.addTaskLog(
      task.id,
      'Config agent creating implementation plan...'
    );
    
    // Record step start
    const stepStart = Date.now();
    
    try {
      // Get Config agent config
      const configConfig = this.agentConfigs.Config;
      
      // Create codebase summary (simplified version of codebase context)
      const codebaseSummary = {
        directories: Object.keys(codebaseContext.directories),
        files: Object.keys(codebaseContext.files),
        fileStructures: codebaseContext.structure,
        summary: codebaseContext.summary
      };
      
      // Create plan prompt
      const planPrompt = `
${configConfig.systemPrompt}

# Task
${task.title || 'Implementation Plan'}

${task.description}

# Admin Analysis
${analysis}

# Codebase Context
${JSON.stringify(codebaseSummary, null, 2)}

# Planning Requirements
Create a detailed implementation plan for this task. The plan should be concrete and specific, 
with clear steps that can be executed by specialist agents.

Your plan should include:
1. An overview of the approach
2. Detailed step-by-step implementation tasks with specific file paths
3. For each file modification:
   - Specify exactly what needs to be changed
   - Provide the context of where the change should be made
4. Testing strategy
5. Potential risks or edge cases to address

Format your implementation plan with clear sections for:
- OVERVIEW
- IMPLEMENTATION STEPS (numbered)
- TESTING
- RISKS

Your implementation plan:
`;

      // Start AI request timer
      const aiStartTime = Date.now();
      
      // Generate plan with AI
      const planResult = await aiService.generateCompletion({
        prompt: planPrompt,
        model: configConfig.model,
        provider: configConfig.provider,
        temperature: configConfig.temperature,
        maxTokens: 4000, // Longer context for detailed plans
      });
      
      // Calculate AI request duration
      const aiDuration = Date.now() - aiStartTime;
      
      // Add completion to task logs
      await tasksDB.addTaskLog(
        task.id,
        `Config agent completed implementation plan in ${Math.round(aiDuration / 1000)} seconds`
      );
      
      // Parse the plan into a structured format
      const plan = this._parseImplementationPlan(planResult);
      
      // Store plan in agent's knowledge
      await fileDB.addAgentKnowledge('Config', {
        document: planResult,
        metadata: {
          type: 'implementation_plan',
          task_id: task.id,
          timestamp: new Date().toISOString(),
        },
      });
      
      // Record step in running tasks
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: 'Config',
          action: 'create_implementation_plan',
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          aiDuration,
          status: 'completed',
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      return plan;
    } catch (error) {
      console.error(`Error creating implementation plan for task ${task.id}:`, error);
      
      await tasksDB.addTaskLog(
        task.id,
        `Error creating implementation plan: ${error.message}`
      );
      
      // Record failed step
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: 'Config',
          action: 'create_implementation_plan',
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          status: 'failed',
          error: error.message,
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      throw error;
    }
  }

  /**
   * Parse the implementation plan into a structured format
   * @param {string} planText - Raw plan text
   * @returns {Object} Structured plan
   * @private
   */
  _parseImplementationPlan(planText) {
    // Basic parsing - in a real implementation, would use more robust parsing
    const sections = planText.split(/\n#+\s+/);
    
    const planObj = {
      overview: '',
      steps: [],
      testing: '',
      risks: []
    };
    
    // Extract sections
    for (const section of sections) {
      if (!section.trim()) continue;
      
      const lines = section.trim().split('\n');
      const sectionTitle = lines[0].toLowerCase();
      
      if (
        sectionTitle.includes('overview') ||
        sectionTitle.includes('approach')
      ) {
        planObj.overview = lines.slice(1).join('\n').trim();
      } else if (
        sectionTitle.includes('implementation') ||
        sectionTitle.includes('steps')
      ) {
        // Parse steps - will extract numbered steps
        const stepLines = lines.slice(1);
        let currentStep = null;
        
        for (const line of stepLines) {
          // Check if line starts a new step (number followed by period)
          if (/^\d+\./.test(line)) {
            if (currentStep) {
              planObj.steps.push(currentStep);
            }
            
            currentStep = {
              description: line.replace(/^\d+\.\s*/, ''),
              files: [],
              details: '',
              agent: this._determineAgentForStep(line)
            };
          } else if (
            currentStep && 
            (line.includes('.js') ||
             line.includes('.ts') ||
             line.includes('.jsx') ||
             line.includes('.tsx'))
          ) {
            // Line contains a file reference
            const fileMatch = line.match(/[a-zA-Z0-9\/_.-]+\.(js|ts|jsx|tsx)/);
            if (fileMatch && !currentStep.files.includes(fileMatch[0])) {
              currentStep.files.push(fileMatch[0]);
            }
          } else if (currentStep) {
            // Add to current step details
            currentStep.details += line + '\n';
          }
        }
        
        // Add the last step
        if (currentStep) {
          planObj.steps.push(currentStep);
        }
      } else if (
        sectionTitle.includes('test') ||
        sectionTitle.includes('validation')
      ) {
        planObj.testing = lines.slice(1).join('\n').trim();
      } else if (
        sectionTitle.includes('risk') ||
        sectionTitle.includes('edge')
      ) {
        planObj.risks = lines
          .slice(1)
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^-\s*/, ''));
      }
    }
    
    return planObj;
  }

  /**
   * Determine the appropriate agent for a step based on its description
   * @param {string} stepDescription - The step description
   * @returns {string} Agent name
   * @private
   */
  _determineAgentForStep(stepDescription) {
    const lowerStep = stepDescription.toLowerCase();
    
    // Map keywords to agents
    const agentKeywords = {
      'frontend': 'Browser',
      'browser': 'Browser',
      'client': 'Browser',
      'render': 'Browser',
      'view': 'Browser',
      'component': 'Browser',
      
      'server': 'Server',
      'backend': 'Server',
      'api': 'Server',
      'controller': 'Server',
      'route': 'Server',
      
      'build': 'Bundler',
      'bundle': 'Bundler',
      'webpack': 'Bundler',
      'vite': 'Bundler',
      
      'type': 'Types',
      'interface': 'Types',
      'typescript': 'Types',
      
      'utility': 'Utils',
      'util': 'Utils',
      'helper': 'Utils',
      
      'test': 'Validator',
      'validation': 'Validator',
      'verify': 'Validator',
      
      'document': 'Docs',
      'documentation': 'Docs',
      
      'generate': 'Generator',
      'scaffold': 'Generator',
      'template': 'Generator',
      
      'git': 'Git',
      'branch': 'Git',
      'commit': 'Git',
      'pr': 'Git',
      'pull request': 'Git',
      
      'version': 'Version',
      'dependency': 'Version',
      'package': 'Version',
      
      'analyze': 'Analyzer',
      'performance': 'Analyzer',
      'optimize': 'Analyzer',
      
      'config': 'Config',
      'configuration': 'Config',
      'setting': 'Config'
    };
    
    // Check for each keyword
    for (const [keyword, agent] of Object.entries(agentKeywords)) {
      if (lowerStep.includes(keyword)) {
        return agent;
      }
    }
    
    // Default to Developer agent
    return 'Developer';
  }

  /**
   * Execute the implementation plan
   * @param {Object} task - The task object
   * @param {Object} plan - Implementation plan
   * @param {Object} codebaseContext - Codebase context
   * @returns {Promise<Array>} Results of implementation steps
   * @private
   */
  async _executeImplementation(task, plan, codebaseContext) {
    await tasksDB.addTaskLog(
      task.id,
      `Executing implementation plan with ${plan.steps.length} steps...`
    );
    
    // Check if git is available and working directory is clean
    let gitAvailable = false;
    let workingDirClean = false;
    
    try {
      gitAvailable = await gitService.isGitRepository();
      if (gitAvailable) {
        workingDirClean = await gitService.isWorkingDirectoryClean();
        
        if (!workingDirClean) {
          await tasksDB.addTaskLog(
            task.id,
            'Warning: Git working directory is not clean. Changes may affect existing modifications.'
          );
        }
      }
    } catch (error) {
      console.warn('Error checking git status:', error);
    }
    
    // Create a branch for task if using git
    let branchCreated = false;
    if (gitAvailable) {
      try {
        // Create branch name from task ID and title
        const branchName = `task/${task.id}_${task.title ? task.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30) : 'implementation'}`;
        
        // Create branch
        await gitService.createBranch(branchName);
        branchCreated = true;
        
        await tasksDB.addTaskLog(
          task.id,
          `Created and checked out git branch: ${branchName}`
        );
      } catch (error) {
        console.error('Error creating git branch:', error);
        await tasksDB.addTaskLog(
          task.id,
          `Warning: Failed to create git branch: ${error.message}`
        );
      }
    }
    
    // Execute each step
    const results = [];
    
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      const stepNumber = i + 1;
      
      await tasksDB.addTaskLog(
        task.id,
        `Step ${stepNumber}/${plan.steps.length}: ${step.description} (${step.agent} agent)`
      );
      
      // Execute step
      try {
        const stepResult = await this._executeImplementationStep(
          task,
          step,
          stepNumber,
          plan.steps.length,
          codebaseContext
        );
        
        results.push({
          step: stepNumber,
          description: step.description,
          agent: step.agent,
          files: stepResult.files,
          status: 'completed'
        });
        
        // Stage modified files if using git
        if (gitAvailable && branchCreated && stepResult.files.length > 0) {
          try {
            await gitService.stageFiles(stepResult.files);
            
            await tasksDB.addTaskLog(
              task.id,
              `Staged ${stepResult.files.length} files for commit`
            );
          } catch (error) {
            console.error('Error staging files:', error);
            await tasksDB.addTaskLog(
              task.id,
              `Warning: Failed to stage files: ${error.message}`
            );
          }
        }
      } catch (error) {
        console.error(`Error executing step ${stepNumber}:`, error);
        
        await tasksDB.addTaskLog(
          task.id,
          `Error executing step ${stepNumber}: ${error.message}`
        );
        
        results.push({
          step: stepNumber,
          description: step.description,
          agent: step.agent,
          error: error.message,
          status: 'failed'
        });
        
        // Continue with next step despite error
      }
    }
    
    // Create commit if using git and modifications were made
    if (gitAvailable && branchCreated) {
      try {
        // Check if there are staged changes
        const status = await gitService.getStatus();
        
        if (status.staged.length > 0) {
          // Create commit message
          const commitMessage = `${task.title || 'Implement task'}\n\nImplement changes for task ${task.id}`;
          
          // Create commit
          const commitHash = await gitService.createCommit(commitMessage);
          
          await tasksDB.addTaskLog(
            task.id,
            `Created commit: ${commitHash}`
          );
        } else {
          await tasksDB.addTaskLog(
            task.id,
            'No changes to commit'
          );
        }
      } catch (error) {
        console.error('Error creating commit:', error);
        await tasksDB.addTaskLog(
          task.id,
          `Warning: Failed to create commit: ${error.message}`
        );
      }
    }
    
    return results;
  }

  /**
   * Execute a single implementation step
   * @param {Object} task - The task object
   * @param {Object} step - Implementation step
   * @param {number} stepNumber - Step number
   * @param {number} totalSteps - Total number of steps
   * @param {Object} codebaseContext - Codebase context
   * @returns {Promise<Object>} Step result
   * @private
   */
  async _executeImplementationStep(task, step, stepNumber, totalSteps, codebaseContext) {
    // Record step start
    const stepStart = Date.now();
    
    // Track modified files
    const modifiedFiles = [];
    
    try {
      // Get agent configuration
      const agentConfig = this.agentConfigs[step.agent] || this.agentConfigs.Developer;
      
      // Process each file in the step
      for (const file of step.files) {
        await tasksDB.addTaskLog(
          task.id,
          `Processing file: ${file}`
        );
        
        // Check if file exists
        const fileExists = await filesystemService.fileExists(file);
        let fileContent = '';
        let fileStructure = null;
        
        if (fileExists) {
          // Get current file content
          fileContent = await filesystemService.readFile(file);
          
          // Get file structure if available in codebase context
          if (codebaseContext.files[file] && codebaseContext.files[file].structure) {
            fileStructure = codebaseContext.files[file].structure;
          }
        }
        
        // Create implementation prompt
        const implementationPrompt = `
${agentConfig.systemPrompt}

# Task
${task.title || 'Implementation Task'}

${task.description}

# Implementation Step (${stepNumber}/${totalSteps})
${step.description}

# Step Details
${step.details}

# File: ${file}
${fileExists ? 'This file exists and needs to be modified.' : 'This file needs to be created.'}

${fileExists ? '## Current File Content' : '## File to Create'}
\`\`\`
${fileContent}
\`\`\`

${fileStructure ? `## File Structure\n${JSON.stringify(fileStructure, null, 2)}` : ''}

# Instructions
${fileExists ? 'Modify the file according to the step details.' : 'Create the file with appropriate content.'}

${fileExists ? 'Provide the COMPLETE updated file content.' : 'Provide the COMPLETE file content to create.'}

Your implementation:
`;

        // Start AI request timer
        const aiStartTime = Date.now();
        
        // Generate implementation with AI
        const implementationResult = await aiService.generateCompletion({
          prompt: implementationPrompt,
          model: agentConfig.model,
          provider: agentConfig.provider,
          temperature: agentConfig.temperature,
          maxTokens: 4000, // Longer context for code generation
        });
        
        // Calculate AI request duration
        const aiDuration = Date.now() - aiStartTime;
        
        // Extract code from the implementation result (remove markdown code blocks if present)
        const codeContent = implementationResult.replace(/^```[\w]*\n([\s\S]*?)```$/m, '$1').trim();
        
        // Write the file
        await filesystemService.writeFile(file, codeContent, true);
        
        // Add to modified files
        modifiedFiles.push(file);
        
        await tasksDB.addTaskLog(
          task.id,
          `${fileExists ? 'Modified' : 'Created'} file: ${file}`
        );
        
        // Store implementation in agent's knowledge
        await fileDB.addAgentKnowledge(step.agent, {
          document: implementationResult,
          metadata: {
            type: 'implementation',
            task_id: task.id,
            file,
            step: stepNumber,
            timestamp: new Date().toISOString(),
          },
        });
      }
      
      // Record step in running tasks
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: step.agent,
          action: 'execute_implementation_step',
          step: stepNumber,
          description: step.description,
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          files: modifiedFiles,
          status: 'completed',
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      return {
        files: modifiedFiles,
        status: 'completed'
      };
    } catch (error) {
      console.error(`Error executing step ${stepNumber}:`, error);
      
      // Record failed step
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: step.agent,
          action: 'execute_implementation_step',
          step: stepNumber,
          description: step.description,
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          files: modifiedFiles,
          status: 'failed',
          error: error.message,
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      throw error;
    }
  }

  /**
   * Validate the implementation
   * @param {Object} task - The task object
   * @returns {Promise<Object>} Validation result
   * @private
   */
  async _validateImplementation(task) {
    await tasksDB.addTaskLog(
      task.id,
      'Validator agent testing implementation...'
    );
    
    // Record step start
    const stepStart = Date.now();
    
    try {
      // Get Validator agent config
      const validatorConfig = this.agentConfigs.Validator;
      
      // Get modified files
      let modifiedFiles = [];
      
      // Check if git is available
      const gitAvailable = await gitService.isGitRepository();
      if (gitAvailable) {
        try {
          const status = await gitService.getStatus();
          modifiedFiles = [
            ...status.modified,
            ...status.created,
            ...status.staged
          ];
        } catch (error) {
          console.warn('Error getting git status:', error);
        }
      }
      
      // If no modified files found via git, use the task's data
      if (modifiedFiles.length === 0) {
        // Get implemented files from running tasks record
        if (this.runningTasks.has(task.id)) {
          const taskData = this.runningTasks.get(task.id);
          modifiedFiles = taskData.steps
            .filter(step => step.action === 'execute_implementation_step' && step.status === 'completed')
            .flatMap(step => step.files || []);
        }
      }
      
      // Deduplicate files
      modifiedFiles = [...new Set(modifiedFiles)];
      
      await tasksDB.addTaskLog(
        task.id,
        `Validating ${modifiedFiles.length} modified files...`
      );
      
      // Read file contents
      const fileContents = {};
      for (const file of modifiedFiles) {
        try {
          fileContents[file] = await filesystemService.readFile(file);
        } catch (error) {
          console.warn(`Error reading file ${file}:`, error);
        }
      }
      
      // Create validation prompt
      const validationPrompt = `
${validatorConfig.systemPrompt}

# Task
${task.title || 'Implementation Validation'}

${task.description}

# Modified Files to Validate
${modifiedFiles.map(file => `## ${file}\n\`\`\`\n${fileContents[file] || 'File content unavailable'}\n\`\`\``).join('\n\n')}

Validate the implementation and provide a comprehensive testing report with the following sections:
1. Quality Assessment - Evaluate the code quality, readability, and maintainability
2. Functionality Review - Assess if the implementation fulfills the task requirements
3. Issues Found - List any bugs, errors, or problems discovered
4. Security Review - Identify any security concerns
5. Performance Considerations - Note any potential performance issues
6. Suggestions for Improvement - Recommend ways to enhance the implementation
7. Overall Assessment - Provide a final verdict (Pass/Fail/Needs Improvement)

Your validation report:
`;

      // Start AI request timer
      const aiStartTime = Date.now();
      
      // Generate validation with AI
      const validationResult = await aiService.generateCompletion({
        prompt: validationPrompt,
        model: validatorConfig.model,
        provider: validatorConfig.provider,
        temperature: validatorConfig.temperature,
        maxTokens: 4000, // Longer context for detailed validation
      });
      
      // Calculate AI request duration
      const aiDuration = Date.now() - aiStartTime;
      
      // Parse validation result
      const validationSummary = this._parseValidationResult(validationResult);
      
      await tasksDB.addTaskLog(
        task.id,
        `Validation completed with verdict: ${validationSummary.verdict}`
      );
      
      // Store validation in agent's knowledge
      await fileDB.addAgentKnowledge('Validator', {
        document: validationResult,
        metadata: {
          type: 'validation',
          task_id: task.id,
          verdict: validationSummary.verdict,
          timestamp: new Date().toISOString(),
        },
      });
      
      // Record step in running tasks
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: 'Validator',
          action: 'validate_implementation',
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          aiDuration,
          verdict: validationSummary.verdict,
          status: 'completed',
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      return {
        valid: validationSummary.verdict === 'Pass',
        verdict: validationSummary.verdict,
        issues: validationSummary.issues,
        suggestions: validationSummary.suggestions,
        fullReport: validationResult
      };
    } catch (error) {
      console.error(`Error validating implementation for task ${task.id}:`, error);
      
      await tasksDB.addTaskLog(
        task.id,
        `Error validating implementation: ${error.message}`
      );
      
      // Record failed step
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: 'Validator',
          action: 'validate_implementation',
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          status: 'failed',
          error: error.message,
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      throw error;
    }
  }

  /**
   * Parse validation result into structured format
   * @param {string} validationText - Raw validation text
   * @returns {Object} Parsed validation result
   * @private
   */
  _parseValidationResult(validationText) {
    // Initialize result
    const result = {
      verdict: 'Needs Improvement', // default
      issues: [],
      suggestions: []
    };
    
    // Extract issues
    const issuesMatch = validationText.match(/(?:Issues Found|Issues|Problems)(?:[:\s]*)([\s\S]*?)(?:(?:#|$|Security|Performance))/i);
    if (issuesMatch && issuesMatch[1]) {
      result.issues = issuesMatch[1]
        .split('\n')
        .filter(line => line.trim() && line.trim().startsWith('-'))
        .map(line => line.trim().replace(/^-\s*/, ''));
    }
    
    // Extract suggestions
    const suggestionsMatch = validationText.match(/(?:Suggestions|Improvements|Recommendations)(?:[:\s]*)([\s\S]*?)(?:(?:#|$|Overall))/i);
    if (suggestionsMatch && suggestionsMatch[1]) {
      result.suggestions = suggestionsMatch[1]
        .split('\n')
        .filter(line => line.trim() && line.trim().startsWith('-'))
        .map(line => line.trim().replace(/^-\s*/, ''));
    }
    
    // Extract overall verdict
    const verdictMatch = validationText.match(/(?:Overall|Verdict|Assessment)(?:[:\s]*)([\s\S]*?)(?:(?:#|$))/i);
    if (verdictMatch && verdictMatch[1]) {
      const verdictText = verdictMatch[1].toLowerCase();
      
      if (verdictText.includes('pass') || verdictText.includes('successful') || verdictText.includes('approve')) {
        result.verdict = 'Pass';
      } else if (verdictText.includes('fail') || verdictText.includes('rejected')) {
        result.verdict = 'Fail';
      } else {
        result.verdict = 'Needs Improvement';
      }
    }
    
    return result;
  }

  /**
   * Create a pull request for the task
   * @param {Object} task - The task object
   * @param {Object} plan - Implementation plan
   * @param {Object} validation - Validation result
   * @returns {Promise<Object>} Pull request result
   * @private
   */
  async _createPullRequest(task, plan, validation) {
    await tasksDB.addTaskLog(
      task.id,
      'Git agent creating pull request...'
    );
    
    // Record step start
    const stepStart = Date.now();
    
    try {
      // Get Git agent config
      const gitConfig = this.agentConfigs.Git;
      
      // Check if git is available
      const gitAvailable = await gitService.isGitRepository();
      if (!gitAvailable) {
        await tasksDB.addTaskLog(
          task.id,
          'Git not available, skipping pull request creation'
        );
        
        return null;
      }
      
      // Get current branch
      const branchInfo = await gitService.refreshBranchInfo();
      const currentBranch = branchInfo.currentBranch;
      
      // Create PR prompt
      const prPrompt = `
${gitConfig.systemPrompt}

# Task
${task.title || 'Implementation Task'}

${task.description}

# Implementation Plan Overview
${plan.overview}

# Validation Summary
${validation.fullReport ? validation.fullReport : JSON.stringify(validation, null, 2)}

Create a comprehensive pull request description for this task. Include:
1. A clear and descriptive title
2. Summary of changes implemented
3. Key implementation decisions
4. Testing performed
5. Any notes for reviewers

Format your PR description following standard GitHub markdown. Break it into sections with clear headers.

Your pull request description:
`;

      // Start AI request timer
      const aiStartTime = Date.now();
      
      // Generate PR description with AI
      const prDescriptionResult = await aiService.generateCompletion({
        prompt: prPrompt,
        model: gitConfig.model,
        provider: gitConfig.provider,
        temperature: gitConfig.temperature,
        maxTokens: 2000, // Moderately long context for PR description
      });
      
      // Calculate AI request duration
      const aiDuration = Date.now() - aiStartTime;
      
      // Extract title from PR description
      let prTitle = task.title || `Implementation for task ${task.id}`;
      const titleMatch = prDescriptionResult.match(/^#\s+(.*?)$/m);
      if (titleMatch && titleMatch[1]) {
        prTitle = titleMatch[1].trim();
      }
      
      // Push branch to remote
      let remotePushResult = null;
      try {
        await gitService.pushChanges('origin', currentBranch, true);
        await tasksDB.addTaskLog(
          task.id,
          `Pushed branch ${currentBranch} to remote`
        );
      } catch (error) {
        console.error('Error pushing branch to remote:', error);
        await tasksDB.addTaskLog(
          task.id,
          `Warning: Failed to push branch to remote: ${error.message}`
        );
      }
      
      // Create PR via GitHub API
      let prResult = null;
      try {
        prResult = await gitService.createPullRequest({
          title: prTitle,
          body: prDescriptionResult,
          head: currentBranch,
          base: 'main' // Assuming main is the default branch
        });
        
        await tasksDB.addTaskLog(
          task.id,
          `Created pull request #${prResult.number}: ${prResult.url}`
        );
        
        // Update task with PR info
        await tasksDB.updateTask(task.id, {
          pr_number: prResult.number,
          pr_url: prResult.url,
          pr_title: prTitle,
          pr_description: prDescriptionResult
        });
      } catch (error) {
        console.error('Error creating pull request:', error);
        await tasksDB.addTaskLog(
          task.id,
          `Warning: Failed to create pull request: ${error.message}`
        );
        
        // Store PR info even if GitHub API failed
        await tasksDB.updateTask(task.id, {
          pr_branch: currentBranch,
          pr_title: prTitle,
          pr_description: prDescriptionResult
        });
      }
      
      // Store PR in agent's knowledge
      await fileDB.addAgentKnowledge('Git', {
        document: prDescriptionResult,
        metadata: {
          type: 'pull_request',
          task_id: task.id,
          branch: currentBranch,
          pr_number: prResult ? prResult.number : null,
          pr_url: prResult ? prResult.url : null,
          timestamp: new Date().toISOString(),
        },
      });
      
      // Record step in running tasks
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: 'Git',
          action: 'create_pull_request',
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          aiDuration,
          branch: currentBranch,
          pr: prResult,
          status: prResult ? 'completed' : 'partial',
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      return prResult || {
        branch: currentBranch,
        title: prTitle,
        description: prDescriptionResult
      };
    } catch (error) {
      console.error(`Error creating pull request for task ${task.id}:`, error);
      
      await tasksDB.addTaskLog(
        task.id,
        `Error creating pull request: ${error.message}`
      );
      
      // Record failed step
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: 'Git',
          action: 'create_pull_request',
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          status: 'failed',
          error: error.message,
        });
        this.runningTasks.set(task.id, taskData);
      }
      
      throw error;
    }
  }
}

// Create singleton instance
const enhancedTaskExecutionService = new EnhancedTaskExecutionService();

// Export the singleton instance
module.exports = enhancedTaskExecutionService;