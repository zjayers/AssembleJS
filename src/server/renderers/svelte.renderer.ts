import type { ComponentContext } from "../../types/component.context";
import type { ComponentParams } from "../../types/component.params";
import type { ComponentRenderer } from "../../types/component.renderer";
import type {
  NodeAsset,
  ComponentPublicData,
} from "../../types/component.simple.types";
import { convertExtsToDistPointer } from "../../utils/html.utils";
import { Loggable } from "../abstract/loggable";

/**
 * Svelte Renderer for server-side rendering of Svelte components
 */
export class SvelteRenderer extends Loggable implements ComponentRenderer {
  public vendorAssets: Array<NodeAsset> = [];

  /** @inheritDoc */
  public render(
    context: ComponentContext<ComponentPublicData, ComponentParams>
  ): string | Promise<string> | Buffer | Promise<Buffer> {
    // Convert component buffers to strings for Svelte props
    const stringComponents: Record<string, string> = {};
    Object.entries(context.components).forEach(([key, value]) => {
      if (Buffer.isBuffer(value)) {
        stringComponents[key] = value.toString();
      }
    });

    try {
      // Ensure template is a valid Svelte component
      // Svelte components are compiled to an object with render method
      if (
        typeof context.template !== "object" ||
        typeof (context.template as any).render !== "function"
      ) {
        console.error(
          "Template is not a valid Svelte component:",
          typeof context.template
        );
        return "<div>Error: Invalid template type</div>";
      }

      // For SSR, Svelte components have a render method that returns { html, css, head }
      const rendered = (context.template as any).render({
        ...context,
        ...stringComponents, // Add component strings directly as props
        components: stringComponents, // Replace buffer components with string components
      });

      if (!rendered.html) {
        console.error("Svelte render returned empty result");
        return "<div>Error: Empty render result</div>";
      }

      // Combine the rendered HTML with any styles
      let html = rendered.html;

      // If there's CSS from the component, add it inline
      if (rendered.css && rendered.css.code) {
        html = `<style>${rendered.css.code}</style>${html}`;
      }

      // Add any head elements
      if (rendered.head) {
        html = `${rendered.head}${html}`;
      }

      return convertExtsToDistPointer(html);
    } catch (err) {
      const error = err as Error;
      console.error("Error rendering Svelte component:", error);
      return `<div>Error rendering component: ${
        error?.message || "Unknown error"
      }</div>`;
    }
  }
}

export const SVELTE = new SvelteRenderer();
