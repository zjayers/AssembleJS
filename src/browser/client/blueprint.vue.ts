import type { ViewContext } from "../../types/component.context";
// Import from local stub for TypeScript compilation
import * as Vue from "../../stubs/vue-client";

/**
 * Base Vue adapter for AssembleJS Views.
 * @author Zach Ayers
 */
export const vue = {
  ...Vue,
  /**
   * Hydrate the base Vue component with the current context.
   * @param {any} Component - The Vue component to hydrate.
   * @param {ViewContext} context - The current context.
   * @author Zach Ayers
   */
  bootstrap: (Component: any, context: ViewContext): void => {
    const root = document.getElementById(context.id) as HTMLElement;
    if (root) {
      // Vue 3 API: pass props via second param to mount
      const app = Vue.createApp(Component);
      app.mount(root);
    }
  },
  /**
   * Create a Vue app from the current context.
   * This is primarily for client-side usage.
   * @param {any} Component - The Vue component.
   * @param {ViewContext} context - The current context.
   * @return {Vue.App} The Vue app instance.
   */
  createApp: (Component: any, context: ViewContext): Vue.App => {
    // Vue 3 API: return app instance
    return Vue.createApp(Component);
  },
  /**
   * Render an imported component's content.
   * @param {string} componentName - The name of the component to render.
   * @param {ViewContext} context - The current context.
   * @return {Vue.VNode} The rendered component.
   */
  component: (componentName: string, context: ViewContext): Vue.VNode => {
    const componentContent = context?.components?.[componentName];

    // Handle case where component is undefined or not a buffer
    if (!componentContent) {
      console.warn(`Component '${componentName}' not found in context`);
      return Vue.h(
        "div",
        {
          class: "__assemblejs_missing_component",
          style: {
            border: "1px dashed #f44336",
            padding: "10px",
            margin: "5px 0",
            color: "#f44336",
          },
        },
        `Component '${componentName}' not found`
      );
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

    return Vue.h("div", {
      innerHTML: htmlContent,
    });
  },
};
