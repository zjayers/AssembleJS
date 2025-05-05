/**
 * Validation Utilities
 * Common validation functions used throughout the application
 */

/**
 * Check if a string is valid JSON
 * @param {string} str - String to check
 * @return {boolean} Whether the string is valid JSON
 */
function isValidJSON(str) {
  if (typeof str !== "string") return false;

  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate if a string is a valid path (no directory traversal)
 * @param {string} path - Path to validate
 * @return {boolean} Whether the path is safe
 */
function isValidPath(path) {
  if (typeof path !== "string") return false;

  // Check for path traversal
  if (path.includes("..")) return false;

  // Check for absolute paths when they shouldn't be
  if (
    path.startsWith("/") &&
    !path.startsWith("/Users/zachariahayers/development/minimesh")
  )
    return false;

  return true;
}

/**
 * Validate if a string is a valid collection name
 * @param {string} name - Collection name to validate
 * @return {boolean} Whether the name is valid
 */
function isValidCollectionName(name) {
  if (typeof name !== "string") return false;

  // Check for valid characters (alphanumeric, underscore, dash)
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

/**
 * Validate if an ID is in the expected format
 * @param {string} id - ID to validate
 * @return {boolean} Whether the ID is valid
 */
function isValidId(id) {
  if (typeof id !== "string") return false;

  // Check for valid characters (alphanumeric, underscore, dash, colon)
  return /^[a-zA-Z0-9_:-]+$/.test(id);
}

/**
 * Validate if a string is a valid agent name
 * @param {string} name - Agent name to validate
 * @return {boolean} Whether the name is valid
 */
function isValidAgentName(name) {
  if (typeof name !== "string") return false;

  // Check for valid characters (alphanumeric, underscore, dash, space)
  return /^[a-zA-Z0-9_\- ]+$/.test(name);
}

/**
 * Validate if a URL is valid
 * @param {string} url - URL to validate
 * @return {boolean} Whether the URL is valid
 */
function isValidUrl(url) {
  if (typeof url !== "string") return false;

  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate if a string is a valid command
 * @param {string} command - Command to validate
 * @return {Object} Validation result with success flag and error
 */
function isValidCommand(command) {
  if (typeof command !== "string") {
    return {
      success: false,
      error: "Command must be a string",
    };
  }

  // Check for dangerous commands
  const dangerousCommands = [
    "rm -rf",
    "rmdir /s",
    "deltree", // Destructive file operations
    "mkfs",
    "fdisk",
    "format", // Disk formatting
    ":(){:|:&};:", // Fork bomb
    "chmod -R 777",
    "chmod -R 000", // Dangerous permission changes
    "dd if=/dev/random", // Disk destroyer
    "> /dev/sda", // Disk overwrites
    "mv /* /dev/null", // Move everything to null
    "wget",
    "curl",
    "nc ",
    "ncat ", // Network commands
    "eval",
    "exec", // Command execution
    "./",
    "bash ",
    "sh ",
    "python ", // Script execution
    "sudo",
    "su", // Privilege escalation
    "nohup",
    "at ",
    "crontab", // Background execution
    "telnet",
    "ssh",
    "ftp", // Remote connections
    "nc ",
    "netcat", // Network utilities
    "iptables",
    "firewall-cmd", // Firewall manipulation
    "chmod +x",
    "$(",
    "`", // Execute bit, command substitution
    "> /etc/",
    ">> /etc/", // Writing to system config
    "kill -9 1",
    "shutdown",
    "reboot", // System control
  ];

  for (const dangerousCommand of dangerousCommands) {
    if (command.includes(dangerousCommand)) {
      return {
        success: false,
        error: `Command contains potentially dangerous operation: ${dangerousCommand}`,
      };
    }
  }

  // Allow only specific commands
  const allowedCommandPrefixes = [
    "git ",
    "npm ",
    "yarn ",
    "pnpm ",
    "ls ",
    "dir ",
    "find ",
    "cat ",
    "type ",
    "more ",
    "less ",
    "grep ",
    "findstr ",
    "echo ",
    "mkdir ",
    "md ",
    "cd ",
    "pwd ",
    "cp ",
    "mv ",
    "touch ",
    "rm ",
    "rmdir ",
    "node ",
    "npm test",
    "npm run ",
  ];

  let isAllowed = false;
  for (const prefix of allowedCommandPrefixes) {
    if (command.startsWith(prefix) || command === prefix.trim()) {
      isAllowed = true;
      break;
    }
  }

  if (!isAllowed) {
    return {
      success: false,
      error:
        "Command not in allowlist. Only basic file, git, and package manager operations are permitted.",
    };
  }

  return {
    success: true,
  };
}

module.exports = {
  isValidJSON,
  isValidPath,
  isValidCollectionName,
  isValidId,
  isValidAgentName,
  isValidUrl,
  isValidCommand,
};
