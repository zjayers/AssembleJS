import type {
  BlueprintDevServer,
  BlueprintServerOptions,
} from "../../types/blueprint.server.options";
import type { FastifyInstance } from "fastify";
import type { Assembly } from "../../types/blueprint.simple.types";
import { ASSEMBLEJS } from "../config/blueprint.config";
import path from "path";
import fastifyStatic from "@fastify/static";
import { CONSTANTS } from "../../constants/blueprint.constants";
import { ManifestController } from "../controllers/manifest.controller";
import { ContentController } from "../controllers/content.controller";
import { HealthController } from "../controllers/health.controller";
import { HydrationController } from "../controllers/hydration.controller";
import { DeveloperController } from "../controllers/developer.controller";
import { assertFileExists } from "../../utils/file.utils";
import fs from "fs";

/**
 * Build all server controllers on the server side at startup and prep any cacheables.
 * @param {FastifyInstance} app - The fastify app to use.
 * @param {BlueprintServerOptions} userOpts - The user options to use.
 * @param {BlueprintDevServer} devServer - The dev server to use.
 * @author Zach Ayers
 */
export function buildBlueprintControllers(
  app: FastifyInstance,
  userOpts: BlueprintServerOptions,
  devServer: BlueprintDevServer
): void {
  // Setup Asset directories
  userOpts.manifest.assetDirectoryRoots?.forEach((assetRoot) => {
    const staticPath: string = path.join(ASSEMBLEJS.root, assetRoot.path);

    app.log.debug(`Registering static assets at: ${staticPath}`);
    app.register(fastifyStatic, {
      ...assetRoot.opts,
      root: staticPath,
      decorateReply: false,
    });
  });

  // Build Routes for Component Content
  userOpts.manifest.components?.forEach((component) => {
    component.views.forEach((view) => {
      const getPath = (rootFallback: string) =>
        path.join(
          ASSEMBLEJS.isLocal()
            ? ASSEMBLEJS.root.replace(/src/g, CONSTANTS.buildOutputFolder)
            : ASSEMBLEJS.root,
          component.root ?? rootFallback,
          component.path,
          view.viewName
        );

      const blueprintPath = getPath("blueprints");
      const componentPath = getPath("components");

      let verifyPath: string;
      let staticPath: string | null = null;

      if (fs.existsSync(blueprintPath)) {
        staticPath = blueprintPath;
        verifyPath = blueprintPath;
      } else {
        if (fs.existsSync(componentPath)) {
          staticPath = componentPath;
          verifyPath = componentPath;
        } else {
          verifyPath = view.exposeAsBlueprint ? blueprintPath : componentPath;
        }
      }

      assertFileExists(verifyPath, verifyPath);

      // Static Paths
      if (staticPath !== null && fs.existsSync(staticPath)) {
        app.log.debug("Registering static path: " + staticPath);
        app.register(fastifyStatic, {
          root: staticPath,
          prefix: `/${component.path}/${view.viewName}/`,
          decorateReply: false,
        });
      } else {
        app.log.debug("No static path found for: " + staticPath);
      }

      // Register Controllers
      new HydrationController().register(
        app as Assembly,
        userOpts,
        component,
        view
      );
      new HealthController().register(
        app as Assembly,
        userOpts,
        component,
        view
      );
      new ManifestController().register(
        app as Assembly,
        userOpts,
        component,
        view
      );
      new ContentController().register(
        app as Assembly,
        userOpts,
        component,
        view,
        devServer
      );
    });
  });

  // Infer BlueprintController Loads
  const controllers = userOpts.manifest.controllers ?? [];
  const registeredControllers: string[] = [];

  // Register all controllers from the manifest
  controllers.forEach((C) => {
    const controller = new C();
    controller.register(app as Assembly);
    registeredControllers.push(controller.constructor.name);
  });

  // Attach the manifest to the app instance for easy access by controllers
  (app as Assembly).manifest = userOpts.manifest;

  // Register developer tools controller in development mode
  if (ASSEMBLEJS.isLocal()) {
    const developerController = new DeveloperController();
    developerController.register(app as Assembly);
    registeredControllers.push(developerController.constructor.name);

    app.log.debug(
      `Controllers: ${JSON.stringify(registeredControllers.sort(), null, 2)}`
    );
  }
}
