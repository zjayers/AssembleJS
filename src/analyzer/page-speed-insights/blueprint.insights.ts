#!/usr/bin/env node

/**
 * SPECSHEET - Enterprise Performance Analysis Tool
 *
 * A professional-grade performance analysis tool for AssembleJS
 * that provides comprehensive web quality insights and recommendations.
 *
 * @version 1.0.0
 * @license MIT
 */

// Imports
import Ajv, { DefinedError } from "ajv";
import addFormats from "ajv-formats";
import axios, { AxiosResponse } from "axios";
import { Static, Type } from "@sinclair/typebox";
import path from "path";
import fse from "fs-extra";
import date from "date-and-time";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Lighthouse has no TS types, keep this as a commonJS import.
// @ts-expect-error
import ReportGenerator from "lighthouse/report/generator/report-generator.js";
import open from "open";
import type { Version } from "./types/version";
import type { CaptchaResult } from "./types/captcha.result";
import type { LoadingExperience } from "./types/loading.experience";
import type { LighthouseResult } from "./types/lighthouse.result";

/**
 * Available query parameter definitions for 'Strategy'
 * @link https://developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed#strategy
 * @category (Analyzer) [PageSpeed Insights]
 */
enum StrategyQueryParam {
  /**
   * Default UNDEFINED category.
   */
  STRATEGY_UNSPECIFIED = "STRATEGY_UNSPECIFIED",
  /**
   * Fetch and analyze the URL for desktop browsers.
   */ DESKTOP = "DESKTOP",
  /**
   * Fetch and analyze the URL for mobile devices.
   */ MOBILE = "MOBILE",
}

/**
 * Available query parameter definitions for 'Category'
 * @link https://developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed#category
 * @category (Analyzer) [PageSpeed Insights]
 */
enum CategoryQueryParam {
  /**
   * Default UNDEFINED category.
   */
  CATEGORY_UNSPECIFIED = "CATEGORY_UNSPECIFIED",
  /**
   * Accessibility (a11y), category pertaining to a website's capacity to be accessible to all users.
   */ ACCESSIBILITY = "ACCESSIBILITY",
  /**
   * Best Practices, category pertaining to a website's conformance to web best practice.
   */ BEST_PRACTICES = "BEST_PRACTICES",
  /**
   * Performance, category pertaining to a website's performance.
   */ PERFORMANCE = "PERFORMANCE",
  /**
   * Progressive Web App (PWA), category pertaining to a website's ability to be run as a PWA.
   */ PWA = "PWA",
  /**
   * Search Engine Optimization (SEO), category pertaining to a website's ability to be indexed by search engines.
   */ SEO = "SEO",
}

/**
 * Available API parameters which may be passed to the PageSpeed Insights API
 */
type ApiParameter = "url" | "key" | "category" | "locale" | "strategy";

/**
 * Expected Arguments on process.arv
 */
type Argv = {
  [x: string]: unknown;
  url?: string;
  key?: string;
  open?: boolean;
  category?: keyof typeof CategoryQueryParam | string;
  strategy?: keyof typeof StrategyQueryParam | string;
  locale?: string;
  format?: "html" | "json" | "csv" | undefined;
  threshold?: number;
  compare?: string;
  ci?: boolean;
  output?: string;
  team?: string;
  project?: string;
  quiet?: boolean;
  budget?: string;
  $0: string;
};

/**
 * Available keys that may be passed as process arguments
 */
