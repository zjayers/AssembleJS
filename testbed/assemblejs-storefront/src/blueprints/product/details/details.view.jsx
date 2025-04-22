import React, { useState, useEffect } from 'react';
import { react, events } from 'asmbl';

export default function Details({ params, publicData, components, id }) {
  // Product state
  const [product, setProduct] = useState(publicData.product || {
    id: 'p1',
    name: 'Premium Ergonomic Office Chair',
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    rating: 4.7,
    reviewCount: 128,
    stock: 24,
    sku: 'ECH-PRO-1001',
    description: 'Experience unparalleled comfort with our Premium Ergonomic Office Chair. Designed for long hours of work, this chair features adjustable lumbar support, breathable mesh back, padded armrests, and smooth-rolling casters.',
    features: [
      'Adjustable lumbar support for optimal back health',
      'Breathable mesh back keeps you cool during long work sessions',
      'Fully adjustable armrests with padding for comfort',
      'Height adjustment with pneumatic gas lift',
      'Smooth-rolling casters suitable for any floor type',
      'Weight capacity: 300 lbs',
      '5-year manufacturer warranty'
    ],
    specifications: {
      dimensions: '26"W x 26"D x 38-42"H',
      weight: '35 lbs',
      material: 'High-grade mesh, premium foam, steel frame',
      adjustableHeight: true,
      color: 'Black/Graphite',
      assembly: 'Simple assembly required (tools included)'
    },
    images: [
      { 
        url: 'https://via.placeholder.com/600x600?text=Main+View', 
        alt: 'Main view of ergonomic office chair',
        type: 'main'
      },
      { 
        url: 'https://via.placeholder.com/600x600?text=Side+View', 
        alt: 'Side view of ergonomic office chair',
        type: 'angle'
      },
      { 
        url: 'https://via.placeholder.com/600x600?text=Back+View', 
        alt: 'Back view showing mesh detail',
        type: 'detail'
      },
      { 
        url: 'https://via.placeholder.com/600x600?text=Lumbar+Support', 
        alt: 'Close-up of adjustable lumbar support',
        type: 'feature'
      },
      { 
        url: 'https://via.placeholder.com/600x600?text=Armrest', 
        alt: 'Detail view of adjustable armrest',
        type: 'feature'
      }
    ],
    categories: ['Office Furniture', 'Ergonomic', 'Chairs'],
    relatedProducts: ['p2', 'p3', 'p4', 'p5'],
  });

  // UI state
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);

  // Handler for changing selected image
  const handleImageChange = (index) => {
    setSelectedImage(index);
  };

  // Handler for quantity changes
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Handler for incrementing quantity
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  // Handler for decrementing quantity
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Handler for adding product to cart
  const handleAddToCart = () => {
    setIsAddingToCart(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Emit event for cart component to listen to
      events.emit('cart.add', {
        productId: product.id,
        quantity: quantity,
        name: product.name,
        price: product.price,
        image: product.images[0].url
      });
      
      setIsAddingToCart(false);
      setAddedToCart(true);
      
      // Reset "Added" message after a delay
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }, 800);
  };

  // Render stars for rating
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`star-${i}`} className="star full">★</span>);
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(<span key="star-half" className="star half">★</span>);
    }
    
    // Empty stars
    const emptyStarsCount = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStarsCount; i++) {
      stars.push(<span key={`star-empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  return (
    <div className="product-details">
      <div className="breadcrumb">
        <a href="/">Home</a> / 
        <a href="/products/listing">Products</a> / 
        <span>{product.name}</span>
      </div>

      <div className="product-main">
        {/* Product Images */}
        <div className="product-images">
          <div className="main-image">
            <img 
              src={product.images[selectedImage].url} 
              alt={product.images[selectedImage].alt} 
              loading="lazy"
            />
          </div>
          <div className="thumbnail-gallery">
            {product.images.map((image, index) => (
              <div 
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => handleImageChange(index)}
              >
                <img 
                  src={image.url} 
                  alt={`Thumbnail ${index + 1}`} 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h1>{product.name}</h1>
          
          <div className="product-meta">
            <div className="rating">
              {renderRatingStars(product.rating)}
              <span className="review-count">({product.reviewCount} reviews)</span>
            </div>
            <div className="sku">SKU: {product.sku}</div>
            <div className="stock-status">
              {product.stock > 0 ? (
                <span className="in-stock">In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>
          </div>
          
          <div className="product-price">
            <span className="current-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                <span className="discount-badge">{product.discount}% OFF</span>
              </>
            )}
          </div>
          
          <div className="short-description">
            <p>{product.description.substring(0, 150)}...</p>
          </div>
          
          <div className="product-categories">
            {product.categories.map((category, index) => (
              <span key={index} className="category-tag">
                {category}
              </span>
            ))}
          </div>
          
          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity:</label>
            <div className="quantity-input">
              <button 
                className="quantity-btn decrement" 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <input 
                type="number" 
                id="quantity" 
                value={quantity} 
                onChange={handleQuantityChange} 
                min="1" 
                max={product.stock}
              />
              <button 
                className="quantity-btn increment" 
                onClick={incrementQuantity}
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className={`add-to-cart-btn ${isAddingToCart ? 'loading' : ''} ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock === 0}
            >
              {isAddingToCart ? (
                <span>Adding to Cart...</span>
              ) : addedToCart ? (
                <span>✓ Added to Cart</span>
              ) : product.stock === 0 ? (
                <span>Out of Stock</span>
              ) : (
                <span>Add to Cart</span>
              )}
            </button>
            <button className="wishlist-btn" aria-label="Add to wishlist">
              ♡
            </button>
          </div>
          
          <div className="product-actions">
            <div className="shipping-info">
              <i className="icon-shipping"></i>
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="returns-info">
              <i className="icon-returns"></i>
              <span>30-day easy returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="product-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Features
          </button>
          <button 
            className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({product.reviewCount})
          </button>
        </div>
        
        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="tab-pane">
              <p>{product.description}</p>
            </div>
          )}
          
          {activeTab === 'features' && (
            <div className="tab-pane">
              <ul className="features-list">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div className="tab-pane">
              <table className="specs-table">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <tr key={index}>
                      <th>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>
                      <td>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="tab-pane">
              <div className="reviews-summary">
                <div className="average-rating">
                  <div className="rating-number">{product.rating.toFixed(1)}</div>
                  <div className="rating-stars">
                    {renderRatingStars(product.rating)}
                  </div>
                  <div className="total-reviews">Based on {product.reviewCount} reviews</div>
                </div>
                
                <div className="rating-bars">
                  {[5, 4, 3, 2, 1].map(stars => (
                    <div key={stars} className="rating-bar-row">
                      <span className="stars-label">{stars} stars</span>
                      <div className="rating-bar">
                        <div 
                          className="rating-fill" 
                          style={{ 
                            width: `${Math.round(Math.random() * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="percentage">{Math.round(Math.random() * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="reviews-list">
                <h3>Customer Reviews</h3>
                {/* Sample reviews */}
                {Array.from({ length: reviewsExpanded ? 5 : 2 }).map((_, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-name">Customer {index + 1}</div>
                      <div className="review-date">
                        {new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                      </div>
                      <div className="reviewer-rating">
                        {renderRatingStars(5 - (index % 2 === 0 ? 0.5 : 0))}
                      </div>
                    </div>
                    <div className="review-title">
                      {index % 2 === 0 ? "Excellent chair, very comfortable!" : "Great quality for the price"}
                    </div>
                    <div className="review-content">
                      <p>
                        {index % 2 === 0 
                          ? "I've been using this chair for a month now and it has significantly improved my posture and comfort during long work sessions. The lumbar support is excellent and all adjustments work smoothly." 
                          : "This chair offers great value for money. Assembly was straightforward and the quality of materials is better than I expected at this price point. Very satisfied with my purchase."}
                      </p>
                    </div>
                  </div>
                ))}
                
                {product.reviewCount > 2 && !reviewsExpanded && (
                  <button 
                    className="load-more-reviews" 
                    onClick={() => setReviewsExpanded(true)}
                  >
                    Load More Reviews
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="related-products">
        <h2>You May Also Like</h2>
        <div className="products-carousel">
          {product.relatedProducts.map((productId, index) => (
            <div key={index} className="related-product-card">
              <div className="product-image">
                <img 
                  src={`https://via.placeholder.com/150x150?text=Product+${index + 1}`} 
                  alt={`Related Product ${index + 1}`} 
                  loading="lazy"
                />
              </div>
              <div className="product-title">
                Similar Product {index + 1}
              </div>
              <div className="product-price">
                ${(Math.round((product.price * (0.8 + (index * 0.1))) * 100) / 100).toFixed(2)}
              </div>
              <button className="quick-view-btn">Quick View</button>
            </div>
          ))}
        </div>
      </div>

      {/* Include stylesheet and client script */}
      <link href="details.styles.scss" rel="stylesheet" />
      <script src="details.client.ts"></script>
    </div>
  );
}