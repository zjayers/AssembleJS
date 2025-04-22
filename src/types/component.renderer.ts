import type { ComponentContext } from "./component.context";
import type { NodeAsset, ComponentPublicData } from "./component.simple.types";
import type { ComponentParams } from "./component.params";

/**
 * Nodes may use different types of Renderers. Renderers may either return a string or a Buffer of content.
 * Once a renderer has 'rendered' the content, the string or Buffer is sent out on the response object.
 * @description This allows string typing of all anonymous objects.
 * @category (Component)
 * @author Zach Ayers
 * @public
 * @example
 * ```typescript
 * // Create a new JS Asset
 * const jsAsset: AssetJS = {
 *   src: "https://unpkg.com/ejs@3.1.6/ejs.min.js",
 * }
 *
 * // Create the new renderer
 * const ejsNodeRenderer: ComponentRenderer = {
 *   vendorAssets: [jsAsset],
 *   render(
 *     context: ComponentContext<ComponentPublicData, ComponentParams>
 *   ): Buffer | string | Promise<Buffer> | Promise<string> {
 *     return ejs.render(context.template, { data: context.data });
 *   },
 * };
 * ```
 */
export type ComponentRenderer = {
  /** Any Vendor assets required by this renderer.
   * These will be sent along with the Component scripts in the Manifest */
  vendorAssets?: Array<NodeAsset>;
  /** Rendering Function -
   * access the Component context
   * and return a string or Buffer which will be sent as the Component content response */
  render(
    context: ComponentContext<ComponentPublicData, ComponentParams>
  ): string | Promise<string> | Buffer | Promise<Buffer>;
};
