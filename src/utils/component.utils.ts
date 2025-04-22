/* eslint-disable valid-jsdoc */
import type { ComponentParams } from "../types/component.params";
import type { AnyObject } from "../types/object.any";
import type { ComponentContext } from "../types/component.context";
import type { BlueprintInstance } from "../types/blueprint.simple.types";
import { parse } from "node-html-parser";
import { ASSEMBLEJS } from "../server/config/blueprint.config";
import assert from "assert";
import { randomUUID } from "crypto";
import { HttpError } from "./http.utils";
import { createNamespacedCache } from "./cache.utils";
import { CONSTANTS } from "../constants/blueprint.constants";
import { logger } from "./logger.utils";

/**
 * Resolve the closest parent component container from the given DOM context.
 * @param {unknown} element - The DOM context.
 * @return {{enclosingComponentView: string, enclosingComponentName: string, pathInjector: string}} - The closest component container.
 * @author Zach Ayers
 */
function getEnclosingComponentInfo(element: unknown) {
  // Get the parent component to the passed in element
  const parentComponentContainer = (<HTMLElement>element).closest(
    `[class^=${ASSEMBLEJS.componentClassIdentifier}]`
  );

  // Fetch the name of the enclosing component
  const enclosingComponentName = (<HTMLElement>(
    (<unknown>parentComponentContainer)
  ))?.getAttribute(ASSEMBLEJS.componentNameIdentifier);

  // Fetch the view of the enclosing component
  const enclosingComponentView = (<HTMLElement>(
    (<unknown>parentComponentContainer)
  ))?.getAttribute(ASSEMBLEJS.componentViewIdentifier);

  const enclosingComponentUrl = (<HTMLElement>(
    (<unknown>parentComponentContainer)
  ))?.getAttribute(ASSEMBLEJS.componentUrlIdentifier);

  return {
    enclosingComponentName,
    enclosingComponentView,
    pathInjector:
      enclosingComponentUrl ??
      `/${enclosingComponentName}/${enclosingComponentView}/`,
  };
}

/**
 * At a Blueprint level, apply AssembleJS specific HTML mutations before sending to the client.
 * @param {string | Buffer} template - The template to be mutated.
 * @param {ComponentContext<AnyObject, AnyObject, ComponentParams>} context - The context of the current view.
 * @todo optimize, optimize, optimize
 * @todo Zach Ayers - This is where the magic happens. Here we take in the HTML template before it is sent to the browser.
 * @todo Currently this ONLY OCCURS at the BLUEPRINT level to avoid unnecessary DOM processing.
 * @todo I would like to refactor and optimize this section to perform all 'mutation' tasks before a user receives our HTML.
 * @returns {string} - The HTML template with all necessary DOM mutations.
 * @author Zach Ayers
 */
/**
 * Adds a property to the component's hydration data that will be accessible in the client.
 * @param {ComponentContext<ComponentPublicData, ComponentParams>} context - The context to add the data to.
 * @param {string} key - The key to add the data under.
 * @param {any} value - The value to add to hydration data.
 * @param {boolean} overwrite - Whether or not to overwrite existing data.
 * @return {Record<string, unknown>} - The record with the new item added.
 * @throws {Error} - If the key is already set and overwrite is false.
 * @author Zach Ayers
 */
export function addToHydration(
  context: ComponentContext<AnyObject, ComponentParams>,
  key: string,
  value: any,
  overwrite = false
): Record<string, unknown> {
  // Cast data to a regular object to ensure type compatibility
  const dataRecord = context.data as unknown as Record<string, unknown>;

  // If the key is already set and overwrite is false, throw an error
  if (key in dataRecord && !overwrite) {
    throw new Error(`${key} is already set in the context.data.`);
  }

  // Set the value in the data record
  dataRecord[key] = value;

  return dataRecord;
}

/**
 * Fetches data securely with standardized error handling
 * @param fetchFunction - The async function that performs the fetch operation
 * @param errorMessage - Custom error message if fetch fails
 * @return Promise resolving to the fetch result
 * @throws HttpError with appropriate status code and details
 */
