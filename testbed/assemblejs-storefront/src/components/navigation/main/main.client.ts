import { Blueprint, BlueprintClient, events } from "asmbl";

/**
 * Navigation Main Client
 * 
 * This class handles client-side behavior for the main navigation component.
 * It provides:
 * - Mobile menu toggling
 * - Cart badge updating
 * - Active link highlighting
 * - Scroll behavior
 */
export class MainClient extends Blueprint {
  // Elements
  private mobileMenuToggle: HTMLElement | null = null;
  private mainNav: HTMLElement | null = null;
  private cartCount: HTMLElement | null = null;
  private navLinks: NodeListOf<HTMLAnchorElement> | null = null;
  
  // State
  private cartItems = 0;
  private isMenuOpen = false;
  
  /**
   * Initialize the component when mounted in the DOM
   */
  protected override onMount(): void {
    super.onMount();
    
    // Get elements
    this.mobileMenuToggle = this.element.querySelector('.mobile-menu-toggle');
    this.mainNav = this.element.querySelector('.main-nav');
    this.cartCount = this.element.querySelector('.cart-count');
    this.navLinks = this.element.querySelectorAll('.nav-link');
    
    // Initialize mobile menu
    this.initMobileMenu();
    
    // Highlight active link
    this.highlightCurrentPage();
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  /**
   * Initialize mobile menu toggle functionality
   */
  private initMobileMenu(): void {
    if (this.mobileMenuToggle && this.mainNav) {
      this.mobileMenuToggle.addEventListener('click', () => {
        this.isMenuOpen = !this.isMenuOpen;
        
        // Toggle classes
        this.mobileMenuToggle.classList.toggle('open', this.isMenuOpen);
        this.mainNav.classList.toggle('open', this.isMenuOpen);
        
        // Update ARIA attributes
        this.mobileMenuToggle.setAttribute('aria-expanded', this.isMenuOpen.toString());
      });
    }
  }
  
  /**
   * Highlight the current page in the navigation
   */
  private highlightCurrentPage(): void {
    if (this.navLinks) {
      const currentPath = window.location.pathname;
      
      this.navLinks.forEach(link => {
        // Check if link href matches current path or if we're on home page
        if (link.getAttribute('href') === currentPath || 
            (currentPath === '/' && link.getAttribute('href') === '/')) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  }
  
  /**
   * Set up event listeners for cart updates and other events
   */
  private setupEventListeners(): void {
    // Listen for cart update events
    events.on('cart.add', this.updateCartCount.bind(this));
    events.on('cart.remove', this.updateCartCount.bind(this));
    events.on('cart.update', this.updateCartCount.bind(this));
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (this.isMenuOpen && 
          this.mainNav && 
          this.mobileMenuToggle && 
          !this.mainNav.contains(event.target as Node) && 
          !this.mobileMenuToggle.contains(event.target as Node)) {
        this.isMenuOpen = false;
        this.mobileMenuToggle.classList.remove('open');
        this.mainNav.classList.remove('open');
        this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  /**
   * Update the cart count badge
   */
  private updateCartCount(event: any): void {
    if (this.cartCount) {
      if (event.data && typeof event.data.quantity === 'number') {
        if (event.type === 'cart.add') {
          this.cartItems += event.data.quantity;
        } else if (event.type === 'cart.remove') {
          this.cartItems = Math.max(0, this.cartItems - event.data.quantity);
        } else if (event.type === 'cart.update') {
          this.cartItems = event.data.totalItems || 0;
        }
        
        // Update the displayed count
        this.cartCount.textContent = this.cartItems.toString();
        
        // Toggle visibility based on count
        if (this.cartItems > 0) {
          this.cartCount.style.display = 'flex';
        } else {
          this.cartCount.style.display = 'none';
        }
      }
    }
  }
  
  /**
   * Clean up event listeners when component is unmounted
   */
  protected override onUnmount(): void {
    super.onUnmount();
    
    // Unsubscribe from events
    events.off('cart.add', this.updateCartCount.bind(this));
    events.off('cart.remove', this.updateCartCount.bind(this));
    events.off('cart.update', this.updateCartCount.bind(this));
  }
}

BlueprintClient.registerComponentCodeBehind(MainClient);