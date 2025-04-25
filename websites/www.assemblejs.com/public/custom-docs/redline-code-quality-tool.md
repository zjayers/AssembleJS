# Redline - Code Quality Tool

The `redline` command is AssembleJS's built-in code quality and static analysis tool that helps ensure your codebase adheres to best practices, coding standards, and security guidelines.

## Overview

Redline performs comprehensive static code analysis on your AssembleJS project to identify potential issues, enforce coding standards, and recommend improvements. It checks for common mistakes, security vulnerabilities, performance bottlenecks, and adherence to AssembleJS's recommended patterns.

## Installation

Redline is included with the AssembleJS CLI. If you've installed the AssembleJS CLI, you already have access to Redline.

```bash
# Verify installation
npx redline --version
```

## Basic Usage

```bash
# Run Redline on your project
npx redline

# Run with specific configuration file
npx redline --config path/to/redline.config.js

# Run on specific files or directories
npx redline src/components/ src/blueprints/
```

## Command Options

| Option | Description |
|--------|-------------|
| `--fix` | Automatically fix problems where possible |
| `--config <path>` | Use a specific configuration file |
| `--format <format>` | Output format (json, html, text) |
| `--output <file>` | Write output to file instead of stdout |
| `--ignore <patterns>` | Files to ignore (comma-separated) |
| `--max-warnings <n>` | Number of warnings to trigger nonzero exit code |
| `--quiet` | Report only errors, not warnings |
| `--verbose` | Increase output verbosity |
| `--rule <rule-id>` | Run only specified rules |
| `--strict` | Enable all strict mode rules |
| `--security` | Run security-focused rules only |
| `--perf` | Run performance-focused rules only |

## Configuration

Redline can be configured using a JavaScript or JSON configuration file. The default configuration file is `redline.config.js` in your project root.

```javascript
// redline.config.js
module.exports = {
  // Which directories to scan
  include: ['src/**/*.{ts,tsx,js,jsx}'],
  
  // Which directories to skip
  exclude: ['**/node_modules/**', '**/*.test.{ts,tsx,js,jsx}'],
  
  // Rule configuration
  rules: {
    // Core rules
    'no-duplicate-components': 'error',
    'proper-event-handling': 'warn',
    'blueprint-naming-convention': 'warn',
    
    // Security rules
    'no-unsafe-html': 'error',
    'proper-authorization-checks': 'error',
    
    // Performance rules
    'optimize-component-re-renders': 'warn',
    'efficient-event-subscriptions': 'warn'
  },
  
  // Extending shared configurations
  extends: ['redline:recommended'],
  
  // Custom plugins
  plugins: ['redline-react', 'redline-vue']
};
```

## Rule Categories

Redline includes several categories of rules:

### Core Rules

These rules enforce AssembleJS's architectural patterns and component model:

- `no-duplicate-components` - Prevents duplicate component registration
- `proper-event-handling` - Ensures events are correctly defined and handled
- `blueprint-naming-convention` - Enforces naming standards for blueprints
- `component-structure` - Ensures components follow the proper structure

### Security Rules

These rules help identify and prevent security vulnerabilities:

- `no-unsafe-html` - Prevents potential XSS vulnerabilities
- `proper-authorization-checks` - Ensures auth checks are performed correctly
- `secure-data-handling` - Ensures sensitive data is handled properly

### Performance Rules

These rules help identify potential performance issues:

- `optimize-component-re-renders` - Identifies components that may re-render unnecessarily
- `efficient-event-subscriptions` - Ensures event subscriptions are properly managed
- `lazy-load-blueprints` - Encourages lazy loading for better initial load performance

## Custom Rules

You can extend Redline with your own custom rules by creating a plugin:

```javascript
// my-redline-plugin.js
module.exports = {
  rules: {
    'my-custom-rule': {
      create: function(context) {
        return {
          // AST visitor functions
          CallExpression(node) {
            // Rule implementation...
          }
        };
      }
    }
  }
};
```

## Integration with CI/CD

Redline can be easily integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Code Quality Check

on: [push, pull_request]

jobs:
  redline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - name: Run Redline
        run: npx redline --format=json --output=redline-results.json
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: redline-results
          path: redline-results.json
```

## Best Practices

1. **Run Regularly**: Integrate Redline into your development workflow and CI/CD pipeline
2. **Fix Issues Incrementally**: Use `--fix` to automatically resolve simple issues
3. **Custom Configuration**: Adjust rules based on your project's specific needs
4. **Team Standards**: Use Redline to enforce team coding standards

## Related Topics

- [Development Workflow](development-workflow)
- [Contributing to AssembleJS](contributing-to-assemblejs)
- [Rivet Deployment System](rivet-deployment-system)