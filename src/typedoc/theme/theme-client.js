// AssembleJS TypeDoc Theme Client-side JavaScript
// This script handles the theme switching and interactive elements

// Initialize everything immediately without waiting for DOMContentLoaded
(function () {
  // Theme toggle functionality
  const themeToggle = document.getElementById("theme-toggle");
  const darkIcon = document.getElementById("dark-icon");
  const lightIcon = document.getElementById("light-icon");
  const logoIcon = document.querySelector(".logo-icon");

  // Theme handling
  const updateThemeDisplay = (isLight) => {
    // This shows/hides the appropriate icon based on current theme
    if (isLight) {
      // In light mode, show the moon (switch to dark)
      darkIcon.style.display = "block";
      lightIcon.style.display = "none";
    } else {
      // In dark mode, show the sun (switch to light)
      darkIcon.style.display = "none";
      lightIcon.style.display = "block";
    }
  };

  // Function to properly set theme
  const setTheme = (theme) => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
      document.body.style.backgroundColor = "var(--light-bg)";
      document.body.style.color = "var(--light-text)";
      localStorage.setItem("assemblejs-theme", "light");
      updateThemeDisplay(true);
    } else {
      document.body.classList.remove("light-theme");
      document.body.style.backgroundColor = "var(--dark-bg)";
      document.body.style.color = "var(--dark-text)";
      localStorage.setItem("assemblejs-theme", "dark");
      updateThemeDisplay(false);
    }

    // Force redraw of background elements
    document.body.style.transition = "background-color 0.3s ease";
  };

  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem("assemblejs-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Set initial theme
  if (savedTheme) {
    // Use saved preference if available
    setTheme(savedTheme);
  } else {
    // Otherwise use system preference
    setTheme(prefersDark ? "dark" : "light");
  }

  // Toggle theme when button is clicked
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.body.classList.contains("light-theme")
        ? "light"
        : "dark";
      const newTheme = currentTheme === "light" ? "dark" : "light";
      setTheme(newTheme);
    });
  }

  // Animate logo blocks on page load with staggered delay
  const orbitContainer = document.querySelector(".orbit-container");
  const logoBlocks = document.querySelectorAll(".logo-block");

  // Ensure logo blocks appear with animation
  if (logoIcon) {
    setTimeout(() => {
      logoIcon.classList.add("animated");
    }, 500);
  }

  // Add click handler to logo icon for explosion animation
  if (logoIcon && orbitContainer && logoBlocks.length) {
    // Store original transforms for each logo block
    logoBlocks.forEach((block, index) => {
      // Add click handler for explosion effect
      block.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent parent click

        // Don't do anything if already exploding
        if (block.classList.contains("exploding")) return;

        // Pause the orbit container animation
        orbitContainer.classList.add("paused");

        // Get current computed transform
        const computedStyle = window.getComputedStyle(block);
        const currentTransform = computedStyle.transform;

        // Create explosion direction - each block explodes in a different direction
        const angle = index * 60 * (Math.PI / 180); // Convert to radians
        const distance = 100; // How far to explode
        const explodeX = Math.cos(angle) * distance;
        const explodeY = Math.sin(angle) * distance;

        // Get block color for the glow effect
        const computedBgColor = window.getComputedStyle(block).backgroundColor;

        // Set custom properties for the explosion animation
        block.style.setProperty("--original-transform", currentTransform);
        block.style.setProperty(
          "--explosion-transform",
          `${currentTransform} translate(${explodeX}px, ${explodeY}px) scale(1.5) rotateY(${
            Math.random() * 720 - 360
          }deg) rotateX(${Math.random() * 720 - 360}deg)`
        );
        block.style.setProperty("--block-color", computedBgColor);

        // Add exploding class to trigger animation
        block.classList.add("exploding");

        // After animation completes, remove class and resume orbit
        setTimeout(() => {
          block.classList.remove("exploding");
          block.style.removeProperty("--original-transform");
          block.style.removeProperty("--explosion-transform");

          // Resume the orbit container animation
          orbitContainer.classList.remove("paused");
        }, 1500); // Match the animation duration
      });
    });

    // Function to handle logo explosion animation
    function explodeLogoBlocks() {
      // Only continue if we have blocks and orbit container
      if (!logoBlocks.length || !orbitContainer) return;

      // Prevent firing if blocks are already exploding
      if (orbitContainer.classList.contains("paused")) return;

      // Pause the orbit container animation
      orbitContainer.classList.add("paused");

      // Trigger explosion on each block with slight delays
      logoBlocks.forEach((block, index) => {
        setTimeout(() => {
          // Get current computed transform
          const computedStyle = window.getComputedStyle(block);
          const currentTransform = computedStyle.transform;

          // Create explosion direction relative to center
          const angle = index * 60 * (Math.PI / 180); // Convert to radians
          const distance = 120; // Further distance for group explosion
          const explodeX = Math.cos(angle) * distance;
          const explodeY = Math.sin(angle) * distance;

          // Get block color for the glow effect
          const computedBgColor =
            window.getComputedStyle(block).backgroundColor;

          // Set custom properties for the explosion animation
          block.style.setProperty("--original-transform", currentTransform);
          block.style.setProperty(
            "--explosion-transform",
            `${currentTransform} translate(${explodeX}px, ${explodeY}px) scale(1.7) rotateY(${
              angle * 30
            }deg)`
          );
          block.style.setProperty("--block-color", computedBgColor);

          // Add exploding class to trigger animation
          block.classList.add("exploding");

          // After animation completes, remove class
          setTimeout(() => {
            block.classList.remove("exploding");
            block.style.removeProperty("--original-transform");
            block.style.removeProperty("--explosion-transform");
            block.style.removeProperty("--block-color");

            // Resume the orbit container animation when the last block is done
            if (index === logoBlocks.length - 1) {
              setTimeout(() => {
                orbitContainer.classList.remove("paused");
              }, 300); // Small additional delay for smoother return
            }
          }, 2000); // Slightly longer animation for group effect
        }, index * 120); // Slightly longer stagger for more dramatic effect
      });
    }

    // Add click handler to logo icon
    logoIcon.addEventListener("click", explodeLogoBlocks);

    // Also add click handler to the orbit container for better clickability
    orbitContainer.addEventListener("click", function (e) {
      // Prevent event from bubbling to individual blocks
      e.stopPropagation();
      // Trigger the explosion
      explodeLogoBlocks();
    });
  }

  // Add gravitational parallax effect to background and shapes
  const shapes = document.querySelectorAll(".shape");

  if (shapes.length) {
    // Track mouse position and target positions
    let mouseX = 0.5,
      mouseY = 0.5;
    let targetParallaxX = 0,
      targetParallaxY = 0;
    let targetReverseX = 0,
      targetReverseY = 0;
    let shapesTargetPos = Array(shapes.length)
      .fill()
      .map(() => ({ x: 0, y: 0 }));

    // Constants for gravitational effect
    const parallaxIntensity = 15; // Base intensity
    const gravitationalEasing = 0.03; // How quickly elements move toward target
    const maxDistanceInfluence = 1.0; // Maximum influence distance
    const gravityMultiplier = 1.2; // How strong the gravitational pull is

    // Function to calculate the gravitational influence based on distance
    function calculateGravitationalInfluence(distance, maxDistance) {
      // If too far, no influence
      if (distance > maxDistance) return 0;

      // Inverse square law - mimics real gravity
      const distanceSquared = Math.max(0.1, distance * distance); // Avoid division by zero
      const inverseSquare = 1 / distanceSquared;

      // Scale and clamp the result
      return Math.min(inverseSquare * gravityMultiplier, 3);
    }

    // Update mouse position on move
    document.addEventListener("mousemove", (e) => {
      // Calculate mouse position as percentage of viewport
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    });

    // Also track mouseover to ensure we start with the right position
    document.addEventListener(
      "mouseover",
      (e) => {
        if (!mouseX || !mouseY) {
          mouseX = e.clientX / window.innerWidth;
          mouseY = e.clientY / window.innerHeight;
        }
      },
      { once: true }
    );

    // Handle mouse leaving the window
    document.addEventListener("mouseleave", () => {
      // When mouse leaves, slowly return elements to center
      const returnToCenter = () => {
        mouseX = 0.5;
        mouseY = 0.5;
      };
      // Add slight delay for smoother transition
      setTimeout(returnToCenter, 500);
    });

    // Animation loop for smooth, physics-based movement
    function animateParallax() {
      // Calculate offset based on mouse position with gravitational influence
      const offsetX = (mouseX - 0.5) * parallaxIntensity;
      const offsetY = (mouseY - 0.5) * parallaxIntensity;

      // Gradually move current position toward target position for background layers
      targetParallaxX += (offsetX - targetParallaxX) * gravitationalEasing;
      targetParallaxY += (offsetY - targetParallaxY) * gravitationalEasing;
      targetReverseX += (-offsetX * 0.7 - targetReverseX) * gravitationalEasing;
      targetReverseY += (-offsetY * 0.7 - targetReverseY) * gravitationalEasing;

      // Apply smooth, gradual movement to background layers
      document.body.style.setProperty("--parallax-x", `${targetParallaxX}px`);
      document.body.style.setProperty("--parallax-y", `${targetParallaxY}px`);
      document.body.style.setProperty(
        "--parallax-reverse-x",
        `${targetReverseX}px`
      );
      document.body.style.setProperty(
        "--parallax-reverse-y",
        `${targetReverseY}px`
      );

      // Update and apply movement to each shape with varying gravitational influences
      shapes.forEach((shape, index) => {
        // Get shape position relative to viewport
        const rect = shape.getBoundingClientRect();
        const shapeX = (rect.left + rect.width / 2) / window.innerWidth;
        const shapeY = (rect.top + rect.height / 2) / window.innerHeight;

        // Calculate distance from mouse to shape (normalized 0-1)
        const dx = mouseX - shapeX;
        const dy = mouseY - shapeY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate gravitational influence based on distance
        const influence = calculateGravitationalInfluence(
          distance,
          maxDistanceInfluence
        );

        // Different shapes have different mass (resistance to movement)
        const mass = 0.7 + index * 0.08;
        const easingFactor = gravitationalEasing / mass;

        // Direction is toward the mouse for gravitational pull
        const directionX =
          dx * influence * parallaxIntensity * (1 + (index % 3) * 0.5);
        const directionY =
          dy * influence * parallaxIntensity * (1 + (index % 2) * 0.6);

        // Add some randomness to make movement more organic
        const jitterX = Math.sin(Date.now() * 0.001 + index) * 0.2;
        const jitterY = Math.cos(Date.now() * 0.001 + index) * 0.2;

        // Set maximum range to prevent bunching
        const maxRange = 40; // Maximum pixel distance from original position

        // Limit the range to prevent bunching up
        const limitedX = Math.max(-maxRange, Math.min(maxRange, directionX));
        const limitedY = Math.max(-maxRange, Math.min(maxRange, directionY));

        // Add spring-back effect when away from mouse too long
        const distanceFromOrigin = Math.sqrt(
          shapesTargetPos[index].x * shapesTargetPos[index].x +
            shapesTargetPos[index].y * shapesTargetPos[index].y
        );

        // Stronger spring force the further the shape gets from origin
        const springForce = Math.max(0, (distanceFromOrigin - 20) / 100);

        // Update target position with gravitational pull, limits and spring-back
        shapesTargetPos[index].x +=
          (limitedX - shapesTargetPos[index].x) * easingFactor -
          shapesTargetPos[index].x * springForce;
        shapesTargetPos[index].y +=
          (limitedY - shapesTargetPos[index].y) * easingFactor -
          shapesTargetPos[index].y * springForce;

        // Final position includes slight jitter
        const finalX = shapesTargetPos[index].x + jitterX;
        const finalY = shapesTargetPos[index].y + jitterY;

        // Apply transform with eased values and add rotation proportional to movement
        const rotation = Math.max(2, Math.min(20, Math.abs(finalX * 0.1)));
        shape.style.transform = `translate(${finalX}px, ${finalY}px) 
                                rotate(${rotation * Math.sign(finalX)}deg) 
                                scale(${1 + Math.abs(influence) * 0.05})`;
      });

      // Continue the animation loop
      requestAnimationFrame(animateParallax);
    }

    // Start the animation loop
    animateParallax();
  }
})();
