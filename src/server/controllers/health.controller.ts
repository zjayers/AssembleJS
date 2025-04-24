import type { Component } from "../../types/component";
import type { Assembly } from "../../types/blueprint.simple.types";
import type { BlueprintServerOptions } from "../../types/blueprint.server.options";
import type { ComponentView } from "../../types/component.view";
import { ComponentController } from "../abstract/component.controller";

/**
 * Health Status Controller - exposed for each component/blueprint.
 * @description Provides health status endpoints for monitoring component/blueprint availability
 * @author Zachariah Ayers
 * @category Server
 * @public
 */
export class HealthController extends ComponentController {
  /** @inheritDoc */
  public register(
    app: Assembly,
    userOpts: BlueprintServerOptions,
    component: Component,
    view: ComponentView
  ): void {
    app.get(
      `/${component.path}/${view.viewName}/health-status/`,
      (request, reply) => {
        return reply.send({ status: "ok" });
      }
    );
  }
}
