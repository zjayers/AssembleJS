import type { Environment } from "./environment";
import type { ConfigSettings } from "./config.settings";
import type { Audits } from "./audits";
import type { Categories } from "./categories";
import type { CategoryGroups } from "./category.groups";
import type { RuntimeError } from "./runtime.error";
import type { Timing } from "./timing";
import type { I18n } from "./i18n";

/**
 * PageSpeed Insights - LighthouseResult
 * @description
 * @category (Analyzer) [PageSpeed Insights]
 */
export interface LighthouseResult {
  /**
   * The original requested url.
   */
  requestedUrl: string;
  /**
   * The final resolved url that was audited.
   */
  finalUrl: string;
  /**
   * The lighthouse version that was used to generate this LHR.
   */
  lighthouseVersion: string;
  /**
   * The user agent that was used to run this LHR.
   */
  userAgent: string;
  /**
   * The time that this run was fetched.
   */
  fetchTime: string;
  /**
   * Environment settings that were used when making this LHR.
   */
  environment: Environment;
  /**
   * List of all run warnings in the LHR. Will always output to at least `[]`.
   */
  runWarnings: string[];
  /**
   * The configuration settings for this LHR.
   */
  configSettings: ConfigSettings;
  /**
   * Map of audits in the LHR.
   */
  audits: Audits;
  /**
   * Map of categories in the LHR.
   */
  categories: Categories;
  /**
   * Map of category groups in the LHR.
   */
  categoryGroups: CategoryGroups;
  /**
   * Object containing the code + message of any thrown runtime errors.
   */
  runtimeError: RuntimeError;
  /**
   * Timing information for this LHR.
   */
  timing: Timing;
  /**
   * The internationalization strings that are required to render the LHR.
   */
  i18n: I18n;
}
