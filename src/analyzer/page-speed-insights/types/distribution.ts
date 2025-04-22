/**
 * PageSpeed Insights - Distribution
 * @description Distribution model used by LHR.
 * @note LHR does not provide documentation around these keys.
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface Distribution {
  /**
   * Min level of distribution used by LHR.
   */
  min: number;
  /**
   * Max level of distribution used by LHR.
   */
  max: number;
  /**
   * Proportion of distribution used by LHR.
   */
  proportion: number;
}
