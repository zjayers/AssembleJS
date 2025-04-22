import type { BlueprintConstructor } from "./blueprint.view";
import { CONSTANTS } from "../../constants/blueprint.constants";
import {
  getAssembleJSClientRegistry,
  BlueprintClientRegistry,
} from "./blueprint.client.registry";

/**
 * Main AssembleJS Client Entrypoint.
 * @description This class serves as the primary client-side entry point for AssembleJS.
 * It manages the registration of component code-behind classes, maintains the client registry,
 * and provides core client-side functionality. This entrypoint is bundled and provided
 * to the browser by the top-most blueprint in the component hierarchy.
 *
 * @example
 * ```typescript
 * // Register a component's client-side code
 * import { Blueprint, BlueprintClient } from "asmbl";
 *
 * export class MyComponent extends Blueprint {
 *   protected override onMount(): void {
 *     super.onMount();
 *     console.log("MyComponent mounted");
 *   }
 * }
 *
 * BlueprintClient.registerComponentCodeBehind(MyComponent);
 * ```
 *
 * @category (Client)
 * @author Zachariah Ayers
 */
export class BlueprintClient {
  /**
   * Has the welcome banner been printed?
   * @type {boolean}
   * @private
   */
  private static _loaded = false;

  /**
   * Get the BlueprintClientRegistry singleton from the global window.
   * If a registry doesn't already exist in the global scope, this method will
   * initialize a new one. This ensures there's always a single, consistent
   * registry available for component management.
   *
   * @return {BlueprintClientRegistry} The singleton instance of the client registry
   * @example
   * ```typescript
   * // Get the registry to access registered components
   * const registry = BlueprintClient.getBlueprintClientRegistry();
   * const componentCount = Object.keys(registry.components).length;
   * console.log(`There are ${componentCount} registered components`);
   * ```
   */
  public static getBlueprintClientRegistry(): BlueprintClientRegistry {
    return getAssembleJSClientRegistry();
  }

  /**
   * Register a Blueprint component's client-side code with the global registry.
   * This method associates the component's code-behind class with its DOM element
   * by using the data attribute that identifies the component. It automatically
   * initializes the component and manages its lifecycle.
   *
   * @param {BlueprintConstructor} constructor - The Blueprint constructor class to register.
   * @example
   * ```typescript
   * // Create and register a component with event handling
   * export class NavBarComponent extends Blueprint {
   *   protected override onMount(): void {
   *     super.onMount();
   *
   *     // Add click event listener to a button
   *     const menuButton = document.getElementById('menu-toggle');
   *     if (menuButton) {
   *       menuButton.addEventListener('click', this.toggleMenu.bind(this));
   *     }
   *   }
   *
   *   private toggleMenu(): void {
   *     const menu = document.getElementById('main-menu');
   *     if (menu) {
   *       menu.classList.toggle('visible');
   *     }
   *   }
   * }
   *
   * BlueprintClient.registerComponentCodeBehind(NavBarComponent);
   * ```
   */
  public static registerComponentCodeBehind(constructor: BlueprintConstructor) {
    // TODO: do not show this in production - NOTE: Envs are sent to the browser using `import.meta.env.ENV_NAME`
    if (!BlueprintClient._loaded) {
      BlueprintClient.printWelcomeBanner();
      BlueprintClient._loaded = true;
    }

    // Get the current executing script -
    // the script will have a data attribute with a corresponding component id
    const currentExecutor = document.currentScript;

    // Get the component pointer from the script
    const pointerId = currentExecutor?.getAttribute(
      CONSTANTS.componentDataIdentifier
    );

    // If no pointer was found, throw an error and return
    if (!pointerId) {
      console.error("Error: Unable to locate component data pointer!");
      return;
    }

    this.getBlueprintClientRegistry().components[pointerId] = new constructor(
      pointerId
    );
  }

  /**
   * Print the welcome banner to the console.
   * This method displays the AssembleJS branding and welcome message in the browser's
   * console when the first component is registered. It provides a visual indicator
   * that AssembleJS has loaded successfully.
   *
   * @private
   */
  private static printWelcomeBanner() {
    console.log(CONSTANTS.welcomeBanner);

    console.info(
      "/ ~ %cWelcome to AssembleJS!%c ~",
      "color:default",
      "color:default"
    );
    console.info(
      "\\ ~ Below you will find contextual information about registered components ~"
    );
    console.info(CONSTANTS.welcomeBannerConsoleSeparator);
  }
}
