import type { Metrics } from "./metrics";
import type { Category } from "./category";

/**
 * PageSpeed Insights - LoadingExperience
 * @description Metrics of end users' page loading experience.
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface LoadingExperience {
  /**
   * The url, pattern or origin which the metrics are on.
   */
  id: string;
  /**
   * Loading experience metrics / data.
   */
  metrics: Metrics;
  /**
   * Loading Experience: {@link Category}
   */
  overall_category: Category;
  /**
   * Initial url of the API request
   */
  initial_url: string;
}
