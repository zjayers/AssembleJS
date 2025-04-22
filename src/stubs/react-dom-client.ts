/**
 * Stub for react-dom/client for type checking
 * This is used to resolve TypeScript errors when the actual module is not available
 */

/**
 * Creates a root for a React component tree
 * @param {Element} container - The DOM element to render into
 * @returnss {Object} The root object with a render method
 */
export function createRoot(container: Element): any {
  return {
    render: (element: any) => {},
  };
}

/**
 * Hydrates a React component tree on an existing HTML structure
 * @param {Element} container - The DOM element to hydrate into
 * @param {any} element - The React element to hydrate
 * @returnss {Object} The root object with a render method
 */
export function hydrateRoot(container: Element, element: any): any {
  return {
    render: (element: any) => {},
  };
}
