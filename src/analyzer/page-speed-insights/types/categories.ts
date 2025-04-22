import type { AuditRef } from "./audit.ref";

/**
 * PageSpeed Insights - Categories
 * @description Category group in the LHR.
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface Categories {
  [key: string]: {
    /**
     * The string identifier of the category.
     */
    id: string;
    /**
     * The human-friendly name of the category.
     */
    title: string;
    /**
     * A more detailed description of the category and its importance.
     */
    description: string;
    /**
     * Category score, provided by LHR.
     */
    score: number;
    /**
     * A description for the manual audits in the category.
     */
    manualDescription: string;
    /**
     * An array of references to all the audit members of this category.
     */
    auditRefs: AuditRef[];
  };
}
