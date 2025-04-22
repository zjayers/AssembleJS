#!/usr/bin/env node
/**
 * AssembleJS Designer Development Server
 * This script allows developing the designer UI by running a standalone server
 * that connects to an existing AssembleJS project directory.
 */
import Fastify from "fastify";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 9000;

// Create a simple logging utility for initialization
const log = {
  error: (msg) => console.error(msg),
  info: (msg) => console.log(msg),
};

// Target project directory (default to multi-ui-language-example)
const targetProjectDir =
  process.argv[2] ||
  path.join(__dirname, "../../examples/multi-ui-language-example");
const designerDir = __dirname;

// Handle help flag early
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  log.info(`
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   AssembleJS Designer Development Server                                   ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║   Usage: node designer-dev-server.js [project-directory] [options]         ║
║                                                                            ║
║   Options:                                                                 ║
║     --help, -h         Show this help message                              ║
║                                                                            ║
║   Environment Variables:                                                   ║
║     PORT               Port to run the server on (default: 9000)           ║
║                                                                            ║
║   Examples:                                                                ║
║     npm run designer                                                       ║
║     npm run designer:watch                                                 ║
║     npm run designer -- /path/to/your/project                              ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
  `);
  process.exit(0);
}

// Make sure the target exists
if (!fs.existsSync(targetProjectDir)) {
  log.error(`Error: Target project directory not found: ${targetProjectDir}`);
  log.error(
    "Please make sure the directory exists or specify a different directory as an argument."
  );
  process.exit(1);
}

// Create Fastify app with logging
const app = Fastify({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
});

// Setup middleware
app.register(import("@fastify/static"), {
  root: path.join(designerDir, "assets"),
  prefix: "/assets/",
});

// Register JSON parsing
app.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  (req, body, done) => {
    try {
      const json = JSON.parse(body);
      done(null, json);
    } catch (err) {
      done(err, undefined);
    }
  }
);

// Serve designer files
app.get("/", async (request, reply) => {
  try {
    const htmlContent = fs.readFileSync(
      path.join(designerDir, "designer", "designer.html"),
      "utf8"
    );
    const cssContent = fs.readFileSync(
      path.join(designerDir, "designer", "designer.css"),
      "utf8"
    );
    const jsContent = fs.readFileSync(
      path.join(designerDir, "designer", "designer.js"),
      "utf8"
    );

    // Inject CSS and JS into HTML
    const fullHtml = htmlContent
      .replace("</head>", `<style>${cssContent}</style></head>`)
      .replace("</body>", `<script>${jsContent}</script></body>`);

    reply.code(200).header("Content-Type", "text/html").send(fullHtml);
  } catch (error) {
    app.log.error("Error serving designer:", error);
    reply.code(500).send("Failed to load designer");
  }
});

// API endpoint to get application structure
app.get("/api/structure", async (request, reply) => {
  try {
    const structure = await scanProjectStructure(targetProjectDir);
    return reply.send(structure);
  } catch (error) {
    app.log.error("Error getting structure:", error);
    return reply
      .code(500)
      .send({ error: "Failed to get application structure" });
  }
});

// API endpoint to list directories and files
app.get("/api/files", (request, reply) => {
  try {
    const requestedDir = request.query.dir || "";
    const targetPath = path.resolve(targetProjectDir, requestedDir);

    // Security check - ensure path is within project
    if (!targetPath.startsWith(targetProjectDir)) {
      return reply
        .code(403)
        .send({ error: "Access denied: Path outside project directory" });
    }

    // Read directory contents
    const dirContents = fs.readdirSync(targetPath, { withFileTypes: true });

    // Format response
    const files = dirContents.map((item) => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      path: path.relative(targetProjectDir, path.join(targetPath, item.name)),
      ext: item.isFile() ? path.extname(item.name) : null,
    }));

    return reply.send({
      currentDir: path.relative(targetProjectDir, targetPath) || ".",
      parentDir:
        path.relative(targetProjectDir, path.dirname(targetPath)) || null,
      files,
    });
  } catch (error) {
    app.log.error("Error listing files:", error);
    return reply.code(500).send({ error: "Failed to list files" });
  }
});

