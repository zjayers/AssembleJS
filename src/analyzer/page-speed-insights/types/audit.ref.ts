/**
 * PageSpeed Insights - AuditRef
 * @description References to an audit member of a category.
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface AuditRef {
  /**
   * The audit ref id.
   */
  id: string;
  /**
   * The weight this audit's score has on the overall category score.
   */
  weight: number;
  /**
   * The category group that the audit belongs to (optional).
   */
  group: string;
}
