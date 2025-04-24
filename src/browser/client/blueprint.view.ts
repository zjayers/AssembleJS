import type { BlueprintEvent } from "../eventing/blueprint.event";
import type { ComponentPublicData } from "../../types/component.simple.types";
import type { ComponentParams } from "../../types/component.params";
import type {
  EMPTY_NODE_PARAM,
  EMPTY_NODE_PARAMS,
  ViewContext,
} from "../../types/component.context";
import { CONSTANTS } from "../../constants/blueprint.constants";
import axios, { AxiosInstance } from "axios";
import {
  EventBus,
  EventListener,
  ViewEventAdapter,
} from "../eventing/event.bus";

/**
 * Base view constructor for a Component in the browser.
 * @description This is the base class for all views in the browser.
 * @author Zachariah Ayers
 * @category Browser
 */
export type BlueprintConstructor<
  Public extends ComponentPublicData = EMPTY_NODE_PARAM,
  Params extends ComponentParams = EMPTY_NODE_PARAMS
> = new (idSelector: string) => Blueprint<Public, Params>;

/**
 * Blueprint is the base class for all views in the browser.
 * @description This is the base class for all views in the browser.
 * @author Zachariah Ayers
 * @category Browser
 * @public
 */
export abstract class Blueprint<
  Public extends ComponentPublicData = EMPTY_NODE_PARAM,
  Params extends ComponentParams = EMPTY_NODE_PARAMS
