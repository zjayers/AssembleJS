<script>
  // Props are passed via context
  export let params = {};
  export let publicData = {};
  export let components = {};
  export let id;
  
  import { svelte, events } from 'asmbl';
  
  // Function to render a sub-component
  function renderComponent(node, componentName) {
    if (componentName && components) {
      svelte.component(componentName, node, {params, publicData, components, id});
    }
  }
  
  // Form state
  let formStep = 1;
  let formData = {
    // Contact Information
    email: '',
    phone: '',
    
    // Shipping Information
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    
    // Billing Information (starts as same as shipping)
    billingSameAsShipping: true,
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingApartment: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'US',
    
    // Payment Information
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    
    // Order notes
    orderNotes: '',
    
    // Terms acceptance
    acceptTerms: false
  };
  
  // Error handling
  let errors = {};
  let formSubmitted = false;
  let formSubmitting = false;
  let formSubmitSuccess = false;
  
  // Cart data from local storage
  let cartItems = [];
  let subtotal = 0;
  let shipping = 5.99;
  let tax = 0;
  let total = 0;
  
  // Countries list
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'MX', name: 'Mexico' },
    { code: 'GB', name: 'United Kingdom' },
    // Add more countries as needed
  ];
  
  // US States
  const usStates = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    // Add more states as needed
  ];
  
  // Years for credit card expiry
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  
  // Months for credit card expiry
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      value: month.toString().padStart(2, '0'),
      label: month.toString().padStart(2, '0')
    };
  });
  
  // Form validation
  function validateStep(step) {
    errors = {};
    let isValid = true;
    
    if (step === 1) {
      // Validate contact and shipping information
      if (!formData.email) {
        errors.email = 'Email is required';
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        errors.email = 'Email is invalid';
        isValid = false;
      }
      
      if (!formData.firstName) {
        errors.firstName = 'First name is required';
        isValid = false;
      }
      
      if (!formData.lastName) {
        errors.lastName = 'Last name is required';
        isValid = false;
      }
      
      if (!formData.address) {
        errors.address = 'Address is required';
        isValid = false;
      }
      
      if (!formData.city) {
        errors.city = 'City is required';
        isValid = false;
      }
      
      if (!formData.state) {
        errors.state = 'State is required';
        isValid = false;
      }
      
      if (!formData.zipCode) {
        errors.zipCode = 'ZIP code is required';
        isValid = false;
      }
      
      if (!formData.country) {
        errors.country = 'Country is required';
        isValid = false;
      }
    } else if (step === 2) {
      // Validate billing information if not same as shipping
      if (!formData.billingSameAsShipping) {
        if (!formData.billingFirstName) {
          errors.billingFirstName = 'First name is required';
          isValid = false;
        }
        
        if (!formData.billingLastName) {
          errors.billingLastName = 'Last name is required';
          isValid = false;
        }
        
        if (!formData.billingAddress) {
          errors.billingAddress = 'Address is required';
          isValid = false;
        }
        
        if (!formData.billingCity) {
          errors.billingCity = 'City is required';
          isValid = false;
        }
        
        if (!formData.billingState) {
          errors.billingState = 'State is required';
          isValid = false;
        }
        
        if (!formData.billingZipCode) {
          errors.billingZipCode = 'ZIP code is required';
          isValid = false;
        }
        
        if (!formData.billingCountry) {
          errors.billingCountry = 'Country is required';
          isValid = false;
        }
      }
    } else if (step === 3) {
      // Validate payment information
      if (formData.paymentMethod === 'credit-card') {
        if (!formData.cardNumber) {
          errors.cardNumber = 'Card number is required';
          isValid = false;
        } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
          errors.cardNumber = 'Card number must be 16 digits';
          isValid = false;
        }
        
        if (!formData.cardName) {
          errors.cardName = 'Name on card is required';
          isValid = false;
        }
        
        if (!formData.expiryMonth) {
          errors.expiryMonth = 'Expiry month is required';
          isValid = false;
        }
        
        if (!formData.expiryYear) {
          errors.expiryYear = 'Expiry year is required';
          isValid = false;
        }
        
        if (!formData.cvv) {
          errors.cvv = 'CVV is required';
          isValid = false;
        } else if (!/^\d{3,4}$/.test(formData.cvv)) {
          errors.cvv = 'CVV must be 3 or 4 digits';
          isValid = false;
        }
      }
      
      if (!formData.acceptTerms) {
        errors.acceptTerms = 'You must accept the terms and conditions';
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  // Navigation between steps
  function nextStep() {
    if (validateStep(formStep)) {
      if (formStep < 3) {
        formStep += 1;
        window.scrollTo(0, 0);
      }
    }
  }
  
  function prevStep() {
    if (formStep > 1) {
      formStep -= 1;
      window.scrollTo(0, 0);
    }
  }
  
  // Copy shipping info to billing info
  function updateBillingInfo() {
    if (formData.billingSameAsShipping) {
      formData.billingFirstName = formData.firstName;
      formData.billingLastName = formData.lastName;
      formData.billingAddress = formData.address;
      formData.billingApartment = formData.apartment;
      formData.billingCity = formData.city;
      formData.billingState = formData.state;
      formData.billingZipCode = formData.zipCode;
      formData.billingCountry = formData.country;
    }
  }
  
  // Format credit card number with spaces
  function formatCardNumber(e) {
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let newVal = '';
    
    for (let i = 0; i < val.length; i++) {
      if (i % 4 === 0 && i > 0) {
        newVal = newVal + ' ';
      }
      newVal = newVal + val[i];
    }
    
    formData.cardNumber = newVal.substring(0, 19);
  }
  
  // Handle form submission
  async function submitOrder() {
    if (validateStep(formStep)) {
      formSubmitting = true;
      formSubmitted = true;
      
      try {
        // Simulate API call to process order
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Emit event for successful order
        events.emit('checkout.complete', {
          orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          total: total,
          items: cartItems
        });
        
        // Clear cart after successful order
        localStorage.removeItem('cartItems');
        
        // Show success state
        formSubmitSuccess = true;
        
        // Track order completion
        events.emit('analytics.track', {
          event: 'order_completed',
          orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          total: total,
          items: cartItems
        });
      } catch (error) {
        console.error('Error processing order:', error);
        errors.submit = 'An error occurred while processing your order. Please try again.';
      } finally {
        formSubmitting = false;
      }
    }
  }
  
  // Load cart items from local storage on component mount
  function loadCartItems() {
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        cartItems = JSON.parse(storedCart);
        calculateTotals();
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      cartItems = [];
    }
  }
  
  // Calculate order totals
  function calculateTotals() {
    subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    tax = subtotal * 0.07; // 7% tax rate
    total = subtotal + shipping + tax;
  }
  
  // Initial setup on component mount
  svelte.onMount(() => {
    loadCartItems();
    
    // Handle billingSameAsShipping changes
    $: if (formData.billingSameAsShipping) {
      updateBillingInfo();
    }
  });
</script>

<div class="checkout-form">
  {#if formSubmitSuccess}
    <div class="checkout-success">
      <div class="success-icon">✓</div>
      <h1>Thank You for Your Order!</h1>
      <p>Your order has been received and is being processed.</p>
      <p>A confirmation email has been sent to <strong>{formData.email}</strong>.</p>
      <div class="success-actions">
        <a href="/" class="button-secondary">Continue Shopping</a>
        <a href="/order-tracking" class="button-primary">Track Your Order</a>
      </div>
    </div>
  {:else}
    <div class="checkout-header">
      <h1>Checkout</h1>
      <div class="checkout-steps">
        <div class="step {formStep >= 1 ? 'active' : ''} {formStep > 1 ? 'completed' : ''}">
          <div class="step-number">1</div>
          <div class="step-label">Shipping</div>
        </div>
        <div class="step-connector"></div>
        <div class="step {formStep >= 2 ? 'active' : ''} {formStep > 2 ? 'completed' : ''}">
          <div class="step-number">2</div>
          <div class="step-label">Billing</div>
        </div>
        <div class="step-connector"></div>
        <div class="step {formStep >= 3 ? 'active' : ''}">
          <div class="step-number">3</div>
          <div class="step-label">Payment</div>
        </div>
      </div>
    </div>
    
    <div class="checkout-main">
      <div class="checkout-content">
        <form on:submit|preventDefault={formStep === 3 ? submitOrder : nextStep}>
          {#if formStep === 1}
            <!-- Step 1: Contact and Shipping Information -->
            <div class="form-section">
              <h2>Contact Information</h2>
              <div class="form-group">
                <label for="email">Email Address <span class="required">*</span></label>
                <input 
                  type="email" 
                  id="email" 
                  bind:value={formData.email} 
                  class:error={errors.email}
                  required
                />
                {#if errors.email}
                  <div class="error-message">{errors.email}</div>
                {/if}
              </div>
              
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  bind:value={formData.phone} 
                  placeholder="(Optional)"
                />
              </div>
            </div>
            
            <div class="form-section">
              <h2>Shipping Address</h2>
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">First Name <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="firstName" 
                    bind:value={formData.firstName} 
                    class:error={errors.firstName}
                    required
                  />
                  {#if errors.firstName}
                    <div class="error-message">{errors.firstName}</div>
                  {/if}
                </div>
                
                <div class="form-group">
                  <label for="lastName">Last Name <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="lastName" 
                    bind:value={formData.lastName} 
                    class:error={errors.lastName}
                    required
                  />
                  {#if errors.lastName}
                    <div class="error-message">{errors.lastName}</div>
                  {/if}
                </div>
              </div>
              
              <div class="form-group">
                <label for="address">Address <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="address" 
                  bind:value={formData.address} 
                  class:error={errors.address}
                  required
                />
                {#if errors.address}
                  <div class="error-message">{errors.address}</div>
                {/if}
              </div>
              
              <div class="form-group">
                <label for="apartment">Apartment, Suite, etc.</label>
                <input 
                  type="text" 
                  id="apartment" 
                  bind:value={formData.apartment} 
                  placeholder="(Optional)"
                />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="city">City <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="city" 
                    bind:value={formData.city} 
                    class:error={errors.city}
                    required
                  />
                  {#if errors.city}
                    <div class="error-message">{errors.city}</div>
                  {/if}
                </div>
                
                <div class="form-group">
                  <label for="state">State <span class="required">*</span></label>
                  <select 
                    id="state" 
                    bind:value={formData.state} 
                    class:error={errors.state}
                    required
                  >
                    <option value="">Select State</option>
                    {#each usStates as state}
                      <option value={state.code}>{state.name}</option>
                    {/each}
                  </select>
                  {#if errors.state}
                    <div class="error-message">{errors.state}</div>
                  {/if}
                </div>
                
                <div class="form-group">
                  <label for="zipCode">ZIP Code <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="zipCode" 
                    bind:value={formData.zipCode} 
                    class:error={errors.zipCode}
                    required
                  />
                  {#if errors.zipCode}
                    <div class="error-message">{errors.zipCode}</div>
                  {/if}
                </div>
              </div>
              
              <div class="form-group">
                <label for="country">Country <span class="required">*</span></label>
                <select 
                  id="country" 
                  bind:value={formData.country} 
                  class:error={errors.country}
                  required
                >
                  <option value="">Select Country</option>
                  {#each countries as country}
                    <option value={country.code}>{country.name}</option>
                  {/each}
                </select>
                {#if errors.country}
                  <div class="error-message">{errors.country}</div>
                {/if}
              </div>
            </div>
            
            <div class="form-actions">
              <a href="/cart" class="button-secondary">Back to Cart</a>
              <button type="submit" class="button-primary">Continue to Billing</button>
            </div>
          {:else if formStep === 2}
            <!-- Step 2: Billing Information -->
            <div class="form-section">
              <h2>Billing Information</h2>
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    bind:checked={formData.billingSameAsShipping} 
                    on:change={updateBillingInfo}
                  />
                  <span>Same as shipping address</span>
                </label>
              </div>
              
              {#if !formData.billingSameAsShipping}
                <div class="form-row">
                  <div class="form-group">
                    <label for="billingFirstName">First Name <span class="required">*</span></label>
                    <input 
                      type="text" 
                      id="billingFirstName" 
                      bind:value={formData.billingFirstName} 
                      class:error={errors.billingFirstName}
                      required
                    />
                    {#if errors.billingFirstName}
                      <div class="error-message">{errors.billingFirstName}</div>
                    {/if}
                  </div>
                  
                  <div class="form-group">
                    <label for="billingLastName">Last Name <span class="required">*</span></label>
                    <input 
                      type="text" 
                      id="billingLastName" 
                      bind:value={formData.billingLastName} 
                      class:error={errors.billingLastName}
                      required
                    />
                    {#if errors.billingLastName}
                      <div class="error-message">{errors.billingLastName}</div>
                    {/if}
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="billingAddress">Address <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="billingAddress" 
                    bind:value={formData.billingAddress} 
                    class:error={errors.billingAddress}
                    required
                  />
                  {#if errors.billingAddress}
                    <div class="error-message">{errors.billingAddress}</div>
                  {/if}
                </div>
                
                <div class="form-group">
                  <label for="billingApartment">Apartment, Suite, etc.</label>
                  <input 
                    type="text" 
                    id="billingApartment" 
                    bind:value={formData.billingApartment} 
                    placeholder="(Optional)"
                  />
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="billingCity">City <span class="required">*</span></label>
                    <input 
                      type="text" 
                      id="billingCity" 
                      bind:value={formData.billingCity} 
                      class:error={errors.billingCity}
                      required
                    />
                    {#if errors.billingCity}
                      <div class="error-message">{errors.billingCity}</div>
                    {/if}
                  </div>
                  
                  <div class="form-group">
                    <label for="billingState">State <span class="required">*</span></label>
                    <select 
                      id="billingState" 
                      bind:value={formData.billingState} 
                      class:error={errors.billingState}
                      required
                    >
                      <option value="">Select State</option>
                      {#each usStates as state}
                        <option value={state.code}>{state.name}</option>
                      {/each}
                    </select>
                    {#if errors.billingState}
                      <div class="error-message">{errors.billingState}</div>
                    {/if}
                  </div>
                  
                  <div class="form-group">
                    <label for="billingZipCode">ZIP Code <span class="required">*</span></label>
                    <input 
                      type="text" 
                      id="billingZipCode" 
                      bind:value={formData.billingZipCode} 
                      class:error={errors.billingZipCode}
                      required
                    />
                    {#if errors.billingZipCode}
                      <div class="error-message">{errors.billingZipCode}</div>
                    {/if}
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="billingCountry">Country <span class="required">*</span></label>
                  <select 
                    id="billingCountry" 
                    bind:value={formData.billingCountry} 
                    class:error={errors.billingCountry}
                    required
                  >
                    <option value="">Select Country</option>
                    {#each countries as country}
                      <option value={country.code}>{country.name}</option>
                    {/each}
                  </select>
                  {#if errors.billingCountry}
                    <div class="error-message">{errors.billingCountry}</div>
                  {/if}
                </div>
              {/if}
            </div>
            
            <div class="form-section">
              <h2>Order Notes</h2>
              <div class="form-group">
                <label for="orderNotes">Add notes to your order</label>
                <textarea 
                  id="orderNotes" 
                  bind:value={formData.orderNotes} 
                  placeholder="Special instructions for delivery, gift messages, etc. (Optional)"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="button-secondary" on:click={prevStep}>Back to Shipping</button>
              <button type="submit" class="button-primary">Continue to Payment</button>
            </div>
          {:else if formStep === 3}
            <!-- Step 3: Payment Information -->
            <div class="form-section">
              <h2>Payment Method</h2>
              <div class="payment-methods">
                <label class="payment-method {formData.paymentMethod === 'credit-card' ? 'selected' : ''}">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="credit-card" 
                    bind:group={formData.paymentMethod}
                  />
                  <div class="payment-method-content">
                    <div class="payment-icon">💳</div>
                    <div class="payment-label">Credit / Debit Card</div>
                  </div>
                </label>
                
                <label class="payment-method {formData.paymentMethod === 'paypal' ? 'selected' : ''}">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="paypal" 
                    bind:group={formData.paymentMethod}
                  />
                  <div class="payment-method-content">
                    <div class="payment-icon">PayPal</div>
                    <div class="payment-label">PayPal</div>
                  </div>
                </label>
              </div>
              
              {#if formData.paymentMethod === 'credit-card'}
                <div class="form-group">
                  <label for="cardNumber">Card Number <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="cardNumber" 
                    bind:value={formData.cardNumber} 
                    on:input={formatCardNumber}
                    placeholder="1234 5678 9012 3456"
                    maxlength="19"
                    class:error={errors.cardNumber}
                    required
                  />
                  {#if errors.cardNumber}
                    <div class="error-message">{errors.cardNumber}</div>
                  {/if}
                </div>
                
                <div class="form-group">
                  <label for="cardName">Name on Card <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="cardName" 
                    bind:value={formData.cardName} 
                    class:error={errors.cardName}
                    required
                  />
                  {#if errors.cardName}
                    <div class="error-message">{errors.cardName}</div>
                  {/if}
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="expiryMonth">Expiry Month <span class="required">*</span></label>
                    <select 
                      id="expiryMonth" 
                      bind:value={formData.expiryMonth} 
                      class:error={errors.expiryMonth}
                      required
                    >
                      <option value="">MM</option>
                      {#each months as month}
                        <option value={month.value}>{month.label}</option>
                      {/each}
                    </select>
                    {#if errors.expiryMonth}
                      <div class="error-message">{errors.expiryMonth}</div>
                    {/if}
                  </div>
                  
                  <div class="form-group">
                    <label for="expiryYear">Expiry Year <span class="required">*</span></label>
                    <select 
                      id="expiryYear" 
                      bind:value={formData.expiryYear} 
                      class:error={errors.expiryYear}
                      required
                    >
                      <option value="">YYYY</option>
                      {#each years as year}
                        <option value={year}>{year}</option>
                      {/each}
                    </select>
                    {#if errors.expiryYear}
                      <div class="error-message">{errors.expiryYear}</div>
                    {/if}
                  </div>
                  
                  <div class="form-group">
                    <label for="cvv">CVV <span class="required">*</span></label>
                    <input 
                      type="password" 
                      id="cvv" 
                      bind:value={formData.cvv} 
                      placeholder="123"
                      maxlength="4"
                      class:error={errors.cvv}
                      required
                    />
                    {#if errors.cvv}
                      <div class="error-message">{errors.cvv}</div>
                    {/if}
                  </div>
                </div>
              {:else if formData.paymentMethod === 'paypal'}
                <div class="paypal-info">
                  <p>You will be redirected to PayPal to complete your payment.</p>
                </div>
              {/if}
            </div>
            
            <div class="form-section">
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    bind:checked={formData.acceptTerms} 
                    class:error={errors.acceptTerms}
                    required
                  />
                  <span>
                    I accept the <a href="/terms" target="_blank">Terms and Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                  </span>
                </label>
                {#if errors.acceptTerms}
                  <div class="error-message">{errors.acceptTerms}</div>
                {/if}
              </div>
            </div>
            
            {#if errors.submit}
              <div class="alert alert-error">
                {errors.submit}
              </div>
            {/if}
            
            <div class="form-actions">
              <button type="button" class="button-secondary" on:click={prevStep}>Back to Billing</button>
              <button 
                type="submit" 
                class="button-primary {formSubmitting ? 'loading' : ''}" 
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          {/if}
        </form>
      </div>
      
      <div class="checkout-sidebar">
        <div class="order-summary">
          <h2>Order Summary</h2>
          
          <div class="order-items">
            {#if cartItems.length === 0}
              <div class="empty-cart-message">Your cart is empty</div>
            {:else}
              {#each cartItems as item}
                <div class="order-item">
                  <div class="item-image">
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <span class="item-quantity">{item.quantity}</span>
                  </div>
                  <div class="item-details">
                    <div class="item-name">{item.name}</div>
                    <div class="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
          
          <div class="order-totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div class="secure-checkout">
          <div class="secure-icon">🔒</div>
          <div class="secure-message">Secure Checkout</div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Component-specific styles */
  /* Svelte scoped styles */
  :global(.checkout-form) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  }
  
  .checkout-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
  
  .checkout-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .step-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    color: #666;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  .step.active .step-number {
    background-color: #3498db;
    color: white;
  }
  
  .step.completed .step-number {
    background-color: #27ae60;
    color: white;
  }
  
  .step-connector {
    width: 60px;
    height: 2px;
    background-color: #f0f0f0;
    margin: 0 0.5rem;
  }
  
  .checkout-main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  @media (min-width: 992px) {
    .checkout-main {
      grid-template-columns: 3fr 2fr;
    }
  }
  
  .form-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 576px) {
    .form-row {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .required {
    color: #e74c3c;
  }
  
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="password"],
  select,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input:focus,
  select:focus,
  textarea:focus {
    border-color: #3498db;
    outline: none;
  }
  
  input.error,
  select.error,
  textarea.error {
    border-color: #e74c3c;
  }
  
  .error-message {
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .checkbox-label input {
    margin-right: 0.5rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
  }
  
  .button-primary,
  .button-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .button-primary {
    background-color: #3498db;
    color: white;
    border: 1px solid #3498db;
  }
  
  .button-primary:hover {
    background-color: #2980b9;
  }
  
  .button-primary.loading {
    background-color: #5dade2;
    cursor: wait;
  }
  
  .button-secondary {
    background-color: transparent;
    color: #3498db;
    border: 1px solid #3498db;
  }
  
  .button-secondary:hover {
    background-color: rgba(52, 152, 219, 0.1);
  }
  
  .payment-methods {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (min-width: 576px) {
    .payment-methods {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .payment-method {
    display: block;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .payment-method:hover {
    border-color: #3498db;
  }
  
  .payment-method.selected {
    border-color: #3498db;
    background-color: rgba(52, 152, 219, 0.05);
  }
  
  .payment-method input {
    position: absolute;
    opacity: 0;
  }
  
  .payment-method-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .payment-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .order-summary {
    background-color: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .order-items {
    margin-bottom: 1.5rem;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .order-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .order-item .item-image {
    position: relative;
    width: 60px;
    height: 60px;
    margin-right: 1rem;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .order-item .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .order-item .item-quantity {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #3498db;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
  }
  
  .order-item .item-details {
    flex: 1;
  }
  
  .order-item .item-name {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .order-item .item-price {
    color: #3498db;
    font-weight: 600;
  }
  
  .empty-cart-message {
    text-align: center;
    padding: 2rem 0;
    color: #666;
  }
  
  .order-totals {
    border-top: 1px solid #f0f0f0;
    padding-top: 1rem;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }
  
  .grand-total {
    font-weight: 700;
    font-size: 1.125rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #f0f0f0;
  }
  
  .secure-checkout {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .secure-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .secure-message {
    font-size: 0.875rem;
    color: #666;
  }
  
  .checkout-success {
    text-align: center;
    padding: 3rem 1rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: 0 auto;
  }
  
  .success-icon {
    width: 80px;
    height: 80px;
    background-color: #27ae60;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    margin: 0 auto 1.5rem;
  }
  
  .success-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .alert {
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .alert-error {
    background-color: #fdedec;
    color: #e74c3c;
    border: 1px solid #fadbd8;
  }
</style>