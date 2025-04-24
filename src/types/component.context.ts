import type { ComponentParams } from "./component.params";
import type { AxiosInstance } from "axios";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { ComponentDevice } from "./component.device";
import type {
  ComponentContent,
  ComponentHelper,
  ComponentHelperMap,
  ComponentPublicData,
  ComponentTemplate,
} from "./component.simple.types";
import type { ComponentView } from "./component.view";
import type { AnyObject } from "./object.any";
import type { ComponentChildren } from "preact";
// We're using 'any' for React types to avoid dependencies
// import type * as React from "react";
import { CONSTANTS } from "../constants/blueprint.constants";

/**
 * Just a plain empty object expectation type.
 * @author Zachariah Ayers
 * @category Component
 * @public
 */
export type EMPTY_NODE_PARAM = AnyObject;

/**
 * Helper interface for pointing to a base Param map that is available to components.
 * @author Zachariah Ayers
 * @category Component
 * @public
 */
export interface EMPTY_NODE_PARAMS extends ComponentParams {
  headers: EMPTY_NODE_PARAM;
  path: EMPTY_NODE_PARAM;
  query: EMPTY_NODE_PARAM;
  body: EMPTY_NODE_PARAM;
}

/**
 * Component Context - Built during each request for a Component
 * @description The Component context captures the state of a Component as data passes through the system
 * @description Items on the Context are thrown away after a Reply is returned, and Context should only exist for a single request session.
 * @category Component
 * @author Zachariah Ayers
 * @public
 * @example
 * ```typescript
 * const context: ComponentContext = {
 *   viewName: "my-custom-view",
 *   template: `<div>Hello World</div>`,
 *   // Context keys are filled by the framework during a request session.
 * }
 * ```
 */
/**
 * Component context interface - defines the core structure of the component context
 */
export interface INodeContext<
  Public extends ComponentPublicData = ComponentPublicData,
  Params extends ComponentParams = ComponentParams
> extends ComponentContent {
  /** An axios instance used only by this Component */
  readonly api: AxiosInstance;
  /** The device type of the requesting browser */
  readonly deviceType: ComponentDevice;
  /** Any parameters passed to this Component on a request */
  params: Params;
  /** Any public data that will be serialized and passed to the Client */
  data: Public;
  /** The current HTTP request, flowing through Fastify */
  request: FastifyRequest;
  /** The current HTTP reply, flowing through Fastify */
  reply: FastifyReply;
  /** Helper functions added to the Context object */
  helpers: ComponentHelperMap;
  /** Any child components of the current Component */
  components: Record<string, Buffer>;
  /** Render this view as a Blueprint */
  renderAsBlueprint: boolean;
  /** The ID of the currently requested component or blueprint */
  id: string;
  /** The title to display on the displayed page */
  title?: string;
  /** The nesting level of the current request context */
  nestLevel: number;
  /** The server url of the current request */
  serverUrl: string;
  /** The name of the component */
  readonly componentName: string;
  /** The renderer to use */
  renderer?:
    | "EJS"
    | "PREACT"
    | "REACT"
    | "VUE"
    | "SVELTE"
    | "HTML"
    | "STRING"
    | "MARKDOWN"
    | "NUNJUCKS"
    | "HANDLEBARS"
    | "PUG"
    | "WEBCOMPONENT";
}

/**
 * Collection of mutations that can be performed on a Component context object
 * @public
 * @category (Component)
 * @author Zach Ayers
 */
export interface NodeContextMutations<
  Public extends ComponentPublicData = ComponentPublicData,
  Params extends ComponentParams = ComponentParams
