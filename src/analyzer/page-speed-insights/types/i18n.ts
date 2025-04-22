/**
 * PageSpeed Insights - I18n
 * @description The internationalization strings that are required to render the LHR.
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface I18n {
  /**
   * Formatted string results from the LHR request.
   * @note These keys have no documentation provided by PageSpeed Insights.
   * @link https://developers.google.com/speed/docs/insights/v5/reference/pagespeedapi/runpagespeed#response
   */
  rendererFormattedStrings: {
    varianceDisclaimer: string;
    opportunityResourceColumnLabel: string;
    opportunitySavingsColumnLabel: string;
    errorMissingAuditInfo: string;
    errorLabel: string;
    warningHeader: string;
    auditGroupExpandTooltip: string;
    passedAuditsGroupTitle: string;
    notApplicableAuditsGroupTitle: string;
    manualAuditsGroupTitle: string;
    toplevelWarningsMessage: string;
    scorescaleLabel: string;
    crcLongestDurationLabel: string;
    crcInitialNavigation: string;
    lsPerformanceCategoryDescription: string;
    labDataTitle: string;
  };
}
