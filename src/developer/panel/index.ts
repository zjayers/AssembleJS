/**
 * AssembleJS Development Panel
 * @description Injects a development panel into Blueprint pages when in development mode
 * @author Zach Ayers
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { ASSEMBLEJS } from "../../server/config/blueprint.config";
import { encodeHtml } from "../../utils/html.utils";

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache for file contents to avoid repeated disk reads
const fileCache = new Map<string, string>();

/**
 * Read a file from the dev panel directory
 * @param {string} filename - The name of the file to read
 * @return {string} - The file contents
 */
function readPanelFile(filename: string): string {
  try {
    // Check cache first
    if (fileCache.has(filename)) {
      return fileCache.get(filename)!;
    }

    // Log the absolute path for debugging
    const filePath = path.join(__dirname, filename);
    console.debug(`Reading panel file: ${filePath}`);

    // Check if file exists before reading
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);

      // Try to list directory contents to help debug
      try {
        const dirContents = fs.readdirSync(__dirname);
        console.debug(
          `Directory contents of ${__dirname}: ${dirContents.join(", ")}`
        );
      } catch (dirErr) {
        console.error(
          `Failed to read directory: ${
            dirErr instanceof Error ? dirErr.message : String(dirErr)
          }`
        );
      }

      return `<!-- Panel file ${filename} not found -->`;
    }

    // Read from disk
    const content = fs.readFileSync(filePath, "utf8");
    console.debug(
      `Successfully read panel file: ${filename} (${content.length} bytes)`
    );

    // Cache for future use (only in production)
    if (process.env.NODE_ENV !== "development") {
      fileCache.set(filename, content);
    }

    return content;
  } catch (error) {
    console.error(`[DEV-PANEL] Error reading panel file ${filename}:`, error);
    return `<!-- Error reading panel file: ${filename} -->`;
  }
}

/**
 * Apply template variables to HTML content
 * @param {string} html - The HTML content with template variables
 * @param {Record<string, string>} variables - The variables to inject
 * @return {string} - The processed HTML
 */
function applyTemplateVariables(
  html: string,
  variables: Record<string, string>
): string {
  return Object.entries(variables).reduce((result, [key, value]) => {
    const safeValue = encodeHtml(value);
    return result.replace(new RegExp(`{{${key}}}`, "g"), safeValue);
  }, html);
}

/**
 * Generate the HTML for the development panel
 * @param {string} blueprintId - The blueprint ID
 * @param {string} componentName - The component name
 * @param {string} viewName - The view name
 * @return {string} - The HTML for the development panel
 */
export function generateDevPanel(
  blueprintId: string,
  componentName: string,
  viewName: string
): string {
  try {
    console.debug(
      `Generating panel for component: ${componentName}/${viewName}`
    );

    // Read panel files
    const htmlContent = readPanelFile("panel.html");
    const cssContent = readPanelFile("panel.css");
    const jsContent = readPanelFile("panel.js");

    // Check for failed files - but NOTE that panel.html actually DOES start with <!-- for the comment!
    const htmlFailed = htmlContent.includes("Panel file panel.html not found");
    const cssFailed = cssContent.includes("Panel file panel.css not found");
    const jsFailed = jsContent.includes("Panel file panel.js not found");

    if (htmlFailed || cssFailed || jsFailed) {
      console.warn(
        "One or more panel files failed to load, skipping panel generation"
      );
      console.debug(`HTML failed: ${htmlFailed}`);
      console.debug(`CSS failed: ${cssFailed}`);
      console.debug(`JS failed: ${jsFailed}`);
      return "<!-- Some panel files could not be loaded -->";
    } else {
      console.debug("All panel files loaded successfully");
    }

    // Replace template variables in HTML
    const processedHtml = applyTemplateVariables(htmlContent, {
      blueprintId: blueprintId || "unknown",
      componentName: componentName || "unknown",
      viewName: viewName || "unknown",
      environment: ASSEMBLEJS.environment || "development",
    });

    // Generate the panel HTML
    const panel = `
    <!-- AssembleJS Development Panel -->
    <style>${cssContent}</style>
    ${processedHtml}
    <script>${jsContent}</script>
    <!-- End AssembleJS Development Panel -->
    `;

    console.debug(`Successfully generated panel (${panel.length} bytes)`);
    return panel;
  } catch (error) {
    console.error(
      "Error generating dev panel:",
      error instanceof Error ? error.message : String(error)
    );
    return "<!-- Failed to generate AssembleJS Development Panel -->";
  }
}

/**
 * Inject the development panel into the template HTML
 * @param {string} template - The template HTML
 * @param {string} blueprintId - The blueprint ID
 * @param {string} componentName - The component name
 * @param {string} viewName - The view name
 * @return {string} - The template HTML with the development panel injected
 */
export function injectDevPanel(
  template: string,
  blueprintId: string,
  componentName: string,
  viewName: string
): string {
  try {
    console.debug(
      `Injecting panel into template for ${componentName}/${viewName}`
    );

    // Only inject in development mode
    if (!ASSEMBLEJS.isLocal()) {
      console.debug("Not in local mode, skipping panel injection");
      return template;
    }

    // Handle null/undefined template
    if (!template) {
      console.error("Template is null or undefined, cannot inject panel");
      return template || "";
    }

    // Generate the dev panel HTML
    const devPanel = generateDevPanel(blueprintId, componentName, viewName);

    if (!devPanel || devPanel.startsWith("<!--")) {
      console.warn("Dev panel generation failed, returning original template");
      return template;
    }

    // Inject before closing body tag
    if (template.includes("</body>")) {
      console.debug("Found </body> tag, injecting panel");
      const result = template.replace("</body>", `${devPanel}</body>`);
      console.debug(
        `Successfully injected panel, template size: ${template.length} → ${result.length} bytes`
      );
      return result;
    }

    // If no body tag, append to the end
    console.debug("No </body> tag found, appending panel to the end");
    const result = template + devPanel;
    console.debug(
      `Successfully appended panel, template size: ${template.length} → ${result.length} bytes`
    );
    return result;
  } catch (error) {
    console.error(
      "Error injecting dev panel:",
      error instanceof Error ? error.message : String(error)
    );
    return template; // Return original template on error
  }
}
