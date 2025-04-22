import type { Blueprint } from "./blueprint.view";
import { getWindow } from "../common/get.window";

/**
 * The main component registry store. Stored on the <code>window</code> object.
 * @author Zach Ayers
 */
declare global {
  interface Window {
    ASSEMBLEJS_CLIENT_REGISTRY: BlueprintClientRegistry;
  }
}

/**
 * The main component registry store. Stored on the <code>window</code> object.
 * @author Zach Ayers
 */
export interface BlueprintClientRegistry {
  components: {
    [id: string]: Blueprint;
  };
}

/**
 * Get the Client Registry singleton from the global window. If one does not exist, create a new singleton.
 * @author Zach Ayers
 * @return {BlueprintClientRegistry} The singleton Client registry instance (stored on the window object)
 * */
export function getAssembleJSClientRegistry(): BlueprintClientRegistry {
  // Get the window object
  const globalWindow = getWindow();

  // Pull the EventManager from the window.
  let assembleJSRegistry = globalWindow.ASSEMBLEJS_CLIENT_REGISTRY;

  // If no EventManager was found, create one.
  if (!assembleJSRegistry) {
    // Create a new Registry, and initialize an empty component map
    assembleJSRegistry = {
      components: {},
    };

    // Set the new Registry on the window object.
    globalWindow.ASSEMBLEJS_CLIENT_REGISTRY = assembleJSRegistry;
  }

  // Return the found (or new) Registry object.
  return assembleJSRegistry;
}
