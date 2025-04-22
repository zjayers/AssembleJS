import { preact, Blueprint, BlueprintClient, events } from "asmbl";
import { Card } from './card.view';

/**
 * Product Card Client
 * 
 * This class handles client-side behavior for the Card component.
 * It includes internationalization support, error handling, and responsive design.
 * 
 * Features:
 * - Error handling with proper user feedback
 * - Responsive design with mobile device detection
 * - Internationalization support
 * - Accessible user interface
 * 
 * @author Zachariah Ayers
 */
export class CardClient extends Blueprint {
  // Track component state
  private mounted = false;
  private resizeObserver?: ResizeObserver;
  private errorHandled = false;
  
  // Track device/viewport information
  private isMobileDevice = false;
  private viewportWidth = 0;
  
  /**
   * Initialize the component when mounted in the DOM
   */
  protected override async onMount(): Promise<void> {
    try {
      super.onMount();
      this.mounted = true;
      
      // Detect device type
      this.detectDeviceType();
      
      // Initialize internationalization if needed
      // await this.initializeI18n();
      
      // Set up responsive handling
      this.setupResponsiveHandling();
      
      // Initialize error handling
      this.setupErrorHandling();
      
      // Bootstrap Preact component
      preact.bootstrap(Card, this.context);
      
      // Notify completion
      events.emit('product.card.ready', { 
        componentId: this.context.id 
      });
    } catch (error) {
      this.handleError(error);
    }
  }
  
  /**
   * Clean up resources when component is unmounted
   */
  protected override onUnmount(): void {
    try {
      super.onUnmount();
      this.mounted = false;
      
      // Remove responsive listener
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      
      // Clean up any other resources, event listeners, etc.
    } catch (error) {
      console.error('Error during unmount:', error);
    }
  }
  
  /**
   * Detect device type and set flags accordingly
   */
  private detectDeviceType(): void {
    // Check if mobile based on user agent
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    this.isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    // Get current viewport size
    this.viewportWidth = window.innerWidth;
    
    // Add mobile-specific class if needed
    if (this.isMobileDevice) {
      this.element.classList.add('mobile-device');
    }
    
    // Add responsive classes based on viewport width
    this.updateResponsiveClasses();
  }
  
  /**
   * Set up responsive handling for window resizing
   */
  private setupResponsiveHandling(): void {
    // Create resize observer if supported
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.viewportWidth = window.innerWidth;
        this.updateResponsiveClasses();
      });
      
      // Observe the component element
      this.resizeObserver.observe(this.element);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', () => {
        this.viewportWidth = window.innerWidth;
        this.updateResponsiveClasses();
      });
    }
  }
  
  /**
   * Update CSS classes based on viewport size
   */
  private updateResponsiveClasses(): void {
    // Remove existing responsive classes
    this.element.classList.remove('viewport-xs', 'viewport-sm', 'viewport-md', 'viewport-lg', 'viewport-xl');
    
    // Add appropriate class
    if (this.viewportWidth < 576) {
      this.element.classList.add('viewport-xs');
    } else if (this.viewportWidth < 768) {
      this.element.classList.add('viewport-sm');
    } else if (this.viewportWidth < 992) {
      this.element.classList.add('viewport-md');
    } else if (this.viewportWidth < 1200) {
      this.element.classList.add('viewport-lg');
    } else {
      this.element.classList.add('viewport-xl');
    }
  }
  
  /**
   * Set up error handling for the component
   */
  private setupErrorHandling(): void {
    // Listen for global errors
    window.addEventListener('error', (event) => {
      // Only handle errors that originated in this component
      if (this.element.contains(event.target as Node)) {
        this.handleError(event.error || new Error('Unknown error occurred'));
        event.preventDefault();
      }
    });
    
    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      // For simplicity, we'll handle all unhandled rejections when the component is mounted
      if (this.mounted && !this.errorHandled) {
        this.handleError(event.reason || new Error('Unhandled promise rejection'));
        event.preventDefault();
      }
    });
  }
  
  /**
   * Handle component errors gracefully
   */
  private handleError(error: unknown): void {
    if (this.errorHandled) return;
    
    console.error(`Error in ${this.constructor.name}:`, error);
    this.errorHandled = true;
    
    // Emit error event that can be captured by analytics
    events.emit('component.error', {
      componentName: 'Product.Card',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
    
    // Display user-friendly error message if component is mounted
    if (this.mounted) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'component-error';
      errorMsg.setAttribute('role', 'alert');
      errorMsg.innerHTML = `
        <h3>Something went wrong</h3>
        <p>We're having trouble displaying this content. Please try refreshing the page.</p>
        <button class="retry-button">Retry</button>
      `;
      
      // Add retry functionality
      const retryButton = errorMsg.querySelector('.retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.errorHandled = false;
          errorMsg.remove();
          this.onMount(); // Attempt to remount
        });
      }
      
      // Insert error message
      this.element.innerHTML = '';
      this.element.appendChild(errorMsg);
    }
  }
  
  /**
   * Initialize internationalization support (example implementation)
   */
  /*
  private async initializeI18n(): Promise<void> {
    // Get user's preferred language
    const userLang = navigator.language || 'en-US';
    
    // Load language resources
    try {
      const response = await fetch(`/api/i18n/${userLang}.json`);
      if (response.ok) {
        const translations = await response.json();
        this.context.i18n = {
          t: (key: string, params?: Record<string, any>) => {
            let text = translations[key] || key;
            if (params) {
              Object.entries(params).forEach(([paramKey, value]) => {
                text = text.replace(`{${paramKey}}`, String(value));
              });
            }
            return text;
          },
          locale: userLang
        };
      }
    } catch (error) {
      console.warn('Failed to load translations:', error);
      // Provide fallback i18n function
      this.context.i18n = {
        t: (key: string) => key,
        locale: 'en-US'
      };
    }
  }
  */
}

BlueprintClient.registerComponentCodeBehind(CardClient);