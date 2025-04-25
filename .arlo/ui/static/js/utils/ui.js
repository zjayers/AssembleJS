// Advanced options toggle
export function setupAdvancedOptionsToggle() {
  const advancedToggle = document.getElementById('advanced-toggle');
  const advancedOptions = document.getElementById('advanced-options');
  if (advancedToggle && advancedOptions) {
    advancedToggle.addEventListener('click', () => {
      const isVisible = advancedOptions.style.display === 'block';
      advancedOptions.style.display = isVisible ? 'none' : 'block';
      const toggleIcon = advancedToggle.querySelector('svg');
      if (toggleIcon) {
        toggleIcon.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  }
}

// Output tab switching
export function setupOutputTabs() {
  const outputTabs = document.querySelectorAll('.output-tab');
  outputTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      outputTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding pane
      const tabId = tab.getAttribute('data-tab');
      const panes = document.querySelectorAll('.output-pane');
      panes.forEach(pane => {
        pane.style.display = 'none';
      });
      const targetPane = document.getElementById(`${tabId}-pane`);
      if (targetPane) {
        targetPane.style.display = 'block';
      }
    });
  });
}

// Task history item selection
export function setupTaskHistorySelection() {
  const taskItems = document.querySelectorAll('.task-item');
  const taskDetailContent = document.getElementById('task-detail-content');
  const emptyState = document.querySelector('.task-details-body .empty-state');
  
  taskItems.forEach(item => {
    item.addEventListener('click', () => {
      // Update active item
      taskItems.forEach(t => t.classList.remove('active'));
      item.classList.add('active');
      
      // Show task details
      if (emptyState) emptyState.style.display = 'none';
      if (taskDetailContent) taskDetailContent.style.display = 'block';
    });
  });
}

// Task history filter
export function setupTaskHistoryFilter() {
  const historyFilter = document.getElementById('history-filter');
  if (historyFilter) {
    historyFilter.addEventListener('change', () => {
      const filterValue = historyFilter.value;
      
      // If we have sample items
      const taskItems = document.querySelectorAll('.task-item');
      taskItems.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-status') === filterValue) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
}