import type { ScoreDisplayMode } from "./score-display.mode";

/**
 * PageSpeed Insights - Audits
 * @description Map of audits in the LHR.
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface Audits {
  /**
   * The audit entry.
   */
  [key: string]: {
    /**
     * The audit's id.
     */
    id: string;
    /**
     * The human-readable title.
     */
    title: string;
    /**
     * The description of the audit.
     */
    description: string;
    /**
     * The audit score.
     */
    score: number;
    /**
     * The enumerated score display mode.
     */
    scoreDisplayMode: ScoreDisplayMode;
    /**
     * The value that should be displayed on the UI for this audit.
     */
    displayValue: string;
    /**
     * An explanation of the errors in the audit.
     */
    explanation: string;
    /**
     * An error message from a thrown error inside the audit.
     */
    errorMessage: string;
    /**
     * Array of warnings.
     */
    warnings: string[];
    /**
     * Freeform details section of the audit.
     */
    details: {
      /**
       * The detail entry.
       */
      [key: string]: any;
    };
  };
}
