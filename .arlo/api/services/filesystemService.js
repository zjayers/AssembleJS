/**
 * Filesystem Service
 * Service for safe file operations with git awareness
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const { createError } = require('../utils/errorUtils');
const analytics = require('../models/analytics');

/**
 * Filesystem Service
 * Provides safe file operations with version control awareness
 */
class FilesystemService {
  constructor() {
    // Set the repository root path (default to parent directory of the .arlo directory)
    this.repositoryRoot = process.env.REPOSITORY_ROOT || 
      path.resolve(__dirname, '../../../');
    
    // Backup directory for file modifications
    this.backupDir = path.join(__dirname, '../../data/backups');
    
    // Initialize file operation lock tracking
    this.fileLocks = new Map();
    
    // Set of directories that are protected from modification (e.g., .git, node_modules)
    this.protectedDirectories = new Set([
      '.git',
      'node_modules',
      '.arlo/data/backups'
    ]);
    
    // File extensions that are considered safe to modify
    this.safeExtensions = new Set([
      '.js', '.jsx', '.ts', '.tsx', '.md', '.json', '.html', '.css', '.scss',
      '.svg', '.yml', '.yaml', '.txt', '.ejs', '.hbs', '.vue', '.svelte'
    ]);
    
    console.log('Filesystem Service initialized with repository root:', this.repositoryRoot);
  }

  /**
   * Initialize the service, creating necessary directories
   */
  async initialize() {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Try to get repository information
      try {
        const isGitRepo = await this.isGitRepository();
        if (isGitRepo) {
          console.log('Git repository detected');
        } else {
          console.warn('No git repository detected at', this.repositoryRoot);
        }
      } catch (error) {
        console.warn('Error checking git repository:', error.message);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize FilesystemService:', error);
      return false;
    }
  }