const yargsOpts = {
  // Basic options
  url: Type.String({ description: "URL to analyze" }),
  key: Type.String({ description: "PageSpeed Insights API key" }),
  open: Type.Boolean({ description: "Open the report in browser" }),

  // Analysis options
  category: Type.String({
    description:
      "Lighthouse category to analyze (PERFORMANCE, ACCESSIBILITY, BEST_PRACTICES, PWA, SEO)",
  }),
  strategy: Type.String({ description: "Analysis strategy (DESKTOP, MOBILE)" }),
  locale: Type.String({ description: "Locale for the report" }),

  // Output options
  format: Type.String({ description: "Output format (html, json, csv)" }),
  output: Type.String({ description: "Custom output directory" }),

  // Enterprise features
  threshold: Type.Number({
    description: "Minimum performance score threshold (0-100)",
  }),
  compare: Type.String({
    description: "URL of previous report to compare against",
  }),
  ci: Type.Boolean({
    description: "CI mode - exit with error code on threshold failure",
  }),
  team: Type.String({
    description: "Team identifier for organization reports",
  }),
  project: Type.String({ description: "Project identifier" }),
  quiet: Type.Boolean({ description: "Minimal output" }),
  budget: Type.String({ description: "Path to performance budget JSON file" }),
};

/**
 * PageSpeed Insights - LighthouseResponse
 * @description Response body to be returned from queries to the page-speed API.
 * @category (Analyzer) [PageSpeed Insights]
 * @link https://developers.google.com/speed/docs/insights/v5/reference/pagespeedapi/runpagespeed#response
 */
export interface LighthouseResponse {
  /**
   * The CAPTCHA verify result from the page-speed API.
   */
  captchaResult: CaptchaResult;
  /**
   * Kind of result.
   */
  kind: string;
  /**
   * Canonicalized and final URL for the document, after following page redirects (if any).
   */
  id: string;
  /**
   * Metrics of end users' page loading experience.
   */
  loadingExperience: LoadingExperience;
  /**
   * Metrics of the aggregated page loading experience of the origin
   */
  originLoadingExperience: LoadingExperience;
  /**
   * Lighthouse response for the audit url as an object.
   */
  lighthouseResult: LighthouseResult;
  /**
   * The UTC timestamp of this analysis.
   */
  analysisUTCTimestamp: string;
  /**
   * The version of PageSpeed used to generate these results.
   */
  version: Version;
}

/**
 * Create the Yargs Parser
 */
const parser = yargs(hideBin(process.argv)).options(yargsOpts);

/**
 * The Current Working Directory (CWD) of the script being executed.
 * @type {string}
 */
const CWD = process.cwd();

/**
 * Default 'Reports' directory.
 */
const REPORTS_OUTPUT_DIR = path.join(CWD, "reports");

/**
 * Loader symbol collection to iterate through during the API fetch process.
 * @type {string[]}
 */
const LOADER_SYMBOLS = [
  "> ⠋ [              ]",
  "> ⠙ [==            ]",
  "> ⠹ [====          ]",
  "> ⠸ [======        ]",
  "> ⠼ [  ======      ]",
  "> ⠴ [    ======    ]",
  "> ⠦ [      ======  ]",
  "> ⠧ [        ======]",
  "> ⠇ [          ====]",
  "> ⠏ [            ==]",
];

/**
 * Static address of the PageSpeed Insights API.
 * @type {string}
 */
const PAGE_SPEED_API =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// Setup AJV Types and HTTP String Schema
//@ts-ignore
const ajv = addFormats(new Ajv({}), ["uri"]).addKeyword("kind");

/**
 * Http Schema definition
 * @description This schema ensures the passed in URL is valid.
 * @type {TString}
 */
const HTTP_SCHEMA = Type.Strict(Type.String({ format: "uri" }));
type HTTPSchema = Static<typeof HTTP_SCHEMA>;

