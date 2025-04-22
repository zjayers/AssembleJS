import fs from "fs";
import path from "path";
import type { FastifyInstance } from "fastify";
import { ASSEMBLEJS } from "../config/blueprint.config";
import { BlueprintController } from "../abstract/blueprint.controller";
import type { Assembly } from "../../types/blueprint.simple.types";

// First try to resolve dirname from current file path (works in development)
// Then fallback to node_modules path for when running as an installed package
const getPackagePath = () => {
  try {
    // First try local development path
    const localPath = path.resolve(process.cwd(), "src/server/controllers");
    if (fs.existsSync(localPath)) {
      return localPath;
    }

    // Try to find the package in node_modules
    // This handles the case when running from the installed package
    const modulePath = require.resolve("asmbl");
    const packageRoot =
      modulePath.substring(0, modulePath.indexOf("node_modules") + 12) +
      "/asmbl";
    return path.join(packageRoot, "lib/server/controllers");
  } catch (error) {
    // Last resort, use process.cwd()
    return path.resolve(process.cwd(), "src/server/controllers");
  }
};

const __dirname = getPackagePath();

// Cache the welcome page and designer page content to avoid reading from disk on every request
let cachedWelcomeHtml: string | null = null;
let cachedDesignerContent: { html: string; css: string; js: string } | null =
  null;

/**
 * Developer Controller - Handles developer tools such as the visual designer.
 * Only available in development mode.
 * @author Zach Ayers
 */
export class DeveloperController extends BlueprintController {
  /** @inheritDoc */
  public register(app: FastifyInstance): void {
    // Only register in development mode
    if (!ASSEMBLEJS.isLocal()) {
      return;
    }

    // Register welcome page at root route when no components or blueprints are registered
    this.registerWelcomePage(app);

    // Register designer tools
    this.registerDesignerRoutes(app);
    this.registerDesignerAssets(app);
    this.registerDesignerApi(app);
  }

  /**
   * Load the welcome page HTML from disk and cache it
   * @private
   * @return {string|null} The welcome page HTML content or null if it cannot be loaded
   */
  private loadWelcomePageHtml(): string | null {
    // If we already have the welcome page cached, return it
    if (cachedWelcomeHtml) {
      return cachedWelcomeHtml;
    }

    // Try multiple possible paths for the welcome page
    const possibleWelcomePaths = [
      // Path when running in development
      path.join(__dirname, "../../developer/welcome/welcome.html"),
      // Path when running from node_modules (lib structure)
      path.join(__dirname, "../../../developer/welcome/welcome.html"),
      // Path when running from node_modules but from different directory structure
      path.join(__dirname, "../../../../src/developer/welcome/welcome.html"),
      // Additional paths to try from node_modules
      path.join(
        process.cwd(),
        "node_modules/asmbl/lib/developer/welcome/welcome.html"
      ),
      path.join(
        process.cwd(),
        "storefront/node_modules/asmbl/lib/developer/welcome/welcome.html"
      ),
      path.join(
        process.cwd(),
        "../node_modules/asmbl/lib/developer/welcome/welcome.html"
      ),
    ];

    // Try each path until we find one that exists
    for (const tryPath of possibleWelcomePaths) {
      try {
        if (fs.existsSync(tryPath)) {
          cachedWelcomeHtml = fs.readFileSync(tryPath, "utf8");
          return cachedWelcomeHtml;
        }
      } catch (err) {
        // Continue to next path
      }
    }

    console.error("Welcome page not found. Tried paths:", possibleWelcomePaths);
    return null;
  }

