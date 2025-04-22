import type { Assembly } from "../../types/blueprint.simple.types";
import type { BlueprintServerOptions } from "../../types/blueprint.server.options";
import type { ComponentView } from "../../types/component.view";
import type { Component } from "../../types/component";
import { ComponentController } from "../abstract/component.controller";
import { omit } from "../../utils/object.utils";

/**
 * JSON manifest of a Component. This is the primary way to access the manifest.
 * @todo: finalize the manifest interface.
 * @author: Zach Ayers
 */
export class ManifestController extends ComponentController {
  /** @inheritDoc */
  public register(
    app: Assembly,
    userOpts: BlueprintServerOptions,
    component: Component,
    view: ComponentView
  ): void {
    app.get(
      `/${component.path}/${view.viewName}/manifest/`,
      (request, reply) => {
        const dto = omit<ComponentView>(
          view,
          "factories",
          "template",
          "developmentOptions"
        );
        return reply.type("application/json").send(dto);
      }
    );
  }
}
