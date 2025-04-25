// Control buttons for task
export function setupTaskControls() {
  const pauseButton = document.getElementById('pause-task');
  const cancelButton = document.getElementById('cancel-task');
  const feedbackButton = document.getElementById('provide-feedback');
  
  if (pauseButton) {
    pauseButton.addEventListener('click', () => {
      const isPaused = pauseButton.textContent === 'Resume Task';
      pauseButton.textContent = isPaused ? 'Pause Task' : 'Resume Task';
      
      // In a real app, this would trigger an API call to pause/resume the task
      alert(isPaused ? 'Task resumed!' : 'Task paused!');
    });
  }
  
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel this task? This action cannot be undone.')) {
        // In a real app, this would trigger an API call to cancel the task
        alert('Task cancelled!');
      }
    });
  }
  
  if (feedbackButton) {
    feedbackButton.addEventListener('click', () => {
      const feedback = prompt('Provide feedback or guidance for the agents working on this task:');
      if (feedback) {
        // In a real app, this would send the feedback to the agents
        alert('Feedback submitted!');
      }
    });
  }
}