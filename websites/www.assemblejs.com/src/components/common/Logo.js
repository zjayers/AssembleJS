import React, { useEffect, useRef, useState } from 'react';
import './Logo.css';

const Logo = () => {
  const logoIconRef = useRef(null);
  const orbitContainerRef = useRef(null);
  const blockRefs = useRef([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(prefersReducedMotion.matches);

    const handleMotionPreferenceChange = (e) => {
      setReducedMotion(e.matches);
    };

    prefersReducedMotion.addEventListener('change', handleMotionPreferenceChange);
    
    const logoIcon = logoIconRef.current;
    const orbitContainer = orbitContainerRef.current;
    const logoBlocks = blockRefs.current;

    // Only start animation if reduced motion is not preferred
    if (!reducedMotion) {
      // Ensure logo animation starts after a short delay
      setTimeout(() => {
        // Add animated class to start animations
        if (logoIcon) {
          logoIcon.classList.add("animated");
        }
      }, 800);
    }

    // Add keyboard and click handlers to logo blocks
    logoBlocks.forEach((block, index) => {
      if (!block) return;
      
      // Add explode animation handler
      const handleExplode = (e) => {
        e.stopPropagation(); // Prevent parent click

        // Don't do anything if already exploding
        if (block.classList.contains("exploding")) return;

        // Pause the orbit container animation
        if (orbitContainer) {
          orbitContainer.classList.add("paused");
        }

        // Create explosion direction - each block explodes in a different direction
        const angle = index * 60 * (Math.PI / 180); // Convert to radians
        const distance = 100; // How far to explode
        const explodeX = Math.cos(angle) * distance;
        const explodeY = Math.sin(angle) * distance;

        // Set custom properties for the explosion animation
        block.style.setProperty("--explode-x", `${explodeX}px`);
        block.style.setProperty("--explode-y", `${explodeY}px`);
        block.style.setProperty("--explode-rotate", `${Math.random() * 720 - 360}deg`);
        block.style.setProperty("--block-color", window.getComputedStyle(block).backgroundColor);

        // Add exploding class to trigger animation
        block.classList.add("exploding");

        // After animation completes, remove class and resume orbit
        setTimeout(() => {
          block.classList.remove("exploding");

          // Resume the orbit container animation
          if (orbitContainer) {
            orbitContainer.classList.remove("paused");
          }
        }, 2000); // Match the animation duration
      };
      
      // Add click handler
      block.addEventListener("click", handleExplode);
      
      // Add keyboard handler (Enter and Space trigger the animation)
      block.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleExplode(e);
        }
      });
    });

    return () => {
      prefersReducedMotion.removeEventListener('change', handleMotionPreferenceChange);
      
      // Clean up event listeners
      logoBlocks.forEach((block) => {
        if (block) {
          block.replaceWith(block.cloneNode(true));
        }
      });
    };
  }, [reducedMotion]);

  const setBlockRef = (el, index) => {
    blockRefs.current[index] = el;
  };

  return (
    <div 
      className={`logo-icon ${reducedMotion ? 'reduced-motion' : ''}`} 
      ref={logoIconRef}
      role="img"
      aria-label="AssembleJS logo - animated hexagon blocks"
    >
      <div className="orbit-container" ref={orbitContainerRef} aria-hidden="true">
        {[1, 2, 3, 4, 5, 6].map((num, index) => (
          <div 
            key={`block-${num}`}
            className={`logo-block block-${num}`} 
            ref={(el) => setBlockRef(el, index)}
            tabIndex="0"
            role="button"
            aria-label={`Logo block ${num} - click to animate`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Logo;