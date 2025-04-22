/**
 * PageSpeed Insights - Environment
 * @description Environment settings that were used when making this LHR.
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface Environment {
  /**
   * The network agent used during the Environment benchmark.
   */
  networkUserAgent: string;
  /**
   * The host agent used during the Environment benchmark.
   */
  hostUserAgent: string;
  /**
   * LHR environment benchmark index.
   */
  benchmarkIndex: number;
}
