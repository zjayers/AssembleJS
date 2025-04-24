# Search & Filtering

<iframe src="https://placeholder-for-assemblejs-search-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

Search and filtering functionality are essential for applications with large datasets. This cookbook demonstrates how to implement efficient search and filtering capabilities in AssembleJS applications, including client-side filtering, server-side search, and advanced features like faceted search and typeahead suggestions.

## Prerequisites

- Basic knowledge of AssembleJS components and blueprints
- Understanding of async/await and Promises in JavaScript
- Familiarity with array operations like filter, map, and reduce

## Implementation Steps

### Step 1: Create a Basic Search Service

First, let's create a service to handle search operations:

1. Use the CLI to generate a search service:

```bash
npx asm
# Select "Service" from the list
# Enter "search" as the name
# Follow the prompts
```

2. Implement the search service:

```typescript
// src/services/search.service.ts
import { Service } from 'asmbl';

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  fields?: string[];
  limit?: number;
}

export interface SearchResult<T> {
  item: T;
  matches: {
    field: string;
    indices: Array<[number, number]>; // Start and end positions of matches
  }[];
  score: number;
}

export class SearchService extends Service {
  /**
   * Perform a simple client-side search on an array of items
   */
  search<T>(
    items: T[],
    query: string,
    options: SearchOptions = {}
  ): SearchResult<T>[] {
    if (!query || query.trim() === '') {
      return items.map(item => ({
        item,
        matches: [],
        score: 1
      }));
    }

    const searchQuery = options.caseSensitive ? query : query.toLowerCase();
    const fields = options.fields || this.getAllObjectFields(items[0]);
    const limit = options.limit || items.length;
    
    const results: SearchResult<T>[] = [];
    
    for (const item of items) {
      const matches: SearchResult<T>['matches'] = [];
      let totalScore = 0;
      
      for (const field of fields) {
        const value = this.getNestedValue(item, field);
        
        if (typeof value !== 'string') continue;
        
        const fieldValue = options.caseSensitive ? value : value.toLowerCase();
        
        // Find all matches
        const matchIndices = this.findAllMatches(fieldValue, searchQuery, options.wholeWord);
        
        if (matchIndices.length > 0) {
          matches.push({
            field,
            indices: matchIndices
          });
          
          // Calculate field score (more matches = higher score)
          const fieldScore = matchIndices.length * (2 - fieldValue.length / 100);
          totalScore += fieldScore;
        }
      }
      
      if (matches.length > 0) {
        results.push({
          item,
          matches,
          score: totalScore
        });
      }
    }
    
    // Sort by score (highest first) and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * Find all matches of a query in a text
   */
  private findAllMatches(
    text: string,
    query: string,
    wholeWord: boolean = false
  ): Array<[number, number]> {
    const matches: Array<[number, number]> = [];
    let startIndex = 0;
    let index: number;
    
    if (wholeWord) {
      const regex = new RegExp(`\\b${this.escapeRegExp(query)}\\b`, 'g');
      let match: RegExpExecArray | null;
      
      while ((match = regex.exec(text)) !== null) {
        matches.push([match.index, match.index + match[0].length - 1]);
      }
    } else {
      while ((index = text.indexOf(query, startIndex)) > -1) {
        matches.push([index, index + query.length - 1]);
        startIndex = index + 1;
      }
    }
    
    return matches;
  }
  
  /**
   * Get all object fields, including nested fields (up to 2 levels deep)
   */
  private getAllObjectFields(obj: any): string[] {
    if (!obj || typeof obj !== 'object') return [];
    
    const fields: string[] = [];
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fields.push(key);
        
        // Add nested fields (one level deep)
        const value = obj[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          for (const nestedKey in value) {
            if (Object.prototype.hasOwnProperty.call(value, nestedKey)) {
              fields.push(`${key}.${nestedKey}`);
            }
          }
        }
      }
    }
    
    return fields;
  }
  
  /**
   * Get a nested value from an object using a dot notation path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => 
      prev && prev[curr] !== undefined ? prev[curr] : undefined
    , obj);
  }
  
  /**
   * Escape special regex characters in a string
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Filter an array of items based on criteria
   */
  filter<T>(
    items: T[],
    criteria: Partial<Record<keyof T, any>>
  ): T[] {
    return items.filter(item => {
      for (const key in criteria) {
        if (Object.prototype.hasOwnProperty.call(criteria, key)) {
          const criteriaValue = criteria[key];
          const itemValue = item[key];
          
          // Skip undefined criteria values
          if (criteriaValue === undefined) continue;
          
          // Handle different types of criteria
          if (Array.isArray(criteriaValue)) {
            // Array includes
            if (!criteriaValue.includes(itemValue)) return false;
          } else if (typeof criteriaValue === 'function') {
            // Custom filter function
            if (!criteriaValue(itemValue)) return false;
          } else if (criteriaValue !== null && typeof criteriaValue === 'object') {
            // Range criteria (min, max)
            if (
              (criteriaValue.min !== undefined && itemValue < criteriaValue.min) ||
              (criteriaValue.max !== undefined && itemValue > criteriaValue.max)
            ) {
              return false;
            }
          } else {
            // Direct equality
            if (itemValue !== criteriaValue) return false;
          }
        }
      }
      
      return true;
    });
  }
}
```

