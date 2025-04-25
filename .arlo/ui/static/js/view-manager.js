// View manager functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get all navigation items and view containers
  const navItems = document.querySelectorAll('.nav-item');
  const viewContainers = document.querySelectorAll('.view-container');
  
  // Function to activate a view
  function activateView(viewId) {
    // Hide all view containers
    viewContainers.forEach(container => {
      container.classList.remove('active-view');
    });
    
    // Show the selected view container
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add('active-view');
      
      // Update active state in nav items
      navItems.forEach(item => {
        if (item.getAttribute('data-target') === viewId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      
      // Store active view in localStorage
      localStorage.setItem('activeView', viewId);
    }
  }
  
  // Add click event to all nav items
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const targetView = this.getAttribute('data-target');
      if (targetView) {
        activateView(targetView);
      }
    });
  });
  
  // Check if there's a stored active view, otherwise default to workflow
  const storedView = localStorage.getItem('activeView');
  if (storedView && document.getElementById(storedView)) {
    activateView(storedView);
  } else {
    // Default to workflow view
    const defaultView = 'workflow-view';
    const workflowItem = document.querySelector(`.nav-item[data-target="${defaultView}"]`);
    
    if (document.getElementById(defaultView)) {
      activateView(defaultView);
    } else {
      // If workflow view doesn't exist, activate the first view
      const firstNavItem = navItems[0];
      if (firstNavItem) {
        const firstViewId = firstNavItem.getAttribute('data-target');
        if (firstViewId) {
          activateView(firstViewId);
        }
      }
    }
  }
});