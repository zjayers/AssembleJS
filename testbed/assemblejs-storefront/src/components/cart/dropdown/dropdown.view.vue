<template>
  <div class="cart-dropdown" :class="{ 'is-open': isOpen }">
    <!-- Cart Icon and Toggle Button -->
    <div class="cart-toggle" @click="toggleCart" ref="cartToggle">
      <div class="cart-icon">
        <i class="icon-cart">🛒</i>
        <span v-if="cartItems.length > 0" class="cart-count">{{ totalItems }}</span>
      </div>
    </div>

    <!-- Cart Dropdown Content -->
    <div class="cart-content" v-if="isOpen" ref="cartContent">
      <div class="cart-header">
        <h3>Your Cart ({{ totalItems }})</h3>
        <button class="close-btn" @click="closeCart">×</button>
      </div>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <p>Your cart is empty</p>
        <button class="shop-now-btn" @click="goToProducts">Shop Now</button>
      </div>
      
      <div v-else class="cart-items">
        <transition-group name="fade-slide" tag="ul" class="cart-items-list">
          <li v-for="item in cartItems" :key="item.productId" class="cart-item">
            <div class="item-image">
              <img :src="item.image" :alt="item.name" loading="lazy">
            </div>
            <div class="item-details">
              <h4 class="item-name">{{ item.name }}</h4>
              <div class="item-price">${{ item.price.toFixed(2) }}</div>
              <div class="item-quantity">
                <button class="quantity-btn" @click="decrementQuantity(item)" :disabled="item.quantity <= 1">-</button>
                <span class="quantity-value">{{ item.quantity }}</span>
                <button class="quantity-btn" @click="incrementQuantity(item)">+</button>
              </div>
            </div>
            <button class="remove-item-btn" @click="removeItem(item)">×</button>
          </li>
        </transition-group>

        <div class="cart-subtotal">
          <span>Subtotal:</span>
          <span class="subtotal-price">${{ subtotal.toFixed(2) }}</span>
        </div>

        <div class="cart-actions">
          <button class="view-cart-btn" @click="viewCart">View Cart</button>
          <button class="checkout-btn" @click="checkout">Checkout</button>
        </div>
      </div>
    </div>
    
    <!-- Backdrop when cart is open -->
    <div v-if="isOpen" class="cart-backdrop" @click="closeCart"></div>
  </div>
</template>

<script>
import { vue, events } from 'asmbl';

export default {
  name: 'CartDropdown',
  props: {
    params: {
      type: Object,
      default: () => ({})
    },
    publicData: {
      type: Object,
      default: () => ({})
    },
    components: {
      type: Object,
      default: () => ({})
    },
    id: String
  },
  data() {
    return {
      isOpen: false,
      cartItems: [],
      freeShippingThreshold: 50,
    }
  },
  computed: {
    totalItems() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    },
    subtotal() {
      return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    freeShippingMessage() {
      const remaining = this.freeShippingThreshold - this.subtotal;
      return remaining > 0 
        ? `Add $${remaining.toFixed(2)} more for free shipping!`
        : 'You qualify for free shipping!';
    }
  },
  methods: {
    toggleCart() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        // Add event listener to close cart when clicking outside
        this.$nextTick(() => {
          document.addEventListener('click', this.handleOutsideClick);
        });
      } else {
        document.removeEventListener('click', this.handleOutsideClick);
      }
    },
    closeCart() {
      this.isOpen = false;
      document.removeEventListener('click', this.handleOutsideClick);
    },
    handleOutsideClick(event) {
      if (this.$refs.cartContent && !this.$refs.cartContent.contains(event.target) && 
          this.$refs.cartToggle && !this.$refs.cartToggle.contains(event.target)) {
        this.closeCart();
      }
    },
    incrementQuantity(item) {
      item.quantity += 1;
      this.updateCartInStorage();
      events.emit('cart.update', { 
        cartItems: this.cartItems,
        action: 'increment',
        productId: item.productId
      });
    },
    decrementQuantity(item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
        this.updateCartInStorage();
        events.emit('cart.update', { 
          cartItems: this.cartItems,
          action: 'decrement',
          productId: item.productId
        });
      }
    },
    removeItem(item) {
      const index = this.cartItems.findIndex(i => i.productId === item.productId);
      if (index !== -1) {
        // Use Vue's array mutation methods for reactivity
        this.cartItems.splice(index, 1);
        this.updateCartInStorage();
        events.emit('cart.update', { 
          cartItems: this.cartItems,
          action: 'remove',
          productId: item.productId
        });
      }
    },
    updateCartInStorage() {
      try {
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
      } catch (error) {
        console.error('Error updating cart in storage:', error);
      }
    },
    viewCart() {
      window.location.href = '/cart';
    },
    checkout() {
      window.location.href = '/checkout/form';
    },
    goToProducts() {
      window.location.href = '/products/listing';
    },
    handleCartAdd(cartItem) {
      // Check if item already exists in cart
      const existingItem = this.cartItems.find(item => item.productId === cartItem.productId);
      
      if (existingItem) {
        // Update quantity if item already exists
        existingItem.quantity += cartItem.quantity;
      } else {
        // Add new item to cart
        this.cartItems.push({ ...cartItem });
      }
      
      // Update storage and show cart
      this.updateCartInStorage();
      this.isOpen = true;
      
      // Show toast notification
      this.showNotification(`${cartItem.name} added to cart`);
    },
    loadCartFromStorage() {
      try {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
          this.cartItems = JSON.parse(storedCart);
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    },
    showNotification(message) {
      events.emit('notification.show', {
        message,
        type: 'success',
        duration: 3000
      });
    }
  },
  mounted() {
    // Load cart from storage
    this.loadCartFromStorage();
    
    // Listen for cart add events
    events.on('cart.add', this.handleCartAdd);
  },
  beforeDestroy() {
    // Clean up event listeners
    events.off('cart.add', this.handleCartAdd);
    document.removeEventListener('click', this.handleOutsideClick);
  }
}
</script>

<style scoped>
/* Vue-specific scoped styles */
.cart-dropdown {
  position: relative;
}

.cart-toggle {
  cursor: pointer;
}

.cart-icon i {
  font-size: 1.5rem;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f39c12;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s;
}

.fade-slide-enter, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>