> implements ViewEventAdapter
{
  /**
   * The eventing interface for this view. This is auto-wired and should not be used directly.
   * @description Use the <code>this.events</code> getter to access the eventing interface for this view.
   * @type {EventBus} - The event bus for this view.
   * @private
   */
  private readonly _events: EventBus = new EventBus();
  /**
   * The api interface for this view. This is auto-wired and should not be used directly.
   * @description Use the <code>this.api</code> getter to access the api interface for this view.
   * @type {AxiosInstance} - The api interface for this view.
   * @private
   */
  private readonly _api: AxiosInstance;
  /**
   * The root element of this view. This is auto-wired and should not be used directly.
   * @description Use the <code>this.root</code> getter to access the root element of this view.
   * @type {HTMLElement} - The root element of this view.
   * @private
   */
  private readonly _root: HTMLElement;
  /**
   * The context (hydration data) for this view. This is any public data and information from the Server side that is needed to render this view.
   * @description Use the <code>this.context</code> getter to access the context for this view.
   * @type {ViewContext<Public, Params>} - The context for this view.
   * @private
   */
  private _context: ViewContext<Public, Params>;

  /**
   * Base view constructor
   * @param {string} idSelector - The id selector for the root element of this view.
   * @throws {Error} - If the root element or data payload cannot be found
   * @author Zachariah Ayers
   */
  constructor(idSelector: string) {
    // Initialize with proper default objects that satisfy minimum interface requirements
    this._root = document.createElement("div"); // Create a real DOM element instead of casting
    // Initialize with an empty context - will be properly filled in during hydration
    this._context = {
      id: "",
      componentName: "unknown",
      viewName: "unknown",
      nestLevel: 0,
      renderAsBlueprint: false,
      deviceType: "DESKTOP",
      serverUrl: window.location.href,
      data: {} as Public, // Use the type parameter directly
      components: {},
      params: {} as Params, // Use the type parameter directly
      title: document.title || "AssembleJS Application",
    }; // No need for type assertion when properly initialized
    // Create a minimal axios-compatible instance
    // Create a placeholder API client that will be replaced with a real one
    // We don't initialize it with a real AxiosInstance yet to avoid unnecessary initialization
    this._api = null as unknown as AxiosInstance;

    // Get the root element from the DOM
    const root = document.getElementById(idSelector);

    // If no root was found, show an error and return
    if (!root) {
      console.error(`Error: Unable to locate element with id ${idSelector}`);
      this.renderErrorMessage(
        document.body,
        `Unable to locate element with id "${idSelector}"`,
        "Component cannot be mounted"
      );
      return;
    }

    // Set the root element
    this._root = root;

    // Get the corresponding script payload for this face
    const dataPayload = document.getElementById(
      CONSTANTS.dataIdPrefix + idSelector
    );

    // If no payload was found, show error and return
    if (!dataPayload) {
      console.error(
        `Error: Unable to locate component data payload for ${idSelector}`
      );
      this.renderErrorMessage(
        root,
        `Unable to locate data payload for component "${idSelector}"`,
        "Component hydration failed"
      );
      return;
    }

    const textContent = dataPayload.textContent ?? "{}";
    // Remove the data script, to clean up the DOM
    dataPayload.remove();

    // Parse and Load the script into context with error handling
    try {
      this._context = JSON.parse(textContent) as ViewContext<Public, Params>;
    } catch (error) {
      console.error(`Error parsing context data for ${idSelector}:`, error);
      this.renderErrorMessage(
        root,
        `Error parsing context data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "Component hydration failed"
      );
      return;
    }

    // Setup the API pointer for this face
    // Remove last two parts of serverUrl so we get the base route to the server
    const apiUrl = this.context.serverUrl.split("/").slice(0, -3).join("/");
    this._api = axios.create({
      baseURL: apiUrl,
      withCredentials: true,
    });

    // TODO: use already listeners if possible, this will cut down on listener/event emitter warnings
    // Bind Listeners
    this._events.subscribe(
      {
        channel: CONSTANTS.eventingGlobalChannel,
        topic: CONSTANTS.eventingGlobalTopic,
      },
      this.onMessage.bind(this)
    );

    if (this.context.renderAsBlueprint) {
      this._events.subscribe(
        {
          channel: CONSTANTS.eventingGlobalBlueprintChannel,
          topic: CONSTANTS.eventingGlobalTopic,
        },
        this.onMessage.bind(this)
      );
    } else {
      this._events.subscribe(
        {
          channel: CONSTANTS.eventingGlobalComponentChannel,
          topic: CONSTANTS.eventingGlobalTopic,
        },
        this.onMessage.bind(this)
      );
    }

    this.onMount();
  }

  /**
   * Get the context for this view.
   * @return {ViewContext<Public, Params>} The context for this view.
   * @public
   * @author Zachariah Ayers
   */
  public get context(): ViewContext<Public, Params> {
    return this._context;
  }

  /**
   * Get the root element for this view.
   * @return {HTMLElement | undefined} The root element for this view.
   * @public
   * @author Zachariah Ayers
   */
  public get root(): HTMLElement | undefined {
    return this._root;
  }

  /**
   * Get the scoped api interface for this view.
   * @return {AxiosInstance} The scoped api interface for this view.
   * @public
   * @author Zachariah Ayers
   */
  public get api(): AxiosInstance {
    return this._api;
  }

  /** @inheritDoc */
  public toComponents<Payload, Response = Payload>(
    payload: Payload,
    topic?: string
  ): BlueprintEvent<Response> {
    return this._events.publish({
      payload,
      topic: topic ?? CONSTANTS.eventingGlobalTopic,
      channel: CONSTANTS.eventingGlobalComponentChannel,
    }) as unknown as BlueprintEvent<Response>;
  }

  /** @inheritDoc */
  public toBlueprint<Payload, Response = Payload>(
    payload: Payload,
    topic?: string | undefined
  ): BlueprintEvent<Response> {
    return this._events.publish({
      payload,
      topic: topic ?? CONSTANTS.eventingGlobalTopic,
      channel: CONSTANTS.eventingGlobalBlueprintChannel,
    }) as unknown as BlueprintEvent<Response>;
  }

  /** @inheritDoc */
  public toAll<Payload, Response = Payload>(
    payload: Payload,
    topic?: string | undefined
  ): BlueprintEvent<Response> {
    return this._events.publish({
      payload,
      topic: topic ?? CONSTANTS.eventingGlobalTopic,
      channel: CONSTANTS.eventingGlobalChannel,
    }) as unknown as BlueprintEvent<Response>;
  }

  /**
   * Subscribe to a topic on a channel.
   * @template Payload - The type of the payload
   * @template Response - The type of the expected response
   * @param {string} channel - The channel to subscribe to.
   * @param {string} topic - The topic to subscribe to.
   * @param {EventListener} listener - The listener to subscribe to the topic.
   * @return {void}
   * @author Zachariah Ayers
   */
  public subscribe<Payload, Response>(
    channel: string,
    topic: string,
    listener: EventListener
  ): void {
    this._events.subscribe(
      {
        channel,
        topic,
      },
      listener
    );
  }

  /**
   * This method will fire anytime <strong>subscribed</strong> event is received.
   * @description If this view is not subscribed to the particular channel and topic, it will not receive the event. Components subscribe to the 'all', 'component', and 'blueprint' channels by default.
   * @template P - The type of the message payload
   * @param {BlueprintEvent<P>} message - The event message
   * @return {void}
   * @protected
   * @author Zachariah Ayers
   */
  protected onMessage<P = unknown>(message: BlueprintEvent<P>): void {}

  /**
   * Clean up this view's resources - especially event listeners
   * This method should be called when the view is no longer needed
   * to prevent memory leaks from event listener accumulation
   * @return {void}
   * @public
   * @author Zachariah Ayers
   */
  public dispose(): void {
    // Unsubscribe from all event listeners to prevent memory leaks
    this._events.unsubscribe(
      {
        channel: CONSTANTS.eventingGlobalChannel,
        topic: CONSTANTS.eventingGlobalTopic,
      },
      this.onMessage.bind(this)
    );

    if (this.context.renderAsBlueprint) {
      this._events.unsubscribe(
        {
          channel: CONSTANTS.eventingGlobalBlueprintChannel,
          topic: CONSTANTS.eventingGlobalTopic,
        },
        this.onMessage.bind(this)
      );
    } else {
      this._events.unsubscribe(
        {
          channel: CONSTANTS.eventingGlobalComponentChannel,
          topic: CONSTANTS.eventingGlobalTopic,
        },
        this.onMessage.bind(this)
      );
    }

    // Clear any other resources or references that could cause memory leaks
    // Note: We keep references to root and context for potential serialization
  }

  /**
   * Renders an error message in the specified container
   * @param {HTMLElement} container - The HTML element to render the error message in
   * @param {string} message - The error message to display
   * @param {string} title - The title of the error message
   * @return {void}
   * @private
   * @author Zachariah Ayers
   */
  private renderErrorMessage(
    container: HTMLElement,
    message: string,
    title: string
  ): void {
    const errorElement = document.createElement("div");
    errorElement.style.border = "2px solid #ff5757";
    errorElement.style.background = "#fff0f0";
    errorElement.style.padding = "12px";
    errorElement.style.margin = "10px 0";
    errorElement.style.borderRadius = "4px";
    errorElement.style.fontFamily = "sans-serif";
    errorElement.setAttribute("data-assemblejs-error", "true");

    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.style.color = "#d32f2f";
    titleElement.style.margin = "0 0 8px 0";

    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageElement.style.margin = "0";

    errorElement.appendChild(titleElement);
    errorElement.appendChild(messageElement);

    // If the container already has content, prepend the error
    // otherwise just append it
    if (container.firstChild) {
      container.insertBefore(errorElement, container.firstChild);
    } else {
      container.appendChild(errorElement);
    }
  }

  /**
   * This method will fire when the view is mounted.
   * @description Any post-mount actions should be done here.
   * @return {void}
   * @protected
   * @author Zachariah Ayers
   */
  protected onMount() {
    const identifierText = this.context.renderAsBlueprint
      ? "%c[Blueprint]  "
      : "%c[Component]";
    const identifierColor = this.context.renderAsBlueprint
      ? CONSTANTS.branding.blue
      : CONSTANTS.branding.green;

    let rendererColor = "default";
    switch (this.context.renderer) {
      case "EJS":
        rendererColor = CONSTANTS.branding.puse;
        break;
      case "PREACT":
        rendererColor = CONSTANTS.branding.purple;
        break;
      case "HTML":
        rendererColor = CONSTANTS.branding.orange;
        break;
      case "STRING":
        rendererColor = CONSTANTS.branding.yellow;
        break;
      case "MARKDOWN":
        rendererColor = CONSTANTS.branding.gold;
        break;
      default:
        console.warn(
          `No Renderer color was found for: '${this.context.renderer}'. Please reach out to an AssembleJS developer so they may add one to the framework in class: 'Blueprint'.`
        );
        break;
    }

    console.groupCollapsed(
      "🔔 " +
        identifierText +
        " %c" +
        "[" +
        this.context.renderer +
        "] %c" +
        this.context.componentName +
        "." +
        this.context.viewName,
      `color:${identifierColor}`,
      `color:${rendererColor}`,
      "color:default"
    );
    this.checkNestLevel();
    console.info("Extend this view's `onMount` method to get started!");
    console.info(this);
    console.groupEnd();
  }

  /**
   * Components should not be nested too deeply, this can have poor performance implications.
   * @description If the nest level is too deep, a warning will be logged to the browser console.
   * @private
   * @author Zachariah Ayers
   * @return {void}
   */
  private checkNestLevel() {
    if (this.context.nestLevel > 1) {
      console.warn(
        `${this.context.componentName} | ${this.context.viewName} : Nest level of '${this.context.nestLevel}' is not recommended! The deeper you nest your components, the slower the application's performance may become.`
      );
    }
  }
}
