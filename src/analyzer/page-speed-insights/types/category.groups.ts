/**
 * PageSpeed Insights - CategoryGroups
 * @description
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface CategoryGroups {
  [key: string]: {
    /**
     * The human-friendly name of the category group.
     */
    title: string;
    /**
     * A more detailed description of the category group and its importance.
     */
    description: string;
  };
}