### Step 2: Create a Product Search Component

Let's create a component that implements product search functionality:

```bash
npx asm
# Select "Component" from the list
# Enter "products/search" as the name
# Follow the prompts
```

First, implement the factory:

```typescript
// src/components/products/search/search.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { SearchService } from '../../../services/search.service';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  inStock: boolean;
  attributes: Record<string, any>;
}

export class ProductSearchFactory implements ComponentFactory {
  private products: Product[] = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation.',
      price: 129.99,
      category: 'Electronics',
      tags: ['wireless', 'bluetooth', 'audio'],
      inStock: true,
      attributes: {
        brand: 'SoundMaster',
        color: 'Black',
        batteryLife: '20 hours'
      }
    },
    {
      id: '2',
      name: 'Smartphone Pro Max',
      description: 'Latest smartphone with advanced camera and long battery life.',
      price: 999.99,
      category: 'Electronics',
      tags: ['smartphone', 'camera', 'mobile'],
      inStock: true,
      attributes: {
        brand: 'TechGiant',
        color: 'Silver',
        storage: '256GB'
      }
    },
    {
      id: '3',
      name: 'Ergonomic Office Chair',
      description: 'Comfortable office chair with lumbar support and adjustable height.',
      price: 249.99,
      category: 'Furniture',
      tags: ['office', 'chair', 'ergonomic'],
      inStock: true,
      attributes: {
        brand: 'ComfortPlus',
        color: 'Gray',
        material: 'Mesh'
      }
    },
    {
      id: '4',
      name: 'Coffee Maker Deluxe',
      description: 'Programmable coffee maker with thermal carafe.',
      price: 79.99,
      category: 'Appliances',
      tags: ['coffee', 'kitchen', 'brewing'],
      inStock: false,
      attributes: {
        brand: 'BrewMaster',
        color: 'Stainless Steel',
        capacity: '12 cups'
      }
    },
    {
      id: '5',
      name: 'Ultra HD Smart TV',
      description: '65-inch 4K smart TV with HDR and streaming apps built-in.',
      price: 799.99,
      category: 'Electronics',
      tags: ['tv', '4k', 'smart'],
      inStock: true,
      attributes: {
        brand: 'VisionTech',
        resolution: '4K Ultra HD',
        screenSize: '65 inches'
      }
    },
    // Add more products as needed
  ];

  async factory(context: ComponentContext): Promise<void> {
    const searchService = context.services.get('searchService') as SearchService;
    
    // Set initial search query and filters
    context.data.set('searchQuery', '');
    context.data.set('filters', {
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false
    });
    
    // Get search parameters from query parameters if available
    if (context.request.query) {
      const { q, category, minPrice, maxPrice, inStock } = context.request.query;
      
      if (q) context.data.set('searchQuery', q);
      if (category) context.data.set('filters', { ...context.data.get('filters'), category });
      if (minPrice) context.data.set('filters', { ...context.data.get('filters'), minPrice });
      if (maxPrice) context.data.set('filters', { ...context.data.get('filters'), maxPrice });
      if (inStock === 'true') context.data.set('filters', { ...context.data.get('filters'), inStock: true });
    }
    
    // Apply search and filters
    const searchQuery = context.data.get('searchQuery') as string;
    const filters = context.data.get('filters') as Record<string, any>;
    
    // Get unique categories for filter options
    const categories = [...new Set(this.products.map(p => p.category))];
    context.data.set('categories', categories);
    
    // Apply filters first
    let filteredProducts = this.products;
    
    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }
    
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
    }
    
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }
    
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(p => p.inStock);
    }
    
    // Then apply search if there's a query
    if (searchQuery) {
      const searchResults = searchService.search(filteredProducts, searchQuery, {
        fields: ['name', 'description', 'tags', 'attributes.brand'],
        caseSensitive: false,
        wholeWord: false
      });
      
      context.data.set('searchResults', searchResults);
      context.data.set('products', searchResults.map(result => result.item));
    } else {
      context.data.set('searchResults', null);
      context.data.set('products', filteredProducts);
    }
    
    // Pass search service to client-side
    context.data.set('searchService', searchService);
  }
}
```

