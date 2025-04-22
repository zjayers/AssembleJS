import type { ViewContext } from "../../types/component.context";
// Define minimal React stub
const React = {
  createElement: (type: any, props?: any, ...children: any[]) => ({
    type,
    props,
    children,
  }),
  Fragment: Symbol("React.Fragment"),
};
// Import from local stub for TypeScript compilation
import * as ReactDOM from "../../stubs/react-dom-client";

/**
 * Base React adapter for AssembleJS Views.
 * @author Zach Ayers
 */
export const react = {
  ...React,
  /**
   * React DOM Client
   */
  dom: ReactDOM,
  /**
   * Hydrate the base React component with the current context.
   * @param {any} Component - The base React component to hydrate.
   * @param {ViewContext} context - The current context.
   * @author Zach Ayers
   */
  bootstrap: (Component: any, context: ViewContext): void => {
    const root = document.getElementById(context.id) as HTMLElement;
    if (root) {
      ReactDOM.hydrateRoot(root, React.createElement(Component, context));
    }
  },
  /**
   * Render an imported component's content.
   * @param {string} componentName - The name of the component to render.
   * @param {ViewContext} context - The current context.
   * @return {React.ReactElement} The rendered component.
   */
  component: (componentName: string, context: ViewContext): any => {
    // Using 'any' instead of React.ReactElement
    const componentContent = context?.components?.[componentName];

    // Handle case where component is undefined or not a buffer
    if (!componentContent) {
      console.warn(`Component '${componentName}' not found in context`);
      return React.createElement(
        "div",
        {
          className: "__assemblejs_missing_component",
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

    return React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: htmlContent,
      },
    });
  },
};
