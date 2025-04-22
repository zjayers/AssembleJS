/**
 * AssembleJS Prettier Configuration
 *
 * This configuration is bundled with the asmbl package and provides a
 * shared formatting config for all AssembleJS projects.
 */

const config = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: "all",
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: "avoid",
  endOfLine: "lf",
};

// Support both ES modules and CommonJS
try {
  if (typeof module !== "undefined") {
    module.exports = config;
  }
} catch (e) {
  // Ignore error for ES modules
}

export default config;
