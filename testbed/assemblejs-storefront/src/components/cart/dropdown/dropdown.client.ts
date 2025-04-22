import { Blueprint, BlueprintClient, events, vue } from "asmbl";
import type { ComponentContext } from "asmbl";

// Type definitions for cart items
interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

interface CartUpdateEvent {
  cartItems: CartItem[];
  action: 'add' | 'remove' | 'increment' | 'decrement' | 'clear';
  productId?: string;
}

export class CartDropdown extends Blueprint<{}, {}> {
  private cartItems: CartItem[] = [];
  private vueApp: any = null;
  private cartOpenState = false;
  private clickOutsideHandler: ((e: MouseEvent) => void) | null = null;
  private freeShippingThreshold = 50;
  
  constructor(context: ComponentContext) {
    super(context);
    
    // Initialize component when ready
    this.onReady(() => {
      this.initializeComponent();
    });
  }

  private initializeComponent(): void {
    // Load cart from storage
    this.loadCartFromStorage();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize Vue component
    this.mountVueComponent();
    
    // Set up analytics tracking
    this.setupAnalyticsTracking();
  }

  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      // Reset to empty cart if there's an error
      this.cartItems = [];
    }
  }

  private setupEventListeners(): void {
    // Listen for cart add events
    events.on('cart.add', this.handleCartAdd.bind(this));
    
    // Listen for cart update events
    events.on('cart.update', this.handleCartUpdate.bind(this));
    
    // Listen for checkout events
    events.on('checkout.complete', this.handleCheckoutComplete.bind(this));
    
    // Listen for cart clear events
    events.on('cart.clear', this.handleCartClear.bind(this));
  }

  private mountVueComponent(): void {
    // The Vue component is mounted by AssembleJS during server-side rendering
    // Here we can set up any additional client-side Vue-specific behavior
    
    const componentRoot = document.querySelector('.cart-dropdown');
    if (!componentRoot) return;
    
    // Add additional behavior to the already-mounted Vue component
    this.setupMobileResponsiveness();
  }

  private setupMobileResponsiveness(): void {
    // Handle specific mobile behavior for the cart dropdown
    if (window.innerWidth < 768) {
      // Adjust cart dropdown position for mobile
      const cartContent = document.querySelector('.cart-content');
      if (cartContent) {
        (cartContent as HTMLElement).style.maxHeight = `${window.innerHeight * 0.8}px`;
      }
      
      // Handle window resize
      window.addEventListener('resize', () => {
        const cartContent = document.querySelector('.cart-content');
        if (cartContent) {
          (cartContent as HTMLElement).style.maxHeight = `${window.innerHeight * 0.8}px`;
        }
      });
    }
  }

  private setupAnalyticsTracking(): void {
    // Track cart view events
    document.querySelector('.cart-toggle')?.addEventListener('click', () => {
      if (!this.cartOpenState) {
        // Only track when opening, not closing
        events.emit('analytics.track', {
          event: 'cart_view',
          cartItems: this.cartItems.length,
          cartValue: this.calculateSubtotal()
        });
      }
    });
    
    // Track checkout clicks
    document.querySelector('.checkout-btn')?.addEventListener('click', () => {
      events.emit('analytics.track', {
        event: 'checkout_start',
        cartItems: this.cartItems,
        cartValue: this.calculateSubtotal()
      });
    });
  }

  private handleCartAdd(cartItem: CartItem): void {
    // Check if item already exists in cart
    const existingItemIndex = this.cartItems.findIndex(item => item.productId === cartItem.productId);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      this.cartItems[existingItemIndex].quantity += cartItem.quantity;
    } else {
      // Add new item to cart
      this.cartItems.push({ ...cartItem });
    }
    
    // Update storage
    this.updateCartInStorage();
    
    // Show cart dropdown
    this.setCartOpenState(true);
    
    // Animate cart count badge
    this.animateCartBadge();
    
    // Track add to cart event
    events.emit('analytics.track', {
      event: 'add_to_cart',
      product: cartItem,
      cartValue: this.calculateSubtotal()
    });
  }

  private handleCartUpdate(updateEvent: CartUpdateEvent): void {
    // Update cart items based on event
    this.cartItems = updateEvent.cartItems;
    
    // Update storage
    this.updateCartInStorage();
    
    // Track update event
    events.emit('analytics.track', {
      event: 'cart_update',
      action: updateEvent.action,
      productId: updateEvent.productId,
      cartValue: this.calculateSubtotal()
    });
  }

  private handleCheckoutComplete(): void {
    // Clear cart after successful checkout
    this.cartItems = [];
    this.updateCartInStorage();
    
    // Close cart dropdown
    this.setCartOpenState(false);
    
    // Show success notification
    this.showNotification('Order placed successfully!', 'success');
  }

  private handleCartClear(): void {
    // Clear cart
    this.cartItems = [];
    this.updateCartInStorage();
    
    // Show notification
    this.showNotification('Cart cleared', 'info');
  }

  private updateCartInStorage(): void {
    try {
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
      
      // Update cart count in UI
      this.updateCartCount();
      
      // Update subtotal in UI
      this.updateSubtotal();
    } catch (error) {
      console.error('Error updating cart in storage:', error);
    }
  }

  private setCartOpenState(isOpen: boolean): void {
    this.cartOpenState = isOpen;
    
    // Toggle class on cart dropdown element
    const cartDropdown = document.querySelector('.cart-dropdown');
    if (cartDropdown) {
      if (isOpen) {
        cartDropdown.classList.add('is-open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when cart is open on mobile
      } else {
        cartDropdown.classList.remove('is-open');
        document.body.style.overflow = ''; // Restore scrolling
      }
    }
  }

  private animateCartBadge(): void {
    // Add pulse animation to cart count badge
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      // Remove animation class to reset
      cartCount.classList.remove('pulse');
      
      // Force reflow
      void cartCount.offsetWidth;
      
      // Add animation class back
      cartCount.classList.add('pulse');
    }
  }

  private updateCartCount(): void {
    // Update cart count in DOM
    const cartCount = document.querySelector('.cart-count');
    const totalItems = this.calculateTotalItems();
    
    if (cartCount) {
      if (totalItems > 0) {
        cartCount.textContent = totalItems.toString();
        cartCount.classList.remove('hidden');
      } else {
        cartCount.classList.add('hidden');
      }
    }
  }

  private updateSubtotal(): void {
    // Update subtotal in DOM
    const subtotalElement = document.querySelector('.subtotal-price');
    if (subtotalElement) {
      subtotalElement.textContent = `$${this.calculateSubtotal().toFixed(2)}`;
    }
    
    // Update free shipping progress
    this.updateFreeShippingProgress();
  }

  private updateFreeShippingProgress(): void {
    const subtotal = this.calculateSubtotal();
    const progressElement = document.querySelector('.progress-fill');
    
    if (progressElement) {
      const progressPercentage = Math.min(100, (subtotal / this.freeShippingThreshold) * 100);
      (progressElement as HTMLElement).style.width = `${progressPercentage}%`;
    }
  }

  private calculateTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  private calculateSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    events.emit('notification.show', {
      message,
      type,
      duration: 3000
    });
  }

  protected override onDestroy(): void {
    // Clean up event listeners
    events.off('cart.add', this.handleCartAdd);
    events.off('cart.update', this.handleCartUpdate);
    events.off('checkout.complete', this.handleCheckoutComplete);
    events.off('cart.clear', this.handleCartClear);
    
    // Clean up click outside handler
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
    }
  }
}

// Register the client-side behavior with AssembleJS
BlueprintClient.registerComponentCodeBehind(CartDropdown);