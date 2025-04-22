/**
 * Stub for Vue client API for type checking
 * This is used to resolve TypeScript errors when the actual module is not available
 */

/**
 * Creates a Vue application instance
 * @param {any} component - The root component
 * @returnss {Object} The Vue application instance
 */
// Vue 3 signature
export function createApp(component: any): any {
  return {
    mount: (container: string | Element) => {},
    component: (name: string, component: any) => {},
    directive: (name: string, directive: any) => {},
    use: (plugin: any) => {},
  };
}

/**
 * Creates a virtual node
 * @param {any} type - Element type or component
 * @param {any} props - Component properties
 * @param {any} children - Child elements
 * @returnss {Object} Virtual node object
 */
export function h(type: any, props?: any, children?: any): any {
  return {};
}

/**
 * Vue Application type
 */
export interface App {
  mount: (container: string | Element) => void;
  component: (name: string, component: any) => any;
  directive: (name: string, directive: any) => any;
  use: (plugin: any) => any;
}

/**
 * Vue Virtual Node type
 */
export interface VNode {
  [key: string]: any;
}
