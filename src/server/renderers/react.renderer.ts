import type { ComponentContext } from "../../types/component.context";
import type { ComponentParams } from "../../types/component.params";
import type { ComponentRenderer } from "../../types/component.renderer";
import type {
  NodeAsset,
  ComponentPublicData,
} from "../../types/component.simple.types";
// Import from local stub for TypeScript compilation
import { renderToString } from "../../stubs/react-dom-server";
import { convertExtsToDistPointer } from "../../utils/html.utils";
import { Loggable } from "../abstract/loggable";

/**
 * React Renderer for server-side rendering of React components
 */
export class ReactRenderer extends Loggable implements ComponentRenderer {
  public vendorAssets: Array<NodeAsset> = [];

  /** @inheritDoc */
  public render(
    context: ComponentContext<ComponentPublicData, ComponentParams>
  ): string | Promise<string> | Buffer | Promise<Buffer> {
    // Convert component buffers to strings for React props
    const stringComponents: Record<string, string> = {};
    Object.entries(context.components).forEach(([key, value]) => {
      if (Buffer.isBuffer(value)) {
        stringComponents[key] = value.toString();
      }
    });

    try {
      // Ensure template is a function before calling it
      if (typeof context.template !== "function") {
        console.error("Template is not a function:", typeof context.template);
        return "<div>Error: Invalid template type</div>";
      }

      // Create React element with context as props
      const element = context.template({
        ...context,
        ...stringComponents, // Add component strings directly as props
        components: stringComponents as unknown as Record<string, Buffer>, // Type assertion to satisfy the interface
        children: null, // Add missing children property for PreactViewContext
      });

      const html = renderToString(element);
      if (!html) {
        console.error("React render returned empty result");
        return "<div>Error: Empty render result</div>";
      }

      return convertExtsToDistPointer(html);
    } catch (err) {
      const error = err as Error;
      console.error("Error rendering React component:", error);
      return `<div>Error rendering component: ${
        error?.message || "Unknown error"
      }</div>`;
    }
  }
}

export const REACT = new ReactRenderer();
