import { preact, BlueprintClient } from "asmbl";
import { WelcomeClient } from "./welcome.client";

/**
 * Home Welcome Component
 *
 * This is the homepage for our storefront application, featuring a banner and product grid.
 *
 * Features:
 * - Responsive product grid layout
 * - Featured product section
 * - Integration with product cards
 * - Accessibility compliant
 *
 * @param context - Contains component data and helper functions
 */
export function Welcome(context: PreactViewContext) {
  // Error handling with Error Boundary pattern
  const [hasError, setHasError] = preact.useState(false);
  const [errorDetails, setErrorDetails] = preact.useState<string | null>(null);
  
  // Example products data (will be replaced with real data from a factory later)
  const featuredProducts = [
    {
      id: "p1",
      title: "Classic Denim Jacket",
      price: 89.99,
      imageUrl: "https://via.placeholder.com/300x300",
      rating: 4.8,
      reviewCount: 156,
      description: "A timeless denim jacket that pairs with everything in your wardrobe.",
      inStock: true
    },
    {
      id: "p2",
      title: "Lightweight Summer Dress",
      price: 49.99,
      imageUrl: "https://via.placeholder.com/300x300",
      rating: 4.5,
      reviewCount: 89,
      description: "Perfect lightweight dress for summer days and evenings.",
      inStock: true
    },
    {
      id: "p3",
      title: "Leather Crossbody Bag",
      price: 79.99,
      imageUrl: "https://via.placeholder.com/300x300",
      rating: 4.7,
      reviewCount: 112,
      description: "Sleek leather crossbody bag with adjustable strap and multiple compartments.",
      inStock: true
    },
    {
      id: "p4",
      title: "Premium Athletic Shoes",
      price: 129.99,
      imageUrl: "https://via.placeholder.com/300x300",
      rating: 4.9,
      reviewCount: 234,
      description: "High-performance athletic shoes with responsive cushioning.",
      inStock: false
    }
  ];
  
  // Handle error states
  if (hasError) {
    return (
      <div className="home-welcome error" role="alert" aria-live="assertive">
        <h2>Something went wrong</h2>
        <p>We're having trouble displaying this content. Please try refreshing the page.</p>
        {errorDetails && <details><summary>Technical Details</summary><pre>{errorDetails}</pre></details>}
      </div>
    );
  }

  return (
    <div className="home-welcome" role="region" aria-label="Welcome section">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1>Welcome to Our Storefront</h1>
          <p>Discover the latest trends and best quality products.</p>
          <button className="shop-now-btn">Shop Now</button>
        </div>
      </div>
      
      {/* Featured Products Section */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="product-grid">
          {featuredProducts.map(product => (
            <div className="product-grid-item" key={product.id}>
              <context.component.product.card 
                product={product}
              />
            </div>
          ))}
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          <div className="category-item">
            <div className="category-image">
              <img src="https://via.placeholder.com/200x200" alt="Clothing" />
            </div>
            <h3>Clothing</h3>
          </div>
          <div className="category-item">
            <div className="category-image">
              <img src="https://via.placeholder.com/200x200" alt="Accessories" />
            </div>
            <h3>Accessories</h3>
          </div>
          <div className="category-item">
            <div className="category-image">
              <img src="https://via.placeholder.com/200x200" alt="Footwear" />
            </div>
            <h3>Footwear</h3>
          </div>
        </div>
      </section>

      {/* Include stylesheet and client script */}
      <link href="welcome.styles.scss" rel="stylesheet" />
      <script src="welcome.client.ts"></script>
    </div>
  );
}