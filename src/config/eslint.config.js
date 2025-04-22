/**
 * AssembleJS ESLint Configuration
 *
 * This configuration is bundled with the asmbl package and provides a
 * shared linting config for all AssembleJS projects.
 */

// Import AssembleJS custom plugin
const assemblejsPlugin = require("./assemblejs-eslint-plugin");

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:assemblejs/recommended", // Use the AssembleJS recommended configuration
  ],
  plugins: {
    "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    assemblejs: assemblejsPlugin, // Register the AssembleJS plugin
  },
  rules: {
    // TypeScript rules
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

    // General rules
    "no-console": ["warn", { allow: ["warn", "error", "info", "debug"] }],
    "prefer-const": "warn",
    eqeqeq: ["warn", "always"],
  },
  overrides: [
    {
      files: ["*.js", "*.jsx"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      // Relax rules for test files
      files: ["**/__tests__/**/*", "**/*.test.ts", "**/*.test.tsx", "**/*.test.js", "**/*.test.jsx", "**/__mocks__/**/*"],
      rules: {
        "require-jsdoc": "off",
        "valid-jsdoc": "off",
      },
    },
  ],
};