  /**
   * Create a backup of a file before modification
   * @param {string} filePath - Absolute path of the file to backup
   * @returns {Promise<string>} Path to the backup file
   */
  async backupFile(filePath) {
    try {
      // Create backup directory with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(
        this.backupDir, 
        `${path.basename(filePath)}.${timestamp}.bak`
      );
      
      // Check if file exists before backing up
      try {
        await fs.access(filePath);
        // Copy file to backup location
        await fs.copyFile(filePath, backupPath);
        return backupPath;
      } catch (error) {
        // File doesn't exist, no backup needed
        return null;
      }
    } catch (error) {
      console.error(`Error backing up file ${filePath}:`, error);
      throw createError(`Failed to backup file: ${error.message}`, 'FILESYSTEM_ERROR');
    }
  }

  /**
   * Restore a file from backup
   * @param {string} backupPath - Path to the backup file
   * @param {string} originalPath - Original path to restore to
   * @returns {Promise<boolean>} Success or failure
   */
  async restoreBackup(backupPath, originalPath) {
    try {
      // Check if backup exists
      await fs.access(backupPath);
      
      // Copy backup back to original location
      await fs.copyFile(backupPath, originalPath);
      
      // Log the restoration
      console.log(`Restored file ${originalPath} from backup ${backupPath}`);
      
      return true;
    } catch (error) {
      console.error(`Error restoring backup ${backupPath}:`, error);
      throw createError(`Failed to restore backup: ${error.message}`, 'FILESYSTEM_ERROR');
    }
  }

  /**
   * Safely read a file
   * @param {string} filePath - Path to the file (relative to repo root or absolute)
   * @returns {Promise<string>} File contents
   */
  async readFile(filePath) {
    const resolvedPath = this.resolvePath(filePath);
    
    try {
      // Check if file exists
      await fs.access(resolvedPath);
      
      // Read file contents
      const content = await fs.readFile(resolvedPath, 'utf8');
      
      // Track read operation in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.FILE_OPERATION, {
        operation: 'read',
        path: resolvedPath,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return content;
    } catch (error) {
      console.error(`Error reading file ${resolvedPath}:`, error);
      throw createError(`Failed to read file: ${error.message}`, 'FILESYSTEM_ERROR');
    }
  }

  /**
   * Safely write to a file with backup and locking
   * @param {string} filePath - Path to the file (relative to repo root or absolute)
   * @param {string} content - Content to write
   * @param {boolean} createBackup - Whether to create a backup before writing
   * @returns {Promise<boolean>} Success or failure
   */
  async writeFile(filePath, content, createBackup = true) {
    const resolvedPath = this.resolvePath(filePath);
    
    // Security checks
    await this.validateFilePath(resolvedPath);
    
    // Acquire lock for this file
    const lockAcquired = await this.acquireFileLock(resolvedPath);
    if (!lockAcquired) {
      throw createError(`File ${resolvedPath} is locked by another operation`, 'FILESYSTEM_LOCKED');
    }
    
    let backupPath = null;
    
    try {
      // Create backup if requested
      if (createBackup) {
        backupPath = await this.backupFile(resolvedPath);
      }
      
      // Ensure directory exists
      const dirPath = path.dirname(resolvedPath);
      await fs.mkdir(dirPath, { recursive: true });
      
      // Write file contents
      await fs.writeFile(resolvedPath, content, 'utf8');
      
      // Track write operation in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.FILE_OPERATION, {
        operation: 'write',
        path: resolvedPath,
        backup: backupPath,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return true;
    } catch (error) {
      console.error(`Error writing file ${resolvedPath}:`, error);
      
      // Attempt to restore from backup if available
      if (backupPath) {
        try {
          await this.restoreBackup(backupPath, resolvedPath);
          console.log(`Restored ${resolvedPath} from backup after write error`);
        } catch (restoreError) {
          console.error(`Failed to restore backup for ${resolvedPath}:`, restoreError);
        }
      }
      
      throw createError(`Failed to write file: ${error.message}`, 'FILESYSTEM_ERROR');
    } finally {
      // Release the lock
      this.releaseFileLock(resolvedPath);
    }
  }

  /**
   * Check if a file exists
   * @param {string} filePath - Path to the file (relative to repo root or absolute)
   * @returns {Promise<boolean>} Whether the file exists
   */
  async fileExists(filePath) {
    const resolvedPath = this.resolvePath(filePath);
    
    try {
      await fs.access(resolvedPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * List files in a directory
   * @param {string} dirPath - Path to the directory (relative to repo root or absolute)
   * @param {Object} options - Options for listing files
   * @param {boolean} options.recursive - Whether to list files recursively
   * @param {Array<string>} options.extensions - File extensions to include (e.g., ['.js', '.ts'])
   * @param {Array<string>} options.exclude - Patterns to exclude (e.g., ['node_modules', '.git'])
   * @returns {Promise<Array<string>>} List of file paths
   */
  async listFiles(dirPath, options = {}) {
    const resolvedPath = this.resolvePath(dirPath);
    const { recursive = false, extensions = [], exclude = [] } = options;
    
    // Convert exclude patterns to RegExp objects
    const excludePatterns = exclude.map(pattern => new RegExp(pattern));
    
    try {
      // Check if directory exists
      await fs.access(resolvedPath);
      
      // Helper function for recursive listing
      const listFilesRecursive = async (currentPath) => {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        let files = [];
        
        for (const entry of entries) {
          const entryPath = path.join(currentPath, entry.name);
          
          // Check if path should be excluded
          const shouldExclude = excludePatterns.some(pattern => pattern.test(entryPath));
          if (shouldExclude) continue;
          
          if (entry.isDirectory() && recursive) {
            // Skip protected directories
            if (this.isProtectedDirectory(entryPath)) continue;
            
            // Recursively list files in subdirectory
            const subFiles = await listFilesRecursive(entryPath);
            files = files.concat(subFiles);
          } else if (entry.isFile()) {
            // Check file extension if extensions filter is provided
            if (extensions.length > 0) {
              const ext = path.extname(entry.name).toLowerCase();
              if (extensions.includes(ext)) {
                files.push(entryPath);
              }
            } else {
              files.push(entryPath);
            }
          }
        }
        
        return files;
      };
      
      // List files
      const files = await listFilesRecursive(resolvedPath);
      
      // Make paths relative to repository root
      return files.map(file => path.relative(this.repositoryRoot, file));
    } catch (error) {
      console.error(`Error listing files in directory ${resolvedPath}:`, error);
      throw createError(`Failed to list files: ${error.message}`, 'FILESYSTEM_ERROR');
    }
  }

  /**
   * Modify a file by replacing a specific string pattern
   * @param {string} filePath - Path to the file (relative to repo root or absolute)
   * @param {string} pattern - Pattern to replace
   * @param {string} replacement - Replacement string
   * @returns {Promise<boolean>} Success or failure
   */
  async modifyFile(filePath, pattern, replacement) {
    const resolvedPath = this.resolvePath(filePath);
    
    // Security checks
    await this.validateFilePath(resolvedPath);
    
    // Acquire lock for this file
    const lockAcquired = await this.acquireFileLock(resolvedPath);
    if (!lockAcquired) {
      throw createError(`File ${resolvedPath} is locked by another operation`, 'FILESYSTEM_LOCKED');
    }
    
    let backupPath = null;
    
    try {
      // Create backup
      backupPath = await this.backupFile(resolvedPath);
      
      // Read file contents
      const content = await fs.readFile(resolvedPath, 'utf8');
      
      // Replace pattern
      const modifiedContent = content.replace(pattern, replacement);
      
      // If no changes were made, return early
      if (content === modifiedContent) {
        return false;
      }
      
      // Write modified content
      await fs.writeFile(resolvedPath, modifiedContent, 'utf8');
      
      // Track modification in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.FILE_OPERATION, {
        operation: 'modify',
        path: resolvedPath,
        backup: backupPath,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return true;
    } catch (error) {
      console.error(`Error modifying file ${resolvedPath}:`, error);
      
      // Attempt to restore from backup if available
      if (backupPath) {
        try {
          await this.restoreBackup(backupPath, resolvedPath);
          console.log(`Restored ${resolvedPath} from backup after modification error`);
        } catch (restoreError) {
          console.error(`Failed to restore backup for ${resolvedPath}:`, restoreError);
        }
      }
      
      throw createError(`Failed to modify file: ${error.message}`, 'FILESYSTEM_ERROR');
    } finally {
      // Release the lock
      this.releaseFileLock(resolvedPath);
    }
  }

  /**
   * Delete a file with backup
   * @param {string} filePath - Path to the file (relative to repo root or absolute)
   * @returns {Promise<boolean>} Success or failure
   */
  async deleteFile(filePath) {
    const resolvedPath = this.resolvePath(filePath);
    
    // Security checks
    await this.validateFilePath(resolvedPath);
    
    // Acquire lock for this file
    const lockAcquired = await this.acquireFileLock(resolvedPath);
    if (!lockAcquired) {
      throw createError(`File ${resolvedPath} is locked by another operation`, 'FILESYSTEM_LOCKED');
    }
    
    let backupPath = null;
    
    try {
      // Create backup
      backupPath = await this.backupFile(resolvedPath);
      
      // Delete file
      await fs.unlink(resolvedPath);
      
      // Track deletion in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.FILE_OPERATION, {
        operation: 'delete',
        path: resolvedPath,
        backup: backupPath,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return true;
    } catch (error) {
      console.error(`Error deleting file ${resolvedPath}:`, error);
      throw createError(`Failed to delete file: ${error.message}`, 'FILESYSTEM_ERROR');
    } finally {
      // Release the lock
      this.releaseFileLock(resolvedPath);
    }
  }

  /**
   * Create a new directory
   * @param {string} dirPath - Path to the directory (relative to repo root or absolute)
   * @returns {Promise<boolean>} Success or failure
   */
  async createDirectory(dirPath) {
    const resolvedPath = this.resolvePath(dirPath);
    
    // Security checks
    if (this.isProtectedDirectory(resolvedPath)) {
      throw createError(`Cannot create protected directory ${resolvedPath}`, 'FILESYSTEM_SECURITY');
    }
    
    try {
      // Create directory
      await fs.mkdir(resolvedPath, { recursive: true });
      
      // Track directory creation in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.FILE_OPERATION, {
        operation: 'createDirectory',
        path: resolvedPath,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return true;
    } catch (error) {
      console.error(`Error creating directory ${resolvedPath}:`, error);
      throw createError(`Failed to create directory: ${error.message}`, 'FILESYSTEM_ERROR');
    }
  }

  /**
   * Check if the path is within the repository
   * @param {string} filePath - Absolute path to check
   * @returns {boolean} Whether the path is within the repository
   */
  isWithinRepository(filePath) {
    const resolvedPath = path.resolve(filePath);
    return resolvedPath.startsWith(this.repositoryRoot);
  }

  /**
   * Check if the path is in a protected directory
   * @param {string} filePath - Absolute path to check
   * @returns {boolean} Whether the path is in a protected directory
   */
  isProtectedDirectory(filePath) {
    const relativePath = path.relative(this.repositoryRoot, filePath);
    
    // Check if path is in a protected directory
    return this.protectedDirectories.has(relativePath) || 
      Array.from(this.protectedDirectories).some(dir => 
        relativePath.startsWith(dir + path.sep));
  }

  /**
   * Check if the file extension is considered safe to modify
   * @param {string} filePath - Path to check
   * @returns {boolean} Whether the file extension is safe
   */
  hasSafeExtension(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.safeExtensions.has(ext);
  }

  /**
   * Validate a file path for security concerns
   * @param {string} filePath - Absolute path to validate
   * @throws {Error} If the path is invalid
   */
  async validateFilePath(filePath) {
    // Check if path is within repository
    if (!this.isWithinRepository(filePath)) {
      throw createError(
        `File path ${filePath} is outside the repository root`, 
        'FILESYSTEM_SECURITY'
      );
    }
    
    // Check if path is in a protected directory
    if (this.isProtectedDirectory(filePath)) {
      throw createError(
        `File path ${filePath} is in a protected directory`, 
        'FILESYSTEM_SECURITY'
      );
    }
    
    // Check file extension for writes
    if (!this.hasSafeExtension(filePath)) {
      throw createError(
        `File extension for ${filePath} is not on the safe list`, 
        'FILESYSTEM_SECURITY'
      );
    }
  }

  /**
   * Resolve a path to an absolute path, handling both relative and absolute paths
   * @param {string} inputPath - Path to resolve
   * @returns {string} Absolute path
   */
  resolvePath(inputPath) {
    // If already absolute, just normalize it
    if (path.isAbsolute(inputPath)) {
      return path.normalize(inputPath);
    }
    
    // Otherwise, resolve relative to repository root
    return path.resolve(this.repositoryRoot, inputPath);
  }

  /**
   * Acquire a lock for a file operation
   * @param {string} filePath - Absolute path to the file
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} Whether the lock was acquired
   */
  async acquireFileLock(filePath, timeout = 5000) {
    const start = Date.now();
    
    while (this.fileLocks.has(filePath)) {
      // Check for timeout
      if (Date.now() - start > timeout) {
        return false;
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Acquire the lock
    this.fileLocks.set(filePath, {
      timestamp: Date.now(),
      operation: 'lock'
    });
    
    return true;
  }

  /**
   * Release a file lock
   * @param {string} filePath - Absolute path to the file
   */
  releaseFileLock(filePath) {
    this.fileLocks.delete(filePath);
  }

  /**
   * Check if the current directory is a git repository
   * @returns {Promise<boolean>} Whether it's a git repository
   */
  async isGitRepository() {
    try {
      // Check if .git directory exists
      const gitDir = path.join(this.repositoryRoot, '.git');
      await fs.access(gitDir);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the current git branch
   * @returns {Promise<string>} Current branch name
   */
  async getCurrentBranch() {
    try {
      if (!await this.isGitRepository()) {
        return null;
      }
      
      const output = execSync('git branch --show-current', {
        cwd: this.repositoryRoot,
        encoding: 'utf8'
      });
      
      return output.trim();
    } catch (error) {
      console.error('Error getting current branch:', error);
      return null;
    }
  }

  /**
   * Check if the current working directory is clean (no uncommitted changes)
   * @returns {Promise<boolean>} Whether the working directory is clean
   */
  async isWorkingDirectoryClean() {
    try {
      if (!await this.isGitRepository()) {
        return false;
      }
      
      const output = execSync('git status --porcelain', {
        cwd: this.repositoryRoot,
        encoding: 'utf8'
      });
      
      return output.trim() === '';
    } catch (error) {
      console.error('Error checking working directory status:', error);
      return false;
    }
  }

  /**
   * Get the list of files modified in the current working directory
   * @returns {Promise<Array<string>>} List of modified files
   */
  async getModifiedFiles() {
    try {
      if (!await this.isGitRepository()) {
        return [];
      }
      
      const output = execSync('git status --porcelain', {
        cwd: this.repositoryRoot,
        encoding: 'utf8'
      });
      
      return output
        .trim()
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          // Extract the file path from the git status output
          // Status format is like: " M file.js" or "?? newfile.js"
          return line.substring(3);
        });
    } catch (error) {
      console.error('Error getting modified files:', error);
      return [];
    }
  }
}

// Create singleton instance
const filesystemService = new FilesystemService();

// Export the singleton instance
module.exports = filesystemService;