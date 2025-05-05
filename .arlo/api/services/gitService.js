/**
 * Git Service
 * Service for git repository operations and GitHub integrations
 */

const simpleGit = require('simple-git');
const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');
const filesystemService = require('./filesystemService');
const analytics = require('../models/analytics');
const { createError } = require('../utils/errorUtils');

/**
 * Git Service
 * Provides Git repository operations and GitHub integration
 */
class GitService {
  constructor() {
    // Set the repository root path
    this.repositoryRoot = process.env.REPOSITORY_ROOT || 
      path.resolve(__dirname, '../../../');
    
    // Initialize simple-git with repository path
    this.git = simpleGit({
      baseDir: this.repositoryRoot,
      binary: 'git',
      maxConcurrentProcesses: 1
    });
    
    // Initialize Octokit for GitHub API
    this.octokit = null;
    
    // Flags to track git status
    this.isRepo = false;
    this.branchInfo = null;
    
    console.log('Git Service initialized with repository root:', this.repositoryRoot);
  }

  /**
   * Initialize the git service
   * @returns {Promise<boolean>} Success or failure
   */
  async initialize() {
    try {
      // Check if directory is a git repository
      this.isRepo = await this.isGitRepository();
      
      if (this.isRepo) {
        // Get branch information
        await this.refreshBranchInfo();
        
        // Initialize GitHub API if token is available
        const githubToken = process.env.GITHUB_TOKEN;
        if (githubToken) {
          this.octokit = new Octokit({
            auth: githubToken
          });
          
          // Check GitHub connection
          try {
            const { data } = await this.octokit.users.getAuthenticated();
            console.log(`GitHub API authenticated as ${data.login}`);
          } catch (error) {
            console.warn('GitHub API authentication failed:', error.message);
            this.octokit = null;
          }
        } else {
          console.log('GitHub token not provided, GitHub API access will be unavailable');
        }
      } else {
        console.warn('Directory is not a git repository:', this.repositoryRoot);
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing Git service:', error);
      return false;
    }
  }

  /**
   * Check if the directory is a git repository
   * @returns {Promise<boolean>} Whether it's a git repository
   */
  async isGitRepository() {
    try {
      await this.git.revparse(['--is-inside-work-tree']);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh branch information
   * @returns {Promise<Object>} Branch information
   */
  async refreshBranchInfo() {
    try {
      // Get current branch
      const currentBranch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
      
      // Get tracking branch
      let upstream = null;
      let ahead = 0;
      let behind = 0;
      
      try {
        // Get upstream (tracking) branch
        upstream = await this.git.raw(['rev-parse', '--abbrev-ref', `${currentBranch}@{upstream}`]);
        
        if (upstream) {
          // Get ahead/behind counts
          const status = await this.git.status();
          ahead = status.ahead;
          behind = status.behind;
        }
      } catch (error) {
        // No upstream branch set
      }
      
      // Get remote information
      const remotes = await this.git.getRemotes(true);
      
      this.branchInfo = {
        currentBranch: currentBranch.trim(),
        upstream: upstream ? upstream.trim() : null,
        ahead,
        behind,
        remotes: remotes.map(remote => ({
          name: remote.name,
          url: remote.refs.fetch
        }))
      };
      
      return this.branchInfo;
    } catch (error) {
      console.error('Error refreshing branch info:', error);
      throw createError(`Failed to get branch information: ${error.message}`, 'GIT_ERROR');
    }
  }

  /**
   * Get repository status
   * @returns {Promise<Object>} Repository status
   */
  async getStatus() {
    try {
      if (!this.isRepo) {
        throw createError('Not a git repository', 'GIT_ERROR');
      }
      
      // Get status
      const status = await this.git.status();
      
      // Get last commit
      const log = await this.git.log({ maxCount: 1 });
      const lastCommit = log.latest;
      
      // Return formatted status
      return {
        branch: status.current,
        isClean: status.isClean(),
        modified: status.modified,
        created: status.created,
        deleted: status.deleted,
        staged: status.staged,
        ahead: status.ahead,
        behind: status.behind,
        tracking: status.tracking,
        lastCommit: lastCommit ? {
          hash: lastCommit.hash,
          message: lastCommit.message,
          author: lastCommit.author_name,
          date: lastCommit.date
        } : null
      };
    } catch (error) {
      console.error('Error getting repository status:', error);
      throw createError(`Failed to get repository status: ${error.message}`, 'GIT_ERROR');
    }
  }

  /**
   * Create a new branch
   * @param {string} branchName - Name of the branch
   * @param {string} baseBranch - Base branch to create from (default: current branch)
   * @returns {Promise<boolean>} Success or failure
   */
  async createBranch(branchName, baseBranch = null) {
    try {
      if (!this.isRepo) {
        throw createError('Not a git repository', 'GIT_ERROR');
      }
      
      // Get current branch if baseBranch not specified
      if (!baseBranch) {
        const status = await this.git.status();
        baseBranch = status.current;
      }
      
      // Check if branch already exists
      const branches = await this.git.branch();
      if (branches.all.includes(branchName)) {
        console.log(`Branch ${branchName} already exists, checking it out`);
        await this.git.checkout(branchName);
        return true;
      }
      
      // Create and checkout the new branch
      await this.git.checkoutBranch(branchName, baseBranch);
      
      // Refresh branch info
      await this.refreshBranchInfo();
      
      // Track branch creation in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.GIT_OPERATION, {
        operation: 'createBranch',
        branch: branchName,
        baseBranch,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return true;
    } catch (error) {
      console.error(`Error creating branch ${branchName}:`, error);
      throw createError(`Failed to create branch: ${error.message}`, 'GIT_ERROR');
    }
  }

  /**
   * Checkout a branch
   * @param {string} branchName - Name of the branch to checkout
   * @returns {Promise<boolean>} Success or failure
   */
  async checkoutBranch(branchName) {
    try {
      if (!this.isRepo) {
        throw createError('Not a git repository', 'GIT_ERROR');
      }
      
      // Check if branch exists
      const branches = await this.git.branch();
      if (!branches.all.includes(branchName)) {
        throw createError(`Branch ${branchName} does not exist`, 'GIT_ERROR');
      }
      
      // Checkout the branch
      await this.git.checkout(branchName);
      
      // Refresh branch info
      await this.refreshBranchInfo();
      
      // Track branch checkout in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.GIT_OPERATION, {
        operation: 'checkout',
        branch: branchName,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return true;
    } catch (error) {
      console.error(`Error checking out branch ${branchName}:`, error);
      throw createError(`Failed to checkout branch: ${error.message}`, 'GIT_ERROR');
    }
  }

  /**
   * Stage files for commit
   * @param {string|Array<string>} files - File(s) to stage (relative paths)
   * @returns {Promise<boolean>} Success or failure
   */
  async stageFiles(files) {
    try {
      if (!this.isRepo) {
        throw createError('Not a git repository', 'GIT_ERROR');
      }
      
      // Convert single file to array
      if (typeof files === 'string') {
        files = [files];
      }
      
      // Validate file paths
      for (const file of files) {
        const resolvedPath = filesystemService.resolvePath(file);
        if (!filesystemService.isWithinRepository(resolvedPath)) {
          throw createError(`File path ${file} is outside the repository`, 'GIT_ERROR');
        }
      }
      
      // Add files to staging
      await this.git.add(files);
      
      // Track file staging in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.GIT_OPERATION, {
        operation: 'stage',
        files,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return true;
    } catch (error) {
      console.error('Error staging files:', error);
      throw createError(`Failed to stage files: ${error.message}`, 'GIT_ERROR');
    }
  }

  /**
   * Create a commit
   * @param {string} message - Commit message
   * @param {Object} options - Commit options
   * @param {Array<string>} options.files - Files to include in commit (optional)
   * @param {string} options.author - Author for the commit (optional)
   * @returns {Promise<string>} Commit hash
   */
  async createCommit(message, options = {}) {
    try {
      if (!this.isRepo) {
        throw createError('Not a git repository', 'GIT_ERROR');
      }
      
      const { files, author } = options;
      
      // Add specific files if provided
      if (files && files.length > 0) {
        await this.stageFiles(files);
      }
      
      // Add default signature
      const finalMessage = message + '\n\n🤖 Generated with ARLO AI\n';
      
      // Create commit options
      const commitOptions = {};
      
      if (author) {
        commitOptions.author = author;
      }
      
      // Create commit
      const result = await this.git.commit(finalMessage, null, commitOptions);
      
      // Track commit in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.GIT_OPERATION, {
        operation: 'commit',
        message: message.split('\n')[0], // Just the first line for analytics
        files: files || [],
        hash: result.commit,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return result.commit;
    } catch (error) {
      console.error('Error creating commit:', error);
      throw createError(`Failed to create commit: ${error.message}`, 'GIT_ERROR');
    }
  }

  /**
   * Push changes to remote
   * @param {string} remote - Remote name (default: origin)
   * @param {string} branch - Branch name (default: current branch)
   * @param {boolean} setUpstream - Whether to set upstream tracking
   * @returns {Promise<boolean>} Success or failure
   */
  async pushChanges(remote = 'origin', branch = null, setUpstream = false) {
    try {
      if (!this.isRepo) {
        throw createError('Not a git repository', 'GIT_ERROR');
      }
      
      // Refresh branch info
      await this.refreshBranchInfo();
      
      // Use current branch if not specified
      if (!branch) {
        branch = this.branchInfo.currentBranch;
      }
      
      // Push options
      const pushOptions = {};
      
      if (setUpstream) {
        pushOptions['--set-upstream'] = null;
      }
      
      // Push changes
      await this.git.push(remote, branch, pushOptions);
      
      // Refresh branch info after push
      await this.refreshBranchInfo();
      
      // Track push in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.GIT_OPERATION, {
        operation: 'push',
        remote,
        branch,
        setUpstream,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return true;
    } catch (error) {
      console.error('Error pushing changes:', error);
      throw createError(`Failed to push changes: ${error.message}`, 'GIT_ERROR');
    }
  }

  /**
   * Pull changes from remote
   * @param {string} remote - Remote name (default: origin)
   * @param {string} branch - Branch name (default: current branch)
   * @returns {Promise<boolean>} Success or failure
   */
  async pullChanges(remote = 'origin', branch = null) {
    try {
      if (!this.isRepo) {
        throw createError('Not a git repository', 'GIT_ERROR');
      }
      
      // Refresh branch info
      await this.refreshBranchInfo();
      
      // Use current branch if not specified
      if (!branch) {
        branch = this.branchInfo.currentBranch;
      }
      
      // Pull changes
      await this.git.pull(remote, branch);
      
      // Refresh branch info after pull
      await this.refreshBranchInfo();
      
      // Track pull in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.GIT_OPERATION, {
        operation: 'pull',
        remote,
        branch,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return true;
    } catch (error) {
      console.error('Error pulling changes:', error);
      throw createError(`Failed to pull changes: ${error.message}`, 'GIT_ERROR');
    }
  }

  /**
   * Get the diff for modified files
   * @param {string} filePath - Optional specific file to get diff for
   * @returns {Promise<string>} Diff output
   */
  async getDiff(filePath = null) {
    try {
      if (!this.isRepo) {
        throw createError('Not a git repository', 'GIT_ERROR');
      }
      
      // Get diff for specific file or all files
      let diff;
      if (filePath) {
        diff = await this.git.diff(['HEAD', '--', filePath]);
      } else {
        diff = await this.git.diff(['HEAD']);
      }
      
      return diff;
    } catch (error) {
      console.error('Error getting diff:', error);
      throw createError(`Failed to get diff: ${error.message}`, 'GIT_ERROR');
    }
  }

  /**
   * Get commit history
   * @param {number} maxCount - Maximum number of commits to get
   * @returns {Promise<Array<Object>>} Commit history
   */
  async getCommitHistory(maxCount = 10) {
    try {
      if (!this.isRepo) {
        throw createError('Not a git repository', 'GIT_ERROR');
      }
      
      // Get commit history
      const log = await this.git.log({ maxCount });
      
      // Format commit history
      return log.all.map(commit => ({
        hash: commit.hash,
        shortHash: commit.hash.substring(0, 7),
        message: commit.message,
        author: commit.author_name,
        email: commit.author_email,
        date: commit.date,
        body: commit.body
      }));
    } catch (error) {
      console.error('Error getting commit history:', error);
      throw createError(`Failed to get commit history: ${error.message}`, 'GIT_ERROR');
    }
  }

  /**
   * Create a GitHub pull request
   * @param {Object} options - Pull request options
   * @param {string} options.title - PR title
   * @param {string} options.body - PR description
   * @param {string} options.head - Head branch
   * @param {string} options.base - Base branch (default: main)
   * @param {boolean} options.draft - Whether to create as a draft PR
   * @returns {Promise<Object>} Pull request info
   */
  async createPullRequest(options) {
    try {
      if (!this.isRepo) {
        throw createError('Not a git repository', 'GIT_ERROR');
      }
      
      if (!this.octokit) {
        throw createError('GitHub API not initialized', 'GITHUB_ERROR');
      }
      
      const { title, body, head, base = 'main', draft = false } = options;
      
      if (!title || !body || !head) {
        throw createError('Missing required pull request options', 'GITHUB_ERROR');
      }
      
      // Get repository owner and name from remote URL
      const remotes = await this.git.getRemotes(true);
      const originRemote = remotes.find(remote => remote.name === 'origin');
      
      if (!originRemote) {
        throw createError('No origin remote found', 'GITHUB_ERROR');
      }
      
      // Parse GitHub owner and repo from remote URL
      const remoteUrl = originRemote.refs.push;
      const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
      
      if (!match) {
        throw createError('Could not parse GitHub repository from remote URL', 'GITHUB_ERROR');
      }
      
      const [, owner, repo] = match;
      
      // Create pull request
      const { data } = await this.octokit.pulls.create({
        owner,
        repo,
        title,
        body,
        head,
        base,
        draft
      });
      
      // Track pull request creation in analytics
      analytics.trackEvent(analytics.EVENT_TYPES.GIT_OPERATION, {
        operation: 'createPullRequest',
        title,
        head,
        base,
        prNumber: data.number,
        url: data.html_url,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error('Analytics error:', err));
      
      return {
        number: data.number,
        url: data.html_url,
        id: data.id,
        state: data.state,
        title: data.title,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error creating pull request:', error);
      throw createError(`Failed to create pull request: ${error.message}`, 'GITHUB_ERROR');
    }
  }

  /**
   * Get remote repository information
   * @returns {Promise<Object>} Repository information
   */
  async getRepositoryInfo() {
    try {
      if (!this.isRepo) {
        throw createError('Not a git repository', 'GIT_ERROR');
      }
      
      // Get remotes
      const remotes = await this.git.getRemotes(true);
      
      // Try to get GitHub repository info if Octokit is available
      let githubInfo = null;
      
      if (this.octokit) {
        const originRemote = remotes.find(remote => remote.name === 'origin');
        
        if (originRemote) {
          const remoteUrl = originRemote.refs.push;
          const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
          
          if (match) {
            const [, owner, repo] = match;
            
            try {
              const { data } = await this.octokit.repos.get({
                owner,
                repo
              });
              
              githubInfo = {
                owner,
                name: repo,
                fullName: data.full_name,
                description: data.description,
                defaultBranch: data.default_branch,
                stars: data.stargazers_count,
                forks: data.forks_count,
                openIssues: data.open_issues_count,
                url: data.html_url
              };
            } catch (error) {
              console.warn('Error getting GitHub repository info:', error.message);
            }
          }
        }
      }
      
      return {
        remotes: remotes.map(remote => ({
          name: remote.name,
          fetchUrl: remote.refs.fetch,
          pushUrl: remote.refs.push
        })),
        github: githubInfo
      };
    } catch (error) {
      console.error('Error getting repository info:', error);
      throw createError(`Failed to get repository info: ${error.message}`, 'GIT_ERROR');
    }
  }
}

// Create singleton instance
const gitService = new GitService();

// Export the singleton instance
module.exports = gitService;