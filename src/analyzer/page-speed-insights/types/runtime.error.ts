import type { RuntimeErrorCode } from "./runtime-error.code";

/**
 * PageSpeed Insights - RuntimeError
 * @description Object containing the code + message of any thrown runtime errors.
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface RuntimeError {
  /**
   * Possible runtime error codes from LHR.
   */
  code: RuntimeErrorCode;
  /**
   * The runtime error code message from LHR.
   */
  message: string;
}