  /**
   * Register the welcome page for new projects with no components
   * @param {FastifyInstance} app - The Fastify instance
   */
  private registerWelcomePage(app: FastifyInstance): void {
    // Attempt to load and cache the welcome page HTML at registration time
    // This ensures we only try to load it once at startup
    this.loadWelcomePageHtml();

    // Add a root route handler for when no components are registered
    app.get("/", async (request, reply) => {
      try {
        // Check if any components or blueprints are registered in the manifest
        const hasManifestComponents = this.checkManifestComponents(app);

        // Check if any components or blueprints are on disk (directory structure)
        const appStructure = await this.scanApplicationStructure();

        // If components or blueprints exist either in manifest or on disk, redirect to the first available blueprint
        if (
          hasManifestComponents ||
          appStructure.components.length > 0 ||
          appStructure.blueprints.length > 0
        ) {
          // Try to find the first accessible route from registered blueprints
          const firstRoute = await this.findFirstBlueprintRoute(app);

          if (firstRoute) {
            // Redirect to the first blueprint route we found
            return reply.redirect(firstRoute);
          }

          // If no route was found, return a 404
          return reply
            .code(404)
            .send({ error: "No accessible blueprints found" });
        }

        // Get the cached welcome page HTML (will load and cache if needed)
        const welcomeHtml = this.loadWelcomePageHtml();

        // If no welcome page HTML is available, return 404
        if (!welcomeHtml) {
          return reply.code(404).send({ error: "Welcome page not found" });
        }

        return reply
          .code(200)
          .header("Content-Type", "text/html")
          .send(welcomeHtml);
      } catch (error) {
        return reply.code(500).send({ error: "Failed to load welcome page" });
      }
    });
  }

