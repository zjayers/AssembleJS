import type { ComponentContext } from "../../types/component.context";
import type { ComponentParams } from "../../types/component.params";
import type { ComponentRenderer } from "../../types/component.renderer";
import type {
  NodeAsset,
  ComponentPublicData,
} from "../../types/component.simple.types";
// Import from local stubs for TypeScript compilation
import { createSSRApp } from "../../stubs/vue";
import { renderToString } from "../../stubs/vue-server-renderer";
import { convertExtsToDistPointer } from "../../utils/html.utils";
import { Loggable } from "../abstract/loggable";

/**
 * Vue Renderer for server-side rendering of Vue components
 */
export class VueRenderer extends Loggable implements ComponentRenderer {
  public vendorAssets: Array<NodeAsset> = [];

  /** @inheritDoc */
  public render(
    context: ComponentContext<ComponentPublicData, ComponentParams>
  ): string | Promise<string> | Buffer | Promise<Buffer> {
    // Convert component buffers to strings for Vue props
    const stringComponents: Record<string, string> = {};
    Object.entries(context.components).forEach(([key, value]) => {
      if (Buffer.isBuffer(value)) {
        stringComponents[key] = value.toString();
      }
    });

    try {
      // Ensure template is a valid Vue component
      if (
        typeof context.template !== "object" &&
        typeof context.template !== "function"
      ) {
        console.error(
          "Template is not a valid Vue component:",
          typeof context.template
        );
        return "<div>Error: Invalid template type</div>";
      }

      // Create Vue SSR app with context as props
      // Vue 3 API: create SSR app without props
      const app = createSSRApp(context.template as any);

      // Return the render promise
      return renderToString(app)
        .then((html: string) => {
          if (!html) {
            console.error("Vue render returned empty result");
            return "<div>Error: Empty render result</div>";
          }

          return convertExtsToDistPointer(html);
        })
        .catch((err: any) => {
          console.error("Error rendering Vue component:", err);
          return `<div>Error rendering component: ${
            err?.message || "Unknown error"
          }</div>`;
        });
    } catch (err) {
      const error = err as Error;
      console.error("Error setting up Vue renderer:", error);
      return `<div>Error rendering component: ${
        error?.message || "Unknown error"
      }</div>`;
    }
  }
}

export const VUE = new VueRenderer();
