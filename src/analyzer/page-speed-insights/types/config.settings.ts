import type { EmulatedFormFactor } from "./emulated-form.factor";

/**
 * PageSpeed Insights - ConfigSettings
 * @description The configuration settings for this LHR.
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface ConfigSettings {
  /**
   * The form factor the emulation should use.
   */
  emulatedFormFactor: EmulatedFormFactor;
  /**
   * The locale setting.
   */
  locale: string;
  /**
   * Map of only categories.
   */
  onlyCategories: Record<string, any>;
}