  /**
   * Check if components are registered in the application manifest
   * @param {FastifyInstance} app - The Fastify instance
   * @return {boolean} - True if components are registered in the manifest
   * @private
   */
  private checkManifestComponents(app: FastifyInstance): boolean {
    try {
      // Access the manifest through the app
      const assembly = app as unknown as Assembly;

      // Check if manifest exists and has registered components
      if (
        assembly.manifest &&
        assembly.manifest.components &&
        Array.isArray(assembly.manifest.components) &&
        assembly.manifest.components.length > 0
      ) {
        return true;
      }

      // Check routes to find registered component routes
      if (app.routes) {
        // First, check if there are routes that aren't the welcome page or dev tools
        // We need to collect all routes from potentially nested route tables
        const allRoutes: Array<{
          url?: string;
          path?: string;
          method?: string;
        }> = [];

        // Recursively flatten the routes object which might be nested
        const flattenRoutes = (routes: any) => {
          if (Array.isArray(routes)) {
            routes.forEach((route) => allRoutes.push(route));
          } else if (routes && typeof routes === "object") {
            Object.values(routes).forEach((value) => {
              flattenRoutes(value);
            });
          }
        };

        flattenRoutes(app.routes);

        // Filter out internal routes, static asset routes, and the welcome page itself
        const nonInternalRoutes = allRoutes.filter((route) => {
          const url =
            typeof route.url === "string"
              ? route.url
              : typeof route.path === "string"
              ? route.path
              : "";

          if (!url) return false;

          // Skip internal routes and the root route (which is the welcome page)
          return (
            url !== "/" &&
            !url.startsWith("/__asmbl__") &&
            !url.startsWith("/assets/") &&
            !url.startsWith("/bundles/") &&
            !url.startsWith("/static/") &&
            !url.startsWith("/health") &&
            !url.startsWith("/auth/")
          );
        });

        if (nonInternalRoutes.length > 0) {
          // Log the routes found for debugging
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Find the first available blueprint route to redirect to
   * @param {FastifyInstance} app - The Fastify instance
   * @return {Promise<string|null>} - The first blueprint route, or null if none found
   * @private
   */
  private async findFirstBlueprintRoute(
    app: FastifyInstance
  ): Promise<string | null> {
    try {
      // First try to find routes from the manifest
      const assembly = app as unknown as Assembly;

      if (
        assembly.manifest?.components &&
        Array.isArray(assembly.manifest.components)
      ) {
        // Look through manifest components for blueprints
        for (const component of assembly.manifest.components) {
          for (const view of component.views || []) {
            // A blueprint is a component view with exposeAsBlueprint set to true
            if (view.exposeAsBlueprint) {
              return `/${component.path}/${view.viewName}/`;
            }
          }
        }
      }

      // Fall back to checking the file system structure
      const appStructure = await this.scanApplicationStructure();

      // Check for blueprints that have views
      if (appStructure.blueprints.length > 0) {
        for (const blueprint of appStructure.blueprints) {
          if (blueprint.views && blueprint.views.length > 0) {
            return `/${blueprint.name}/${blueprint.views[0].name}/`;
          }
        }
      }

      // As a last resort, check for component routes as they might be exposed as blueprints too
      if (appStructure.components.length > 0) {
        for (const component of appStructure.components) {
          if (component.views && component.views.length > 0) {
            return `/${component.name}/${component.views[0].name}/`;
          }
        }
      }

      // Check all registered routes to find something that looks like a blueprint
      if (app.routes) {
        const allRoutes: string[] = [];

        // Recursively extract route paths
        const extractRoutePaths = (routes: any) => {
          if (Array.isArray(routes)) {
            routes.forEach((route) => {
              if (route.url || route.path) {
                allRoutes.push(route.url || route.path);
              }
            });
          } else if (routes && typeof routes === "object") {
            Object.values(routes).forEach((value) => {
              extractRoutePaths(value);
            });
          }
        };

        extractRoutePaths(app.routes);

        // Filter for routes that look like blueprints (typically /componentPath/viewName/)
        // Skip internal and system routes
        const blueprintRoutes = allRoutes.filter((route) => {
          return (
            typeof route === "string" &&
            route !== "/" &&
            !route.startsWith("/__asmbl__") &&
            !route.startsWith("/assets/") &&
            !route.startsWith("/bundles/") &&
            !route.startsWith("/static/") &&
            !route.startsWith("/health") &&
            !route.startsWith("/auth/") &&
            route.match(/^\/[\w-]+\/[\w-]+\/?$/)
          );
        });

        if (blueprintRoutes.length > 0) {
          // Sort to get consistent results and pick the first one
          blueprintRoutes.sort();
          // Ensure the route ends with a slash for consistency
          return blueprintRoutes[0].endsWith("/")
            ? blueprintRoutes[0]
            : blueprintRoutes[0] + "/";
        }
      }

      // No suitable route found
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Load the designer UI files from disk and cache them
   * @private
   * @return {Object|null} The designer UI files (with html, css, js properties) or null if they cannot be loaded
   */
  private loadDesignerContent(): {
    html: string;
    css: string;
    js: string;
  } | null {
    // If we already have the designer content cached, return it
    if (cachedDesignerContent) {
      return cachedDesignerContent;
    }

    // Try multiple possible paths for the designer files
    const possibleDesignerPaths = [
      // Path when running in development
      path.join(__dirname, "../../developer/designer"),
      // Path when running from node_modules (lib structure)
      path.join(__dirname, "../../../developer/designer"),
      // Path when running from node_modules but from different directory structure
      path.join(__dirname, "../../../../src/developer/designer"),
      // Additional paths to try from node_modules
      path.join(process.cwd(), "node_modules/asmbl/lib/developer/designer"),
      path.join(
        process.cwd(),
        "storefront/node_modules/asmbl/lib/developer/designer"
      ),
      path.join(process.cwd(), "../node_modules/asmbl/lib/developer/designer"),
    ];

    // Try each path until we find one that exists
    for (const designerDir of possibleDesignerPaths) {
      try {
        const htmlPath = path.join(designerDir, "designer.html");
        const cssPath = path.join(designerDir, "designer.css");
        const jsPath = path.join(designerDir, "designer.js");

        if (
          fs.existsSync(htmlPath) &&
          fs.existsSync(cssPath) &&
          fs.existsSync(jsPath)
        ) {
          const html = fs.readFileSync(htmlPath, "utf8");
          const css = fs.readFileSync(cssPath, "utf8");
          const js = fs.readFileSync(jsPath, "utf8");

          // Cache the content
          cachedDesignerContent = { html, css, js };
          return cachedDesignerContent;
        }
      } catch (err) {
        // Continue to the next path
      }
    }

    console.error(
      "Designer files not found. Tried paths:",
      possibleDesignerPaths
    );
    return null;
  }

  /**
   * Register the designer UI route
   * @param {FastifyInstance} app - The Fastify instance
   * @private
   */
  private registerDesignerRoutes(app: FastifyInstance): void {
    // Attempt to load and cache the designer content at registration time
    this.loadDesignerContent();

    // Serve the designer UI at the main designer path
    app.get(ASSEMBLEJS.designerPath, async (request, reply) => {
      try {
        // Get the cached designer content (will load and cache if needed)
        const content = this.loadDesignerContent();

        if (!content) {
          return reply.code(404).send({ error: "Designer files not found" });
        }

        // Inject CSS and JS into HTML
        const fullHtml = content.html
          .replace("</head>", `<style>${content.css}</style></head>`)
          .replace("</body>", `<script>${content.js}</script></body>`);

        return reply
          .code(200)
          .header("Content-Type", "text/html")
          .send(fullHtml);
      } catch (error) {
        return reply.code(500).send({ error: "Failed to load designer" });
      }
    });
  }

  /**
   * Register routes to serve designer assets
   * @param {FastifyInstance} app - The Fastify instance
   * @private
   */
  private registerDesignerAssets(app: FastifyInstance): void {
    // Serve designer assets from the main assets directory
    app.get(
      `${ASSEMBLEJS.developerToolsPath}/assets/*`,
      async (request, reply) => {
        try {
          const assetPath = (request.params as { "*": string })["*"];

          // Look for the asset in the main assets directory
          const fullPath = path.join(
            ASSEMBLEJS.root,
            "src",
            "assets",
            assetPath
          );

          // Check if file exists
          if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
            return reply.code(404).send({ error: "Asset not found" });
          }

          // Determine content type based on file extension
          const ext = path.extname(fullPath).toLowerCase();
          let contentType = "application/octet-stream";

          switch (ext) {
            case ".js":
              contentType = "application/javascript";
              break;
            case ".css":
              contentType = "text/css";
              break;
            case ".html":
              contentType = "text/html";
              break;
            case ".json":
              contentType = "application/json";
              break;
            case ".png":
              contentType = "image/png";
              break;
            case ".jpg":
            case ".jpeg":
              contentType = "image/jpeg";
              break;
            case ".svg":
              contentType = "image/svg+xml";
              break;
          }

          // Read and return the file
          const fileContent = fs.readFileSync(fullPath);

          return reply
            .code(200)
            .header("Content-Type", contentType)
            .send(fileContent);
        } catch (error) {
          return reply.code(500).send({ error: "Failed to serve asset" });
        }
      }
    );
  }

  /**
   * Register API routes for the designer
   * @param {FastifyInstance} app - The Fastify instance
   * @private
   */
  private registerDesignerApi(app: FastifyInstance): void {
    // API route to get application structure - blueprints and components
    app.get(
      `${ASSEMBLEJS.designerPath}/api/structure`,
      async (request, reply) => {
        try {
          const appStructure = await this.scanApplicationStructure();
          return reply.send(appStructure);
        } catch (error) {
          return reply
            .code(500)
            .send({ error: "Failed to get application structure" });
        }
      }
    );

    // API route to list directories and files
    app.get(`${ASSEMBLEJS.designerPath}/api/files`, async (request, reply) => {
      try {
        const { dir = "" } = request.query as { dir?: string };

        // Validate and sanitize path to prevent directory traversal
        const targetPath = path.resolve(ASSEMBLEJS.root, dir);

        // Ensure the requested path is within the project root
        if (!targetPath.startsWith(ASSEMBLEJS.root)) {
          return reply
            .code(403)
            .send({ error: "Access denied: Path outside project directory" });
        }

        // Read directory contents
        const dirContents = fs.readdirSync(targetPath, { withFileTypes: true });

        // Format the response
        const files = dirContents.map((item) => ({
          name: item.name,
          isDirectory: item.isDirectory(),
          path: path.relative(
            ASSEMBLEJS.root,
            path.join(targetPath, item.name)
          ),
          ext: item.isFile() ? path.extname(item.name) : null,
        }));

        return reply.send({
          currentDir: path.relative(ASSEMBLEJS.root, targetPath) || ".",
          parentDir:
            path.relative(ASSEMBLEJS.root, path.dirname(targetPath)) || null,
          files,
        });
      } catch (error) {
        return reply.code(500).send({ error: "Failed to list files" });
      }
    });

    // API route to read a file
    app.get(`${ASSEMBLEJS.designerPath}/api/file`, async (request, reply) => {
      try {
        const { filepath } = request.query as { filepath: string };

        if (!filepath) {
          return reply.code(400).send({ error: "File path is required" });
        }

        // Validate and sanitize path
        const targetPath = path.resolve(ASSEMBLEJS.root, filepath);

        // Ensure the requested path is within the project root
        if (!targetPath.startsWith(ASSEMBLEJS.root)) {
          return reply
            .code(403)
            .send({ error: "Access denied: Path outside project directory" });
        }

        // Check if file exists
        if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
          return reply.code(404).send({ error: "File not found" });
        }

        // Read file content
        const content = fs.readFileSync(targetPath, "utf8");

        return reply.send({
          path: filepath,
          content,
          ext: path.extname(targetPath),
        });
      } catch (error) {
        return reply.code(500).send({ error: "Failed to read file" });
      }
    });

    // API route to write a file
    app.post(`${ASSEMBLEJS.designerPath}/api/file`, async (request, reply) => {
      try {
        const { filepath, content } = request.body as {
          filepath: string;
          content: string;
        };

        if (!filepath) {
          return reply.code(400).send({ error: "File path is required" });
        }

        // Validate and sanitize path
        const targetPath = path.resolve(ASSEMBLEJS.root, filepath);

        // Ensure the requested path is within the project root
        if (!targetPath.startsWith(ASSEMBLEJS.root)) {
          return reply
            .code(403)
            .send({ error: "Access denied: Path outside project directory" });
        }

        // Ensure directory exists
        const dirPath = path.dirname(targetPath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        // Write file content
        fs.writeFileSync(targetPath, content);

        return reply.send({ success: true, path: filepath });
      } catch (error) {
        return reply.code(500).send({ error: "Failed to write file" });
      }
    });

    // API route to get component details
    app.get(
      `${ASSEMBLEJS.designerPath}/api/component/:component/:view`,
      async (request, reply) => {
        try {
          const { component, view } = request.params as {
            component: string;
            view: string;
          };

          // Validate component and view
          if (!component || !view) {
            return reply
              .code(400)
              .send({ error: "Component and view names are required" });
          }

          // Find component files
          const componentDir = path.join(
            ASSEMBLEJS.root,
            "src",
            "components",
            component,
            view
          );

          if (
            !fs.existsSync(componentDir) ||
            !fs.statSync(componentDir).isDirectory()
          ) {
            return reply.code(404).send({ error: "Component not found" });
          }

          // Read component files
          const files = fs.readdirSync(componentDir);
          const componentFiles: Record<string, string> = {};

          files.forEach((file) => {
            const filePath = path.join(componentDir, file);
            if (fs.statSync(filePath).isFile()) {
              componentFiles[file] = fs.readFileSync(filePath, "utf8");
            }
          });

          return reply.send({
            component,
            view,
            files: componentFiles,
          });
        } catch (error) {
          return reply
            .code(500)
            .send({ error: "Failed to get component details" });
        }
      }
    );

    // API route to get blueprint details
    app.get(
      `${ASSEMBLEJS.designerPath}/api/blueprint/:blueprint/:view`,
      async (request, reply) => {
        try {
          const { blueprint, view } = request.params as {
            blueprint: string;
            view: string;
          };

          // Validate blueprint and view
          if (!blueprint || !view) {
            return reply
              .code(400)
              .send({ error: "Blueprint and view names are required" });
          }

          // Find blueprint files
          const blueprintDir = path.join(
            ASSEMBLEJS.root,
            "src",
            "blueprints",
            blueprint,
            view
          );

          if (
            !fs.existsSync(blueprintDir) ||
            !fs.statSync(blueprintDir).isDirectory()
          ) {
            return reply.code(404).send({ error: "Blueprint not found" });
          }

          // Read blueprint files
          const files = fs.readdirSync(blueprintDir);
          const blueprintFiles: Record<string, string> = {};

          files.forEach((file) => {
            const filePath = path.join(blueprintDir, file);
            if (fs.statSync(filePath).isFile()) {
              blueprintFiles[file] = fs.readFileSync(filePath, "utf8");
            }
          });

          return reply.send({
            blueprint,
            view,
            files: blueprintFiles,
          });
        } catch (error) {
          return reply
            .code(500)
            .send({ error: "Failed to get blueprint details" });
        }
      }
    );
  }

  /**
   * Scan the application to build a structure of blueprints and components
   * @return {Promise<object>} - The application structure
   * @private
   */
  private async scanApplicationStructure() {
    const srcDir = path.join(ASSEMBLEJS.root, "src");

    // Structure object to return
    const structure = {
      blueprints: [] as any[],
      components: [] as any[],
      controllers: [] as any[],
      factories: [] as any[],
    };

    // Helper function to scan directory structure
    const scanDir = async (baseDir: string, type: string) => {
      try {
        if (!fs.existsSync(baseDir)) {
          return [];
        }

        const items = fs
          .readdirSync(baseDir, { withFileTypes: true })
          .filter((item) => item.isDirectory())
          .map((item) => item.name);

        const result = [];

        for (const itemName of items) {
          const itemDir = path.join(baseDir, itemName);
          // Get sub-views/variations
          const views = fs
            .readdirSync(itemDir, { withFileTypes: true })
            .filter((view) => view.isDirectory())
            .map((view) => {
              const viewDir = path.join(itemDir, view.name);
              const files = fs
                .readdirSync(viewDir)
                .filter((file) =>
                  fs.statSync(path.join(viewDir, file)).isFile()
                )
                .map((file) => ({
                  name: file,
                  path: path.join(type, itemName, view.name, file),
                }));

              return {
                name: view.name,
                path: path.join(type, itemName, view.name),
                files,
              };
            });

          result.push({
            name: itemName,
            path: path.join(type, itemName),
            views,
          });
        }

        return result;
      } catch (error) {
        return [];
      }
    };

    // Scan blueprints
    structure.blueprints = await scanDir(
      path.join(srcDir, "blueprints"),
      "blueprints"
    );

    // Scan components
    structure.components = await scanDir(
      path.join(srcDir, "components"),
      "components"
    );

    // Scan controllers (flat list)
    try {
      const controllersDir = path.join(srcDir, "controllers");
      if (fs.existsSync(controllersDir)) {
        structure.controllers = fs
          .readdirSync(controllersDir)
          .filter(
            (file) =>
              file.endsWith(".controller.ts") || file.endsWith(".controller.js")
          )
          .map((file) => ({
            name: file.replace(/\.(controller\.ts|controller\.js)$/, ""),
            path: path.join("controllers", file),
          }));
      }
    } catch (error) {}

    // Scan factories (flat list)
    try {
      const factoriesDir = path.join(srcDir, "factories");
      if (fs.existsSync(factoriesDir)) {
        structure.factories = fs
          .readdirSync(factoriesDir)
          .filter(
            (file) =>
              file.endsWith(".factory.ts") || file.endsWith(".factory.js")
          )
          .map((file) => ({
            name: file.replace(/\.(factory\.ts|factory\.js)$/, ""),
            path: path.join("factories", file),
          }));
      }
    } catch (error) {}

    return structure;
  }
}
