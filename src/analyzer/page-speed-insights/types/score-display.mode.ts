/**
 * PageSpeed Insights - ScoreDisplayMode
 * @description The enumerated score display mode.
 * @category (Analyzer) [PageSpeed Insights]
 */
export enum ScoreDisplayMode {
  /**
   * No display mode was specified.
   */
  SCORE_DISPLAY_MODE_UNSPECIFIED,
  /**
   * Display score as 'binary'.
   */ binary,
  /**
   * Display score as 'error'.
   */ error,
  /**
   * Display score as 'informative'.
   */ informative,
  /**
   * Display score as 'manual'.
   */ manual,
  /**
   * Display score as 'not_applicable'.
   */ not_applicable,
  /**
   * Display score as 'numeric'.
   */ numeric,
}
