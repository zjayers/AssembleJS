/**
 * Pattern Utilities
 * @description Various pattern matching utilities
 * @author Zach Ayers
 */

// Common regex patterns
export const PATTERN_ALL_ZEROS = /^0+$/;
export const PATTERN_CURRENCY =
  /^\$(?:[+-]?(?:(?:[1-9]\d{0,2}(?:,\d{3})*)|[1-9]\d*|0)\.\d{2}|\((?:(?:[1-9]\d{0,2}(?:,\d{3})*)|[1-9]\d*|0)\.\d{2}\))$/;
export const PATTERN_DATE =
  /(\d{2}-\d{2}-\d{4}|\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4})/;
export const PATTERN_DATE_SEPARATOR = /(\/|-|\.)/;
export const PATTERN_HEX_DIGITS = /^[0-9a-f]+$/i;
export const PATTERN_HTML_TAG = /(< *\/?[biu] *>)|(< *br *\/ *>)/g;
export const PATTERN_PUNCTUATION = /[,.!?]+$/;
export const PATTERN_MULTIPLE_SPACES = /\s{2,}/g;

/**
 * Checks if a string matches a wildcard pattern
 * Supports * for any characters and ? for a single character
 *
 * @param str - The string to check
 * @param pattern - The pattern to match against (with wildcards)
 * @return True if the string matches the pattern
 *
 * @example
 * isWildcardMatch('/api/users/123', '/api/users/*') // true
 * isWildcardMatch('/api/admin', '/api/user*') // false
 * isWildcardMatch('/health/check', '/health/*') // true
 */
export function isWildcardMatch(str: string, pattern: string): boolean {
  // Convert to regex pattern
  // Escape regex special chars except * and ?
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape all regex special chars except * and ?
    .replace(/\*/g, ".*") // * becomes .* (any number of any chars)
    .replace(/\?/g, "."); // ? becomes . (exactly one char)

  // Add ^ and $ to ensure full string match
  const regex = new RegExp(`^${regexPattern}$`);

  return regex.test(str);
}