Now, implement the view:

```tsx
// src/components/products/search/search.view.tsx
import React from 'react';
import { SearchResult } from '../../../services/search.service';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  inStock: boolean;
  attributes: Record<string, any>;
}

interface ProductSearchProps {
  data: {
    searchQuery: string;
    filters: {
      category: string;
      minPrice: string;
      maxPrice: string;
      inStock: boolean;
    };
    categories: string[];
    products: Product[];
    searchResults: SearchResult<Product>[] | null;
  };
}

const ProductSearch: React.FC<ProductSearchProps> = ({ data }) => {
  const { searchQuery, filters, categories, products, searchResults } = data;
  
  // Function to highlight search matches in text
  const highlightMatches = (text: string, field: string) => {
    if (!searchResults) return text;
    
    for (const result of searchResults) {
      if (result.item.name !== text && result.item.description !== text) continue;
      
      const fieldMatches = result.matches.find(match => match.field === field);
      if (!fieldMatches) continue;
      
      let highlighted = '';
      let lastIndex = 0;
      
      for (const [start, end] of fieldMatches.indices) {
        // Add text before the match
        highlighted += text.substring(lastIndex, start);
        // Add the highlighted match
        highlighted += `<mark>${text.substring(start, end + 1)}</mark>`;
        lastIndex = end + 1;
      }
      
      // Add the remaining text
      highlighted += text.substring(lastIndex);
      return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
    }
    
    return text;
  };
  
  return (
    <div className="product-search">
      <div className="search-filters">
        <form className="search-form" action="" method="GET">
          <div className="search-bar">
            <input 
              type="text" 
              name="q" 
              placeholder="Search products..." 
              defaultValue={searchQuery}
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </div>
          
          <div className="filters-container">
            <div className="filter-group">
              <label htmlFor="category">Category:</label>
              <select 
                id="category" 
                name="category" 
                defaultValue={filters.category}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="minPrice">Min Price:</label>
              <input 
                type="number" 
                id="minPrice" 
                name="minPrice" 
                placeholder="Min"
                defaultValue={filters.minPrice}
                min="0"
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="maxPrice">Max Price:</label>
              <input 
                type="number" 
                id="maxPrice" 
                name="maxPrice" 
                placeholder="Max"
                defaultValue={filters.maxPrice}
                min="0"
                className="filter-input"
              />
            </div>
            
            <div className="filter-group checkbox-group">
              <input 
                type="checkbox" 
                id="inStock" 
                name="inStock" 
                defaultChecked={filters.inStock}
                value="true"
                className="filter-checkbox"
              />
              <label htmlFor="inStock">In Stock Only</label>
            </div>
            
            <button type="submit" className="filter-button">Apply Filters</button>
          </div>
        </form>
      </div>
      
      <div className="search-results">
        <div className="results-header">
          <h2>
            {searchQuery 
              ? `Search Results for "${searchQuery}" (${products.length} products)` 
              : `All Products (${products.length})`}
          </h2>
        </div>
        
        {products.length === 0 ? (
          <div className="no-results">
            <p>No products found matching your search criteria.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-header">
                  <h3 className="product-name">
                    {highlightMatches(product.name, 'name')}
                  </h3>
                  <span className={`product-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <div className="product-description">
                  {highlightMatches(product.description, 'description')}
                </div>
                
                <div className="product-meta">
                  <div className="product-category">{product.category}</div>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                </div>
                
                <div className="product-tags">
                  {product.tags.map(tag => (
                    <span key={tag} className="product-tag">{tag}</span>
                  ))}
                </div>
                
                <button className="product-button">View Details</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
