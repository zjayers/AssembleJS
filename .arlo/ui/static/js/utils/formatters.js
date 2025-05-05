/**
 * Date and time formatting utilities
 */

/**
 * Format a date string into a human-readable format
 *
 * @param {string|Date} dateInput - Date string or Date object
 * @param {object} options - Formatting options
 * @return {string} Formatted date string
 */
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return "Unknown";

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "Invalid date";

  const now = new Date();
  const diffMs = now - date;
  const diffSecs = diffMs / 1000;
  const diffMins = diffSecs / 60;
  const diffHrs = diffMins / 60;
  const diffDays = diffHrs / 24;

  // Format based on how recent the date is
  if (diffSecs < 60) {
    return "Just now";
  } else if (diffMins < 60) {
    const mins = Math.floor(diffMins);
    return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  } else if (diffHrs < 24) {
    const hrs = Math.floor(diffHrs);
    return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    const days = Math.floor(diffDays);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else {
    // Default to formatted date
    const dateOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    return date.toLocaleDateString(undefined, dateOptions);
  }
}

/**
 * Format a number with commas for thousands
 *
 * @param {number} number - The number to format
 * @return {string} Formatted number string
 */
export function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format a file size into a human-readable string
 *
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @return {string} Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Truncate a string to a certain length and add ellipsis
 *
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @return {string} Truncated string
 */
export function truncateString(str, length = 100) {
  if (!str || str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Format a value as percentage
 *
 * @param {number} value - Value to format (0-1)
 * @param {number} decimals - Number of decimal places
 * @return {string} Formatted percentage
 */
export function formatPercent(value, decimals = 0) {
  return (value * 100).toFixed(decimals) + "%";
}

/**
 * Format JSON object as a pretty-printed string
 *
 * @param {object} obj - Object to format
 * @return {string} Formatted JSON string
 */
export function formatJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

/**
 * Format duration in milliseconds to human-readable string
 *
 * @param {number} ms - Duration in milliseconds
 * @return {string} Formatted duration
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;

  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;

  const minutes = seconds / 60;
  if (minutes < 60) {
    const mins = Math.floor(minutes);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  }

  const hours = minutes / 60;
  const hrs = Math.floor(hours);
  const mins = Math.floor(minutes % 60);
  return `${hrs}h ${mins}m`;
}
