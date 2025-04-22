/**
 * Stub for @vue/server-renderer for type checking
 * This is used to resolve TypeScript errors when the actual module is not available
 */

/**
 * Renders a Vue application to a string
 * @param {any} app - The Vue application to render
 * @returnss {Promise<string>} Promise that resolves to the rendered HTML
 */
export function renderToString(app: any): Promise<string> {
  return Promise.resolve("");
}
