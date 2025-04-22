/**
 * Stub for react-dom/client for type checking
 * This is used to resolve TypeScript errors when the actual module is not available
 */

/**
 * Creates a root for a React component tree
 */
export function createRoot(container: Element): any {
  return {
    render: (element: any) => {},
  };
}

/**
 * Hydrates a React component tree on an existing HTML structure
 */
export function hydrateRoot(container: Element, element: any): any {
  return {
    render: (element: any) => {},
  };
}
