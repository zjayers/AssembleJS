/**
 * Code Executor Model
 * Implements real code analysis and execution capabilities for ARLO agents
 */

const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

// Base directory (2 levels up from this file location)
const baseDir = path.resolve(__dirname, "../../../");
const arloDir = path.join(baseDir, ".arlo");

// Code execution functions
const codeExecutor = {
  /**
   * Analyze a directory or file in the repository
   * @param {string} targetPath - Path relative to repository root
   * @param {object} options - Analysis options
   * @return {Promise<object>} Analysis results
   */
  async analyzeCode(targetPath, options = {}) {
    const fullPath = path.join(baseDir, targetPath);
    console.log(`Analyzing code at: ${fullPath}`);

    try {
      // Check if path exists
      await fs.access(fullPath);

      // Get file/directory stats
      const stats = await fs.stat(fullPath);

      // Execute different analysis based on whether it's a file or directory
      if (stats.isFile()) {
        return await this.analyzeFile(fullPath, options);
      } else if (stats.isDirectory()) {
        return await this.analyzeDirectory(fullPath, options);
      } else {
        throw new Error(
          `Path is neither a file nor a directory: ${targetPath}`
        );
      }
    } catch (error) {
      console.error(`Error analyzing code at ${targetPath}:`, error);
      throw error;
    }
  },

  /**
   * Analyze a specific file
   * @param {string} filePath - Absolute path to the file
   * @param {object} options - Analysis options
   * @return {Promise<object>} File analysis results
   */
  async analyzeFile(filePath, options = {}) {
    try {
      // Read file content
      const content = await fs.readFile(filePath, "utf8");

      // Determine file type from extension
      const ext = path.extname(filePath).toLowerCase();
      const relativePath = path.relative(baseDir, filePath);

      // Basic file stats
      const stats = await fs.stat(filePath);

      // Analyze based on file type
      let analysis = {
        type: "file",
        path: relativePath,
        extension: ext,
        size: stats.size,
        lines: content.split("\n").length,
        modified: stats.mtime,
      };

      // Add content if requested
      if (options.includeContent) {
        analysis.content = content;
      }

      // Specialized analysis by file type
      if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
        analysis = {
          ...analysis,
          ...(await this.analyzeJavaScriptFile(content, filePath)),
        };
      } else if (ext === ".json") {
        analysis = {
          ...analysis,
          ...(await this.analyzeJsonFile(content)),
        };
      } else if (ext === ".md") {
        analysis = {
          ...analysis,
          ...(await this.analyzeMarkdownFile(content)),
        };
      }

      return analysis;
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      throw error;
    }
  },

  /**
   * Analyze a directory
   * @param {string} dirPath - Absolute path to the directory
   * @param {object} options - Analysis options
   * @return {Promise<object>} Directory analysis results
   */
  async analyzeDirectory(dirPath, options = {}) {
    try {
      // Get all files in the directory
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      // Filter based on options
      const maxDepth = options.depth || 2;
      const filePattern = options.pattern || null;

      // Prepare results
      const relativePath = path.relative(baseDir, dirPath);
      const result = {
        type: "directory",
        path: relativePath,
        files: [],
        directories: [],
        summary: {
          totalFiles: 0,
          totalDirectories: 0,
          fileTypes: {},
        },
      };

      // Process each entry
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);

        // Skip node_modules and hidden files/dirs
        if (entry.name === "node_modules" || entry.name.startsWith(".")) {
          continue;
        }

        if (entry.isFile()) {
          // Skip files that don't match pattern if provided
          if (filePattern && !entry.name.match(filePattern)) {
            continue;
          }

          const ext = path.extname(entry.name).toLowerCase();
          result.files.push(path.relative(baseDir, entryPath));
          result.summary.totalFiles++;

          // Track file types
          result.summary.fileTypes[ext] =
            (result.summary.fileTypes[ext] || 0) + 1;
        } else if (entry.isDirectory() && maxDepth > 0) {
          result.directories.push(path.relative(baseDir, entryPath));
          result.summary.totalDirectories++;

          // Recursively analyze subdirectories if depth allows
          if (options.recursive && maxDepth > 1) {
            const subOptions = { ...options, depth: maxDepth - 1 };
            const subAnalysis = await this.analyzeDirectory(
              entryPath,
              subOptions
            );

            // Merge summary stats
            result.summary.totalFiles += subAnalysis.summary.totalFiles;
            result.summary.totalDirectories +=
              subAnalysis.summary.totalDirectories;

            // Merge file type counts
            for (const [ext, count] of Object.entries(
              subAnalysis.summary.fileTypes
            )) {
              result.summary.fileTypes[ext] =
                (result.summary.fileTypes[ext] || 0) + count;
            }
          }
        }
      }

      return result;
    } catch (error) {
      console.error(`Error analyzing directory ${dirPath}:`, error);
      throw error;
    }
  },

  /**
   * Analyze a JavaScript/TypeScript file
   * @param {string} content - File content
   * @param {string} filePath - File path for reference
   * @return {Promise<object>} Analysis results
   */
  async analyzeJavaScriptFile(content, filePath) {
    // Simple analysis without AST parsing
    const analysis = {
      language:
        filePath.endsWith(".ts") || filePath.endsWith(".tsx")
          ? "TypeScript"
          : "JavaScript",
      imports: [],
      exports: [],
      classes: [],
      functions: [],
    };

    // Extract imports
    const importRegex =
      /import\s+(?:{[^}]*}|\*\s+as\s+[^,]*|[^,{]*)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      analysis.imports.push(match[1]);
    }

    // Extract exports
    const exportRegex =
      /export\s+(default\s+)?(?:class|function|const|let|var)\s+(\w+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      analysis.exports.push(match[2]);
    }

    // Extract classes
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
    while ((match = classRegex.exec(content)) !== null) {
      analysis.classes.push({
        name: match[1],
        extends: match[2] || null,
      });
    }

    // Extract functions
    const functionRegex =
      /function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(\s*.*?\)\s*=>|(\w+)\s*:\s*(?:async\s*)?\(\s*.*?\)\s*=/g;
    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[1] || match[2] || match[3];
      if (functionName) {
        analysis.functions.push(functionName);
      }
    }

    return analysis;
  },

  /**
   * Analyze a JSON file
   * @param {string} content - File content
   * @return {Promise<object>} Analysis results
   */
  async analyzeJsonFile(content) {
    try {
      const jsonData = JSON.parse(content);

      return {
        isValid: true,
        keys: Object.keys(jsonData),
        keyCount: Object.keys(jsonData).length,
        topLevelStructure: Object.keys(jsonData).map((key) => {
          const value = jsonData[key];
          return {
            key,
            type: Array.isArray(value) ? "array" : typeof value,
          };
        }),
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  },

  /**
   * Analyze a Markdown file
   * @param {string} content - File content
   * @return {Promise<object>} Analysis results
   */
  async analyzeMarkdownFile(content) {
    // Extract headings
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
      });
    }

    // Extract links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];

    while ((match = linkRegex.exec(content)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
      });
    }

    // Extract code blocks
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const codeBlocks = [];

    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || "text",
        code: match[2],
      });
    }

    return {
      headings,
      links,
      codeBlocks,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    };
  },

  /**
   * Make changes to a file
   * @param {string} filePath - Path to the file relative to repository root
   * @param {string} oldContent - Content to replace
   * @param {string} newContent - New content
   * @return {Promise<object>} Result of the operation
   */
  async modifyFile(filePath, oldContent, newContent) {
    const fullPath = path.join(baseDir, filePath);
    console.log(`Modifying file: ${fullPath}`);

    try {
      // Check if file exists
      await fs.access(fullPath);

      // Read file content
      const content = await fs.readFile(fullPath, "utf8");

      // Replace content
      if (!content.includes(oldContent)) {
        throw new Error(`Old content not found in file ${filePath}`);
      }

      const updatedContent = content.replace(oldContent, newContent);

      // Write updated content
      await fs.writeFile(fullPath, updatedContent);

      return {
        success: true,
        message: `File ${filePath} successfully modified`,
        changesMade: true,
      };
    } catch (error) {
      console.error(`Error modifying file ${filePath}:`, error);
      return {
        success: false,
        message: `Error modifying file: ${error.message}`,
        changesMade: false,
      };
    }
  },

  /**
   * Create a new file
   * @param {string} filePath - Path to the file relative to repository root
   * @param {string} content - File content
   * @return {Promise<object>} Result of the operation
   */
  async createFile(filePath, content) {
    const fullPath = path.join(baseDir, filePath);
    console.log(`Creating file: ${fullPath}`);

    try {
      // Check if file already exists
      try {
        await fs.access(fullPath);
        return {
          success: false,
          message: `File ${filePath} already exists`,
          changesMade: false,
        };
      } catch (e) {
        // File doesn't exist, which is what we want
      }

      // Ensure directory exists
      const dirPath = path.dirname(fullPath);
      await fs.mkdir(dirPath, { recursive: true });

      // Write file
      await fs.writeFile(fullPath, content);

      return {
        success: true,
        message: `File ${filePath} successfully created`,
        changesMade: true,
      };
    } catch (error) {
      console.error(`Error creating file ${filePath}:`, error);
      return {
        success: false,
        message: `Error creating file: ${error.message}`,
        changesMade: false,
      };
    }
  },

  /**
   * Delete a file
   * @param {string} filePath - Path to the file relative to repository root
   * @return {Promise<object>} Result of the operation
   */
  async deleteFile(filePath) {
    const fullPath = path.join(baseDir, filePath);
    console.log(`Deleting file: ${fullPath}`);

    try {
      // Check if file exists
      await fs.access(fullPath);

      // Delete file
      await fs.unlink(fullPath);

      return {
        success: true,
        message: `File ${filePath} successfully deleted`,
        changesMade: true,
      };
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      return {
        success: false,
        message: `Error deleting file: ${error.message}`,
        changesMade: false,
      };
    }
  },

  /**
   * Run a command in the repository
   * @param {string} command - Command to run
   * @param {object} options - Command options
   * @return {Promise<object>} Command result
   */
  async runCommand(command, options = {}) {
    // Define safe commands that can be executed
    const safeCommands = [
      "git status",
      "git diff",
      "git log",
      "git branch",
      "npm run",
      "npm test",
      "node -v",
      "ls",
      "find",
      "grep",
      "cat",
    ];

    // Check if command is safe
    const isSafe = safeCommands.some((safeCmd) => command.startsWith(safeCmd));
    if (!isSafe) {
      return {
        success: false,
        message: `Command not allowed: ${command}`,
        stdout: "",
        stderr: "Security: Only a subset of commands are allowed for execution",
      };
    }

    console.log(`Running command: ${command}`);

    try {
      // Run command in repository root
      const { stdout, stderr } = await execPromise(command, {
        cwd: baseDir,
        timeout: options.timeout || 30000,
      });

      return {
        success: true,
        message: `Command executed successfully`,
        stdout,
        stderr,
      };
    } catch (error) {
      console.error(`Error running command ${command}:`, error);
      return {
        success: false,
        message: `Error running command: ${error.message}`,
        stdout: error.stdout || "",
        stderr: error.stderr || "",
      };
    }
  },

  /**
   * Create a git commit with the specified message
   * @param {string} message - Commit message
   * @param {Array<string>} files - Files to include in the commit
   * @return {Promise<object>} Commit result
   */
  async createCommit(message, files = []) {
    console.log(`Creating git commit with message: ${message}`);

    try {
      // Check git status
      const statusResult = await this.runCommand("git status --porcelain");
      if (!statusResult.success) {
        throw new Error(`Failed to get git status: ${statusResult.stderr}`);
      }

      // Check if there are changes to commit
      if (!statusResult.stdout.trim() && files.length === 0) {
        return {
          success: false,
          message: "No changes to commit",
          changesMade: false,
        };
      }

      // Stage specific files if provided
      if (files.length > 0) {
        for (const file of files) {
          const addResult = await this.runCommand(`git add "${file}"`);
          if (!addResult.success) {
            throw new Error(`Failed to add file ${file}: ${addResult.stderr}`);
          }
        }
      } else {
        // Stage all changes
        const addResult = await this.runCommand("git add -A");
        if (!addResult.success) {
          throw new Error(`Failed to stage changes: ${addResult.stderr}`);
        }
      }

      // Create commit
      const commitCmd = `git commit -m "${message}"`;
      const commitResult = await this.runCommand(commitCmd);

      if (!commitResult.success) {
        throw new Error(`Failed to create commit: ${commitResult.stderr}`);
      }

      return {
        success: true,
        message: `Commit created successfully: ${message}`,
        changesMade: true,
        commitInfo: commitResult.stdout,
      };
    } catch (error) {
      console.error(`Error creating commit:`, error);
      return {
        success: false,
        message: `Error creating commit: ${error.message}`,
        changesMade: false,
      };
    }
  },

  /**
   * Create a pull request
   * @param {string} title - PR title
   * @param {string} body - PR description
   * @param {string} baseBranch - Base branch (e.g., 'main')
   * @param {string} headBranch - Head branch (current branch)
   * @return {Promise<object>} PR creation result
   */
  async createPullRequest(title, body, baseBranch = "main", headBranch = "") {
    console.log(`Creating pull request: ${title}`);

    // This is a mock implementation since actual GitHub API calls would require
    // authentication and external API access
    return {
      success: true,
      message: `Pull request created successfully (mock)`,
      changesMade: false,
      prInfo: {
        title,
        body,
        baseBranch,
        headBranch: headBranch || "current-branch",
        url: "https://github.com/example/repo/pull/123",
      },
    };
  },
};

module.exports = codeExecutor;