```

Add some styles for the search component:

```scss
// src/components/products/search/search.styles.scss
.product-search {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  .search-filters {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
    
    .search-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .search-bar {
      display: flex;
      width: 100%;
      
      .search-input {
        flex: 1;
        padding: 12px 15px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px 0 0 4px;
        outline: none;
        
        &:focus {
          border-color: #0066cc;
        }
      }
      
      .search-button {
        background-color: #0066cc;
        color: white;
        border: none;
        border-radius: 0 4px 4px 0;
        padding: 0 20px;
        font-size: 16px;
        cursor: pointer;
        
        &:hover {
          background-color: #0055aa;
        }
      }
    }
    
    .filters-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      align-items: end;
      
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
        
        label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }
        
        .filter-select,
        .filter-input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          
          &:focus {
            border-color: #0066cc;
            outline: none;
          }
        }
        
        &.checkbox-group {
          flex-direction: row;
          align-items: center;
          gap: 10px;
        }
      }
      
      .filter-button {
        background-color: #333;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 10px 15px;
        font-size: 14px;
        cursor: pointer;
        height: 38px;
        
        &:hover {
          background-color: #222;
        }
      }
    }
  }
  
  .search-results {
    .results-header {
      margin-bottom: 20px;
      
      h2 {
        font-size: 24px;
        font-weight: 500;
        color: #333;
      }
    }
    
    .no-results {
      background-color: #f5f5f5;
      padding: 30px;
      text-align: center;
      border-radius: 8px;
      
      p {
        font-size: 16px;
        color: #666;
      }
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      
      .product-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        
        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .product-name {
            font-size: 18px;
            font-weight: 500;
            color: #333;
            margin: 0;
          }
          
          .product-status {
            font-size: 12px;
            font-weight: 500;
            padding: 4px 8px;
            border-radius: 12px;
            
            &.in-stock {
              background-color: #e6f7e6;
              color: #2e7d32;
            }
            
            &.out-of-stock {
              background-color: #fce8e8;
              color: #c62828;
            }
          }
        }
        
        .product-description {
          font-size: 14px;
          color: #666;
          line-height: 1.4;
        }
        
        .product-meta {
          display: flex;
          justify-content: space-between;
          
          .product-category {
            font-size: 14px;
            color: #666;
            font-weight: 500;
          }
          
          .product-price {
            font-size: 18px;
            color: #0066cc;
            font-weight: 600;
          }
        }
        
        .product-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          
          .product-tag {
            font-size: 12px;
            background-color: #f0f0f0;
            color: #333;
            padding: 4px 8px;
            border-radius: 4px;
          }
        }
        
        .product-button {
          margin-top: auto;
          background-color: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 15px;
          font-size: 14px;
          cursor: pointer;
          
          &:hover {
            background-color: #0055aa;
          }
        }
      }
    }
  }
  
  mark {
    background-color: #fff2cc;
    padding: 0 2px;
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    .search-results .product-grid {
      grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
    }
  }
}
```

### Step 3: Implement Client-Side Search

Let's add client-side functionality to enhance the search experience:

```typescript
// src/components/products/search/search.client.ts
import { Blueprint } from 'asmbl';
import { SearchService } from '../../../services/search.service';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  inStock: boolean;
  attributes: Record<string, any>;
}

export class ProductSearchClient extends Blueprint {
  private searchService: SearchService | null = null;
  private products: Product[] = [];
  private debounceTimer: number | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Get search service and products from data
    this.searchService = this.data.get('searchService');
    this.products = this.data.get('products');
    
