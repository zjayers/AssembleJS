import type {
  NodeAsset,
  ComponentPublicData,
} from "../../types/component.simple.types";
import type { ComponentRenderer } from "../../types/component.renderer";
import type { ComponentContext } from "../../types/component.context";
import type { ComponentParams } from "../../types/component.params";
import ejs from "ejs";
import { Loggable } from "../abstract/loggable";

/**
 * EJS Renderer
 * @author Zach Ayers
 */
export class EjsRenderer extends Loggable implements ComponentRenderer {
  public vendorAssets: Array<NodeAsset> = [];

  /** @inheritDoc */
  public render(
    context: ComponentContext<ComponentPublicData, ComponentParams>
  ): string | Promise<string> | Buffer | Promise<Buffer> {
    // Convert component buffers to strings
    const stringComponents: Record<string, string> = {};
    Object.entries(context.components).forEach(([key, value]) => {
      if (Buffer.isBuffer(value)) {
        stringComponents[key] = value.toString();
      }
    });

    return ejs.render(
      context.template as string,
      {
        ...stringComponents, // Spread component strings directly in root for <%- testChild %> syntax
        context: {
          // Keep full context in 'context' for <%= context.title %> syntax
          ...context,
          components: stringComponents, // Replace buffer components with string components
        },
      },
      {
        localsName: "context",
      }
    );
  }
}

export const EJS = new EjsRenderer();
