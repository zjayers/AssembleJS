import type { ViewContext } from "../../types/component.context";

/**
 * Base Svelte adapter for AssembleJS Views.
 * @author Zach Ayers
 */
export const svelte = {
  /**
   * Hydrate the base Svelte component with the current context.
   * @param {any} ComponentClass - The Svelte component class to hydrate.
   * @param {ViewContext} context - The current context.
   * @author Zach Ayers
   */
  bootstrap: (ComponentClass: any, context: ViewContext): void => {
    const root = document.getElementById(context.id) as HTMLElement;
    if (root) {
      new ComponentClass({
        target: root,
        hydrate: true,
        props: context,
      });
    }
  },
  /**
   * Create a Svelte component from the current context.
   * This is primarily for client-side usage.
   * @param {any} ComponentClass - The Svelte component class.
   * @param {ViewContext} context - The current context.
   * @return {any} The Svelte component instance.
   */
  create: (ComponentClass: any, context: ViewContext): any => {
    const target = document.getElementById(context.id);
    if (!target) {
      console.error(`Target element with ID '${context.id}' not found`);
      return null;
    }

    return new ComponentClass({
      target,
      props: context,
    });
  },
  /**
   * Render an imported component's content.
   * @param {string} componentName - The name of the component to render.
   * @param {HTMLElement} target - The target element to render into.
   * @param {ViewContext} context - The current context.
   */
  component: (
    componentName: string,
    target: HTMLElement,
    context: ViewContext
  ): void => {
    const componentContent = context?.components?.[componentName];

    // Handle case where component is undefined or not a buffer
    if (!componentContent) {
      console.warn(`Component '${componentName}' not found in context`);
      target.innerHTML = `<div class="__assemblejs_missing_component" 
        style="border: 1px dashed #f44336; padding: 10px; margin: 5px 0; color: #f44336;">
        Component '${componentName}' not found
      </div>`;
      return;
    }

    // Convert buffer to string safely
    let htmlContent = "";
    try {
      htmlContent =
        typeof componentContent.toString === "function"
          ? componentContent.toString("utf8")
          : String(componentContent);
    } catch (error) {
      console.error(
        `Error converting component '${componentName}' to string:`,
        error
      );
      htmlContent = `<div>Error rendering component '${componentName}'</div>`;
    }

    target.innerHTML = htmlContent;
  },
};
