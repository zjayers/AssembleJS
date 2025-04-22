import type { Distribution } from "./distribution";
import type { Category } from "./category";

/**
 * PageSpeed Insights - Metrics
 * @description LHR metric definitions provided by LHR.
 * @note LHR does not provide documentation around these keys.
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface Metrics {
  /**
   * The type of metric.
   */
  [key: string]: {
    /**
     * The metric percentile, provided by LHR.
     */
    percentile: number;
    /**
     * Distribution model used by LRH.
     */
    distributions: Distribution[];
    /**
     * LHR Category: {@link Category}
     */
    category: Category;
  };
}
