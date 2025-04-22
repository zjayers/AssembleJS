import type { Assembly } from "../../types/blueprint.simple.types";
import type { BlueprintServerOptions } from "../../types/blueprint.server.options";
import type { ComponentView } from "../../types/component.view";
import type { Component } from "../../types/component";
import { ComponentController } from "../abstract/component.controller";

/**
 * Hydration Controller - exposed for each component/blueprint.
 * @description This controller appends a ?DATA_ONLY attribute to the request and hits the content route.
 * This allows the same factory code to run without duplication.
 * @author Zach Ayers
 */
export class HydrationController extends ComponentController {
  /** @inheritDoc */
  public register(
    app: Assembly,
    userOpts: BlueprintServerOptions,
    component: Component,
    view: ComponentView
  ): void {
    app.get(
      `/${component.path}/${view.viewName}/data/`,
      async (request, reply) => {
        const result = await app
          .inject()
          .get(`/${component.path}/${view.viewName}/?DATA_ONLY=true`);
        return reply.send(result.payload);
      }
    );
  }
}
