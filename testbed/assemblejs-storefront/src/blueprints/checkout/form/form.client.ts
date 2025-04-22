import { Blueprint, BlueprintClient } from "asmbl";
import type { ComponentContext } from "asmbl";

export class CheckoutForm extends Blueprint<{}, {}> {
  constructor(context: ComponentContext) {
    super(context);
    
    // DOM is ready, component is mounted
    this.onReady(() => {
      // Svelte component will already be server-rendered
      const componentRoot = document.querySelector('.checkout-form');
      if (componentRoot) {
        // Handle events, lifecycle, etc.
        this.events.on('checkout.form.update', (data) => {
          // Handle update event
          console.log('Component updated with data:', data);
        });
      }
    });
  }
}

// Register the client-side behavior with AssembleJS
BlueprintClient.registerComponentCodeBehind(CheckoutForm);