> {
  /**
   * Add a Helper function to the context. Helper functions can be passed to templates.
   * @param {ComponentHelper} helper - Helper function to be exposed to your templates.
   * @example
   * ```typescript
   * // Create a helper function that converts a string to uppercase
   * const myCustomFn = (item: string) => item.toUpperCase();
   *
   * // Add a new Helper Function to the context
   * context.addHelper(myCustomFn);
   * ```
   */
  addHelper<T extends any[] = any[], R = any>(
    helper: ComponentHelper<T, R>
  ): void;

  /**
   * Set a new key and value on the public data - Public data is exposed to the client
   * @param {string} key Key to set the data on.
   * @param {T} value The value of the new key.
   * @returns {Partial<Public>}
   * @example
   * ```
   * // Add a new piece of public data to the Component context
   * context.setPublicDataKey('foo', 'bar');
   * ```
   */
  setPublicDataKey<T>(key: string, value: T): Partial<Public>;

  /**
   * Set a new series of keys and values on the public data - Public data is exposed to the client
   * @param {T} data Data object to merge in to the current Public data.
   * @returns {Partial<Public>}
   * @example
   * ```typescript
   * // Add a set of public data to the Component context
   * context.setPublicData({ foo: 'bar', baz: 'bum' });
   * ```
   */
  setPublicData<T extends AnyObject>(data: T): Public;

  /**
   * Add a new key:value parameter to the header, path, query, or body parameters.
   * @param {keyof ComponentParams} type The type of param to set.
   * @param {string} key Key to set the parameter on.
   * @param {T} value Value of the new parameter key.
   * @returns {Partial<Params>}
   * @example
   * ```typescript
   * // Add a new piece of data to the 'headers' param set
   * context.addParam('headers', 'foo', 'bar');
   * ```
   */
  addParam<T>(
    type: keyof ComponentParams,
    key: string,
    value: T
  ): Partial<Params>;

  /**
   * Add a set of new key:value parameters to the header, path, query, or body parameters.
   * @param {keyof ComponentParams} type The type of parameter to set.
   * @param {T} obj Object to merge in to the current params.
   * @returns {Partial<Params>}
   * @example
   * ```typescript
   * // Add a new set of data to the 'headers' param set
   * context.addParams('headers', { password: 'abcd1234', userId: 3 });
   * ```
   */
  addParams<T extends AnyObject>(
    type: keyof ComponentParams,
    obj: T
  ): Partial<Params>;

  /**
   * Replace any matched keys in a parameter type.
   * @param {keyof ComponentParams} type The type of parameter to set.
   * @param {RegExp | string} regex Regex matcher used in key replacement.
   * @param {T} value New value to use for matched keys.
   * @returns {Partial<Params>}
   * @example
   * ```typescript
   * // Replace the value of any 'query' params matching the regex pattern
   * context.replaceParams('query', /replace-matcher/g, 'new value');
   * ```
   */
  replaceParams<T>(
    type: keyof ComponentParams,
    regex: RegExp | string,
    value: T
  ): Partial<Params>;

  /**
   * Remove a key from a parameter type.
   * @param {keyof ComponentParams} type The type of parameter to set.
   * @param {string} key The key to remove.
   * @returns {Partial<Params>}
   * @example
   * ```typescript
   * // Remove the username key from the 'body' param set
   * context.removeParam('body', 'username');
   * ```
   */
  removeParam(type: keyof ComponentParams, key: string): Partial<Params>;

  /**
   * Remove a set of keys from a parameter type.
   * @param {keyof ComponentParams} type The type of parameter to set.
   * @param {string} keys The keys to remove.
   * @returns {Partial<Params>}
   * @example
   * ```typescript
   * // Remove the username and password keys from the 'body' param set
   * context.removeParams('body', ['username', 'password']);
   * ```
   */
  removeParams(type: keyof ComponentParams, keys: string[]): Partial<Params>;

  /**
   * Remove a set of keys from a parameter type that match a regex pattern.
   * @param {keyof ComponentParams} type The type of parameter to set.
   * @param {RegExp} regex The regex matcher to use when testing object keys.
   * @returns {Partial<Params>}
   * @example
   * ```typescript
   * // Remove any params from the 'body' param set that matches a regex pattern
   * context.removeParamsByMatch('body', /username/);
   * ```
   */
  removeParamsByMatch(
    type: keyof ComponentParams,
    regex: RegExp
  ): Partial<Params>;

  /**
   * Remove a set of keys from a parameter type that match a regex pattern.
   * @param {keyof ComponentParams} type The type of parameter to set.
   * @param {(key: string, value: T) => boolean} filter The filter function to use when testing object keys.
   * @returns {Partial<Params>}
   * @example
   * ```typescript
   * // Remove any keys from the 'body' param set whose values do not equal "Hello World"
   * context.removeParamsByFilter('body', (key: string, value: string) => value === "Hello World"));
   * ```
   */
  removeParamsByFilter<T>(
    type: keyof ComponentParams,
    filter: (key: string, value: T) => boolean
  ): Partial<Params>;

  /**
   * Override the Component template that is returned by this Component request.
   * @param {ComponentTemplate} template The Component template used when rendering this Component.
   * @example
   * ```typescript
   * // Override the Component template for the current Component request.
   * context.overrideTemplate(`<div><h1>Override!</h1></div>`);
   * ```
   */
  overrideTemplate(template: ComponentTemplate): void;

  /**
   * Override the View that is returned by this Component request.
   * @param {ComponentView["viewName"]} viewName The name of the view to return instead of the current view.
   * @example
   * ```typescript
   * // Override the Component template for the current Component request.
   * context.overrideView('mobile');
   * ```
   */
  overrideView(viewName: ComponentView["viewName"]): void;

  /**
   * Throw an error using the context object.
   * @param {Error} error The error to throw.
   * @throws Error
   * @example
   * ```typescript
   * // Throw an error when something unexpected occurs
   * context.throw(new CustomError('Something Happened!));
   * ```
   */
  throw(error: Error): void;
}

