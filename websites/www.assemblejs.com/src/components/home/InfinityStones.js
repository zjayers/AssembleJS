import { useState, useEffect, useCallback } from 'react';
import './InfinityStones.css';

// Infinity Stone positions (hidden all over the page)
const stonePositions = {
  space: { selector: '.hero-content', position: 'random' },
  reality: { selector: '.feature-card:nth-child(1)', position: 'random' },
  power: { selector: '.languages-grid', position: 'random' },
  mind: { selector: '.footer-container', position: 'random' },
  time: { selector: '.container', position: 'random' },
  soul: { selector: 'header', position: 'random' }
};

// Global variable to track stones (outside React state since we're manipulating DOM directly)
let stonesCollected = 0;
let counterElement = null;

const InfinityStones = () => {
  const [snapActive, setSnapActive] = useState(false);

  // Function to create ripple effect
  const createRippleEffect = useCallback((stone) => {
    // Get stone color
    const stoneColors = {
      space: '#3D5AFE',
      reality: '#FF1744',
      power: '#AA00FF',
      mind: '#FFAB00',
      time: '#00BFA5',
      soul: '#FF9100'
    };
    
    // Create ripple element
    const ripple = document.createElement('div');
    ripple.className = 'stone-ripple';
    ripple.style.backgroundColor = stoneColors[stone];
    
    // Add a subtle radial gradient to enhance the power effect
    ripple.style.background = `radial-gradient(circle at center, ${stoneColors[stone]}88 0%, ${stoneColors[stone]}66 40%, ${stoneColors[stone]}44 70%, ${stoneColors[stone]}22 100%)`;
    
    document.body.appendChild(ripple);
    
    // Activate ripple
    setTimeout(() => {
      ripple.classList.add('active');
      
      // Remove after animation completes
      setTimeout(() => {
        ripple.remove();
      }, 2100); // Slightly longer than animation duration to ensure completion
    }, 10);
  }, []);

  // Function to update counter display
  const updateCounter = useCallback((remaining) => {
    if (!counterElement) return;
    
    // Clear any existing timeout
    if (window.counterTimeout) {
      clearTimeout(window.counterTimeout);
    }
    
    // Update text directly
    counterElement.textContent = remaining === 0 
      ? `You found them all!` 
      : `You have ${remaining} more to collect`;
    
    // Show the counter
    counterElement.classList.add('active');
    counterElement.classList.remove('hidden');
    
    // Hide after a few seconds
    window.counterTimeout = setTimeout(() => {
      counterElement.classList.remove('active');
      counterElement.classList.add('hidden');
      
      setTimeout(() => {
        counterElement.classList.remove('hidden');
      }, 500);
    }, 3000);
  }, []);
  
  // Function to show final message
  const showFinalMessage = useCallback(() => {
    if (!counterElement) return;
    
    counterElement.textContent = 'You found them all!';
    counterElement.classList.add('active');
    
    // Hide just before snap
    setTimeout(() => {
      counterElement.classList.remove('active');
    }, 1500);
  }, []);
  
  // Function to trigger snap
  const triggerSnap = useCallback(() => {
    // Create snap effect element
    const snapElement = document.createElement('div');
    snapElement.className = 'snap-effect';
    
    // Background color uses CSS variable to respect theme
    
    // Add floating stones container
    const stonesContainer = document.createElement('div');
    stonesContainer.className = 'floating-stones-container';
    snapElement.appendChild(stonesContainer);
    
    // Create each infinity stone with random position and movement
    const stoneColors = {
      space: '#1E88E5', // Blue
      reality: '#E53935', // Red
      power: '#8E24AA', // Purple
      mind: '#FDD835', // Yellow
      time: '#00897B', // Green
      soul: '#FB8C00'  // Orange
    };
    
    // Add each infinity stone
    Object.entries(stoneColors).forEach(([stoneName, color]) => {
      const stone = document.createElement('div');
      stone.className = `floating-stone ${stoneName}`;
      
      // Set random starting position (within viewport)
      const randomX = 10 + Math.random() * 80;
      const randomY = 10 + Math.random() * 80;
      stone.style.left = `${randomX}%`;
      stone.style.top = `${randomY}%`;
      
      // Set unique animation timing for each stone
      stone.style.animationDuration = `${30 + Math.random() * 20}s`;
      stone.style.animationDelay = `${Math.random() * 5}s`;
      
      // Apply color
      stone.style.backgroundColor = color;
      stone.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
      
      stonesContainer.appendChild(stone);
    });
    
    // Add balance message
    const messageElement = document.createElement('div');
    messageElement.className = 'balance-message';
    messageElement.textContent = 'Perfectly balanced, as all web development should be.';
    snapElement.appendChild(messageElement);
    
    // Add submessage
    const submessageElement = document.createElement('div');
    submessageElement.className = 'balance-submessage';
    submessageElement.textContent = 'In the cosmic dance of frameworks and libraries, true power comes from harmony.';
    snapElement.appendChild(submessageElement);
    
    // Add button with initial "Initializing Portal" text
    const reloadButton = document.createElement('button');
    reloadButton.className = 'reload-button initializing';
    reloadButton.disabled = true; // Disable initially
    
    // Create text wrapper for button text with span for gold gradient
    const buttonText = document.createElement('span');
    buttonText.textContent = 'Initializing Portal...';
    reloadButton.appendChild(buttonText);
    
    // Create portal container inside the button
    const portalContainer = document.createElement('div');
    portalContainer.className = 'portal-container';
    reloadButton.appendChild(portalContainer);
    
    // Create the portal circle
    const portalCircle = document.createElement('div');
    portalCircle.className = 'portal-circle';
    portalContainer.appendChild(portalCircle);
    
    // Create portal view
    const portalView = document.createElement('div');
    portalView.className = 'portal-view';
    portalCircle.appendChild(portalView);
    
    // Create portal image that respects theme
    const portalImage = document.createElement('div');
    portalImage.className = 'portal-image';
    
    // Check if dark mode is active
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    if (!isDarkMode) {
      portalImage.classList.add('light-mode');
    }
    
    portalView.appendChild(portalImage);
    
    // Add click handler (will only work once enabled)
    reloadButton.addEventListener('click', () => window.location.reload());
    
    // Enable button after 5 seconds
    setTimeout(() => {
      // Update button text using the span element
      buttonText.textContent = 'ASSEMBLE and Restore the Universe';
      reloadButton.disabled = false;
      reloadButton.classList.remove('initializing');
      reloadButton.classList.add('ready');
    }, 5000);
    
    snapElement.appendChild(reloadButton);
    document.body.appendChild(snapElement);
    
    // Activate the snap
    setTimeout(() => {
      setSnapActive(true);
      snapElement.classList.add('active');
      
      // Hide all content except our snap effect
      const elements = document.querySelectorAll('body > *:not(.snap-effect):not(.stone-counter)');
      elements.forEach(element => {
        element.style.transition = 'opacity 1s ease';
        element.style.opacity = '0';
        
        // Hide the element after transition
        setTimeout(() => {
          element.style.display = 'none';
        }, 1000);
      });
    }, 100);
  }, [setSnapActive]);
  
  // Function to collect stone - define this with useCallback to avoid dependency issues
  const collectStone = useCallback((stone, stoneElement) => {
    // Skip if already collected (check class instead of state)
    if (stoneElement.classList.contains('collected')) {
      return;
    }
    
    // Highlight the stone
    stoneElement.classList.add('collected');
    
    // Create ripple effect
    createRippleEffect(stone);
    
    // Increment global counter
    stonesCollected += 1;
    
    // Update counter display with the remaining count
    updateCounter(6 - stonesCollected);
    
    // Check if all stones are collected
    if (stonesCollected === 6 && !snapActive) {
      // Final message
      showFinalMessage();
      
      // Trigger the snap after a delay
      setTimeout(() => {
        triggerSnap();
      }, 2000);
    }
  }, [snapActive, createRippleEffect, updateCounter, showFinalMessage, triggerSnap]);

  useEffect(() => {
    // Add infinity stones to the page after elements are loaded
    const addInfinityStones = () => {
      // Check if key elements exist
      const anyElement = document.querySelector('.hero-content, .feature-card, .footer');
      if (!anyElement) return;

      // Check if stones are already added
      if (document.querySelector('.infinity-stone')) return;
      
      // Create counter element
      counterElement = document.createElement('div');
      counterElement.className = 'stone-counter';
      counterElement.id = 'stone-counter';
      counterElement.textContent = 'You have 6 more to collect';
      document.body.appendChild(counterElement);
      
      // Reset global counter
      stonesCollected = 0;

      Object.entries(stonePositions).forEach(([stone, { selector, position }]) => {
        const element = document.querySelector(selector);
        if (!element) return;

        const stoneElement = document.createElement('div');
        stoneElement.className = `infinity-stone ${stone}`;
        stoneElement.dataset.stone = stone;
        
        // Make sure parent element has position
        if (window.getComputedStyle(element).position === 'static') {
          element.style.position = 'relative';
        }
        
        // Random position within the element, biased toward corners and edges
        const maxTop = Math.max(10, element.offsetHeight - 10);
        const maxLeft = Math.max(10, element.offsetWidth - 10);
        
        // Position bias toward edges for better hiding
        const edgeBias = Math.random() > 0.5;
        let randomTop, randomLeft;
        
        if (edgeBias) {
          // Position near edges
          randomTop = Math.random() > 0.5 ? 
            Math.floor(Math.random() * 20) : 
            Math.floor(maxTop - Math.random() * 20);
          
          randomLeft = Math.floor(Math.random() * maxLeft);
        } else {
          // Position near corners or randomly
          randomTop = Math.floor(Math.random() * maxTop);
          randomLeft = Math.random() > 0.5 ? 
            Math.floor(Math.random() * 20) : 
            Math.floor(maxLeft - Math.random() * 20);
        }
        
        stoneElement.style.top = `${randomTop}px`;
        stoneElement.style.left = `${randomLeft}px`;
        
        // Add the stone to the element
        element.appendChild(stoneElement);

        // Add click event
        stoneElement.addEventListener('click', () => collectStone(stone, stoneElement));
      });
    };

    // Attempt to add stones every 500ms until successful
    const interval = setInterval(addInfinityStones, 500);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      const stones = document.querySelectorAll('.infinity-stone');
      stones.forEach(stone => stone.remove());
      
      // Also remove counter
      if (counterElement) {
        counterElement.remove();
      }
      
      // Reset global counter
      stonesCollected = 0;
    };
  }, [collectStone]); // Include collectStone dependency

  return null; // This component doesn't render anything directly
};

export default InfinityStones;