// API endpoint to read a file
app.get("/api/file", (request, reply) => {
  try {
    const filepath = request.query.filepath;

    if (!filepath) {
      return reply.code(400).send({ error: "File path is required" });
    }

    // Security check
    const targetPath = path.resolve(targetProjectDir, filepath);
    if (!targetPath.startsWith(targetProjectDir)) {
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
    app.log.error("Error reading file:", error);
    return reply.code(500).send({ error: "Failed to read file" });
  }
});

// API endpoint to write a file
app.post("/api/file", (request, reply) => {
  try {
    const { filepath, content } = request.body;

    if (!filepath) {
      return reply.code(400).send({ error: "File path is required" });
    }

    // Security check
    const targetPath = path.resolve(targetProjectDir, filepath);
    if (!targetPath.startsWith(targetProjectDir)) {
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
    app.log.error("Error writing file:", error);
    return reply.code(500).send({ error: "Failed to write file" });
  }
});

// API endpoint to get component details
app.get("/api/component/:component/:view", (request, reply) => {
  try {
    const { component, view } = request.params;

    // Validate component and view
    if (!component || !view) {
      return reply
        .code(400)
        .send({ error: "Component and view names are required" });
    }

    // Find component files
    const componentDir = path.join(
      targetProjectDir,
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
    const componentFiles = {};

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
    app.log.error("Error getting component details:", error);
    return reply.code(500).send({ error: "Failed to get component details" });
  }
});

// API endpoint to get blueprint details
app.get("/api/blueprint/:blueprint/:view", (request, reply) => {
  try {
    const { blueprint, view } = request.params;

    // Validate blueprint and view
    if (!blueprint || !view) {
      return reply
        .code(400)
        .send({ error: "Blueprint and view names are required" });
    }

    // Find blueprint files
    const blueprintDir = path.join(
      targetProjectDir,
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
    const blueprintFiles = {};

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
    app.log.error("Error getting blueprint details:", error);
    return reply.code(500).send({ error: "Failed to get blueprint details" });
  }
});

/**
 * Scan project to build a structure of blueprints and components
 * @param {string} projectDir - The project directory
 * @returns {Promise<object>} - The application structure
 */
async function scanProjectStructure(projectDir) {
  const srcDir = path.join(projectDir, "src");

  // Structure object to return
  const structure = {
    blueprints: [],
    components: [],
    controllers: [],
    factories: [],
  };

  // Helper function to scan directory structure
  const scanDir = async (baseDir, type) => {
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
              .filter((file) => fs.statSync(path.join(viewDir, file)).isFile())
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
      app.log.error(`Error scanning ${type} directory:`, error);
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
  } catch (error) {
    app.log.error("Error scanning controllers:", error);
  }

  // Scan factories (flat list)
  try {
    const factoriesDir = path.join(srcDir, "factories");
    if (fs.existsSync(factoriesDir)) {
      structure.factories = fs
        .readdirSync(factoriesDir)
        .filter(
          (file) => file.endsWith(".factory.ts") || file.endsWith(".factory.js")
        )
        .map((file) => ({
          name: file.replace(/\.(factory\.ts|factory\.js)$/, ""),
          path: path.join("factories", file),
        }));
    }
  } catch (error) {
    app.log.error("Error scanning factories:", error);
  }

  return structure;
}

// Help flag is handled at the top of the file

// Start the server
const start = async () => {
  try {
    await app.listen({ port, host: "0.0.0.0" });

    app.log.info(`
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   AssembleJS Designer Development Server                                   ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║   Server running at: http://localhost:${port}                              ║
║                                                                            ║
║   Target project: ${targetProjectDir}                                      ║
║                                                                            ║
║   Access the visual designer in your browser at:                           ║
║   http://localhost:${port}                                                 ║
║                                                                            ║
║   Run with --help for more options                                         ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    // Open browser automatically
    try {
      if (process.platform === "darwin") {
        await execAsync(`open http://localhost:${port}`);
      } else if (process.platform === "win32") {
        await execAsync(`start http://localhost:${port}`);
      } else {
        await execAsync(`xdg-open http://localhost:${port}`);
      }
    } catch (err) {
      app.log.warn("Could not open browser automatically.");
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
