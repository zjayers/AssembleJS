import type { ComponentView } from "./component.view";
import type { JsAsset } from "./js.asset.js";
import type { CssAsset } from "./css.asset";
// Remove unused import
// import type { AnyObject } from "./object.any";
import type { ComponentAddress } from "./component.address";
import type { VNode } from "preact";
import type { PreactViewContext } from "./component.context";

/**
 * Any type of Component Asset -
 * These will be sent along on the Component manifest to allow other components to grab assets.
 * @category (Component)
 * @public
 * @author Zach Ayers
 * @example
 * ```typescript
 * // NodeAsset is a generic type that encompasses all Assets for a Component (CSS, JS, Img, Font, etc)
 * const asset = <NodeAsset>{
 *     src: './dist/js/bundle.js',
 *     async: true
 *   }
 * ```
 */
export type NodeAsset = JsAsset | CssAsset | { value: string };

/**
 * PUBLIC data to be exposed to the Client side -
 * Public data is serialized and sent alongside the Component as a payload script.
 * @category (Component)
 * @public
 * @author Zach Ayers
 */
export type ComponentPublicData = Record<string, unknown>;

/**
 * Map of addresses used to render external components.
 * @category (Component)
 * @public
 * @author Zach Ayers
 * @example
 * ```typescript
 * const addresses: ComponentAddresses = [
 *   {
 *     name: 'calculator',
 *     contentUrl: "https://my-components.com/v1/common-components/calculator",
 *     manifestUrl:
 *       "https://my-components.com/v1/common-components/calculator/manifest.json",
 *     renderTimeout: 3000,
 *     requestRetries: 2,
 *     requestTimeout: 4000,
 *   },
 *   {
 *     name: 'search-entry',
 *     contentUrl: "https://my-components.com/v1/common-components/search-entry",
 *   },
 * ];
 * ```
 */
export type ComponentAddresses = Array<ComponentAddress>;

/**
 * A helper function which may be passed to templates and run inside of templates.
 * @category (Component)
 * @public
 * @author Zach Ayers
 * @example
 * ```typescript
 * const reverseText = (text: string) => text.split('').reverse().join('');
 * ```
 */
export type ComponentHelper<T extends any[] = any[], R = any> = (
  ...args: T
) => R;

/**
 * Map of Component helper functions, used to access via a helper key.
 * @category (Component)
 * @public
 * @author Zach Ayers
 * @example
 * ```typescript
 * // Create a map of Helpers
 * const helpers: ComponentHelperMap = {
 *   reverseText: (text: string) => text.split("").reverse().join(""),
 *   formatNumber: (text: string) => text.toLocaleUpperCase(),
 * }
 * ```
 */
export type ComponentHelperMap = Record<string, ComponentHelper>;

/**
 * Template to be rendered by a ComponentRenderer.
 * Templates are run through any defined factories before they are sent to the client.
 * @category (Component)
 * @public
 * @author Zach Ayers
 */
export type ComponentTemplate = VNodeFn<PreactViewContext> | RawTemplate;

/**
 * Raw template string
 */
export type RawTemplate = string;

/**
 * Function that produces a VNode from a context
 */
export type VNodeFn<P> = (context: P) => VNode<P>;

/**
 * A Component's Content and ViewName identifier.
 * @category (Component)
 * @public
 * @author Zach Ayers
 * @example
 * ```typescript
 * const componentContent: ComponentContent = {
 *   template: `<div>Hello World</div>`,
 *   viewName: 'my-custom-view'
 * }
 * ```
 */
export type ComponentContent = Pick<
  ComponentView,
  "viewName" | "template" | "templateFile"
>;