/**
 * Component Context - Stateful Object
 * This Class is created, populated, and destroyed during the Component request cycle.
 * No Context should ever exist outside a single request operation.
 * @public
 * @category (Component)
 * @author Zach Ayers
 */
export class ComponentContext<
  Public extends AnyObject,
  Params extends ComponentParams
> implements INodeContext<Public, Params>, NodeContextMutations<Public, Params>
{
  public readonly api: AxiosInstance;
  public readonly components: INodeContext<Public, Params>["components"];
  public readonly deviceType: ComponentDevice;
  public componentName: string;
  public viewName: string;
  public template: ComponentTemplate | undefined;
  public templateFile: string | undefined;
  public params: Params;
  public data: Public;
  public reply: FastifyReply;
  public request: FastifyRequest;
  public helpers: ComponentHelperMap = {};
  public renderAsBlueprint = false;
  public id;
  public nestLevel = 0;
  public title: string;
  public readonly serverUrl: string;
  public renderer: INodeContext<Public, Params>["renderer"];

  /**
   * Context builder
   * @param {INodeContext} context
   */
  constructor(context: INodeContext<Public, Params>) {
    this.api = context.api;
    this.components = context.components;
    this.deviceType = context.deviceType;
    this.componentName = context.componentName;
    this.viewName = context.viewName;
    this.template = context.template;
    this.templateFile = context.templateFile;
    this.params = context.params;
    this.data = context.data;
    this.reply = context.reply;
    this.request = context.request;
    this.renderAsBlueprint = context.renderAsBlueprint;
    this.id = context.id;
    this.nestLevel = context.nestLevel;
    this.title = context.title ?? CONSTANTS.defaultHTMLTitle;
    this.serverUrl = context.serverUrl;
    this.renderer = context.renderer;
  }

  /** @inheritDoc */
  public addHelper<T extends any[] = any[], R = any>(
    helper: ComponentHelper<T, R>
  ): void {
    if (!helper.name) {
      throw new Error("Helper function must have a name");
    }
    this.helpers[helper.name] = helper;
  }

  /** @inheritDoc */
  public setPublicDataKey<T>(key: string, value: T): Partial<Public> {
    this.data = { ...this.data, [key]: value } as Public;
    return this.data;
  }

  /** @inheritDoc */
  public setPublicData<T extends AnyObject>(data: T): Public {
    this.data = { ...this.data, ...data };
    return this.data;
  }

  /** @inheritDoc */
  public addParam<T>(
    type: keyof ComponentParams,
    key: string,
    value: T
  ): Partial<Params> {
    this.params[type][key] = value;
    return this.params;
  }

  /** @inheritDoc */
  public addParams<T extends AnyObject>(
    type: keyof ComponentParams,
    obj: T
  ): Partial<Params> {
    this.params[type] = { ...this.params[type], ...obj };
    return this.params;
  }

  /** @inheritDoc */
  public replaceParams<T>(
    type: keyof ComponentParams,
    regex: RegExp,
    value: T
  ): Partial<Params> {
    const currentParams = { ...this.params[type] };

    for (const key in currentParams) {
      if (regex.test(key)) {
        currentParams[key] = value;
      }
    }

    this.params[type] = currentParams;
    return this.params;
  }

  /** @inheritDoc */
  public removeParam(
    type: keyof ComponentParams,
    key: string
  ): Partial<Params> {
    delete this.params[type][key];
    return this.params;
  }

  /** @inheritDoc */
  public removeParams(
    type: keyof ComponentParams,
    keys: string[]
  ): Partial<Params> {
    for (const key of keys) {
      if (this.params[type][key]) {
        delete this.params[type][key];
      }
    }

    return this.params;
  }

  /** @inheritDoc */
  public removeParamsByMatch(
    type: keyof ComponentParams,
    regex: RegExp
  ): Partial<Params> {
    for (const key in this.params[type]) {
      if (regex.test(key)) {
        delete this.params[type][key];
      }
    }

    return this.params;
  }

  /** @inheritDoc */
  public removeParamsByFilter<T>(
    type: keyof ComponentParams,
    filter: (key: string, value: T) => boolean
  ): Partial<Params> {
    for (const key in this.params[type]) {
      if (filter(key, this.params[type][key])) {
        delete this.params[type][key];
      }
    }

    return this.params;
  }

  /** @inheritDoc */
  public overrideTemplate(template: ComponentTemplate): void {
    this.template = template;
  }

  /** @inheritDoc */
  public overrideView(viewName: ComponentView["viewName"]): void {
    this.viewName = viewName;
  }

  /** @inheritDoc */
  public throw(error: Error): void {
    throw error;
  }
}

