/**
 * Task Execution Service
 * Service for executing tasks using AI agents
 */

const aiService = require("./aiService");
const fileDB = require("../models/fileDB");
const tasksDB = require("../models/tasksDB");
const analytics = require("../models/analytics");
const { createError } = require("../utils/errorUtils");
const path = require("path");
const fs = require("fs").promises;

// Check if required environment variables for AI providers are set
function validateEnvironment() {
  const warnings = [];
  const errors = [];

  // Check for Ollama (default provider)
  if (!process.env.OLLAMA_ENDPOINT) {
    warnings.push(
      "OLLAMA_ENDPOINT not set, using default: http://localhost:11434"
    );
  }

  if (!process.env.OLLAMA_DEFAULT_MODEL) {
    warnings.push(
      "OLLAMA_DEFAULT_MODEL not set, using default: codellama:7b-code"
    );
  }

  // Check for OpenAI API key if defined as a provider in any agent
  const usesOpenAI = Object.values(AGENT_CONFIG).some(
    (config) => config.provider === "openai"
  );
  if (usesOpenAI && !process.env.OPENAI_API_KEY) {
    errors.push("OpenAI provider is used but OPENAI_API_KEY is not set");
  }

  // Check for Anthropic API key if defined as a provider in any agent
  const usesAnthropic = Object.values(AGENT_CONFIG).some(
    (config) => config.provider === "anthropic"
  );
  if (usesAnthropic && !process.env.ANTHROPIC_API_KEY) {
    errors.push("Anthropic provider is used but ANTHROPIC_API_KEY is not set");
  }

  return { warnings, errors, isValid: errors.length === 0 };
}

/**
 * Agent configuration
 */
const AGENT_CONFIG = {
  Admin: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null, // Will use provider's default model if null
    temperature: 0.2,
    systemPrompt:
      "You are the Admin agent for ARLO, an AI agent system for the AssembleJS framework. Your role is to analyze tasks, plan work, and coordinate other specialist agents.",
  },
  Analyzer: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Analyzer agent for ARLO, specialized in performance optimization and analyzing code in the /src/analyzer/ directory.",
  },
  Browser: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Browser agent for ARLO, specialized in frontend architecture and code in the /src/browser/ directory.",
  },
  Bundler: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Bundler agent for ARLO, specialized in build systems and code in the /src/bundler/ directory.",
  },
  Config: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.2,
    systemPrompt:
      "You are the Config agent for ARLO, specialized in configuration and system settings for the AssembleJS framework.",
  },
  Developer: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Developer agent for ARLO, specialized in development tooling and code in the /src/developer/ directory.",
  },
  Generator: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Generator agent for ARLO, specialized in code scaffolding and code in the /src/generator/ directory.",
  },
  Git: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Git agent for ARLO, specialized in repository management, PR creation, and version control for the AssembleJS framework.",
  },
  Pipeline: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Pipeline agent for ARLO, specialized in GitHub Actions workflows and CI/CD pipeline management.",
  },
  Docs: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.2,
    systemPrompt:
      "You are the Docs agent for ARLO, specialized in documentation and knowledge management for the AssembleJS framework.",
  },
  Server: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Server agent for ARLO, specialized in backend architecture and code in the /src/server/ directory.",
  },
  Testbed: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Testbed agent for ARLO, specialized in testbed project management and code in the /testbed/ directory.",
  },
  Types: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Types agent for ARLO, specialized in type system design and code in the /src/types/ directory.",
  },
  Utils: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Utils agent for ARLO, specialized in utility functions and code in the /src/utils/ directory.",
  },
  Validator: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Validator agent for ARLO, specialized in quality assurance and testing for the AssembleJS framework.",
  },
  Version: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.1,
    systemPrompt:
      "You are the Version agent for ARLO, specialized in package versioning and dependency management for the AssembleJS framework.",
  },
  ARLO: {
    provider: process.env.DEFAULT_AI_PROVIDER || "ollama",
    model: null,
    temperature: 0.2,
    systemPrompt:
      "You are the ARLO agent, dedicated to self-maintenance and enhancement of the ARLO system itself.",
  },
};

// Define the rainbow color spectrum for agents
const AGENT_COLORS = {
  Admin: "#F44336", // Red
  Types: "#E91E63", // Pink
  Utils: "#9C27B0", // Purple
  Validator: "#673AB7", // Deep Purple
  Developer: "#3F51B5", // Indigo
  Browser: "#2196F3", // Blue
  Version: "#03A9F4", // Light Blue
  Server: "#00BCD4", // Cyan
  Testbed: "#009688", // Teal
  Pipeline: "#4CAF50", // Green
  Generator: "#8BC34A", // Light Green
  Config: "#CDDC39", // Lime
  Docs: "#FFEB3B", // Yellow
  Git: "#FFC107", // Amber
  Analyzer: "#FF9800", // Orange
  Bundler: "#FF5722", // Deep Orange
  ARLO: "#607D8B", // Blue Grey
};

