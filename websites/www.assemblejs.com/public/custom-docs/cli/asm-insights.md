# asm-insights - AssembleJS Analysis Tool

The `asm-insights` command provides comprehensive analysis and optimization suggestions for your AssembleJS application, helping you improve performance, accessibility, SEO, and best practices.

## Overview

`asm-insights` runs a series of analyses on your application to identify opportunities for improvement across multiple dimensions. It provides detailed reports with actionable recommendations to enhance your application's quality and performance.

## Usage

```bash
npx asm-insights [options]
```

## Command Options

| Option | Description |
|--------|-------------|
| `--url=<URL>` | Analyze a deployed application at the specified URL |
| `--local` | Analyze the local development version (starts a server if not running) |
| `--production` | Build and analyze the production version |
| `--categories=<CATS>` | Specify analysis categories to run (comma-separated) |
| `--output=<FORMAT>` | Output format: json, html, or terminal (default) |
| `--report=<PATH>` | Path to save the report file |
| `--open` | Open the report in the browser after generation |
| `--help`, `-h` | Display help information |

## Analysis Categories

`asm-insights` provides analysis in several categories:

| Category | Description |
|----------|-------------|
| `performance` | Page load and runtime performance metrics |
| `accessibility` | Accessibility compliance and best practices |
| `seo` | Search engine optimization evaluation |
| `best-practices` | Web development best practices |
| `pwa` | Progressive Web App capabilities |
| `security` | Security vulnerabilities and concerns |
| `structure` | Component architecture analysis |
| `bundle` | JavaScript bundle size and composition |
| `dependencies` | Dependency analysis and recommendations |

## Output Formats

The analysis results can be output in different formats:

- **Terminal** (default): Colorful, interactive console output
- **HTML**: Comprehensive HTML report with visualizations
- **JSON**: Structured data for integration with other tools

## Performance Analysis

The performance analysis includes:

- **First Contentful Paint (FCP)**: Time until the first content is rendered
- **Largest Contentful Paint (LCP)**: Time until the largest content element is rendered
- **Cumulative Layout Shift (CLS)**: Visual stability measure
- **Total Blocking Time (TBT)**: Measure of interactivity delay
- **Time to Interactive (TTI)**: When the page becomes fully interactive
- **Component Render Time**: Detailed breakdown of component rendering performance
- **JavaScript Execution Time**: Analysis of script execution duration
- **Asset Loading Performance**: Evaluation of image, font, and other asset loading

## Accessibility Analysis

Accessibility analysis checks for:

- **ARIA Compliance**: Proper use of ARIA attributes
- **Keyboard Navigation**: Support for keyboard-only users
- **Color Contrast**: Sufficient contrast for readability
- **Text Alternatives**: Proper alt text for images
- **Heading Structure**: Logical document outline
- **Focus Management**: Proper focus handling for interactive elements

## SEO Analysis

SEO analysis evaluates:

- **Meta Tags**: Proper page metadata
- **Heading Structure**: Logical organization of content
- **Image Optimization**: Proper image attributes
- **Link Quality**: Internal and external link structure
- **Mobile Friendliness**: Mobile optimization factors
- **Structured Data**: Presence of structured data markup

## Component Architecture Analysis

This analysis reviews your application's component structure:

- **Component Coupling**: Evaluation of dependencies between components
- **Event Usage**: Analysis of event bus usage patterns
- **Prop Drilling**: Identification of excessive prop passing
- **Component Size**: Detection of overly large components
- **Rendering Efficiency**: Identification of unnecessary re-renders
- **Code Duplication**: Detection of duplicated code across components

## Advanced Usage

### Analyzing a Deployed Application

```bash
npx asm-insights --url=https://myapp.example.com
```

### Analyzing a Local Development Server

```bash
npx asm-insights --local
```

### Generating an HTML Report

```bash
npx asm-insights --local --output=html --report=./insights.html --open
```

### Focusing on Specific Categories

```bash
npx asm-insights --local --categories=performance,accessibility
```

## Configuration

You can configure `asm-insights` by creating an `asm-insights.config.js` file in your project root:

```javascript
// asm-insights.config.js
module.exports = {
  thresholds: {
    performance: {
      FCP: 1800, // ms
      LCP: 2500, // ms
      CLS: 0.1,
      TTI: 3800, // ms
    },
    // Other category thresholds
  },
  audits: {
    // Enable or disable specific audits
    'no-unload-listeners': false,
    'uses-responsive-images': true,
  },
  skipAudits: [
    // Audits to skip
    'uses-http2',
  ],
  // Other configuration options
};
```

## Integration with CI/CD

`asm-insights` can be integrated into your CI/CD pipeline to ensure quality standards:

```yaml
# Example GitHub Actions workflow
jobs:
  insights:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - name: Run AssembleJS Insights
        run: npx asm-insights --production --output=json --report=./insights.json
      - name: Check performance budgets
        run: node ./scripts/check-insights.js
```

## Best Practices

- Run `asm-insights` before deploying to production
- Set performance budgets for critical metrics
- Address high-priority issues first
- Integrate into your CI/CD pipeline for continuous monitoring
- Share reports with your team to establish performance culture

## Related Commands

- [asmgen](./asmgen.md) - Generate project artifacts
- [asm-build](./asm-build.md) - Build your application for production
- [asm-serve](./asm-serve.md) - Start the development server