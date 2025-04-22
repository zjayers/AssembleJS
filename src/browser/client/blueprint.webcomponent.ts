import type { ViewContext } from "../../types/component.context";

/**
 * Base WebComponent adapter for AssembleJS
 * @author Zach Ayers
 */
export const webcomponent = {
  /**
   * Define a custom element for a component
   * @param {string} name - Custom element name (should include hyphen)
   * @param {string} template - HTML template for the component's shadow DOM
   * @param {Record<string, Function>} methods - Methods to add to the component
   * @return {void} - No return value
   */
  define: (
    name: string,
    template: string,
    methods: Record<string, Function> = {}
  ) => {
    if (!customElements.get(name)) {
      /**
       * Custom element class for AssembleJS components
       */
      class AssembleJSElement extends HTMLElement {
        // Shadow DOM for style encapsulation
        shadow: ShadowRoot;

        // Component state
        state: Record<string, any> = {};

        /**
         * Returns an array of attributes to observe for changes
         * @return {string[]} The attributes to observe
         */
        static get observedAttributes() {
          // Return all attributes - the attributeChangedCallback will filter data-* attributes
          return [];
        }

        /**
         * Constructor for the component
         */
        constructor() {
          super();
          this.shadow = this.attachShadow({ mode: "open" });

          // Initialize with template
          this.shadow.innerHTML = template;

          // Initialize state from data attributes
          Array.from(this.attributes).forEach((attr) => {
            if (attr.name.startsWith("data-")) {
              const key = attr.name.replace("data-", "");
              try {
                // Try to parse as JSON if possible
                this.state[key] = JSON.parse(attr.value);
              } catch {
                // Otherwise use the raw string value
                this.state[key] = attr.value;
              }
            }
          });

          // Process component slots if available
          const componentsSlot = this.querySelector(
            'template[data-slot="components"]'
          );
          if (componentsSlot) {
            const componentsData =
              componentsSlot.getAttribute("data-components");
            if (componentsData) {
              try {
                const components = JSON.parse(componentsData);
                Object.entries(components).forEach(([key, value]) => {
                  const slot = document.createElement("div");
                  slot.setAttribute("slot", key);
                  slot.innerHTML = value as string;
                  this.appendChild(slot);
                });
              } catch (error) {
                console.error("Error parsing components data:", error);
              }
            }
          }
        }

        /**
         * Invoked when the custom element is connected to the DOM
         */
        connectedCallback() {
          if (methods.connectedCallback) {
            methods.connectedCallback.call(this);
          }
        }

        /**
         * Invoked when the custom element is disconnected from the DOM
         */
        disconnectedCallback() {
          if (methods.disconnectedCallback) {
            methods.disconnectedCallback.call(this);
          }
        }

        /**
         * Invoked when one of the custom element's attributes is changed
         * @param {string} name - Name of the attribute that changed
         * @param {string} oldValue - Previous value of the attribute
         * @param {string} newValue - New value of the attribute
         */
        attributeChangedCallback(
          name: string,
          oldValue: string,
          newValue: string
        ) {
          // Handle data-* attributes by updating state
          if (name.startsWith("data-")) {
            const key = name.replace("data-", "");
            let value = newValue;

            // Try to parse JSON if it's a JSON string
            try {
              value = JSON.parse(newValue);
            } catch {}

            this.state[key] = value;
            this.render();
          }

          // Call custom handler if provided
          if (methods.attributeChangedCallback) {
            methods.attributeChangedCallback.call(
              this,
              name,
              oldValue,
              newValue
            );
          }
        }

        /**
         * Updates the component's state and triggers a re-render
         * @param {Record<string, any>} updates - Object containing state updates
         */
        setState(updates: Record<string, any>) {
          this.state = { ...this.state, ...updates };
          this.render();
        }

        /**
         * Renders the component based on its current state
         */
        render() {
          if (methods.render) {
            methods.render.call(this);
          }
        }
      }

      // Add any additional methods to the prototype
      Object.entries(methods).forEach(([key, method]) => {
        if (
          ![
            "connectedCallback",
            "disconnectedCallback",
            "attributeChangedCallback",
            "render",
          ].includes(key)
        ) {
          (AssembleJSElement.prototype as any)[key] = method;
        }
      });

      // Define the custom element
      customElements.define(name, AssembleJSElement);
      return AssembleJSElement;
    }

    return customElements.get(name);
  },

  /**
   * Bootstrap a Web Component with the current context
   * @param {string} elementName - The name of the custom element
   * @param {string} template - HTML template for the component
   * @param {ViewContext} context - The current context
   */
  bootstrap: (
    elementName: string,
    template: string,
    context: ViewContext
  ): void => {
    // Check if component has already been defined
    if (customElements.get(elementName)) {
      // Custom element already defined, just update the instance if needed
      const instance = document.querySelector(elementName);
      if (instance) {
        // The setState method is added at runtime but TypeScript doesn't know about it
        const element = instance as any;
        if (typeof element.setState === "function") {
          element.setState(context.data || {});
        }
      }
      return;
    }

    // Define default methods for the component
    const methods = {
      connectedCallback() {
        console.log(`Web component connected: ${elementName}`);
        // Initialize with context data
        if (context.data) {
          // Use setTimeout to ensure setState is available after full initialization
          setTimeout(() => {
            // We know the actual instance will have setState method
            // but TypeScript doesn't know about methods added to the prototype
            (this as any).setState(context.data);
          }, 0);
        }
      },
      disconnectedCallback() {
        console.log(`Web component disconnected: ${elementName}`);
      },
    };

    // Define the custom element
    webcomponent.define(elementName, template, methods);
  },

  /**
   * Render an imported component's content into a slot
   * @param {string} componentName - The name of the component to render
   * @param {string} slotName - The name of the slot to render into
   * @param {ViewContext} context - The current context
   * @return {void} - No return value
   */
  component: (
    componentName: string,
    slotName: string,
    context: ViewContext
  ): HTMLElement => {
    const componentContent = context?.components?.[componentName];

    // Create a slot container
    const slot = document.createElement("div");
    slot.setAttribute("slot", slotName);

    // Handle case where component is undefined or not a buffer
    if (!componentContent) {
      console.warn(`Component '${componentName}' not found in context`);
      slot.innerHTML = `<div class="__assemblejs_missing_component" 
        style="border: 1px dashed #f44336; padding: 10px; margin: 5px 0; color: #f44336;">
        Component '${componentName}' not found
      </div>`;
      return slot;
    }

    // Convert buffer to string safely
    try {
      slot.innerHTML =
        typeof componentContent.toString === "function"
          ? componentContent.toString("utf8")
          : String(componentContent);
    } catch (error) {
      console.error(
        `Error converting component '${componentName}' to string:`,
        error
      );
      slot.innerHTML = `<div>Error rendering component '${componentName}'</div>`;
    }

    return slot;
  },
};
