import type { ComponentFactory } from "./component.factory";
import type {
  ComponentAddresses,
  ComponentHelper,
  ComponentPublicData,
  ComponentTemplate,
} from "./component.simple.types";
import type {
  ComponentParams,
  ComponentParamsSchema,
} from "./component.params";
import type { RouteShorthandOptions } from "fastify";
import type { JsAsset } from "./js.asset.js";
import type { CssAsset } from "./css.asset";

/**
 * Declaration of a Component 'view' object.
 * @description Component 'views' represent an individual 'view' of a particular Component.
 * Each 'view' is unique for a Component, and a Component may have many different views.
 * @public
 * @category (Component)
 * @author Zach Ayers
 */
export interface ComponentView<
  Public extends ComponentPublicData = {},
  Params extends ComponentParams = {
    headers: {};
    path: {};
    query: {};
    body: {};
  }
> {
  /** The unique name of a view */
  readonly viewName: string;
  /** The title of the HTML page when displaying this view at the top level */
  readonly title?: string;
  /** The template a Component will return from its content controller */
  readonly template?: ComponentTemplate | string;
  /**
   * When using a file renderer, this is the path to the template file.
   */
  readonly templateFile?: string;
  /**
   * Method for re-reading the template after server startup.
   */
  getTemplate?: () => string | ComponentTemplate;
  /** Root node for this view */
  readonly root?: string;
  /** The ext of the template file used */
  readonly templateExt?: string;
  /** Any Nodes that this Component requires to render appropriately */
  readonly components?: ComponentAddresses;
  /** Array of helper functions to pass to the ComponentContext */
  readonly helpers?: Record<string, ComponentHelper>;
  /** Any Route options to use for every view of this Component. */
  readonly routeOpts?: RouteShorthandOptions;
  /** Array of Component Factories to run on the ComponentTemplate, sorted by Priority */
  readonly factories?: Array<ComponentFactory<Public, Params>>;
  /** Expose this Component view to the outside world.
   * Allowing URL request to return this Component view.
   * When not set,
   * this Component view will only be contactable during developmentOptions */
  readonly exposeAsBlueprint?: boolean;
  /** Expected request parameters for a Component content request */
  readonly paramsSchema?: ComponentParamsSchema;
  /** When ASSEMBLEJS is NOT 'production', and this Component is NOT being requested from another Component, apply these developmentOptions tools */
  readonly developmentOptions?: {
    /** Wrap the ComponentTemplate in content, simulating another Component rendering this Component */
    readonly contentWrapper?: (content: string) => string;
  };
  assets?: {
    js?: Array<JsAsset>;
    css?: Array<CssAsset>;
  };
  readonly contentUrl?: string;
  readonly manifestUrl?: string;
  readonly dataUrl?: string;
  readonly htmlContainerCssClassNames?: string[];
  readonly htmlContainerAttributes?: Array<Record<string, string>>;

  /**
   * Cache time-to-live in milliseconds
   * @description How long to cache the rendered output of this view
   * @default 300000 (5 minutes)
   */
  readonly cacheTtl?: number;
}
