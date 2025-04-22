import path from "path";
import fs from "fs";

/**
 * Common paths used throughout the generator system
 * @description Centralizes path management to make maintenance easier
 * @author Zach Ayers
 */
export const GENERATOR_PATHS = {
  /**
   * Path to components directory
   * @param {string} [cwd=process.cwd()] - Current working directory
   * @return {string} Absolute path to components directory
   */
  COMPONENTS_DIR: (cwd = process.cwd()) => path.join(cwd, "src", "components"),

  /**
   * Path to blueprints directory
   * @param {string} [cwd=process.cwd()] - Current working directory
   * @return {string} Absolute path to blueprints directory
   */
  BLUEPRINTS_DIR: (cwd = process.cwd()) => path.join(cwd, "src", "blueprints"),

  /**
   * Path to controllers directory
   * @param {string} [cwd=process.cwd()] - Current working directory
   * @return {string} Absolute path to controllers directory
   */
  CONTROLLERS_DIR: (cwd = process.cwd()) =>
    path.join(cwd, "src", "controllers"),

  /**
   * Path to factories directory
   * @param {string} [cwd=process.cwd()] - Current working directory
   * @return {string} Absolute path to factories directory
   */
  FACTORIES_DIR: (cwd = process.cwd()) => path.join(cwd, "src", "factories"),

  /**
   * Path to models directory
   * @param {string} [cwd=process.cwd()] - Current working directory
   * @return {string} Absolute path to models directory
   */
  MODELS_DIR: (cwd = process.cwd()) => path.join(cwd, "src", "models"),

  /**
   * Path to services directory
   * @param {string} [cwd=process.cwd()] - Current working directory
   * @return {string} Absolute path to services directory
   */
  SERVICES_DIR: (cwd = process.cwd()) => path.join(cwd, "src", "services"),

  /**
   * Path to server.ts file
   * @param {string} [cwd=process.cwd()] - Current working directory
   * @return {string|null} Path to server.ts file or null if not found
   */
  SERVER_FILE: (cwd = process.cwd()) => {
    const serverPath = path.join(cwd, "src", "server.ts");
    return fs.existsSync(serverPath) ? serverPath : null;
  },

  /** Path to templates root directory */
  TEMPLATES_ROOT: "../templates",

  /**
   * Path to view templates by type
   * @param {string} type - The view template type
   * @return {string} Path to view template directory
   */
  VIEW_TEMPLATE: (type: string) =>
    path.join("../templates/view", type.toLowerCase()),

  /** Path to controller template */
  CONTROLLER_TEMPLATE: "../templates/controller",

  /** Path to factory template */
  FACTORY_TEMPLATE: "../templates/factory",

  /** Path to model template */
  MODEL_TEMPLATE: "../templates/model",

  /** Path to service template */
  SERVICE_TEMPLATE: "../templates/service",

  /** Path to project template */
  PROJECT_TEMPLATE: "../templates/project",

  /**
   * Creates a project destination path
   * @param {string} name - Project name
   * @param {string} [cwd=process.cwd()] - Current working directory
   * @return {string} Absolute path to project destination
   */
  PROJECT_DESTINATION: (name: string, cwd = process.cwd()) =>
    path.join(cwd, name),
};