/**
 * Base view context. Sanitizes ComponentContext down to a client model.
 * @description The base client-side data transfer object
 * @author Zach Ayers
 */
export interface BaseViewContext<
  Public extends ComponentPublicData = ComponentPublicData,
  Params extends ComponentParams = ComponentParams
> {
  /** Child component references */
  components: Record<string, Buffer>;
  /** Name of the component */
  componentName: string;
  /** Name of the view */
  viewName: string;
  /** Server URL */
  serverUrl: string;
  /** Unique ID of the component instance */
  id: string;
  /** Request parameters */
  params: Params;
  /** Public data exposed to the client */
  data: Public;
  /** Whether this component is rendered as a blueprint */
  renderAsBlueprint: boolean;
  /** Device type of the client */
  deviceType: ComponentDevice;
  /** Nesting level in the component hierarchy */
  nestLevel: number;
  /** Page title */
  title: string;
  /** Renderer used */
  renderer?:
    | "EJS"
    | "PREACT"
    | "REACT"
    | "VUE"
    | "SVELTE"
    | "HTML"
    | "STRING"
    | "MARKDOWN"
    | "NUNJUCKS"
    | "HANDLEBARS"
    | "PUG"
    | "WEBCOMPONENT";
}

/**
 * View context for standard components.
 * @author Zach Ayers
 */
export interface ViewContext<
  Public extends ComponentPublicData = ComponentPublicData,
  Params extends ComponentParams = ComponentParams
> extends BaseViewContext<Public, Params> {}

/**
 * View context for Preact components.
 * @author Zach Ayers
 */
export interface PreactViewContext<
  Public extends ComponentPublicData = ComponentPublicData,
  Params extends ComponentParams = ComponentParams
> extends BaseViewContext<Public, Params> {
  /** Preact children components */
  children: ComponentChildren;
}

/**
 * View context for React components.
 * @author Zach Ayers
 */
export interface ReactViewContext<
  Public extends ComponentPublicData = ComponentPublicData,
  Params extends ComponentParams = ComponentParams
> extends BaseViewContext<Public, Params> {
  /** React children components */
  children: any; // Using 'any' as a temporary fix for React.ReactNode
}

/**
 * View context for Vue components.
 * @author Zach Ayers
 */
export interface VueViewContext<
  Public extends ComponentPublicData = ComponentPublicData,
  Params extends ComponentParams = ComponentParams
> extends BaseViewContext<Public, Params> {
  /** Vue slots */
  slots: Record<string, any>;
}

/**
 * View context for Svelte components.
 * @author Zach Ayers
 */
export interface SvelteViewContext<
  Public extends ComponentPublicData = ComponentPublicData,
  Params extends ComponentParams = ComponentParams
> extends BaseViewContext<Public, Params> {
  /** Svelte slots */
  slots: Record<string, any>;
}

/**
 * View context for Web Components.
 * @author Zach Ayers
 */
export interface WebComponentViewContext<
  Public extends ComponentPublicData = ComponentPublicData,
  Params extends ComponentParams = ComponentParams
> extends BaseViewContext<Public, Params> {
  /** Web Component slots */
  slots: Record<string, any>;
}