    // Set up live search
    this.setupLiveSearch();
  }
  
  private setupLiveSearch(): void {
    const searchInput = this.root.querySelector<HTMLInputElement>('.search-input');
    if (!searchInput) return;
    
    // Set up input event for live search
    searchInput.addEventListener('input', this.debounce(() => {
      this.performLiveSearch(searchInput.value);
    }, 300));
    
    // Set up form submission
    const searchForm = this.root.querySelector<HTMLFormElement>('.search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.performSearch();
      });
    }
  }
  
  private async performLiveSearch(query: string): Promise<void> {
    if (!this.searchService || !query.trim()) {
      // Clear typeahead suggestions if query is empty
      this.updateTypeaheadSuggestions([]);
      return;
    }
    
    // Get quick typeahead suggestions (just names)
    const suggestions = this.searchService.search(this.products, query, {
      fields: ['name'],
      limit: 5
    });
    
    // Update typeahead UI
    this.updateTypeaheadSuggestions(suggestions);
  }
  
  private updateTypeaheadSuggestions(suggestions: any[]): void {
    let suggestionsContainer = this.root.querySelector('.typeahead-suggestions');
    
    // Create the suggestions container if it doesn't exist
    if (!suggestionsContainer) {
      suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'typeahead-suggestions';
      const searchBar = this.root.querySelector('.search-bar');
      searchBar?.appendChild(suggestionsContainer);
    }
    
    // Clear existing suggestions
    suggestionsContainer.innerHTML = '';
    
    // Hide container if no suggestions
    if (suggestions.length === 0) {
      suggestionsContainer.classList.remove('active');
      return;
    }
    
    // Add suggestions
    suggestions.forEach(result => {
      const suggestion = document.createElement('div');
      suggestion.className = 'suggestion-item';
      suggestion.textContent = result.item.name;
      
      // When suggestion is clicked, fill in search input and perform search
      suggestion.addEventListener('click', () => {
        const searchInput = this.root.querySelector<HTMLInputElement>('.search-input');
        if (searchInput) {
          searchInput.value = result.item.name;
          this.performSearch();
        }
        suggestionsContainer?.classList.remove('active');
      });
      
      suggestionsContainer?.appendChild(suggestion);
    });
    
    // Show suggestions
    suggestionsContainer.classList.add('active');
  }
  
  private performSearch(): void {
    // Get all form values
    const form = this.root.querySelector<HTMLFormElement>('.search-form');
    if (!form) return;
    
    // Create URL with search parameters
    const formData = new FormData(form);
    const params = new URLSearchParams();
    
    // Add non-empty values to URL parameters
    formData.forEach((value, key) => {
      if (value !== '' && !(key === 'inStock' && value !== 'true')) {
        params.append(key, value.toString());
      }
    });
    
    // Navigate to the search URL
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  }
  
  // Utility to debounce function calls
  private debounce(fn: Function, delay: number): (this: any, ...args: any[]) => void {
    return (...args) => {
      if (this.debounceTimer) window.clearTimeout(this.debounceTimer);
      this.debounceTimer = window.setTimeout(() => fn.apply(this, args), delay);
    };
  }
}

export default ProductSearchClient;
```

Add additional styles for the typeahead functionality:

```scss
// Add to src/components/products/search/search.styles.scss
.search-bar {
  position: relative;
  
  .typeahead-suggestions {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    border: 1px solid #ddd;
    border-top: none;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
    
    &.active {
      display: block;
    }
    
    .suggestion-item {
      padding: 10px 15px;
      cursor: pointer;
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      &:not(:last-child) {
        border-bottom: 1px solid #eee;
      }
    }
  }
}
```

### Step 4: Create a Search Demo Blueprint

Let's create a blueprint to showcase the search functionality:

```bash
npx asm
# Select "Blueprint" from the list
# Enter "search-demo" as the name
# Follow the prompts
```

Implement the blueprint view:

```tsx
// src/blueprints/search-demo/main/main.view.tsx
import React from 'react';

const SearchDemo: React.FC = () => {
  return (
    <div className="search-demo">
      <header className="header">
        <h1>Product Search & Filtering</h1>
        <p>Demonstrating advanced search and filtering capabilities in AssembleJS</p>
      </header>
      
      <main className="main-content">
        <div className="product-search-container" data-component="products/search"></div>
      </main>
    </div>
  );
};

export default SearchDemo;
```

Add some styles for the blueprint:

```scss
// src/blueprints/search-demo/main/main.styles.scss
.search-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  .header {
    text-align: center;
    margin-bottom: 40px;
    
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    
    p {
      color: #666;
    }
  }
}
```

### Step 5: Implement Server-Side Search API

For larger datasets, we should implement server-side search:

```bash
npx asm
# Select "Controller" from the list
# Enter "search" as the name
# Follow the prompts
```

Implement the search controller:

```typescript
// src/controllers/search.controller.ts
import { BlueprintController } from 'asmbl';
import { SearchService } from '../services/search.service';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  inStock: boolean;
  attributes: Record<string, any>;
}

export class SearchController extends BlueprintController {
  private searchService: SearchService;
  private products: Product[] = []; // In a real app, this would come from a database
  
  constructor() {
    super();
    
    // Sample products (same as in the factory)
    this.products = [
      // ... same products as in ProductSearchFactory
    ];
  }
  
  override onRegister(): void {
    super.onRegister();
    
    this.searchService = this.services.get('searchService') as SearchService;
    
    // Register API route
    this.server.get('/api/search', this.handleSearch.bind(this));
    this.server.get('/api/products', this.handleGetProducts.bind(this));
  }
  