/**
 * Task Execution Service
 */
class TaskExecutionService {
  constructor() {
    this.aiService = aiService;
    this.runningTasks = new Map();
    this.initialized = false;

    // Run environment validation
    const envValidation = validateEnvironment();
    this.environmentStatus = envValidation;

    // Log any warnings or errors
    if (envValidation.warnings.length > 0) {
      console.warn(
        "TaskExecutionService environment warnings:",
        envValidation.warnings
      );
    }

    if (envValidation.errors.length > 0) {
      console.error(
        "TaskExecutionService environment errors:",
        envValidation.errors
      );
    }

    // Load any saved system prompts
    this._loadSavedSystemPrompts();
  }

  /**
   * Initialize the task execution service
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      // Track initialization in analytics
      await analytics.trackEvent(analytics.EVENT_TYPES.SYSTEM_ERROR, {
        system: "TaskExecutionService",
        action: "initialization",
        status: "success",
        timestamp: new Date().toISOString(),
      });

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize TaskExecutionService:", error);
      return false;
    }
  }

  /**
   * Start task execution pipeline
   * @param {string} taskId - ID of the task to execute
   */
  async startTaskExecution(taskId) {
    // Check if service is initialized
    if (!this.initialized) {
      await this.initialize();
    }

    // Ensure task exists
    const task = await tasksDB.getTaskById(taskId);
    if (!task) {
      throw createError(`Task ${taskId} not found`, "NOT_FOUND");
    }

    // Check if task is already running
    if (this.runningTasks.has(taskId)) {
      throw createError(`Task ${taskId} is already running`, "TASK_RUNNING");
    }

    // Check environment status
    if (!this.environmentStatus.isValid) {
      const errorMessage = `Task execution environment not properly configured: ${this.environmentStatus.errors.join(
        ", "
      )}`;
      await tasksDB.addTaskLog(taskId, `Error: ${errorMessage}`);
      await tasksDB.updateTaskStatus(taskId, "failed", errorMessage);

      // Track the error
      await analytics.trackEvent(analytics.EVENT_TYPES.SYSTEM_ERROR, {
        system: "TaskExecutionService",
        taskId,
        errors: this.environmentStatus.errors,
        timestamp: new Date().toISOString(),
      });

      throw createError(errorMessage, "CONFIG_ERROR");
    }

    // Add task to running tasks
    this.runningTasks.set(taskId, {
      status: "running",
      startTime: Date.now(),
      steps: [],
    });

    // Add log entry
    await tasksDB.addTaskLog(taskId, "Task execution started");

    // Track task started event
    await analytics.trackEvent(analytics.EVENT_TYPES.TASK_CREATED, {
      taskId,
      description: task.description,
      timestamp: new Date().toISOString(),
    });

    // Start the task pipeline
    try {
      // Update task status
      await tasksDB.updateTaskStatus(taskId, "running");

      // Execute the task pipeline
      await this._executeTaskPipeline(task);

      // Mark task as completed if it hasn't failed
      const updatedTask = await tasksDB.getTaskById(taskId);
      if (updatedTask.status !== "failed") {
        await tasksDB.updateTaskStatus(
          taskId,
          "completed",
          "Task completed successfully"
        );

        // Track task completion
        await analytics.trackEvent(analytics.EVENT_TYPES.TASK_COMPLETED, {
          taskId,
          description: task.description,
          startTime: this.runningTasks.get(taskId).startTime,
          endTime: Date.now(),
          status: "completed",
          steps: this.runningTasks.get(taskId).steps,
        });
      }
    } catch (error) {
      console.error(`Error executing task ${taskId}:`, error);
      await tasksDB.addTaskLog(taskId, `Error: ${error.message}`);
      await tasksDB.updateTaskStatus(
        taskId,
        "failed",
        `Task failed: ${error.message}`
      );

      // Track task failure
      await analytics.trackEvent(analytics.EVENT_TYPES.SYSTEM_ERROR, {
        system: "TaskExecutionService",
        taskId,
        error: error.message,
        errorType: error.type || "EXECUTION_ERROR",
        status: "failed",
        timestamp: new Date().toISOString(),
      });
    } finally {
      // Remove task from running tasks
      this.runningTasks.delete(taskId);
    }
  }