export async function safeFetch<T>(
  fetchFunction: () => Promise<T>,
  errorMessage = "Failed to fetch data"
): Promise<T> {
  try {
    return await fetchFunction();
  } catch (err) {
    // Type guard for Axios errors
    const error = err as {
      response?: {
        status?: number;
        data?: unknown;
      };
      request?: unknown;
      config?: {
        url?: string;
      };
      message?: string;
      stack?: string;
    };

    // Handle axios errors specifically
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls outside the range of 2xx
      throw new HttpError(errorMessage, error.response.status || 500, {
        details: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // The request was made but no response was received
      throw new HttpError("Request timed out or no response received", 408, {
        url: error.config?.url,
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new HttpError(errorMessage, 500, {
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
}

/**
 * Renders a component with comprehensive error handling
 * @param renderFunction - The async function that performs the render operation
 * @param context - The component context
 * @param fallbackTemplate - Optional fallback template to use in case of an error
 * @return Promise resolving to the render result
 */
export async function safeRender<T>(
  renderFunction: (
    context: ComponentContext<AnyObject, ComponentParams>
  ) => Promise<T>,
  context: ComponentContext<AnyObject, ComponentParams>,
  fallbackTemplate?: string
): Promise<T | string> {
  try {
    return await renderFunction(context);
  } catch (err) {
    // Type guard for Error
    const error = err as Error;

    // Log the error
    console.error(
      `Render error for ${context.componentName}/${context.viewName}:`,
      error
    );

    // If we're in development mode, return detailed error information
    if (process.env.NODE_ENV === "development") {
      return `
        <div style="border: 2px solid #ff5757; background: #fff0f0; padding: 20px; margin: 20px 0; border-radius: 4px; font-family: sans-serif;">
          <h2 style="color: #d32f2f; margin-top: 0;">Rendering Error in ${
            context.componentName
          }/${context.viewName}</h2>
          <p style="font-weight: bold;">${error.message || "Unknown error"}</p>
          <pre style="background: #f5f5f5; padding: 15px; overflow: auto; border-radius: 4px;">${
            error.stack || ""
          }</pre>
        </div>
      `;
    }

    // For production, return a minimal error or fallback
    return (
      fallbackTemplate ||
      `
      <div data-assemblejs-error="true" style="padding: 10px;">
        <p>Error rendering component</p>
      </div>
    `
    );
  }
}

/**
 * Mutate the blueprint to add required information.
 */
export function mutateBlueprint(
  template: string | Buffer,
  context: ComponentContext<AnyObject, ComponentParams>
): string {
  const parsedTemplate = parse(template.toString());
  // Get all Component class sections
  const foundComponentIds: Set<string> = new Set();
  const updatableComponentIds: Set<string> = new Set();
  const serverUrl = new URL(context.serverUrl);
  const clientBundleSrc =
    serverUrl.protocol +
    "//" +
    serverUrl.hostname +
    (serverUrl.port !== undefined ? ":" + serverUrl.port : "") +
    "/bundles/asmbl.client.bundle.js";
  let skipComponentLevelManipulation = false;

  const clientBundleScript = `<script src="${clientBundleSrc}" defer></script>`;

  // Look at the HTML, re-generate any duplicate IDs
  // TODO: Speed up the performance below / reduce time complexity
  // TODO: parsedTemplate is stored in memory and must be re-parsed at certain sections
  // TODO: This is an expensive operation and should be optimized if possible
  // TODO: Build a default HTML page if one does not exist
  // TODO: The set_content function seems to be the best way to update on the fly.
  //  Refactor to use this set_content pattern
  const components = parsedTemplate.querySelectorAll(
    `[class^=${ASSEMBLEJS.componentClassIdentifier}]`
  );

  // Set the top level data pointer
  const topLevelScripts = parsedTemplate.querySelectorAll("script");
  const topLevelStyles = parsedTemplate.querySelectorAll("link");
  [...topLevelScripts, ...topLevelStyles].forEach((element) => {
    if (element.getAttribute("src") !== undefined) {
      element.setAttribute("defer", "");
    }
    element.setAttribute(ASSEMBLEJS.componentDataIdentifier, context.id!);
  });

  // Find Component IDs that need updates
  // TODO: REDUCE TIME COMPLEXITY HERE, SEE COMMENT AT TOP OF FUNCTION BLOCK -
  //  WATCH OUT FOR ELEMENTS NOT UPDATING DURING COMBINED LOOPS -
  //  THE ORIGINAL `parsedElement` MUST BE RE-QUERIED FOR LIVE UPDATES DURING LOOPS.
  //  THERE IS LIKELY A GOOD WAY AROUND THIS, WE WILL NEED TO DISCUSS.
  components.forEach((component) => {
    // Get the ID of the component
    const elementId = component.getAttribute(ASSEMBLEJS.componentIdIdentifier);

    // Every component/blueprint will get a generated ID, this is a safety guard
    assert(elementId, "Component element must have an ID!");

    // If we've seen the ID before, add it to the update set
    if (foundComponentIds.has(elementId)) {
      updatableComponentIds.add(elementId);
    } else {
      foundComponentIds.add(elementId);
    }

    // Main Component Element Selectors
    const componentScripts = component.querySelectorAll("script");
    const componentLinks = component.querySelectorAll("link");

    // Update Component Script attributes
    componentScripts.forEach((script) => {
      const { pathInjector } = getEnclosingComponentInfo(script);
      const currentSrc = script?.getAttribute("src");

      // If a src exists, we have a fetchable script, if not, it is inline
      if (currentSrc !== undefined && !currentSrc?.includes(pathInjector)) {
        // Set defer so the script loads in the background and fires once the dom is loaded
        script?.setAttribute("defer", "");
        // Update the path to point to the corresponding component
        script?.setAttribute("src", `${pathInjector}${currentSrc}`);
      }
      // Add the association pointer
      script?.setAttribute(
        ASSEMBLEJS.componentDataIdentifier,
        <string>elementId
      );
    });

    // Update Link attributes
    componentLinks.forEach((link) => {
      const { pathInjector } = getEnclosingComponentInfo(link);
      const currentHref = link?.getAttribute("href");

      // Add the association pointer
      link?.setAttribute(ASSEMBLEJS.componentDataIdentifier, <string>elementId);

      // Update the path to point to the corresponding component
      if (currentHref !== undefined && !currentHref?.includes(pathInjector)) {
        link?.setAttribute(
          "href",
          `${pathInjector}${link.getAttribute("href")}`
        );
      }
    });
  });

  // Update component IDs where needed
  // TODO: REDUCE TIME COMPLEXITY HERE, SEE COMMENT AT TOP OF FUNCTION BLOCK
  //  WATCH OUT FOR ELEMENTS NOT UPDATING DURING COMBINED LOOPS -
  //  THE ORIGINAL `parsedElement` MUST BE RE-QUERIED FOR LIVE UPDATES DURING LOOPS.
  //  THERE IS LIKELY A GOOD WAY AROUND THIS, WE WILL NEED TO DISCUSS.
  updatableComponentIds.forEach((id) => {
    const updateableId = id;
    const duplicates = parsedTemplate.querySelectorAll(`[id=${updateableId}]`);

    // It is possible to have many of the same component on one page, sanitize their IDs accordingly
    // TODO: Optimize this, there are WAY too many loops in this section.
    //  This will be revisited at a later date.
    if (duplicates.length) {
      duplicates.forEach((duplicate) => {
        const newElementId = randomUUID();
        duplicate.setAttribute(ASSEMBLEJS.componentIdIdentifier, newElementId);
        duplicate.setAttribute(
          ASSEMBLEJS.componentDataIdentifier,
          newElementId
        );
        const oldElementRegex = new RegExp(updateableId, "gi");
        duplicate.innerHTML = duplicate.innerHTML.replace(
          oldElementRegex,
          newElementId
        );
      });
    }
  });

  // Move Elements where they belong
  // TODO: REDUCE TIME COMPLEXITY HERE, SEE COMMENT AT TOP OF FUNCTION BLOCK
  //  WATCH OUT FOR ELEMENTS NOT UPDATING DURING COMBINED LOOPS -
  //  THE ORIGINAL `parsedElement` MUST BE RE-QUERIED FOR LIVE UPDATES DURING LOOPS.
  //  THERE IS LIKELY A GOOD WAY AROUND THIS, WE WILL NEED TO DISCUSS.
  // If no body tag exists, add it
  let body = parsedTemplate.querySelector("body");
  if (!body) {
    skipComponentLevelManipulation = true;
    parsedTemplate.set_content(
      `<body id="${context.id}" class="${ASSEMBLEJS.componentClassIdentifier} ${context.viewName} ${context.componentName}">${parsedTemplate.innerHTML}</body>`
    );
    body = parsedTemplate.querySelector("body");
  }

  // If no head tag exists, add it
  let head = parsedTemplate.querySelector("head");
  if (!head) {
    skipComponentLevelManipulation = true;
    parsedTemplate.set_content(
      `<html lang="en"><head><title>${context.title}</title></head>${parsedTemplate.innerHTML}</html>`
    );
    head = parsedTemplate.querySelector("head");
  }

  if (!skipComponentLevelManipulation) {
    body?.querySelectorAll("script").forEach((script) => {
      const id = script.getAttribute(ASSEMBLEJS.componentDataIdentifier);
      if (id !== undefined) {
        const scriptScr = script.getAttribute("src");
        script.remove();

        // If the script has no source, move it to the bottom of the body tag
        if (scriptScr === undefined) {
          body?.appendChild(script);
        } else {
          if (id === context.id) {
            head?.insertAdjacentHTML("afterbegin", script.outerHTML);
          } else {
            head?.appendChild(script);
          }
        }
      }
    });
    body?.querySelectorAll("link").forEach((link) => {
      const id = link.getAttribute(ASSEMBLEJS.componentDataIdentifier);
      if (id !== undefined) {
        const linkHref = link.getAttribute("href");

        // Clean up the pointer identifier as it is likely not needed here
        link.removeAttribute(ASSEMBLEJS.componentDataIdentifier);
        link.remove();

        // If the link has an href, move it to the head element.
        if (linkHref !== undefined) {
          head?.appendChild(link);
        }
      }
    });
  }

  // Inject the top level component data into the body tag
  body?.setAttribute(ASSEMBLEJS.componentIdIdentifier, context.id ?? "");
  body?.classList.add(ASSEMBLEJS.componentClassIdentifier);
  body?.classList.add(context.viewName);
  body?.classList.add(context.componentName);

  // Inject the client library
  head?.set_content(`${clientBundleScript}${head?.innerHTML}`);

  // TODO internal script and styles for Preact are not getting removed
  // The reappear as the script and links set in the template
  // Narrow down where this is flowing through and sanitize it

  return parsedTemplate.toString();
}

// Logger for cache operations
const log = logger(`${CONSTANTS.defaultLoggerClassName}:component-utils`);

/**
 * Get the cache for a specific component
 * @param componentId The component ID to get the cache for
 * @return A namespaced cache for the component
 */
export function getComponentCache<T = any>(componentId: string) {
  return createNamespacedCache<T>(`component:${componentId}`);
}

/**
 * Cache a rendered component
 * @param server The server instance
 * @param componentId The component ID
 * @param content The rendered content
 * @param ttl Optional time-to-live in milliseconds
 */
export function cacheRenderedComponent(
  server: BlueprintInstance,
  componentId: string,
  content: string,
  ttl?: number
): void {
  if (!server.caches) {
    // Caching not enabled
    return;
  }

  const cacheKey = `component:${componentId}`;
  server.caches.renderedView.set(cacheKey, content, { maxAge: ttl });
  log.debug(`Cached rendered component: ${componentId}`);
}

/**
 * Get a cached rendered component
 * @param server The server instance
 * @param componentId The component ID
 * @return The cached content or undefined if not found
 */
export function getCachedRenderedComponent(
  server: BlueprintInstance,
  componentId: string
): string | undefined {
  if (!server.caches) {
    // Caching not enabled
    return undefined;
  }

  const cacheKey = `component:${componentId}`;
  const cached = server.caches.renderedView.get(cacheKey);

  if (cached) {
    log.debug(`Cache hit for rendered component: ${componentId}`);
  }

  return cached;
}

/**
 * Check if a URL is for a static asset
 * @param url The URL to check
 * @return True if the URL is for a static asset
 */
export function isStaticAsset(url: string): boolean {
  const staticExtensions = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
  ];

  return staticExtensions.some((ext) => url.endsWith(ext));
}