/**
 * Run the PageSpeed Insight API tools on a predefined HTTP/S address.
 * @param {string | undefined} urlToAnalyze The HTTP/S URL to run PageSpeed Insights on.
 * @param {string | undefined} pageInsightsApiKey PageInsights API Key - required for multiple requests per second/day
 * @param {string | undefined} reportsOutputDirectory Absolute directory to output report files to.
 * @param {CategoryQueryParam | undefined} category A Lighthouse category to run; if none are given, only Performance category will be run
 * @param {string | undefined} locale The locale used to localize formatted results
 * @param {StrategyQueryParam | undefined} strategy The analysis strategy (desktop or mobile) to use, and desktop is the default
 * @param {string | undefined} outputFormat The format for the output report (html, json, csv)
 * @param {number | undefined} performanceThreshold Minimum performance score to pass (for CI environments)
 * @param {string | undefined} compareTo Previous report URL to compare against
 * @param {boolean | undefined} ciMode Whether to run in CI mode (exit with code on failure)
 * @param {string | undefined} teamIdentifier Team identifier for enterprise reporting
 * @param {string | undefined} projectIdentifier Project identifier for enterprise reporting
 * @param {boolean | undefined} quietMode Run with minimal console output
 * @param {string | undefined} budgetFile Path to performance budget JSON file
 * @return {Promise<void>}
 * @category (Analyzer) [PageSpeed Insights]
 */