  private async handleSearch(request, reply) {
    const { q, category, minPrice, maxPrice, inStock, limit } = request.query;
    
    // Apply filters first
    let filteredProducts = this.products;
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (minPrice) {
      const min = parseFloat(minPrice);
      filteredProducts = filteredProducts.filter(p => p.price >= min);
    }
    
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filteredProducts = filteredProducts.filter(p => p.price <= max);
    }
    
    if (inStock === 'true') {
      filteredProducts = filteredProducts.filter(p => p.inStock);
    }
    
    // Then apply search if there's a query
    if (q) {
      const searchResults = this.searchService.search(filteredProducts, q, {
        fields: ['name', 'description', 'tags', 'attributes.brand'],
        caseSensitive: false,
        wholeWord: false,
        limit: limit ? parseInt(limit) : undefined
      });
      
      return reply.send({
        query: q,
        results: searchResults,
        total: searchResults.length
      });
    } else {
      return reply.send({
        query: null,
        results: filteredProducts.map(item => ({ 
          item, 
          matches: [], 
          score: 1 
        })),
        total: filteredProducts.length
      });
    }
  }
  
  private async handleGetProducts(request, reply) {
    const { category, limit } = request.query;
    
    let result = this.products;
    
    if (category) {
      result = result.filter(p => p.category === category);
    }
    
    if (limit) {
      const limitNum = parseInt(limit);
      result = result.slice(0, limitNum);
    }
    
    // Get categories for facets
    const categories = [...new Set(this.products.map(p => p.category))];
    
    return reply.send({
      products: result,
      total: result.length,
      facets: {
        categories,
        price: {
          min: Math.min(...this.products.map(p => p.price)),
          max: Math.max(...this.products.map(p => p.price)),
        }
      }
    });
  }
}
```

### Step 6: Register Components, Services, and Controllers

Update your server.ts to include the new components, services, and controllers:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { SearchService } from "./services/search.service";
import { ProductSearchFactory } from "./components/products/search/search.factory";
import { SearchController } from "./controllers/search.controller";

// Create search service
const searchService = new SearchService();

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'products/search',
        views: [{
          viewName: 'default',
          templateFile: 'search.view.tsx',
          factory: new ProductSearchFactory()
        }]
      }
    ],
    blueprints: [
      {
        path: 'search-demo',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/search-demo'
        }]
      }
    ],
    services: [
      {
        name: 'searchService',
        service: searchService
      }
    ],
    controllers: [
      new SearchController()
    ]
  }
});
```

## Advanced Topics

### Implementing Faceted Search

Faceted search allows users to refine search results using multiple filters:

```typescript
// Add to ProductSearchFactory
async factory(context: ComponentContext): Promise<void> {
  // ... existing code
  
  // Get facets for the current filtered products
  const facets = this.generateFacets(filteredProducts);
  context.data.set('facets', facets);
}

private generateFacets(products: Product[]): Record<string, any> {
  if (products.length === 0) return {};
  
  return {
    // Category facets with counts
    categories: Array.from(new Set(products.map(p => p.category)))
      .map(category => ({
        value: category,
        count: products.filter(p => p.category === category).length
      })),
    
    // Tags facets with counts
    tags: Array.from(
      products.reduce((tags, product) => {
        product.tags.forEach(tag => tags.add(tag));
        return tags;
      }, new Set<string>())
    ).map(tag => ({
      value: tag,
      count: products.filter(p => p.tags.includes(tag)).length
    })),
    
    // Price ranges
    price: {
      min: Math.min(...products.map(p => p.price)),
      max: Math.max(...products.map(p => p.price)),
      ranges: [
        {
          label: 'Under $50',
          count: products.filter(p => p.price < 50).length
        },
        {
          label: '$50 - $100',
          count: products.filter(p => p.price >= 50 && p.price <= 100).length
        },
        {
          label: '$100 - $200',
          count: products.filter(p => p.price > 100 && p.price <= 200).length
        },
        {
          label: 'Over $200',
          count: products.filter(p => p.price > 200).length
        }
      ]
    },
    
    // In stock facet
    availability: [
      {
        label: 'In Stock',
        value: 'true',
        count: products.filter(p => p.inStock).length
      },
      {
        label: 'Out of Stock',
        value: 'false',
        count: products.filter(p => !p.inStock).length
      }
    ]
  };
}
```

