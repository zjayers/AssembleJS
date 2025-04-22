/**
 * AssembleJS Visual Designer
 * @description API routes for the AssembleJS visual designer
 * @author Zach Ayers
 */
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ASSEMBLEJS } from "../../server/config/blueprint.config";
import { promisify } from "util";

// Promisify exec for async/await usage
const execAsync = promisify(exec);

// File cache for efficiency
const fileCache = new Map<string, string>();

/**
 * Read a file from the designer directory
 * @param {string} filename - The name of the file to read
 * @return {string} - The file contents
 */
function readDesignerFile(filename: string): string {
  // Check cache first
  if (fileCache.has(filename)) {
    return fileCache.get(filename)!;
  }

  // Read from disk
  const filePath = path.join(__dirname, filename);
  const content = fs.readFileSync(filePath, "utf8");

  // Cache for future use (only in production)
  if (process.env.NODE_ENV !== "development") {
    fileCache.set(filename, content);
  }

  return content;
}

/**
 * Register the designer routes with the Fastify instance
 * @param {FastifyInstance} fastify - The Fastify instance
 */
export function registerDesignerRoutes(fastify: FastifyInstance) {
  // Only register in development mode
  if (!ASSEMBLEJS.isLocal()) {
    return;
  }

  // Serve the main designer UI
  fastify.get(
    ASSEMBLEJS.designerPath,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const html = readDesignerFile("designer.html");
        const css = readDesignerFile("designer.css");
        const js = readDesignerFile("designer.js");

        // Inject CSS and JS into HTML
        const fullHtml = html
          .replace("</head>", `<style>${css}</style></head>`)
          .replace("</body>", `<script>${js}</script></body>`);

        return reply
          .code(200)
          .header("Content-Type", "text/html")
          .send(fullHtml);
      } catch (error) {
        fastify.log.error("Error serving designer:", error);
        return reply.code(500).send({ error: "Failed to load designer" });
      }
    }
  );

  // API route to list directories and files
  fastify.get(
    `${ASSEMBLEJS.designerPath}/api/files`,
    async (
      request: FastifyRequest<{
        Querystring: { dir?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const requestedDir = request.query.dir || "";

        // Validate and sanitize path to prevent directory traversal
        const targetPath = path.resolve(ASSEMBLEJS.root, requestedDir);

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
        fastify.log.error("Error listing files:", error);
        return reply.code(500).send({ error: "Failed to list files" });
      }
    }
  );

  // API route to read a file
  fastify.get(
    `${ASSEMBLEJS.designerPath}/api/file`,
    async (
      request: FastifyRequest<{
        Querystring: { path: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const filePath = request.query.path;

        if (!filePath) {
          return reply.code(400).send({ error: "File path is required" });
        }

        // Validate and sanitize path
        const targetPath = path.resolve(ASSEMBLEJS.root, filePath);

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
          path: filePath,
          content,
          ext: path.extname(targetPath),
        });
      } catch (error) {
        fastify.log.error("Error reading file:", error);
        return reply.code(500).send({ error: "Failed to read file" });
      }
    }
  );

  // API route to write a file
  fastify.post(
    `${ASSEMBLEJS.designerPath}/api/file`,
    async (
      request: FastifyRequest<{
        Body: { path: string; content: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { path: filePath, content } = request.body as any;

        if (!filePath) {
          return reply.code(400).send({ error: "File path is required" });
        }

        // Validate and sanitize path
        const targetPath = path.resolve(ASSEMBLEJS.root, filePath);

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

        return reply.send({ success: true, path: filePath });
      } catch (error) {
        fastify.log.error("Error writing file:", error);
        return reply.code(500).send({ error: "Failed to write file" });
      }
    }
  );

  // API route to run CLI commands
  fastify.post(
    `${ASSEMBLEJS.designerPath}/api/cli`,
    async (
      request: FastifyRequest<{
        Body: { command: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { command } = request.body as any;

        if (!command) {
          return reply.code(400).send({ error: "Command is required" });
        }

        // Only allow whitelisted commands for security
        const allowedCommands = [
          "asm-", // AssembleJS CLI commands
          "npm run", // npm scripts
          "ls",
          "dir", // directory listing
          "git status", // git status
        ];

        const isCommandAllowed = allowedCommands.some((allowed) =>
          command.trim().startsWith(allowed)
        );

        if (!isCommandAllowed) {
          return reply.code(403).send({
            error: "Command not allowed for security reasons",
            allowedPrefixes: allowedCommands,
          });
        }

        // Execute command
        const { stdout, stderr } = await execAsync(command, {
          cwd: ASSEMBLEJS.root,
          timeout: 30000, // 30 second timeout
        });

        return reply.send({
          success: true,
          stdout,
          stderr: stderr || undefined,
        });
      } catch (error: any) {
        fastify.log.error("Error executing command:", error);
        return reply.code(500).send({
          error: "Command execution failed",
          details: error.message,
        });
      }
    }
  );

  // Log that the designer is available
  fastify.log.info(
    `AssembleJS Designer available at ${ASSEMBLEJS.designerPath}`
  );
}
