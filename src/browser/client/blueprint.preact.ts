import type { ViewContext } from "../../types/component.context";
// Preact
import * as preactMain from "preact";
import * as preactHooks from "preact/hooks";
import * as preactDevTools from "preact/devtools";
import * as preactRuntime from "preact/jsx-runtime";
// @ts-expect-error
import * as preactDebug from "preact/debug";

/**
 * Base Preact adapter for AssembleJS Views.
 * @author Zach Ayers
 */
export const preact = {
  ...preactMain,
  /**
   * Preact Hooks
   * @see https://preactjs.com/guide/v10/hooks/
   */
  hooks: preactHooks,
  /**
   * Preact DevTools Adapter
   * @see https://preactjs.github.io/preact-devtools/
   */
  devtools: preactDevTools,
  /**
   * Preact Runtime
   */
  runtime: preactRuntime,
  /**
   * Preact Debug
   * @see https://preactjs.com/guide/v10/debugging/
   */
  debug: preactDebug,
  /**
   * Hydrate the base Preact component with the current context.
   * @param {any} type - The base Preact component to hydrate.
   * @param {ViewContext} context - The current context.
   * @author Zach Ayers
   */
  bootstrap: (type: any, context: ViewContext): void => {
    const root = document.getElementById(context.id) as HTMLElement;
    if (root) {
      preactMain.hydrate(preactMain.h(type, context), root);
    }
  },
  /**
   * Render an imported component's content.
   * @param {string} componentName - The name of the component to render.
   * @param {ViewContext} context - The current context.
   * @return {preactMain.VNode} The rendered component.
   */
  component: (
    componentName: string,
    context: ViewContext
  ): preactMain.VNode => {
    const componentContent = context?.components?.[componentName];

    // Handle case where component is undefined or not a buffer
    if (!componentContent) {
      console.warn(`Component '${componentName}' not found in context`);
      return preactMain.h(
        "div",
        {
          className: "__assemblejs_missing_component",
          style:
            "border: 1px dashed #f44336; padding: 10px; margin: 5px 0; color: #f44336;",
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

    return preactMain.h("div", {
      dangerouslySetInnerHTML: {
        __html: htmlContent,
      },
    });
  },
};