Then update the view to display facets:

```tsx
// Add to the search.view.tsx in the filters-container
<div className="facets-container">
  <h3>Refine By:</h3>
  
  {facets.categories && (
    <div className="facet-group">
      <h4>Category</h4>
      <ul className="facet-list">
        {facets.categories.map(category => (
          <li key={category.value} className="facet-item">
            <a 
              href={`?${new URLSearchParams({
                ...filterParams,
                category: category.value
              }).toString()}`}
              className={filters.category === category.value ? 'active' : ''}
            >
              {category.value} <span className="facet-count">({category.count})</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )}
  
  {facets.price && (
    <div className="facet-group">
      <h4>Price Range</h4>
      <ul className="facet-list">
        {facets.price.ranges.map(range => (
          <li key={range.label} className="facet-item">
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                const [min, max] = parseRange(range.label);
                applyPriceRange(min, max);
              }}
            >
              {range.label} <span className="facet-count">({range.count})</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )}
  
  {facets.tags && (
    <div className="facet-group">
      <h4>Tags</h4>
      <ul className="facet-list">
        {facets.tags.slice(0, 10).map(tag => (
          <li key={tag.value} className="facet-item tag-facet">
            <span className="tag-label">{tag.value}</span>
            <span className="facet-count">({tag.count})</span>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>
```

### Implementing Elasticsearch Integration

For large-scale search, integrate with Elasticsearch:

```typescript
// src/services/elasticsearch.service.ts
import { Service } from 'asmbl';
import { Client } from '@elastic/elasticsearch';

export class ElasticsearchService extends Service {
  private client: Client;
  
  constructor(config: { node: string, auth?: { username: string, password: string } }) {
    super();
    this.client = new Client(config);
  }
  
  async search<T>(
    index: string,
    query: string,
    options: {
      fields?: string[];
      filters?: Record<string, any>;
      size?: number;
      from?: number;
      sort?: Record<string, 'asc' | 'desc'>;
    } = {}
  ): Promise<{
    hits: Array<{ _source: T; _score: number }>;
    total: number;
    aggregations?: any;
  }> {
    const { fields = ['*'], filters = {}, size = 10, from = 0, sort } = options;
    
    // Build query
    const queryObj: any = {
      bool: {
        must: query ? [
          {
            multi_match: {
              query,
              fields,
              fuzziness: 'AUTO'
            }
          }
        ] : [],
        filter: []
      }
    };
    
    // Add filters
    for (const [field, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue;
      
      if (Array.isArray(value)) {
        queryObj.bool.filter.push({
          terms: { [field]: value }
        });
      } else if (typeof value === 'object') {
        // Range filter
        const range: any = {};
        if (value.min !== undefined) range.gte = value.min;
        if (value.max !== undefined) range.lte = value.max;
        
        if (Object.keys(range).length > 0) {
          queryObj.bool.filter.push({
            range: { [field]: range }
          });
        }
      } else {
        // Term filter
        queryObj.bool.filter.push({
          term: { [field]: value }
        });
      }
    }
    
    // Build aggregations for facets
    const aggregations: any = {
      categories: {
        terms: { field: 'category.keyword' }
      },
      price_stats: {
        stats: { field: 'price' }
      },
      price_ranges: {
        range: {
          field: 'price',
          ranges: [
            { to: 50 },
            { from: 50, to: 100 },
            { from: 100, to: 200 },
            { from: 200 }
          ]
        }
      }
    };
    
    // Execute search
    const response = await this.client.search({
      index,
      body: {
        query: queryObj,
        sort: sort ? [sort] : undefined,
        size,
        from,
        aggregations
      }
    });
    
    return {
      hits: response.hits.hits.map((hit: any) => ({
        _source: hit._source,
        _score: hit._score
      })),
      total: response.hits.total.value,
      aggregations: response.aggregations
    };
  }
}
```

## Conclusion

This cookbook has demonstrated how to implement search and filtering capabilities in AssembleJS applications. We've covered creating a search service, building search components with typeahead suggestions, implementing client-side and server-side search, and enhancing the user experience with faceted search.

By following these patterns, you can build robust search functionality that helps users efficiently find what they're looking for in your application. The advanced topics covered integration with Elasticsearch for large-scale search needs and implementing faceted search for refined filtering.

Effective search and filtering features significantly improve user experience by helping users navigate large datasets and find relevant information quickly.