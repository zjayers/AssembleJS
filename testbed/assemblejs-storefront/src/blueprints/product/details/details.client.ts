import { Blueprint, BlueprintClient, events, react } from "asmbl";
import type { ComponentContext } from "asmbl";

interface ProductImage {
  url: string;
  alt: string;
  type: string;
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  description: string;
  features: string[];
  specifications: Record<string, any>;
  images: ProductImage[];
  categories: string[];
  relatedProducts: string[];
}

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

export class ProductDetails extends Blueprint<{}, {}> {
  private imageZoomed = false;
  private recentlyViewed: string[] = [];
  private isInViewport = false;
  private intersectionObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(context: ComponentContext) {
    super(context);
    
    // Initialize the component when ready
    this.onReady(() => {
      this.initializeComponent();
    });
  }

  private initializeComponent(): void {
    // Get component root
    const componentRoot = document.querySelector('.product-details');
    if (!componentRoot) return;

    // Initialize tracking
    this.setupProductTracking();
    
    // Setup image zoom feature
    this.setupImageZoom();
    
    // Initialize tabs behavior
    this.initializeTabs();
    
    // Setup related products carousel
    this.setupRelatedProducts();
    
    // Setup recently viewed products
    this.updateRecentlyViewed();
    
    // Listen for cart events
    this.setupCartEventListeners();
    
    // Setup visibility tracking
    this.setupVisibilityTracking();
    
    // Setup responsive behavior
    this.setupResponsiveBehavior();
  }

  private setupProductTracking(): void {
    // Track product view for analytics
    const productId = this.context.params?.productId || 'p1';
    const productName = document.querySelector('.product-info h1')?.textContent || 'Unknown Product';
    
    // Emit event for analytics tracking
    events.emit('analytics.track', {
      event: 'product_view',
      productId,
      productName,
      timestamp: new Date().toISOString()
    });
  }

  private setupImageZoom(): void {
    const mainImage = document.querySelector('.main-image img');
    if (!mainImage) return;
    
    // Implement image zoom on hover
    mainImage.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 768) return; // Don't zoom on mobile
      
      const { left, top, width, height } = (mainImage as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      
      (mainImage as HTMLElement).style.transformOrigin = `${x * 100}% ${y * 100}%`;
      
      if (!this.imageZoomed) {
        (mainImage as HTMLElement).style.transform = 'scale(1.5)';
        this.imageZoomed = true;
      }
    });
    
    mainImage.addEventListener('mouseleave', () => {
      (mainImage as HTMLElement).style.transform = 'scale(1)';
      this.imageZoomed = false;
    });
  }

  private initializeTabs(): void {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Handle tab click events
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Get the tab to activate
        const tabToActivate = button.textContent?.toLowerCase().trim().split(' ')[0] || 'description';
        
        // Remove active class from all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to selected tab
        button.classList.add('active');
        
        // Find and show the corresponding tab content
        const activePane = document.querySelector(`.tab-pane[data-tab="${tabToActivate}"]`);
        if (activePane) {
          activePane.classList.add('active');
        }
        
        // Track tab change for analytics
        events.emit('analytics.track', {
          event: 'product_tab_view',
          tab: tabToActivate
        });
      });
    });
  }

  private setupRelatedProducts(): void {
    // Add scrolling behavior for related products on mobile
    const carousel = document.querySelector('.products-carousel');
    if (!carousel || window.innerWidth >= 768) return;
    
    let isDown = false;
    let startX: number;
    let scrollLeft: number;
    
    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      carousel.classList.add('active');
      startX = e.pageX - (carousel as HTMLElement).offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });
    
    carousel.addEventListener('mouseleave', () => {
      isDown = false;
      carousel.classList.remove('active');
    });
    
    carousel.addEventListener('mouseup', () => {
      isDown = false;
      carousel.classList.remove('active');
    });
    
    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - (carousel as HTMLElement).offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed
      carousel.scrollLeft = scrollLeft - walk;
    });
  }

  private updateRecentlyViewed(): void {
    // Get product ID
    const productId = this.context.params?.productId || 'p1';
    
    // Get recently viewed from local storage
    try {
      const storedRecentlyViewed = localStorage.getItem('recentlyViewedProducts');
      this.recentlyViewed = storedRecentlyViewed ? JSON.parse(storedRecentlyViewed) : [];
      
      // Add current product to recently viewed if not already there
      if (!this.recentlyViewed.includes(productId)) {
        // Add to beginning of array and limit to 5 items
        this.recentlyViewed.unshift(productId);
        this.recentlyViewed = this.recentlyViewed.slice(0, 5);
        
        // Save back to local storage
        localStorage.setItem('recentlyViewedProducts', JSON.stringify(this.recentlyViewed));
      }
    } catch (error) {
      console.error('Error updating recently viewed products:', error);
    }
  }

  private setupCartEventListeners(): void {
    // Listen for add to cart button click
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (!addToCartBtn) return;
    
    addToCartBtn.addEventListener('click', () => {
      const productId = this.context.params?.productId || 'p1';
      const productName = document.querySelector('.product-info h1')?.textContent || 'Unknown Product';
      const productPrice = parseFloat(document.querySelector('.current-price')?.textContent?.replace('$', '') || '0');
      const quantity = parseInt((document.querySelector('#quantity') as HTMLInputElement)?.value || '1');
      const imageUrl = (document.querySelector('.main-image img') as HTMLImageElement)?.src || '';
      
      // Create cart item
      const cartItem: CartItem = {
        productId,
        quantity,
        name: productName,
        price: productPrice,
        image: imageUrl
      };
      
      // Emit cart events with slight delay to allow React state to update first
      setTimeout(() => {
        events.emit('cart.add', cartItem);
        
        // Track for analytics
        events.emit('analytics.track', {
          event: 'add_to_cart',
          product: cartItem
        });
      }, 300);
    });
  }

  private setupVisibilityTracking(): void {
    // Use Intersection Observer to track when product is visible
    if ('IntersectionObserver' in window) {
      const productSection = document.querySelector('.product-main');
      if (!productSection) return;
      
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isInViewport = entry.isIntersecting;
          
          if (entry.isIntersecting) {
            // Product is now visible in viewport
            events.emit('analytics.track', {
              event: 'product_in_view',
              productId: this.context.params?.productId || 'p1'
            });
          }
        });
      }, { threshold: 0.3 }); // Consider visible when 30% is in viewport
      
      this.intersectionObserver.observe(productSection);
    }
  }

  private setupResponsiveBehavior(): void {
    // Handle responsive UI adjustments
    if ('ResizeObserver' in window) {
      const handleResize = () => {
        const isMobile = window.innerWidth < 768;
        const tabsSection = document.querySelector('.product-tabs');
        
        if (tabsSection) {
          if (isMobile) {
            tabsSection.classList.add('mobile');
          } else {
            tabsSection.classList.remove('mobile');
          }
        }
      };
      
      // Initial check
      handleResize();
      
      // Setup observer
      this.resizeObserver = new ResizeObserver(handleResize);
      this.resizeObserver.observe(document.body);
    }
  }

  protected override onDestroy(): void {
    // Clean up observers when component is destroyed
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

// Register the client-side behavior with AssembleJS
BlueprintClient.registerComponentCodeBehind(ProductDetails);