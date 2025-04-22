import type { ComponentContext } from "../../types/component.context";
import type { ComponentParams } from "../../types/component.params";
import type { ComponentRenderer } from "../../types/component.renderer";
import type {
  NodeAsset,
  ComponentPublicData,
} from "../../types/component.simple.types";
import { convertExtsToDistPointer } from "../../utils/html.utils";
import { Loggable } from "../abstract/loggable";
import * as pug from "pug";
import { readFileSync } from "fs";
import path from "path";

/**
 * Pug Renderer for server-side rendering of Pug templates
 */
export class PugRenderer extends Loggable implements ComponentRenderer {
  public vendorAssets: Array<NodeAsset> = [];

  /** @inheritDoc */
  public render(
    context: ComponentContext<ComponentPublicData, ComponentParams>
  ): string | Promise<string> | Buffer | Promise<Buffer> {
    try {
      // Convert component buffers to strings for the template
      const stringComponents: Record<string, string> = {};
      Object.entries(context.components).forEach(([key, value]) => {
        if (Buffer.isBuffer(value)) {
          stringComponents[key] = value.toString();
        }
      });

      // Prepare the template context by merging context and components
      const templateContext = {
        ...context,
        components: stringComponents,
        stringComponents,
      };

      // Pug rendering options
      const options: pug.Options = {
        filename: context.templateFile, // For includes and extends
        compileDebug: process.env.NODE_ENV !== "production",
        pretty: process.env.NODE_ENV !== "production", // Pretty in development, minified in production
      };

      // Handle template string or file template
      let result: string;
      if (context.template && typeof context.template === "string") {
        // Render from string template
        result = pug.render(context.template as string, {
          ...options,
          ...templateContext,
        });
      } else if (context.templateFile) {
        // Render from file template
        const templateFile = context.templateFile;
        const templatePath = path.isAbsolute(templateFile)
          ? templateFile
          : path.join(process.cwd(), templateFile);

        try {
          // Two options for Pug rendering from file:
          // 1. Read file and render string (more control over context)
          const templateContent = readFileSync(templatePath, "utf8");
          result = pug.render(templateContent, {
            ...options,
            filename: templatePath, // Important for includes/extends
            ...templateContext,
          });

          // 2. Alternative: Use pug.renderFile (simpler but less control)
          // result = pug.renderFile(templatePath, {
          //   ...templateContext,
          //   pretty: process.env.NODE_ENV !== "production",
          // });
        } catch (error) {
          console.error(
            `Error reading Pug template file: ${templatePath}`,
            error
          );
          return `<div>Error reading Pug template file: ${
            error instanceof Error ? error.message : "Unknown error"
          }</div>`;
        }
      } else {
        console.error("No template or templateFile provided for Pug rendering");
        return "<div>Error: No template or templateFile provided</div>";
      }

      return convertExtsToDistPointer(result);
    } catch (err) {
      const error = err as Error;
      console.error("Error rendering Pug template:", error);
      return `<div>Error rendering Pug template: ${
        error instanceof Error ? error.message : "Unknown error"
      }</div>`;
    }
  }
}

export const PUG = new PugRenderer();
