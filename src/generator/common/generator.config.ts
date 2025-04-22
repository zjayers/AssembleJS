/**
 * Generator configuration and shared settings
 * @description Centralized configuration for generator behavior
 * @author Zach Ayers
 */

/**
 * Output verbosity levels
 */
export enum OutputVerbosity {
  /** Minimal output - just success message and essential information */
  MINIMAL = "minimal",
  /** Standard output - detailed information with examples (default) */
  STANDARD = "standard",
  /** Verbose output - maximum detail for learning */
  VERBOSE = "verbose",
}

/**
 * Generator configuration settings
 */
export const GENERATOR_CONFIG = {
  /**
   * Current output verbosity level
   * @default OutputVerbosity.MINIMAL
   */
  outputVerbosity: OutputVerbosity.MINIMAL,

  /**
   * Set the output verbosity level
   * @param {OutputVerbosity} level - The verbosity level to set
   * @return {void}
   */
  setOutputVerbosity(level: OutputVerbosity): void {
    this.outputVerbosity = level;
  },

  /**
   * Check if minimal output is enabled
   * @return {boolean} true if minimal output is enabled
   */
  isMinimalOutput(): boolean {
    return this.outputVerbosity === OutputVerbosity.MINIMAL;
  },

  /**
   * Check if verbose output is enabled
   * @return {boolean} true if verbose output is enabled
   */
  isVerboseOutput(): boolean {
    return this.outputVerbosity === OutputVerbosity.VERBOSE;
  },

  /**
   * Check if standard output is enabled
   * @return {boolean} true if standard output is enabled
   */
  isStandardOutput(): boolean {
    return this.outputVerbosity === OutputVerbosity.STANDARD;
  },
};
