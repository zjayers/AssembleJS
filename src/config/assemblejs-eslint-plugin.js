/**
 * AssembleJS ESLint Plugin
 *
 * This is a custom ESLint plugin that provides AssembleJS-specific linting rules
 * to enforce best practices in AssembleJS projects.
 *
 * @author AssembleJS Team
 */

// Import custom rules
const customRules = require("./eslint-rules");

module.exports = {
  rules: customRules,
  configs: {
    // Recommended configuration (stricter)
    recommended: {
      plugins: ["assemblejs"],
      rules: {
        // Event System Rules
        "assemblejs/enforce-assemblejs-events": "error", // Enforce using events.emit/on/off instead of DOM events

        // Parameter Access Rules
        "assemblejs/prefer-server-params": "error", // Enforce using context.params instead of URL params

        // Type Safety Rules
        "assemblejs/typed-component-interfaces": "warn", // Enforce proper typing of component classes

        // Controller Implementation Rules
        "assemblejs/proper-controller-lifecycle": "error", // Enforce proper controller lifecycle methods
      },
    },

    // Essential configuration (strictest, for new projects)
    essential: {
      plugins: ["assemblejs"],
      rules: {
        "assemblejs/enforce-assemblejs-events": "error",
        "assemblejs/prefer-server-params": "error",
        "assemblejs/typed-component-interfaces": "error",
        "assemblejs/proper-controller-lifecycle": "error",
      },
    },

    // Relaxed configuration (for projects in transition)
    relaxed: {
      plugins: ["assemblejs"],
      rules: {
        "assemblejs/enforce-assemblejs-events": "warn",
        "assemblejs/prefer-server-params": "warn",
        "assemblejs/typed-component-interfaces": "warn",
        "assemblejs/proper-controller-lifecycle": "warn",
      },
    },
  },
};
