import type { ComponentContext } from "../../types/component.context";
import type { ComponentParams } from "../../types/component.params";
import type { ComponentRenderer } from "../../types/component.renderer";
import type {
  NodeAsset,
  ComponentPublicData,
  VNodeFn,
} from "../../types/component.simple.types";
import { h } from "preact";
import render from "preact-render-to-string";
import { convertExtsToDistPointer } from "../../utils/html.utils";
import { Loggable } from "../abstract/loggable";

/**
 * Preact Renderer for server-side rendering of Preact components
 */
export class PreactRenderer extends Loggable implements ComponentRenderer {
  public vendorAssets: Array<NodeAsset> = [];

  /** @inheritDoc */
  public render(
    context: ComponentContext<ComponentPublicData, ComponentParams>
  ): string | Promise<string> | Buffer | Promise<Buffer> {
    // Convert component buffers to strings for Preact props
    const stringComponents: Record<string, string> = {};
    Object.entries(context.components).forEach(([key, value]) => {
      if (Buffer.isBuffer(value)) {
        stringComponents[key] = value.toString();
      }
    });

    try {
      // Ensure template is a function before calling it with h()
      if (typeof context.template !== "function") {
        console.error("Template is not a function:", typeof context.template);
        return "<div>Error: Invalid template type</div>";
      }

      const component = h(context.template as VNodeFn<any>, {
        ...context,
        ...stringComponents, // Add component strings directly as props
        components: stringComponents, // Replace buffer components with string components
      });

      const html = render(component);
      if (!html) {
        console.error("Preact render returned empty result");
        return "<div>Error: Empty render result</div>";
      }

      return convertExtsToDistPointer(html);
    } catch (err) {
      const error = err as Error;
      console.error("Error rendering Preact component:", error);
      return `<div>Error rendering component: ${
        error?.message || "Unknown error"
      }</div>`;
    }
  }
}

export const PREACT = new PreactRenderer();
