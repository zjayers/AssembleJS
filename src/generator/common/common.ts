import { CONSTANTS } from "../../constants/blueprint.constants";
import fs from "fs";
import path from "path";

export const AVAILABLE_VIEW_CHOICES = [
  "HTML",
  "EJS",
  "Preact",
  "React",
  "Vue",
  "Svelte",
  "Markdown",
  "Nunjucks",
  "Handlebars",
  "Pug",
  "WebComponent",
];
export const RANDOM_SALUTATIONS = [
  // A mix of professional and quirky salutations
  "is operational!",
  "is ready to go!",
  "is up and running!",
  "is alive!",
  "is ready to assemble!",
  "is ready to shine!",
  "is now in the building!",
  "has joined the party!",
  "is ready for action!",
  "is at your service!",
  "is connected and ready!",
  "is good to go!",
  "has entered the chat!",
  "has been successfully launched!",
  "is ready to rock!",
  "is powered up!",
];
export const RANDOM_COLORS = Object.values(CONSTANTS.branding);
export const getRandomSalutation = () =>
  RANDOM_SALUTATIONS[Math.floor(Math.random() * RANDOM_SALUTATIONS.length)];
export const getRandomColor = () =>
  RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];

/**
 * Scans directories to find available blueprints and components
 * @param {string} cwd - Current working directory
 * @return {object} Object containing available blueprints and components
 */
export function scanForAvailableParents(cwd = process.cwd()) {
  const blueprintsDir = path.join(cwd, "src", "blueprints");
  const componentsDir = path.join(cwd, "src", "components");

  const blueprints = [];
  const components = [];

  // Scan blueprints directory if it exists
  if (fs.existsSync(blueprintsDir)) {
    const blueprintFolders = fs
      .readdirSync(blueprintsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    blueprints.push(...blueprintFolders);
  }

  // Scan components directory if it exists
  if (fs.existsSync(componentsDir)) {
    const componentFolders = fs
      .readdirSync(componentsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    components.push(...componentFolders);
  }

  return { blueprints, components };
}

/**
 * Gets file extension for the selected render type
 * @param {string} renderType - The template language to use
 * @return {string} The file extension for the template
 */
export function getFileExtensionForRenderType(renderType: string): string {
  switch (renderType.toLowerCase()) {
    case "html":
      return "html";
    case "ejs":
      return "ejs";
    case "preact":
      return "tsx";
    case "react":
      return "jsx";
    case "vue":
      return "vue";
    case "svelte":
      return "svelte";
    case "markdown":
    case "md":
      return "md";
    case "nunjucks":
      return "njk";
    case "handlebars":
      return "hbs";
    case "pug":
      return "pug";
    case "webcomponent":
      return "wc";
    default:
      return "html";
  }
}

/**
 * Converts a dash-case string to camelCase
 * @param {string} str - The string to convert
 * @return {string} The camelCase version of the string
 */
export function dashToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
