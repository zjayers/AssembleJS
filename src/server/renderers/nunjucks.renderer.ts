import type { ComponentContext } from "../../types/component.context";
import type { ComponentParams } from "../../types/component.params";
import type { ComponentRenderer } from "../../types/component.renderer";
import type {
  NodeAsset,
  ComponentPublicData,
} from "../../types/component.simple.types";
import { convertExtsToDistPointer } from "../../utils/html.utils";
import { Loggable } from "../abstract/loggable";
import * as nunjucks from "nunjucks";
import { readFileSync } from "fs";
import path from "path";

/**
 * Nunjucks Renderer for server-side rendering of Nunjucks templates
 */
export class NunjucksRenderer extends Loggable implements ComponentRenderer {
  public vendorAssets: Array<NodeAsset> = [];
  private env: nunjucks.Environment;

  /**
   * Initialize the Nunjucks renderer with configuration
   */
  constructor() {
    super();
    // Create a new Nunjucks environment with proper configuration
    this.env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(process.cwd(), {
        noCache: process.env.NODE_ENV !== "production",
      }),
      {
        autoescape: true,
        throwOnUndefined: false,
        trimBlocks: true,
        lstripBlocks: true,
      }
    );
  }

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

      // Handle template string or file template
      let result: string;
      if (context.template && typeof context.template === "string") {
        // Render from string template
        result = this.env.renderString(
          context.template as string,
          templateContext
        );
      } else if (context.templateFile) {
        // Render from file template
        const templateFile = context.templateFile;
        const templatePath = path.isAbsolute(templateFile)
          ? templateFile
          : path.join(process.cwd(), templateFile);

        try {
          const templateContent = readFileSync(templatePath, "utf8");
          result = this.env.renderString(templateContent, templateContext);
        } catch (error) {
          console.error(
            `Error reading Nunjucks template file: ${templatePath}`,
            error
          );
          return `<div>Error reading Nunjucks template file: ${
            error instanceof Error ? error.message : "Unknown error"
          }</div>`;
        }
      } else {
        console.error(
          "No template or templateFile provided for Nunjucks rendering"
        );
        return "<div>Error: No template or templateFile provided</div>";
      }

      return convertExtsToDistPointer(result);
    } catch (err) {
      const error = err as Error;
      console.error("Error rendering Nunjucks template:", error);
      return `<div>Error rendering Nunjucks template: ${
        error instanceof Error ? error.message : "Unknown error"
      }</div>`;
    }
  }
}

export const NUNJUCKS = new NunjucksRenderer();
