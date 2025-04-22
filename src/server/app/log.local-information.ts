import type { BlueprintServerOptions } from "../../types/blueprint.server.options";
import type { FastifyInstance } from "fastify";
import { ASSEMBLEJS } from "../config/blueprint.config";

/**
 * Log local information when ASSEMBLEJS is running locally.
 * @param {FastifyInstance} app
 * @param {BlueprintServerOptions} userOpts
 * @param {string} baseAddress
 */
export function logLocalInformation(
  app: FastifyInstance,
  userOpts: BlueprintServerOptions,
  baseAddress: string
): void {
  // If Local - print some more in depth information
  if (ASSEMBLEJS.isLocal()) {
    const routes: string[] = [];
    app.routes.forEach((val, key) => {
      routes.push(key);
    });
    app.log.debug(`Routes: ${JSON.stringify(routes.sort(), null, 2)}`);

    app.log.debug(
      `Components: ${JSON.stringify(
        userOpts.manifest.components?.flatMap((component) =>
          component.views
            .map(
              (view) =>
                `${
                  view.exposeAsBlueprint ? "BLUEPRINT:  " : `COMPONENT: `
                }[ ${baseAddress}/${component.path}/${view.viewName}/ ]${
                  !view.exposeAsBlueprint && ASSEMBLEJS.isLocal()
                    ? " (!!! Default Authentication Removed While Running Locally !!!)"
                    : ""
                }`
            )
            .sort()
        ) ?? [],
        null,
        2
      )}`
    );
  }
}
