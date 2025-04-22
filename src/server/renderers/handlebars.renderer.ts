import type { ComponentContext } from "../../types/component.context";
import type { ComponentParams } from "../../types/component.params";
import type { ComponentRenderer } from "../../types/component.renderer";
import type {
  NodeAsset,
  ComponentPublicData,
} from "../../types/component.simple.types";
import { convertExtsToDistPointer } from "../../utils/html.utils";
import { Loggable } from "../abstract/loggable";
import * as Handlebars from "handlebars";
import { readFileSync } from "fs";
import path from "path";

/**
 * Handlebars Renderer for server-side rendering of Handlebars templates
 */
export class HandlebarsRenderer extends Loggable implements ComponentRenderer {
  public vendorAssets: Array<NodeAsset> = [];
  private handlebars: typeof Handlebars;

  /**
   * Initialize the Handlebars renderer with custom helpers
   */
  constructor() {
    super();

    // Check if create() is available, otherwise use the instance directly
    if (typeof Handlebars.create === "function") {
      this.handlebars = Handlebars.create();
    } else {
      // For newer versions of Handlebars that don't have create()
      this.handlebars = Handlebars;
    }

    // Register some useful built-in helpers
    this.handlebars.registerHelper("json", function (context) {
      return JSON.stringify(context);
    });

    this.handlebars.registerHelper("uppercase", function (str) {
      return str.toUpperCase();
    });

    this.handlebars.registerHelper("lowercase", function (str) {
      return str.toLowerCase();
    });
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

      // Register any helper functions from the context
      if (context.helpers) {
        Object.entries(context.helpers).forEach(([name, helper]) => {
          this.handlebars.registerHelper(name, helper);
        });
      }

      // Handle template string or file template
      let template: Handlebars.TemplateDelegate;
      if (context.template && typeof context.template === "string") {
        // Compile string template
        template = this.handlebars.compile(context.template as string);
      } else if (context.templateFile) {
        // Compile file template
        const templateFile = context.templateFile;
        const templatePath = path.isAbsolute(templateFile)
          ? templateFile
          : path.join(process.cwd(), templateFile);

        try {
          const templateContent = readFileSync(templatePath, "utf8");
          template = this.handlebars.compile(templateContent);
        } catch (error) {
          console.error(
            `Error reading Handlebars template file: ${templatePath}`,
            error
          );
          return `<div>Error reading Handlebars template file: ${
            error instanceof Error ? error.message : "Unknown error"
          }</div>`;
        }
      } else {
        console.error(
          "No template or templateFile provided for Handlebars rendering"
        );
        return "<div>Error: No template or templateFile provided</div>";
      }

      // Render the template with the context
      const result = template(templateContext);
      return convertExtsToDistPointer(result);
    } catch (err) {
      const error = err as Error;
      console.error("Error rendering Handlebars template:", error);
      return `<div>Error rendering Handlebars template: ${
        error instanceof Error ? error.message : "Unknown error"
      }</div>`;
    }
  }
}

export const HANDLEBARS = new HandlebarsRenderer();
