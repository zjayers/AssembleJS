import { preact, BlueprintClient } from "asmbl";
import { ListingClient } from "./listing.client";

/**
 * Products Listing Component
 *
 * This component provides a complete product browsing experience with filtering,
 * sorting, and pagination capabilities.
 *
 * Features:
 * - Product grid with responsive layout
 * - Category and price filtering
 * - Sorting options (price, popularity, etc.)
 * - Pagination controls
 * - Accessibility compliance
 *
 * @param context - Contains component data and helper functions
 */
export function Listing(context: PreactViewContext) {
  // Error handling
  const [hasError, setHasError] = preact.useState(false);
  const [errorDetails, setErrorDetails] = preact.useState<string | null>(null);

  // Filtering and sorting state
  const [isLoading, setIsLoading] = preact.useState(false);
  const [activeCategory, setActiveCategory] = preact.useState<string | null>(null);
  const [priceRange, setPriceRange] = preact.useState<[number, number]>([0, 1000]);
  const [sortOption, setSortOption] = preact.useState('newest');
  const [currentPage, setCurrentPage] = preact.useState(1);
  const [searchQuery, setSearchQuery] = preact.useState('');
  
  // Example categories data (to be replaced with real data)
  const categories = [
    { id: 'clothing', name: 'Clothing' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'footwear', name: 'Footwear' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'home', name: 'Home & Kitchen' }
  ];
  
  // Example products data (to be replaced with real data from API/factory)
  const products = context.data.products || [
    {
      id: "p1",
      title: "Classic Denim Jacket",
      price: 89.99,
      imageUrl: "https://via.placeholder.com/300x300",
      rating: 4.8,
      reviewCount: 156,
      description: "A timeless denim jacket that pairs with everything in your wardrobe.",
      category: "clothing",
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
      category: "clothing",
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
      category: "accessories",
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
      category: "footwear",
      inStock: false
    },
    {
      id: "p5",
      title: "Smart Watch Series 5",
      price: 299.99,
      imageUrl: "https://via.placeholder.com/300x300",
      rating: 4.6,
      reviewCount: 178,
      description: "Advanced smartwatch with health monitoring and notifications.",
      category: "electronics",
      inStock: true
    },
    {
      id: "p6",
      title: "Ceramic Coffee Mug Set",
      price: 24.99,
      imageUrl: "https://via.placeholder.com/300x300",
      rating: 4.4,
      reviewCount: 67,
      description: "Set of 4 ceramic coffee mugs in assorted colors.",
      category: "home",
      inStock: true
    }
  ];
  
  // Handle filtering and sorting
  const filteredProducts = products
    // Filter by category if one is selected
    .filter(product => !activeCategory || product.category === activeCategory)
    // Filter by price range
    .filter(product => product.price >= priceRange[0] && product.price <= priceRange[1])
    // Filter by search query
    .filter(product => searchQuery ? 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) 
      : true
    )
    // Sort products
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.reviewCount - a.reviewCount;
        case 'newest':
        default:
          return 0; // Assume default sorting is by newest
      }
    });
  
  // Pagination
  const productsPerPage = 4;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of product list
    window.scrollTo({
      top: document.querySelector('.product-grid')?.getBoundingClientRect().top || 0,
      behavior: 'smooth'
    });
  };
  
  // Handle search input
  const handleSearchChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    setSearchQuery(input.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle category selection
  const handleCategoryChange = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    setCurrentPage(1); // Reset to first page on category change
  };
  
  // Handle price range change
  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    setCurrentPage(1); // Reset to first page on price change
  };
  
  // Handle sort option change
  const handleSortChange = (e: Event) => {
    const select = e.target as HTMLSelectElement;
    setSortOption(select.value);
  };
  
  // Error handling
  if (hasError) {
    return (
      <div className="products-listing error" role="alert" aria-live="assertive">
        <h2>Something went wrong</h2>
        <p>We're having trouble displaying the products. Please try refreshing the page.</p>
        {errorDetails && <details><summary>Technical Details</summary><pre>{errorDetails}</pre></details>}
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="products-listing loading" aria-busy="true">
        <div className="loading-indicator" aria-label="Loading products">Loading...</div>
      </div>
    );
  }

  return (
    <div className="products-listing" role="region" aria-label="Products listing">
      {/* Page Header */}
      <div className="page-header">
        <h1>Shop All Products</h1>
        <p>Discover our collection of high-quality products</p>
      </div>
      
      <div className="products-container">
        {/* Sidebar - Filters */}
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h2>Categories</h2>
            <ul className="category-filters">
              <li>
                <button 
                  className={activeCategory === null ? 'active' : ''}
                  onClick={() => handleCategoryChange(null)}
                >
                  All Categories
                </button>
              </li>
              {categories.map(category => (
                <li key={category.id}>
                  <button 
                    className={activeCategory === category.id ? 'active' : ''}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="filter-section">
            <h2>Price Range</h2>
            <div className="price-range-filter">
              <div className="price-inputs">
                <div className="price-input">
                  <label htmlFor="min-price">Min</label>
                  <div className="price-wrapper">
                    <span className="currency">$</span>
                    <input 
                      type="number" 
                      id="min-price" 
                      value={priceRange[0]} 
                      min="0" 
                      max={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(
                        Number((e.target as HTMLInputElement).value), 
                        priceRange[1]
                      )}
                    />
                  </div>
                </div>
                <div className="price-input">
                  <label htmlFor="max-price">Max</label>
                  <div className="price-wrapper">
                    <span className="currency">$</span>
                    <input 
                      type="number" 
                      id="max-price" 
                      value={priceRange[1]} 
                      min={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(
                        priceRange[0], 
                        Number((e.target as HTMLInputElement).value)
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="products-main">
          {/* Search and Sort Controls */}
          <div className="products-controls">
            <div className="search-container">
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search products"
              />
            </div>
            <div className="sort-container">
              <label htmlFor="sort-select">Sort by:</label>
              <select 
                id="sort-select" 
                value={sortOption} 
                onChange={handleSortChange}
                aria-label="Sort products by"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>
          
          {/* Product Count */}
          <div className="product-count" aria-live="polite">
            Showing {paginatedProducts.length} of {filteredProducts.length} products
          </div>
          
          {/* Product Grid */}
          {paginatedProducts.length > 0 ? (
            <div className="product-grid">
              {paginatedProducts.map(product => (
                <div className="product-grid-item" key={product.id}>
                  <context.component.product.card product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products" role="status" aria-live="polite">
              <p>No products found matching your criteria. Try adjusting your filters.</p>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination" role="navigation" aria-label="Pagination">
              <button 
                className="pagination-prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={page === currentPage ? 'active' : ''}
                    onClick={() => handlePageChange(page)}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                className="pagination-next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Include stylesheet and client script */}
      <link href="listing.styles.scss" rel="stylesheet" />
      <script src="listing.client.ts"></script>
    </div>
  );
}
}