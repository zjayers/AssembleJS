import { preact, BlueprintClient } from "asmbl";
import { CardClient } from "./card.client";

/**
 * Product Card Component
 *
 * This is a Preact component for displaying product cards in an e-commerce storefront.
 *
 * Features:
 * - Displays product image, title, price, and rating
 * - Add to cart functionality
 * - Responsive design
 * - Accessibility features
 * - Error handling
 *
 * @param context - Contains component data and helper functions
 */
export function Card(context: PreactViewContext) {
  // Error handling with Error Boundary pattern
  const [hasError, setHasError] = preact.useState(false);
  const [errorDetails, setErrorDetails] = preact.useState<string | null>(null);
  
  // Add to cart state management
  const [adding, setAdding] = preact.useState(false);
  const [addedToCart, setAddedToCart] = preact.useState(false);
  
  // Example product data (will be replaced with real data from a factory later)
  const product = context.data.product || {
    id: "p1",
    title: "Stylish T-Shirt",
    price: 29.99,
    imageUrl: "https://via.placeholder.com/300x300",
    rating: 4.5,
    reviewCount: 128,
    description: "A comfortable, stylish t-shirt perfect for any occasion.",
    inStock: true
  };
  
  // Handle adding to cart
  const handleAddToCart = () => {
    try {
      setAdding(true);
      
      // Simulate API call or processing
      setTimeout(() => {
        setAdding(false);
        setAddedToCart(true);
        
        // Emit event for cart component to listen to
        context.events.emit('cart.add', { 
          productId: product.id,
          quantity: 1
        });
        
        // Reset "Added" message after a delay
        setTimeout(() => {
          setAddedToCart(false);
        }, 3000);
      }, 500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAdding(false);
      setHasError(true);
      setErrorDetails(error instanceof Error ? error.message : "Unknown error");
    }
  };
  
  // Rating stars component
  const RatingStars = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="rating" aria-label={`${rating} out of 5 stars`}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star full" aria-hidden="true">★</span>
        ))}
        {hasHalfStar && <span className="star half" aria-hidden="true">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty" aria-hidden="true">☆</span>
        ))}
        <span className="review-count">({product.reviewCount})</span>
      </div>
    );
  };
  
  // Handle error states
  if (hasError) {
    return (
      <div className="product-card error" role="alert" aria-live="assertive">
        <h2>Something went wrong</h2>
        <p>We're having trouble displaying this product. Please try refreshing the page.</p>
        {errorDetails && <details><summary>Technical Details</summary><pre>{errorDetails}</pre></details>}
      </div>
    );
  }

  return (
    <div className="product-card" role="region" aria-label={`Product: ${product.title}`}>
      <div className="product-image">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          loading="lazy" 
          width="300"
          height="300"
        />
        {!product.inStock && (
          <div className="out-of-stock-overlay" aria-label="Out of stock">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="product-details">
        <h3 className="product-title">{product.title}</h3>
        <div className="product-rating">
          <RatingStars rating={product.rating} />
        </div>
        <p className="product-price" aria-label={`Price: $${product.price}`}>
          ${product.price.toFixed(2)}
        </p>
        <p className="product-description">{product.description}</p>
      </div>
      
      <div className="product-actions">
        <button 
          className={`add-to-cart-button ${adding ? 'loading' : ''} ${addedToCart ? 'added' : ''}`}
          onClick={handleAddToCart}
          disabled={adding || !product.inStock}
          aria-busy={adding}
          aria-label={product.inStock ? "Add to cart" : "Out of stock"}
        >
          {adding ? (
            <span className="loading-text">Adding...</span>
          ) : addedToCart ? (
            <span className="added-text">✓ Added to Cart</span>
          ) : product.inStock ? (
            <span>Add to Cart</span>
          ) : (
            <span>Out of Stock</span>
          )}
        </button>
      </div>

      {/* Include stylesheet and client script */}
      <link href="card.styles.scss" rel="stylesheet" />
      <script src="card.client.ts"></script>
    </div>
  );
}