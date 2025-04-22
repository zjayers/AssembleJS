import type { ComponentView } from "./component.view";
import type { RouteShorthandOptions } from "fastify";
import type { ComponentParams } from "./component.params";
import type { ComponentPublicData } from "./component.simple.types";

/**
 * A Component is the building block of AssembleJS.
 * @description Each AssembleJS server is composed of 1 to Many Components.
 * Each Component may render child Components from external servers.
 * The general lifecycle of a Component is as follows:
 *
 * 1.
 * An HTTP request comes in to the AssembleJS server requesting the content for Component 'A
 *
 * 2.
 * The AssembleJS server fetches the template for the Component 'A',
 * runs it through any defined factories,
 * then runs it through the defined Component renderer.
 *
 * 3.
 * The AssembleJS server then returns the manipulated template to the requesting Component -
 *    along with a JSON script of any Public data on the ComponentContext object.
 *
 * 4.
 * While waiting on the Component content, the requesting Component will use a cached 'manifest.json'
 *    for this Component to reach out and gather any required Assets.
 *
 * 5.
 * The requesting Component will then compile the retrieved template,
 *   and any required Assets, into a final template.
 * @category (Component)
 * @author Zach Ayers
 * @public
 */
export interface Component<
  Public extends ComponentPublicData = ComponentPublicData,
  Params extends ComponentParams = ComponentParams
> {
  /**
   * The name of this component
   */
  readonly path: string;

  /**
   * The base directory to search for this component set in.
   */
  readonly root?: string;

  /**
   * When AssembleJS is NOT in 'production', and this Component is NOT being requested
   * from another Component, apply these development options tools
   */
  readonly developmentOptions?: ComponentView<
    Public,
    Params
  >["developmentOptions"];

  /**
   * Collection of common Component options that will be passed to ALL Component views
   */
  readonly shared?: {
    /** Array of Component Factories to run on the ComponentTemplate of each view, sorted by Priority */
    readonly factories?: ComponentView<Public, Params>["factories"];

    /** Array of helper functions to pass to the ComponentContext for all views of this Component */
    readonly helpers?: ComponentView<Public, Params>["helpers"];

    /** Any Components that all views of this Component require to render appropriately */
    readonly components?: ComponentView<Public, Params>["components"];

    /** Any request parameters to be validated when making ComponentTemplate content requests */
    readonly paramsSchema?: ComponentView<Public, Params>["paramsSchema"];

    /** Any Route options to use for every view of this Component. */
    readonly routeOpts?: RouteShorthandOptions;
  };

  /** Array of views for this Component */
  readonly views: Array<ComponentView<Public, Params>>;
}

/**
 * Array of Renderable Components
 */
export type ComponentManifest = Array<Component>;
