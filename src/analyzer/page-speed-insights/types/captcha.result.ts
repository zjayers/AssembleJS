/**
 * PageSpeed Insights - Captcha Result
 * @description API Captcha verification result
 * @category (Analyzer) [PageSpeed Insights]
 */
export enum CaptchaResult {
  /**
   * Captcha is Blocking.
   */
  CAPTCHA_BLOCKING = "CAPTCHA_BLOCKING",
  /**
   * Captcha has been matched.
   */ CAPTCHA_MATCHED = "CAPTCHA_MATCHED",
  /**
   * Captcha is needed.
   */ CAPTCHA_NEEDED = "CAPTCHA_NEEDED",
  /**
   * Captcha is NOT needed.
   */ CAPTCHA_NOT_NEEDED = "CAPTCHA_NOT_NEEDED",
  /**
   * Captcha is NOT matched.
   */ CAPTCHA_UNMATCHED = "CAPTCHA_UNMATCHED",
}
