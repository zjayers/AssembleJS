import React, { useEffect } from 'react';
import './ParallaxBackground.css';

const ParallaxBackground = () => {
  useEffect(() => {
    // Handle parallax effect on mouse move
    const handleMouseMove = (e) => {
      const root = document.documentElement;
      
      // Calculate parallax position based on mouse position
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      // Update CSS variables for parallax effect
      root.style.setProperty('--parallax-x', `${(x - 0.5) * 20}px`);
      root.style.setProperty('--parallax-y', `${(y - 0.5) * 20}px`);
      root.style.setProperty('--parallax-reverse-x', `${(0.5 - x) * 20}px`);
      root.style.setProperty('--parallax-reverse-y', `${(0.5 - y) * 20}px`);
    };

    // Add event listener for mouse move
    window.addEventListener('mousemove', handleMouseMove);
    
    // Create abstract shapes
    const createShapes = () => {
      const container = document.querySelector('.parallax-shapes');
      if (!container) return;
      
      // Array of shape types
      const shapeTypes = [
        'pentagon', 'star', 'octagon', 'diamond', 
        'triangle', 'hexagon', 'circle', 'hexagon'
      ];
      
      // Create 8 shapes
      for (let i = 0; i < 8; i++) {
        const shape = document.createElement('div');
        shape.className = `shape shape-${i + 1}`;
        shape.dataset.shape = shapeTypes[i];
        container.appendChild(shape);
      }
    };
    
    createShapes();
    
    // Cleanup event listeners and shapes
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      const shapes = document.querySelectorAll('.shape');
      shapes.forEach(shape => shape.remove());
    };
  }, []);
  
  return (
    <div className="parallax-bg" aria-hidden="true">
      <div className="parallax-shapes"></div>
    </div>
  );
};

export default ParallaxBackground;