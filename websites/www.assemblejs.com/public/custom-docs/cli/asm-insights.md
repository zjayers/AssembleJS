# asm-insights - AssembleJS Performance Analysis Tool

The `asm-insights` command (alias `specsheet`) provides comprehensive performance analysis and optimization suggestions for your AssembleJS application, helping you improve performance, accessibility, SEO, and best practices.

## Overview

`asm-insights` uses Google PageSpeed Insights API to analyze your web application and provides detailed reports with actionable recommendations to enhance your application's quality and performance.

## Usage

To run the performance analysis on your project, use:

```bash
npm run insights
```

Or directly:

```bash
npx specsheet --url="https://example.com"
```

## Server Configuration

When creating a Blueprint server with `createBlueprintServer()`, make sure to include these required configuration options:

```typescript
// src/server.ts
import { createBlueprintServer } from 'asmbl';

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,  // Required for development server
  devServer: viteDevServer,      // Required for development server
  
  // Other configuration options
});
```

## Command Options

| Option | Description |
|--------|-------------|
| `--url=<URL>` | URL to analyze (required) |
| `--key=<API_KEY>` | PageSpeed Insights API key |
| `--category=<CATEGORY>` | Category to analyze (PERFORMANCE, ACCESSIBILITY, BEST_PRACTICES, PWA, SEO) |
| `--strategy=<STRATEGY>` | Analysis strategy (DESKTOP, MOBILE) |
| `--format=<FORMAT>` | Output format (html, json, csv) |
| `--open` | Open the report in browser after generation |
| `--threshold=<NUMBER>` | Minimum performance score threshold (0-100) |
| `--compare=<REPORT_PATH>` | Previous report to compare against |
| `--output=<DIRECTORY>` | Custom output directory for reports |
| `--help` | Display help information |

## Analysis Categories

The tool provides analysis in several categories from Google PageSpeed Insights:

| Category | Description |
|----------|-------------|
| `PERFORMANCE` | Page load and runtime performance metrics |
| `ACCESSIBILITY` | Accessibility compliance and best practices |
| `SEO` | Search engine optimization evaluation |
| `BEST_PRACTICES` | Web development best practices |
| `PWA` | Progressive Web App capabilities |

## Output Formats

The analysis results can be output in different formats:

- **HTML**: Comprehensive HTML report with visualizations (default)
- **JSON**: Structured data for integration with other tools
- **CSV**: Simple CSV format with key metrics

## Performance Analysis

The performance analysis includes:

- **First Contentful Paint (FCP)**: Time until the first content is rendered
- **Largest Contentful Paint (LCP)**: Time until the largest content element is rendered
- **Cumulative Layout Shift (CLS)**: Visual stability measure
- **Total Blocking Time (TBT)**: Measure of interactivity delay
- **Time to Interactive (TTI)**: When the page becomes fully interactive
- **Speed Index**: Measurement of how quickly content is visually displayed

## Environment Variables

You can configure the analysis tool using environment variables:

| Variable | Description |
|----------|-------------|
| `ASSEMBLEJS_LIGHTHOUSE_API_KEY` | API key for PageSpeed Insights |
| `ASSEMBLEJS_PERFORMANCE_THRESHOLD` | Minimum score threshold (0-100) |
| `ASSEMBLEJS_REPORTS_DIR` | Custom directory for reports |
| `ASSEMBLEJS_TEAM_ID` | Team identifier for enterprise reporting |
| `ASSEMBLEJS_PROJECT_ID` | Project identifier for enterprise reporting |
| `ASSEMBLEJS_QUIET` | Set to 'true' for minimal output |

## Examples

### Basic Analysis

```bash
npx specsheet --url="https://example.com"
```

### With API Key and Open Report

```bash
npx specsheet --url="https://example.com" --key="YOUR_API_KEY" --open
```

### CI Mode with Threshold

```bash
npx specsheet --url="https://example.com" --ci --threshold=90
```

### Compare with Previous Report

```bash
npx specsheet --url="https://example.com" --compare="./reports/previous.json"
```

### Using Environment Variables

```bash
ASSEMBLEJS_LIGHTHOUSE_API_KEY=YOUR_API_KEY npx specsheet --url="https://example.com"
```

## Best Practices

- Run `asm-insights` before deploying to production
- Obtain a PageSpeed Insights API key for more frequent analyses
- Set performance budgets with the threshold parameter
- Compare reports over time to track improvements
- Address high-priority issues identified in the reports

## Related Commands

- [asmgen](./asmgen.md) - Generate project artifacts
- [asm-build](./asm-build.md) - Build your application for production
- [asm-serve](./asm-serve.md) - Start the development server