  /**
   * Execute the task pipeline
   * @param {Object} task - The task to execute
   * @private
   */
  async _executeTaskPipeline(task) {
    // 1. Admin agent analyzes the task
    await this._executeAdminAnalysis(task);

    // 2. Config agent creates a plan
    const plan = await this._createTaskPlan(task);

    // 3. Specialist agents execute the plan steps
    await this._executePlanSteps(task, plan);

    // 4. Validator agent verifies the implementation
    await this._validateImplementation(task);

    // 5. Git agent creates a PR if needed
    await this._createPullRequest(task);
  }

  /**
   * Execute Admin agent's analysis of the task
   * @param {Object} task - The task object
   * @private
   */
  async _executeAdminAnalysis(task) {
    await tasksDB.addTaskLog(task.id, "Admin agent analyzing task...");

    // Record step start
    const stepStart = Date.now();

    try {
      // Get Admin agent config
      const adminConfig = AGENT_CONFIG.Admin;

      // Track agent activation
      await analytics.trackEvent(analytics.EVENT_TYPES.AGENT_ACTIVATED, {
        agentId: "Admin",
        taskId: task.id,
        provider: adminConfig.provider,
        model: adminConfig.model,
        action: "task_analysis",
        timestamp: new Date().toISOString(),
      });

      // Create analysis prompt
      const analysisPrompt = `
${adminConfig.systemPrompt}

# Task
${task.title}

${task.description}

# Analysis Requirements
1. Analyze what this task is asking for
2. Determine which specialist agents should be involved
3. Identify key components or files that will need to be modified
4. Assess complexity and potential challenges
5. Provide an overall assessment of the task

Your analysis:
`;

      // Start AI request timer
      const aiStartTime = Date.now();

      // Generate analysis using AI
      const analysisResult = await this.aiService.generateCompletion({
        prompt: analysisPrompt,
        model: adminConfig.model,
        provider: adminConfig.provider,
        temperature: adminConfig.temperature,
      });

      // Calculate AI request duration
      const aiDuration = Date.now() - aiStartTime;

      // Add analysis to task logs
      await tasksDB.addTaskLog(task.id, `Admin agent completed analysis`);

      // Store analysis in Admin agent's knowledge
      await fileDB.addAgentKnowledge("Admin", {
        document: analysisResult,
        metadata: {
          type: "task_analysis",
          task_id: task.id,
          timestamp: new Date().toISOString(),
        },
      });

      // Record step in running tasks
      if (this.runningTasks.has(task.id)) {
        const taskData = this.runningTasks.get(task.id);
        taskData.steps.push({
          agent: "Admin",
          action: "analyze_task",
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          aiDuration,
          status: "completed",
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
          agent: "Admin",
          action: "analyze_task",
          startTime: stepStart,
          endTime: Date.now(),
          duration: Date.now() - stepStart,
          status: "failed",
          error: error.message,
        });
        this.runningTasks.set(task.id, taskData);
      }

      // Track AI error in analytics
      await analytics.trackEvent(analytics.EVENT_TYPES.SYSTEM_ERROR, {
        system: "AIService",
        agent: "Admin",
        taskId: task.id,
        errorMessage: error.message,
        errorType: error.type || "AI_ERROR",
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Create a task plan using the Config agent
   * @param {Object} task - The task object
   * @private
   */
  async _createTaskPlan(task) {
    await tasksDB.addTaskLog(task.id, "Config agent creating task plan...");

    try {
      // Get Config agent config
      const configConfig = AGENT_CONFIG.Config;

      // Get Admin's analysis
      const adminKnowledge = await fileDB.queryAgentKnowledge(
        "Admin",
        task.id,
        1
      );
      const adminAnalysis =
        adminKnowledge.length > 0 ? adminKnowledge[0].document : "";

      // Get codebase context (in a real implementation, this would scan relevant files)
      const codebaseContext =
        "AssembleJS is a framework for building web components with multi-framework support. The ARLO system is an AI agent system for maintaining and extending the AssembleJS framework.";

      // Create plan prompt
      const planPrompt = `
${configConfig.systemPrompt}

# Task
${task.title}

${task.description}

# Admin Analysis
${adminAnalysis}

# Codebase Context
${codebaseContext}

# Planning Requirements
Create a detailed implementation plan for this task. Break it down into specific steps.

Your plan should include:
1. An overview of the approach
2. Step-by-step implementation tasks with specific file paths where relevant
3. Testing strategy
4. Potential risks or edge cases

Your implementation plan:
`;

      // Generate plan using AI
      const planResult = await this.aiService.generateCompletion({
        prompt: planPrompt,
        model: configConfig.model,
        provider: configConfig.provider,
        temperature: configConfig.temperature,
        maxTokens: 4000, // Longer context for detailed plans
      });

      // Parse the plan into a structured format
      const plan = this.aiService.parseImplementationPlan(planResult);

      // Add plan to task logs
      await tasksDB.addTaskLog(
        task.id,
        `Config agent completed task plan with ${plan.steps.length} steps`
      );

      // Store plan in Config agent's knowledge
      await fileDB.addAgentKnowledge("Config", {
        document: planResult,
        metadata: {
          type: "task_plan",
          task_id: task.id,
          timestamp: new Date().toISOString(),
        },
      });

      return plan;
    } catch (error) {
      console.error(`Error in Config planning for task ${task.id}:`, error);
      await tasksDB.addTaskLog(
        task.id,
        `Error in Config planning: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Execute the plan steps using specialist agents
   * @param {Object} task - The task object
   * @param {Object} plan - The implementation plan
   * @private
   */
  async _executePlanSteps(task, plan) {
    await tasksDB.addTaskLog(
      task.id,
      "Developer agent implementing plan steps..."
    );

    try {
      // Get Developer agent config
      const developerConfig = AGENT_CONFIG.Developer;

      // Execute each step in the plan
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];

        await tasksDB.addTaskLog(
          task.id,
          `Executing step ${i + 1}/${plan.steps.length}: ${step.description}`
        );

        // Simulate file operations (in a real implementation, would actually read/modify files)
        for (const file of step.files) {
          // Create file context (simulated)
          const fileContext = `// Simulated content for file: ${file}`;

          // Create implementation prompt
          const implementationPrompt = `
${developerConfig.systemPrompt}

# Task
${task.title}

# Implementation Step
${step.description}

# Step Details
${step.details}

# File to Modify
${file}

# Current File Content
\`\`\`
${fileContext}
\`\`\`

Generate the code implementation for this step. Provide ONLY the code to add or modify,
using proper syntax, indentation, and following the style of the existing code.
`;

          // Generate implementation using AI
          const implementation = await this.aiService.generateCompletion({
            prompt: implementationPrompt,
            model: developerConfig.model,
            provider: developerConfig.provider,
            temperature: developerConfig.temperature,
            maxTokens: 3000,
          });

          // In a real implementation, would save the change to the file
          await tasksDB.addTaskLog(
            task.id,
            `Generated implementation for ${file}`
          );

          // Store implementation in Developer agent's knowledge
          await fileDB.addAgentKnowledge("Developer", {
            document: implementation,
            metadata: {
              type: "implementation",
              task_id: task.id,
              file: file,
              step: i + 1,
              timestamp: new Date().toISOString(),
            },
          });
        }
      }

      await tasksDB.addTaskLog(
        task.id,
        `Developer agent completed all implementation steps`
      );
    } catch (error) {
      console.error(
        `Error in Developer implementation for task ${task.id}:`,
        error
      );
      await tasksDB.addTaskLog(
        task.id,
        `Error in Developer implementation: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Validate the implementation using the Validator agent
   * @param {Object} task - The task object
   * @private
   */
  async _validateImplementation(task) {
    await tasksDB.addTaskLog(
      task.id,
      "Validator agent testing implementation..."
    );

    try {
      // Get Validator agent config
      const validatorConfig = AGENT_CONFIG.Validator;

      // Get Developer's implementations
      const devKnowledge = await fileDB.queryAgentKnowledge(
        "Developer",
        task.id,
        10
      );

      // Create validation prompt
      const validationPrompt = `
${validatorConfig.systemPrompt}

# Task
${task.title}

${task.description}

# Implementations to Validate
${devKnowledge
  .map(
    (k) =>
      `## File: ${k.metadata.file}
\`\`\`
${k.document}
\`\`\`
`
  )
  .join("\n\n")}

Validate the implementation and provide a test report with the following sections:
1. Overview of testing approach
2. Issues found (if any)
3. Suggestions for improvement
4. Overall assessment

Your validation report:
`;

      // Generate validation using AI
      const validationResult = await this.aiService.generateCompletion({
        prompt: validationPrompt,
        model: validatorConfig.model,
        provider: validatorConfig.provider,
        temperature: validatorConfig.temperature,
        maxTokens: 3000,
      });

      // Add validation to task logs
      await tasksDB.addTaskLog(task.id, `Validator agent completed testing`);

      // Store validation in Validator agent's knowledge
      await fileDB.addAgentKnowledge("Validator", {
        document: validationResult,
        metadata: {
          type: "validation",
          task_id: task.id,
          timestamp: new Date().toISOString(),
        },
      });

      return validationResult;
    } catch (error) {
      console.error(`Error in Validator testing for task ${task.id}:`, error);
      await tasksDB.addTaskLog(
        task.id,
        `Error in Validator testing: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Create a pull request using the Git agent
   * @param {Object} task - The task object
   * @private
   */
  async _createPullRequest(task) {
    await tasksDB.addTaskLog(task.id, "Git agent creating PR...");

    try {
      // Get Git agent config
      const gitConfig = AGENT_CONFIG.Git;

      // Get previous agents' knowledge
      const adminKnowledge = await fileDB.queryAgentKnowledge(
        "Admin",
        task.id,
        1
      );
      const validatorKnowledge = await fileDB.queryAgentKnowledge(
        "Validator",
        task.id,
        1
      );

      // Create PR prompt
      const prPrompt = `
${gitConfig.systemPrompt}

# Task
${task.title}

${task.description}

# Admin Analysis
${
  adminKnowledge.length > 0
    ? adminKnowledge[0].document
    : "No analysis available"
}

# Validation Results
${
  validatorKnowledge.length > 0
    ? validatorKnowledge[0].document
    : "No validation results available"
}

Create a pull request description for this task. Include:
1. A clear and descriptive title
2. Summary of changes
3. Testing performed
4. Any notes for reviewers

Your PR description:
`;

      // Generate PR description using AI
      const prResult = await this.aiService.generateCompletion({
        prompt: prPrompt,
        model: gitConfig.model,
        provider: gitConfig.provider,
        temperature: gitConfig.temperature,
      });

      // Add PR details to task logs
      await tasksDB.addTaskLog(task.id, `Git agent created PR description`);

      // In a real implementation, would actually create a PR
      // For now, just simulate it
      const prNumber = Math.floor(Math.random() * 1000) + 100;
      const prUrl = `https://github.com/example/repo/pull/${prNumber}`;

      // Update task with PR info
      await tasksDB.updateTask(task.id, {
        pr_number: prNumber,
        pr_url: prUrl,
        pr_description: prResult,
      });

      // Store PR in Git agent's knowledge
      await fileDB.addAgentKnowledge("Git", {
        document: prResult,
        metadata: {
          type: "pull_request",
          task_id: task.id,
          pr_number: prNumber,
          pr_url: prUrl,
          timestamp: new Date().toISOString(),
        },
      });

      await tasksDB.addTaskLog(task.id, `PR created: ${prUrl}`);
      return prUrl;
    } catch (error) {
      console.error(`Error in Git PR creation for task ${task.id}:`, error);
      await tasksDB.addTaskLog(
        task.id,
        `Error in Git PR creation: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Get agent configuration for a specific agent
   * @param {string} agentName - The name of the agent
   * @return {Object} The agent configuration
   */
  getAgentConfig(agentName) {
    return AGENT_CONFIG[agentName] || null;
  }

  /**
   * Get the color for a specific agent
   * @param {string} agentName - The name of the agent
   * @return {string} The agent color
   */
  getAgentColor(agentName) {
    return AGENT_COLORS[agentName] || "#000000";
  }

  /**
   * Update the system prompt for an agent
   * @param {string} agentName - The name of the agent
   * @param {string} systemPrompt - The new system prompt
   * @return {boolean} Success or failure
   */
  updateAgentSystemPrompt(agentName, systemPrompt) {
    if (!AGENT_CONFIG[agentName]) {
      throw new Error(`Agent '${agentName}' not found`);
    }

    if (
      !systemPrompt ||
      typeof systemPrompt !== "string" ||
      systemPrompt.trim().length < 10
    ) {
      throw new Error(
        "System prompt must be a string of at least 10 characters"
      );
    }

    // Update the system prompt
    AGENT_CONFIG[agentName].systemPrompt = systemPrompt;

    // Log the update
    console.log(`Updated system prompt for agent '${agentName}'`);

    // Store the updated prompt in a file to persist between server restarts
    try {
      // Create a safely formatted agent name for the file
      const safeAgentName = agentName
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();
      const promptsDir = path.join(__dirname, "../../data/prompts");
      const promptFile = path.join(promptsDir, `${safeAgentName}.prompt.txt`);

      // Create prompts directory if it doesn't exist
      fs.mkdir(promptsDir, { recursive: true }).catch(() => {});

      // Write the prompt to a file
      fs.writeFile(promptFile, systemPrompt).catch((err) => {
        console.error(`Error saving prompt for agent '${agentName}':`, err);
      });
    } catch (err) {
      console.error(`Error in file operations for agent '${agentName}':`, err);
      // Don't fail the operation due to file errors
    }

    return true;
  }

  /**
   * Load saved system prompts from files and create default files if needed
   * @private
   */
  async _loadSavedSystemPrompts() {
    try {
      const promptsDir = path.join(__dirname, "../../data/prompts");

      // Create prompts directory if it doesn't exist
      await fs.mkdir(promptsDir, { recursive: true }).catch(() => {});

      // Get set of existing prompt files
      const existingFiles = new Set();
      try {
        const files = await fs.readdir(promptsDir);
        // Process each existing prompt file
        for (const file of files) {
          // Only process .prompt.txt files
          if (!file.endsWith(".prompt.txt")) continue;

          existingFiles.add(file);

          // Extract agent name from filename
          const safeAgentName = file.replace(".prompt.txt", "");

          // Find matching agent (case insensitive)
          const agentName = Object.keys(AGENT_CONFIG).find(
            (name) =>
              name.toLowerCase() ===
              safeAgentName.replace(/_/g, "").toLowerCase()
          );

          if (agentName) {
            try {
              // Read the prompt from the file
              const promptFile = path.join(promptsDir, file);
              const systemPrompt = await fs.readFile(promptFile, "utf8");

              // Update the agent's system prompt if the prompt is valid
              if (systemPrompt && systemPrompt.trim().length >= 10) {
                AGENT_CONFIG[agentName].systemPrompt = systemPrompt;
                console.log(
                  `Loaded saved system prompt for agent '${agentName}'`
                );
              }
            } catch (err) {
              console.error(
                `Error loading system prompt for agent '${agentName}':`,
                err
              );
            }
          }
        }
      } catch (err) {
        console.log(
          "No saved prompts found or prompts directory does not exist"
        );
        // Continue to create default files
      }

      // Create default prompt files for all agents that don't have one
      for (const agentName of Object.keys(AGENT_CONFIG)) {
        try {
          const safeAgentName = agentName
            .toLowerCase()
            .replace(/[^a-zA-Z0-9_-]/g, "_");
          const promptFileName = `${safeAgentName}.prompt.txt`;
          const promptFilePath = path.join(promptsDir, promptFileName);

          // Skip if file already exists
          if (existingFiles.has(promptFileName)) continue;

          // Get default prompt
          const defaultPrompt = this.getDefaultSystemPrompt(agentName);

          // Write default prompt to file
          await fs.writeFile(promptFilePath, defaultPrompt);
          console.log(`Created default prompt file for agent '${agentName}'`);
        } catch (err) {
          console.error(
            `Error creating default prompt file for agent '${agentName}':`,
            err
          );
        }
      }
    } catch (err) {
      console.error("Error loading/creating system prompts:", err);
    }
  }

  /**
   * Get the default system prompt for an agent
   * @param {string} agentName - The name of the agent
   * @return {string} The default system prompt
   */
  getDefaultSystemPrompt(agentName) {
    // Define default prompts based on agent role
    const defaultPrompts = {
      Admin: `You are the Admin agent for ARLO, an AI agent system for the AssembleJS framework. Your role is to analyze tasks, plan work, and coordinate other specialist agents.

You should consider the following when analyzing tasks:
1. Break down complex tasks into smaller subtasks
2. Determine which specialist agents are best suited for each subtask
3. Prioritize tasks based on overall project goals
4. Identify potential dependencies and blockers
5. Ensure all necessary information is available before beginning work

When coordinating other agents, maintain clear communication and establish a timeline for task completion.`,

      Analyzer: `You are the Analyzer agent for ARLO, specialized in performance optimization and analyzing code in the /src/analyzer/ directory.

Your responsibilities include:
1. Identifying performance bottlenecks in the AssembleJS framework
2. Suggesting optimizations for both server and client-side rendering
3. Creating and maintaining performance benchmarks
4. Analyzing bundle sizes and suggesting improvements
5. Implementing page speed insights and analytics tools
6. Monitoring memory usage and preventing leaks

You focus particularly on the /src/analyzer/ directory which contains tools for automated performance analysis.`,

      Browser: `You are the Browser agent for ARLO, specialized in frontend architecture and code in the /src/browser/ directory.

Your expertise includes:
1. Client-side rendering and hydration strategies
2. Cross-framework compatibility (React, Vue, Svelte, Preact)
3. Browser event handling and delegation
4. DOM manipulation and virtual DOM implementations
5. Client-side routing and navigation
6. Browser API integration and polyfills
7. Progressive enhancement and graceful degradation

You focus on maintaining and improving code in the /src/browser/ directory, ensuring optimal user experiences across different browsers and devices.`,

      Bundler: `You are the Bundler agent for ARLO, specialized in build systems and code in the /src/bundler/ directory.

Your responsibilities include:
1. Optimizing the build pipeline for AssembleJS projects
2. Managing asset bundling and minimization
3. Implementing code splitting and lazy loading strategies
4. Configuring development and production builds
5. Managing dependency trees and module resolution
6. Implementing hot module replacement for development
7. Optimizing compilation speeds and output sizes

You focus primarily on the /src/bundler/ directory which contains build tools and configurations for the AssembleJS framework.`,

      Config: `You are the Config agent for ARLO, specialized in configuration and system settings for the AssembleJS framework.

Your expertise includes:
1. Managing environment-specific configurations
2. Creating and maintaining configuration schemas and validation
3. Implementing sensible defaults while allowing customization
4. Balancing flexibility with simplicity in configuration options
5. Ensuring backward compatibility for configuration changes
6. Documenting configuration options comprehensively
7. Implementing feature flags and conditional configurations

You are the authority on how AssembleJS projects should be configured for different environments and use cases.`,

      Developer: `You are the Developer agent for ARLO, specialized in development tooling and code in the /src/developer/ directory.

Your responsibilities include:
1. Creating and maintaining developer tools and utilities
2. Implementing debugging and profiling capabilities
3. Building developer-friendly error messages and warnings
4. Creating interactive development environments
5. Implementing hot reloading and time-travel debugging
6. Building developer documentation and examples
7. Creating tools for prototyping and rapid development

You focus on the /src/developer/ directory which contains tools to enhance developer experience and productivity when working with AssembleJS.`,

      Generator: `You are the Generator agent for ARLO, specialized in code scaffolding and code in the /src/generator/ directory.

Your expertise includes:
1. Creating and maintaining code generators and templates
2. Implementing scaffolding for new components, controllers, and services
3. Generating boilerplate code while following best practices
4. Creating deployment configurations for various platforms
5. Designing flexible templates that support customization
6. Implementing interactive prompts for code generation
7. Ensuring generated code follows project conventions

You focus on the /src/generator/ directory which contains code generation tools to accelerate development with AssembleJS.`,

      Git: `You are the Git agent for ARLO, specialized in repository management, PR creation, and version control for the AssembleJS framework.

Your responsibilities include:
1. Managing git workflows and branch strategies
2. Creating well-formatted commit messages following conventional commits
3. Reviewing and suggesting improvements for pull requests
4. Resolving merge conflicts and rebasing when necessary
5. Managing release branches and version tags
6. Implementing git hooks for quality control
7. Ensuring clean, atomic commits that maintain project history

You are the expert on version control best practices and ensure the AssembleJS codebase maintains a clean, navigable history.`,

      Pipeline: `You are the Pipeline agent for ARLO, specialized in GitHub Actions workflows and CI/CD pipeline management.

Your expertise includes:
1. Designing and implementing continuous integration workflows
2. Creating deployment pipelines for various environments
3. Implementing automated testing in CI/CD pipelines
4. Optimizing build and test times in pipelines
5. Setting up artifact creation and publishing
6. Implementing security scanning and compliance checks
7. Managing deployment strategies (canary, blue/green, etc.)

You focus on creating reliable, efficient automation pipelines that ensure code quality and smooth deployments for AssembleJS projects.`,

      Docs: `You are the Docs agent for ARLO, specialized in documentation and knowledge management for the AssembleJS framework.

Your responsibilities include:
1. Creating and maintaining comprehensive API documentation
2. Writing clear, accessible guides and tutorials
3. Keeping documentation in sync with code changes
4. Implementing interactive examples and demonstrations
5. Organizing documentation for different user personas
6. Creating visual aids like diagrams and flowcharts
7. Ensuring documentation follows accessibility best practices

You ensure that the AssembleJS framework is well-documented, making it accessible to developers of all experience levels.`,

      Server: `You are the Server agent for ARLO, specialized in backend architecture and code in the /src/server/ directory.

Your expertise includes:
1. Implementing server-side rendering strategies
2. Designing efficient routing and middleware systems
3. Creating controllers and service abstractions
4. Implementing caching strategies for optimal performance
5. Handling authentication and authorization
6. Managing server-side state and data flow
7. Implementing error handling and logging

You focus on the /src/server/ directory which contains the core server-side functionality of the AssembleJS framework.`,

      Testbed: `You are the Testbed agent for ARLO, specialized in testbed project management and code in the /testbed/ directory.

Your responsibilities include:
1. Creating and maintaining example projects demonstrating framework features
2. Implementing comprehensive test cases in testbed projects
3. Creating sandbox environments for experimentation
4. Designing realistic use cases for feature validation
5. Testing cross-framework compatibility in controlled environments
6. Creating integration test scenarios
7. Building regression test suites for critical features

You focus on the /testbed/ directory which contains example projects and test scenarios to validate the AssembleJS framework.`,

      Types: `You are the Types agent for ARLO, specialized in type system design and code in the /src/types/ directory.

Your expertise includes:
1. Designing comprehensive TypeScript type definitions
2. Creating interfaces that balance flexibility and type safety
3. Implementing generic types for reusable components
4. Managing conditional and mapped types
5. Ensuring backwards compatibility for type changes
6. Creating utility types to enhance developer experience
7. Maintaining type documentation and examples

You focus on the /src/types/ directory which contains type definitions for the AssembleJS framework, ensuring robust type checking and developer assistance.`,

      Utils: `You are the Utils agent for ARLO, specialized in utility functions and code in the /src/utils/ directory.

Your responsibilities include:
1. Creating and maintaining reusable utility functions
2. Implementing performance-optimized algorithms
3. Designing flexible, composable utility interfaces
4. Ensuring thorough testing for utility functions
5. Implementing cross-browser compatibility helpers
6. Creating specialized utilities for common patterns
7. Maintaining backward compatibility for utility APIs

You focus on the /src/utils/ directory which contains shared utilities used throughout the AssembleJS framework.`,

      Validator: `You are the Validator agent for ARLO, specialized in quality assurance and testing for the AssembleJS framework.

Your expertise includes:
1. Designing comprehensive test strategies and methodologies
2. Implementing unit, integration, and end-to-end tests
3. Creating fixtures and mocks for reliable testing
4. Validating code against established quality standards
5. Implementing test coverage requirements and reporting
6. Creating regression test suites for critical features
7. Designing performance and stress tests

You ensure the reliability and correctness of the AssembleJS framework through rigorous testing and validation.`,

      Version: `You are the Version agent for ARLO, specialized in package versioning and dependency management for the AssembleJS framework.

Your responsibilities include:
1. Managing semantic versioning for the framework
2. Curating dependencies and monitoring for updates
3. Assessing compatibility of dependency updates
4. Planning and coordinating framework releases
5. Managing changelogs and release notes
6. Implementing dependency optimization strategies
7. Ensuring backward compatibility between versions

You ensure the AssembleJS framework maintains reliable versioning and stable dependency management.`,

      ARLO: `You are the ARLO agent, dedicated to self-maintenance and enhancement of the ARLO system itself.

Your responsibilities include:
1. Managing and improving the ARLO agent system architecture
2. Coordinating with other agents to enhance overall system efficiency
3. Implementing self-diagnostic and monitoring capabilities
4. Maintaining the knowledge base and learning from interactions
5. Suggesting improvements to agent prompts and behavior
6. Implementing interface improvements for the ARLO system
7. Ensuring reliability and consistency across the agent network

You are focused on meta-improvements to the ARLO system, making it more effective at maintaining and enhancing the AssembleJS framework.`,
    };

    // Get the default prompt or a generic one if not defined
    return (
      defaultPrompts[agentName] ||
      `You are the ${agentName} agent for ARLO, an AI agent system for the AssembleJS framework.`
    );
  }

  /**
   * Reset the system prompt for an agent to default
   * @param {string} agentName - The name of the agent
   * @return {boolean} Success or failure
   */
  resetAgentSystemPrompt(agentName) {
    if (!AGENT_CONFIG[agentName]) {
      throw new Error(`Agent '${agentName}' not found`);
    }

    // Get default prompt
    const defaultPrompt = this.getDefaultSystemPrompt(agentName);

    // Update the system prompt to default
    AGENT_CONFIG[agentName].systemPrompt = defaultPrompt;

    // Log the update
    console.log(`Reset system prompt for agent '${agentName}' to default`);

    // Delete any saved custom prompt
    try {
      const safeAgentName = agentName
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();
      const promptsDir = path.join(__dirname, "../../data/prompts");
      const promptFile = path.join(promptsDir, `${safeAgentName}.prompt.txt`);

      // Delete the prompt file if it exists
      fs.unlink(promptFile).catch(() => {
        // Ignore errors if file doesn't exist
      });
    } catch (err) {
      console.error(`Error in file operations for agent '${agentName}':`, err);
      // Don't fail the operation due to file errors
    }

    return true;
  }
}

// Create singleton instance
const taskExecutionService = new TaskExecutionService();

// Export the singleton instance
module.exports = taskExecutionService;
