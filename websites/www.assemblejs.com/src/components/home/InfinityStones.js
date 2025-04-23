import React, { useState, useEffect } from 'react';
import './InfinityStones.css';

// Infinity Stone positions (hidden all over the page)
const stonePositions = {
  space: { selector: '.hero-content', position: 'random' },
  reality: { selector: '.feature-card:nth-child(1)', position: 'random' },
  power: { selector: '.languages-grid', position: 'random' },
  mind: { selector: '.footer-content', position: 'random' },
  time: { selector: '.container', position: 'random' },
  soul: { selector: 'header', position: 'random' }
};

// Global variable to track stones (outside React state since we're manipulating DOM directly)
let stonesCollected = 0;
let counterElement = null;

const InfinityStones = () => {
  const [snapActive, setSnapActive] = useState(false);

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
      
      // Add a subtle hint to the console for developers
      console.log('%c✧ Find the six Infinity Stones to unlock a hidden feature... ✧', 'color: #AA00FF; font-weight: bold;');

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
  }, []);

  const collectStone = (stone, stoneElement) => {
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
    
    // No sound needed
    
    // Check if all stones are collected
    if (stonesCollected === 6 && !snapActive) {
      // Final message
      showFinalMessage();
      
      // Trigger the snap after a delay
      setTimeout(() => {
        triggerSnap();
      }, 2000);
    }
  };
  
  const updateCounter = (remaining) => {
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
  };
  
  const showFinalMessage = () => {
    if (!counterElement) return;
    
    counterElement.textContent = 'You found them all!';
    counterElement.classList.add('active');
    
    // Hide just before snap
    setTimeout(() => {
      counterElement.classList.remove('active');
    }, 1500);
  };
  
  const createRippleEffect = (stone) => {
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
  };

  // Collection sound removed as requested

  const triggerSnap = () => {
    // Create snap effect element
    const snapElement = document.createElement('div');
    snapElement.className = 'snap-effect';
    
    // Background color is set in CSS to #0f172a (--dark-bg)
    
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
    
    // Add reload button
    const reloadButton = document.createElement('button');
    reloadButton.className = 'reload-button';
    reloadButton.textContent = 'Restore the Universe';
    reloadButton.addEventListener('click', () => window.location.reload());
    
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
  };

  // Sound functionality removed as requested

  return null; // This component doesn't render anything directly
};

export default InfinityStones;