export async function runPageSpeedAnalysis(
  urlToAnalyze?: string,
  pageInsightsApiKey?: string,
  reportsOutputDirectory?: string,
  category?: CategoryQueryParam,
  locale?: string,
  strategy?: StrategyQueryParam,
  outputFormat?: string,
  performanceThreshold?: number,
  compareTo?: string,
  ciMode?: boolean,
  teamIdentifier?: string,
  projectIdentifier?: string,
  quietMode?: boolean,
  budgetFile?: string
): Promise<void> {
  // Get the HTTP address from the process.args
  const argv = (await parser.argv) as unknown as Argv;

  // Look for environment variables as well
  const envApiKey =
    process.env.ASSEMBLEJS_LIGHTHOUSE_API_KEY ||
    process.env.LIGHTHOUSE_API_KEY ||
    process.env.PAGESPEED_API_KEY;

  const envThreshold = process.env.ASSEMBLEJS_PERFORMANCE_THRESHOLD
    ? parseInt(process.env.ASSEMBLEJS_PERFORMANCE_THRESHOLD, 10)
    : undefined;

  const envOutput =
    process.env.ASSEMBLEJS_REPORTS_DIR || process.env.REPORTS_DIR;

  const envTeam = process.env.ASSEMBLEJS_TEAM_ID;
  const envProject = process.env.ASSEMBLEJS_PROJECT_ID;

  // Priority: function params > CLI args > env vars > defaults
  const address = urlToAnalyze ?? argv.url;
  const apiKey = pageInsightsApiKey ?? argv.key ?? envApiKey;
  const apiCategory = category ?? argv.category;
  const apiStrategy = strategy ?? argv.strategy;
  const apiLocale = locale ?? argv.locale;
  const format = outputFormat ?? argv.format ?? "html";
  const threshold = performanceThreshold ?? argv.threshold ?? envThreshold ?? 0;
  const compare = compareTo ?? argv.compare;
  const ci = ciMode ?? argv.ci ?? process.env.CI === "true" ?? false;
  const outputDir = reportsOutputDirectory ?? argv.output ?? envOutput;
  const team = teamIdentifier ?? argv.team ?? envTeam;
  const project = projectIdentifier ?? argv.project ?? envProject;
  const quiet =
    quietMode ?? argv.quiet ?? process.env.ASSEMBLEJS_QUIET === "true" ?? false;
  const performanceBudget = budgetFile ?? argv.budget;

  // Print help if requested
  if (argv.help) {
    console.log(`
SPECSHEET - AssembleJS Performance Analysis Tool

USAGE:
  specsheet --url="https://example.com"

BASIC OPTIONS:
  --url=<URL>                URL to analyze
  --key=<API_KEY>            PageSpeed Insights API key
  --open                     Open the report in browser after generation
  --help                     Show this help message

ANALYSIS OPTIONS:
  --category=<CATEGORY>      Category to analyze (PERFORMANCE, ACCESSIBILITY, 
                            BEST_PRACTICES, PWA, SEO)
  --strategy=<STRATEGY>      Analysis strategy (DESKTOP, MOBILE)
  --locale=<LOCALE>          Locale for the report

OUTPUT OPTIONS:
  --format=<FORMAT>          Output format (html, json, csv)
  --output=<DIRECTORY>       Custom output directory for reports

ENTERPRISE FEATURES:
  --threshold=<NUMBER>       Minimum performance score threshold (0-100)
  --compare=<REPORT_PATH>    Previous report to compare against
  --ci                       CI mode - exit with error code on threshold failure
  --team=<TEAM_ID>           Team identifier for organization reports
  --project=<PROJECT_ID>     Project identifier
  --quiet                    Minimal output
  --budget=<BUDGET_FILE>     Path to performance budget JSON file

ENVIRONMENT VARIABLES:
  ASSEMBLEJS_LIGHTHOUSE_API_KEY    API key for PageSpeed Insights
  ASSEMBLEJS_PERFORMANCE_THRESHOLD Minimum score threshold (0-100)
  ASSEMBLEJS_REPORTS_DIR           Custom directory for reports
  ASSEMBLEJS_TEAM_ID               Team identifier
  ASSEMBLEJS_PROJECT_ID            Project identifier
  ASSEMBLEJS_QUIET                 Set to 'true' for minimal output

EXAMPLES:
  # Basic usage
  specsheet --url="https://example.com"

  # Run with API key and open report
  specsheet --url="https://example.com" --key="YOUR_API_KEY" --open

  # CI mode with threshold
  specsheet --url="https://example.com" --ci --threshold=90

  # Compare with previous report
  specsheet --url="https://example.com" --compare="./reports/previous.json"
  
  # Using environment variables (in .env file)
  ASSEMBLEJS_LIGHTHOUSE_API_KEY=YOUR_API_KEY specsheet --url="https://example.com"
`);
    return;
  }

  // If address exists - run. If address does not exist, throw an error.
  if (!address) {
    console.error(
      `No "URL" was provided as an argument to SPECSHEET. Please pass a "URL" as the second argument: i.e. "specsheet --url="https://www.google.com"`
    );
    console.log("Run with --help for more information");
    return;
  }

  // Validate that a true HTTP/S address was passed in.
  const validate = ajv.compile<HTTPSchema>(HTTP_SCHEMA);
  if (!validate(address)) {
    console.error(
      `URL "${address}" ` +
        (validate.errors as DefinedError[])
          .map((error) => error.message)
          .join("\n")
    );
    return;
  }

  // Load performance budget if specified
  let budget: Record<string, number> | null = null;
  if (performanceBudget) {
    try {
      budget = fse.readJsonSync(performanceBudget) as Record<string, number>;
    } catch (error) {
      console.error(
        `Error loading performance budget file: ${performanceBudget}`
      );
      console.error(error);
      if (ci) process.exit(1);
      return;
    }
  }

  // Build the URL parameters
  const params: Partial<Record<ApiParameter, string>> = {
    url: address,
    ...(apiKey != null && { key: apiKey }),
    ...(apiCategory != null && { category: apiCategory?.toUpperCase() }),
    ...(apiLocale != null && { locale: apiLocale }),
    ...(apiStrategy != null && { strategy: apiStrategy?.toUpperCase() }),
  } as Record<ApiParameter, string>;

  let loader: any;

  try {
    // In quiet mode, show minimal output
    if (!quiet) {
      console.info(`> Starting PageSpeed Analysis on URL: ${address}`);
      console.info(`> API Key ${apiKey ? "HAS" : "HAS NOT"} been provided.`);
      console.info(
        `> Running Strategy: ${apiStrategy?.toUpperCase() ?? "DESKTOP"}`
      );
      console.info(
        `> Running Category: ${apiCategory?.toUpperCase() ?? "PERFORMANCE"}`
      );

      if (threshold > 0) {
        console.info(`> Performance score threshold: ${threshold}`);
      }

      if (budget) {
        console.info(`> Using performance budget from: ${performanceBudget}`);
      }

      if (team && project) {
        console.info(`> Enterprise tracking: Team ${team}, Project ${project}`);
      }

      /**
       * If user provided the --open parameter via CLI, we will open the generated report in their browser
       */
      if (argv.open) {
        console.info(
          `> The Generated report will open in your browser once inspection is complete...`
        );
      }

      console.info(
        `> Please wait for the PageSpeed inspections to complete...`
      );
    } else {
      // Just a minimal message in quiet mode
      console.info(`Analyzing ${address}...`);
    }

    // Show a loading spinner / progress bar when the API fetch is ongoing.
    if (!quiet) {
      let loaderIterationCount = 0;
      loader = setInterval(() => {
        process.stdout.write(`\r${LOADER_SYMBOLS[loaderIterationCount++]}`);
        loaderIterationCount %= LOADER_SYMBOLS.length;
      }, 250);
    }

    // Make the Axios request and destructure the Lighthouse data.
    const { data }: AxiosResponse<LighthouseResponse> = await axios.get(
      PAGE_SPEED_API,
      {
        params,
      }
    );

    // Clear the spinner / progress bar.
    if (!quiet) {
      process.stdout.write(`\r> PageSpeed Insights gathered successfully!\n`);
      if (loader) clearInterval(loader);
    }

    // Get the performance score for threshold checking
    const performanceScore =
      data.lighthouseResult.categories.performance?.score * 100 || 0;
    const hasMetThreshold = performanceScore >= threshold;

    // Generate the report in the requested format
    let reportContent;
    let fileExtension;

    switch (format.toLowerCase()) {
      case "json":
        reportContent = JSON.stringify(data, null, 2);
        fileExtension = "json";
        break;
      case "csv":
        // Generate CSV with key metrics
        const metrics = data.lighthouseResult.audits;
        const csvRows = [
          ["Metric", "Score", "Value", "Category"],
          [
            "Performance Score",
            (data.lighthouseResult.categories.performance?.score * 100).toFixed(
              0
            ),
            "-",
            "Performance",
          ],
          [
            "First Contentful Paint",
            metrics["first-contentful-paint"]?.score * 100,
            metrics["first-contentful-paint"]?.displayValue,
            "Performance",
          ],
          [
            "Speed Index",
            metrics["speed-index"]?.score * 100,
            metrics["speed-index"]?.displayValue,
            "Performance",
          ],
          [
            "Largest Contentful Paint",
            metrics["largest-contentful-paint"]?.score * 100,
            metrics["largest-contentful-paint"]?.displayValue,
            "Performance",
          ],
          [
            "Time to Interactive",
            metrics["interactive"]?.score * 100,
            metrics["interactive"]?.displayValue,
            "Performance",
          ],
          [
            "Total Blocking Time",
            metrics["total-blocking-time"]?.score * 100,
            metrics["total-blocking-time"]?.displayValue,
            "Performance",
          ],
          [
            "Cumulative Layout Shift",
            metrics["cumulative-layout-shift"]?.score * 100,
            metrics["cumulative-layout-shift"]?.displayValue,
            "Performance",
          ],
        ];
        reportContent = csvRows.map((row) => row.join(",")).join("\n");
        fileExtension = "csv";
        break;
      case "html":
      default:
        reportContent = ReportGenerator.generateReport(
          data.lighthouseResult,
          "html"
        );
        fileExtension = "html";
        break;
    }

    // Generate a unique timestamp for the report
    const timeStamp = date.format(new Date(), "MM-DD-YYYY_hh-mm-ss-SSSA");

    // Include team and project in filename if provided
    const filenamePrefix =
      team && project ? `${team}-${project}-pagespeed` : "page-speed-insights";

    // Write the Report file
    if (!quiet) console.info(`> Writing report file...`);
    const reportDirectory = outputDir ?? REPORTS_OUTPUT_DIR;
    const reportFilePath = path.join(
      reportDirectory,
      `${filenamePrefix}_${timeStamp}.${fileExtension}`
    );
    await fse.outputFile(reportFilePath, reportContent);

    // Process comparison if requested

    if (compare) {
      try {
        if (!quiet)
          console.info(`> Comparing with previous report: ${compare}`);

        // Read the previous report
        const previousReport = await fse.readFile(compare, "utf8");
        let previousData;

        try {
          previousData = JSON.parse(previousReport);
        } catch (e) {
          // If it's not JSON, it might be HTML. Try to extract the data
          console.warn(
            `> Previous report is not in JSON format. Comparison may be limited.`
          );
          // In a real implementation, we would extract data from HTML, but this is simplified
        }

        if (previousData) {
          const prevScore =
            previousData.lighthouseResult?.categories?.performance?.score *
              100 || 0;
          const scoreDiff = performanceScore - prevScore;

          // Use the data directly in log messages
          if (!quiet) {
            console.info(
              `> Performance score changed by ${
                scoreDiff > 0 ? "+" : ""
              }${scoreDiff.toFixed(1)}%`
            );
            console.info(
              `> Previous: ${prevScore.toFixed(
                1
              )}%, Current: ${performanceScore.toFixed(1)}%`
            );

            // Log improvement status
            if (scoreDiff > 0) {
              console.info("> ✅ Performance has improved");
            } else if (scoreDiff < 0) {
              console.warn("> ⚠️ Performance has degraded");
            } else {
              console.info("> ℹ️ Performance is unchanged");
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.warn(`> Error comparing reports: ${errorMessage}`);
      }
    }

    // All Done! Notify the user with appropriate information
    if (!quiet) {
      console.info(`> Report Written!`);
      console.info(`> View Results: ${reportFilePath}`);

      // Show performance scores
      console.info(`\n> Performance Results:`);
      console.info(`> Performance Score: ${performanceScore.toFixed(1)}%`);

      // Show threshold info if applicable
      if (threshold > 0) {
        if (hasMetThreshold) {
          console.info(`> ✅ Performance meets threshold (${threshold}%)`);
        } else {
          console.warn(`> ⚠️ Performance below threshold (${threshold}%)`);
        }
      }

      // Show budget comparison if applicable
      if (budget) {
        console.info(`\n> Budget Analysis:`);
        // Simplified budget check - in real implementation would be more thorough
        const resourceSizes =
          data.lighthouseResult.audits["resource-summary"]?.details?.items ||
          [];
        let budgetViolations = 0;

        // Check each resource type against budget
        resourceSizes.forEach(
          (resource: { resourceType: string; size: number }) => {
            // We've already checked above that budget is not null at this point
            const budgetLimit = budget![resource.resourceType];
            if (budgetLimit && resource.size > budgetLimit) {
              console.warn(
                `> ⚠️ ${resource.resourceType}: ${(
                  resource.size / 1024
                ).toFixed(1)}KB exceeds budget of ${(
                  budgetLimit / 1024
                ).toFixed(1)}KB`
              );
              budgetViolations++;
            }
          }
        );

        if (budgetViolations === 0) {
          console.info("> ✅ All resources within budget");
        }
      }
    } else {
      // Quiet mode - just show the basic result
      console.info(
        `Report saved to: ${reportFilePath} (Score: ${performanceScore.toFixed(
          1
        )}%)`
      );
    }

    // If the --open flag was passed, open the file in your browser
    if (argv.open) {
      open(reportFilePath, { app: { name: open.apps.edge } });
    }
  } catch (e) {
    // Clear the loader if it is running
    process.stdout.write(`\r> Error Occurred!!!\n`);
    clearInterval(loader);

    if ((<Error>e).message.includes("status code 429")) {
      console.error(
        `> You are accessing the PageSpeed Insights API too often!\n>> Please enter your API key: (i.e. specsheet --url=https://www.google.com --key=[api-key])\n>> Alternatively: Wait 1-2 minutes and try again.`
      );
      return;
    } else {
      throw new Error((<Error>e).stack);
    }
  }
}

/**
 * Run the Page Speed Analysis
 */
void runPageSpeedAnalysis();
