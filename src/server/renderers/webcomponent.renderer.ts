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
 * WebComponent Renderer for server-side rendering of Web Components
 */
export class WebComponentRenderer
  extends Loggable
  implements ComponentRenderer
{
  public vendorAssets: Array<NodeAsset> = [];

  /** @inheritDoc */
  public render(
    context: ComponentContext<ComponentPublicData, ComponentParams>
  ): string | Promise<string> | Buffer | Promise<Buffer> {
    try {
      // For Web Components, we need to:
      // 1. Generate the initial HTML with the custom element
      // 2. Include any server-side properties as data attributes

      const elementName =
        `${context.componentName}-${context.viewName}`.toLowerCase();
      const attributes: string[] = [];

      // Convert properties to data-* attributes
      if (context.data) {
        Object.entries(context.data).forEach(([key, value]) => {
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            attributes.push(`data-${key}="${value}"`);
          } else if (value !== null && value !== undefined) {
            // For complex objects, we stringify and encode
            const jsonValue = JSON.stringify(value).replace(/"/g, "&quot;");
            attributes.push(`data-${key}="${jsonValue}"`);
          }
        });
      }

      // Add an ID for client-side hydration
      attributes.push(`id="${context.id}"`);

      // Convert component buffers to string components for nested use
      const componentsAttr: Record<string, string> = {};
      Object.entries(context.components).forEach(([key, value]) => {
        if (Buffer.isBuffer(value)) {
          componentsAttr[key] = value.toString();
        }
      });

      // If we have components, add them as a hidden slot to be processed by client-side code
      let componentsSlot = "";
      if (Object.keys(componentsAttr).length > 0) {
        const jsonComponents = JSON.stringify(componentsAttr).replace(
          /"/g,
          "&quot;"
        );
        componentsSlot = `<template data-slot="components" style="display:none;" data-components="${jsonComponents}"></template>`;
      }

      // Determine the template HTML
      let templateHtml = "";
      if (context.template && typeof context.template === "string") {
        templateHtml = context.template;
      }

      // Generate the custom element tag with all attributes
      const html = `<${elementName} ${attributes.join(" ")}>
        ${componentsSlot}
        ${templateHtml}
      </${elementName}>`;

      return convertExtsToDistPointer(html);
    } catch (err) {
      const error = err as Error;
      console.error("Error rendering Web Component:", error);
      return `<div>Error rendering Web Component: ${
        error instanceof Error ? error.message : "Unknown error"
      }</div>`;
    }
  }
}

export const WEBCOMPONENT = new WebComponentRenderer();
