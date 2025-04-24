# Multi-step Wizards

This guide demonstrates how to implement multi-step wizards in AssembleJS applications to guide users through complex processes.

## Overview

Multi-step wizards break down complex processes into manageable steps, improving user experience by reducing cognitive load. This cookbook will demonstrate how to build robust, maintainable wizard interfaces in AssembleJS.

## Prerequisites

- AssembleJS project set up
- Basic understanding of AssembleJS components and services
- Familiarity with state management concepts

## Implementation Steps

### 1. Create a Wizard Service

First, let's create a service to handle the wizard state and navigation:

```bash
asm service Wizard
```

This will generate a basic service file. Now let's implement the service:

```typescript
// src/services/wizard.service.ts
import { Service } from '@assemblejs/core';

export interface WizardStep {
  id: string;
  title: string;
  isValid?: boolean;
  isOptional?: boolean;
  isHidden?: boolean;
  data?: Record<string, any>;
}

export interface WizardOptions {
  id: string;
  steps: WizardStep[];
  persistState?: boolean;
  allowSkipToAny?: boolean;
  currentStepIndex?: number;
}

export class WizardService extends Service {
  private options: WizardOptions;
  private storageKey: string;
  private currentStepIndex: number;
  private completedSteps: Set<string> = new Set();
  private validationCallbacks: Record<string, () => boolean> = {};
  private stepData: Record<string, any> = {};
  
  initialize(options: WizardOptions) {
    this.options = {
      persistState: true,
      allowSkipToAny: false,
      currentStepIndex: 0,
      ...options
    };
    
    this.storageKey = `assemblejs-wizard-${this.options.id}`;
    this.currentStepIndex = this.options.currentStepIndex || 0;
    
    // Try to restore state if enabled
    if (this.options.persistState) {
      this.restoreState();
    }
    
    return this;
  }
  
  private persistState() {
    if (typeof window === 'undefined' || !this.options.persistState) {
      return;
    }
    
    const stateToSave = {
      currentStepIndex: this.currentStepIndex,
      completedSteps: Array.from(this.completedSteps),
      stepData: this.stepData
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
  }
  
  private restoreState() {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const savedState = localStorage.getItem(this.storageKey);
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        this.currentStepIndex = parsedState.currentStepIndex || 0;
        this.completedSteps = new Set(parsedState.completedSteps || []);
        this.stepData = parsedState.stepData || {};
      }
    } catch (error) {
      console.error('Failed to restore wizard state:', error);
    }
  }
  
  clearState() {
    if (typeof window === 'undefined') {
      return this;
    }
    
    localStorage.removeItem(this.storageKey);
    this.currentStepIndex = 0;
    this.completedSteps.clear();
    this.stepData = {};
    
    return this;
  }
  
  getCurrentStep(): WizardStep {
    return this.options.steps[this.currentStepIndex];
  }
  
  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }
  
  getTotalSteps(): number {
    return this.options.steps.filter(step => !step.isHidden).length;
  }
  
  getVisibleSteps(): WizardStep[] {
    return this.options.steps.filter(step => !step.isHidden);
  }
  
  getAllSteps(): WizardStep[] {
    return [...this.options.steps];
  }
  
  isFirstStep(): boolean {
    const visibleSteps = this.getVisibleSteps();
    return visibleSteps.findIndex(step => step.id === this.getCurrentStep().id) === 0;
  }
  
  isLastStep(): boolean {
    const visibleSteps = this.getVisibleSteps();
    return visibleSteps.findIndex(step => step.id === this.getCurrentStep().id) === visibleSteps.length - 1;
  }
  
  isStepCompleted(stepId: string): boolean {
    return this.completedSteps.has(stepId);
  }
  
  markStepAsCompleted(stepId: string) {
    this.completedSteps.add(stepId);
    this.persistState();
    return this;
  }
  
  markCurrentStepAsCompleted() {
    const currentStep = this.getCurrentStep();
    return this.markStepAsCompleted(currentStep.id);
  }
  
  setStepValidation(stepId: string, validationFn: () => boolean) {
    this.validationCallbacks[stepId] = validationFn;
    return this;
  }
  
  isStepValid(stepId: string): boolean {
    // If step has a validation function, use it
    if (this.validationCallbacks[stepId]) {
      return this.validationCallbacks[stepId]();
    }
    
    // Check if the step has isValid property
    const step = this.options.steps.find(s => s.id === stepId);
    if (step && step.isValid !== undefined) {
      return step.isValid;
    }
    
    // Default to true if no validation is defined
    return true;
  }
  
  canMoveToStep(stepIndex: number): boolean {
    if (stepIndex < 0 || stepIndex >= this.options.steps.length) {
      return false;
    }
    
    // If we allow skipping to any step, always return true
    if (this.options.allowSkipToAny) {
      return true;
    }
    
    const targetStep = this.options.steps[stepIndex];
    
    // If step is optional, we can always move to it
    if (targetStep.isOptional) {
      return true;
    }
    
    // If we're moving backwards, always allow it
    if (stepIndex < this.currentStepIndex) {
      return true;
    }
    
    // If we're skipping steps, ensure all previous non-optional steps are completed
    if (stepIndex > this.currentStepIndex + 1) {
      for (let i = this.currentStepIndex; i < stepIndex; i++) {
        const step = this.options.steps[i];
        if (!step.isOptional && !this.isStepCompleted(step.id)) {
          return false;
        }
      }
    }
    
    // If we're moving to the next step, ensure current step is valid
    if (stepIndex === this.currentStepIndex + 1) {
      return this.isStepValid(this.getCurrentStep().id);
    }
    
    return true;
  }
  
  goToStep(stepIndex: number): boolean {
    if (!this.canMoveToStep(stepIndex)) {
      return false;
    }
    
    this.currentStepIndex = stepIndex;
    this.persistState();
    
    return true;
  }
  
  goToStepById(stepId: string): boolean {
    const stepIndex = this.options.steps.findIndex(step => step.id === stepId);
    
    if (stepIndex === -1) {
      return false;
    }
    
    return this.goToStep(stepIndex);
  }
  
  goToNextStep(): boolean {
    const currentStep = this.getCurrentStep();
    
    // Validate current step first
    if (!this.isStepValid(currentStep.id)) {
      return false;
    }
    
    // Mark current step as completed
    this.markStepAsCompleted(currentStep.id);
    
    // Find next visible step
    let nextIndex = this.currentStepIndex + 1;
    while (
      nextIndex < this.options.steps.length && 
      this.options.steps[nextIndex].isHidden
    ) {
      nextIndex++;
    }
    
    if (nextIndex >= this.options.steps.length) {
      return false;
    }
    
    this.currentStepIndex = nextIndex;
    this.persistState();
    
    return true;
  }
  
  goToPreviousStep(): boolean {
    // Find previous visible step
    let prevIndex = this.currentStepIndex - 1;
    while (
      prevIndex >= 0 && 
      this.options.steps[prevIndex].isHidden
    ) {
      prevIndex--;
    }
    
    if (prevIndex < 0) {
      return false;
    }
    
    this.currentStepIndex = prevIndex;
    this.persistState();
    
    return true;
  }
  
  setStepData(stepId: string, data: any) {
    this.stepData[stepId] = data;
    this.persistState();
    return this;
  }
  
  getStepData(stepId: string): any {
    return this.stepData[stepId];
  }
  
  getAllData(): Record<string, any> {
    return { ...this.stepData };
  }
  
  reset() {
    this.currentStepIndex = 0;
    this.completedSteps.clear();
    this.stepData = {};
    this.persistState();
    return this;
  }
}
```

### 2. Create a Registration Wizard Component

Let's create a multi-step registration wizard:

```bash
asm component registration wizard
```

Now let's implement the component:

#### View file:

```tsx
// components/registration/wizard/wizard.view.tsx
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { ViewContext } from '@assemblejs/core';
import { WizardService, WizardStep } from '../../../services/wizard.service';

export default function RegistrationWizard({ context }: { context: ViewContext }) {
  const wizardService = context.services.get(WizardService);
  const [currentStep, setCurrentStep] = useState<WizardStep>(wizardService.getCurrentStep());
  const [steps, setSteps] = useState<WizardStep[]>(wizardService.getVisibleSteps());
  const [currentStepIndex, setCurrentStepIndex] = useState(wizardService.getCurrentStepIndex());
  const [stepData, setStepData] = useState<Record<string, any>>({});
  
  // Initialize form data
  useEffect(() => {
    // Get any saved data
    const savedData = wizardService.getAllData();
    setStepData(savedData);
    
    // Set up validation for each step
    wizardService.setStepValidation('personal-info', () => {
      const data = wizardService.getStepData('personal-info') || {};
      return !!(data.firstName && data.lastName && data.email && isValidEmail(data.email));
    });
    
    wizardService.setStepValidation('account-setup', () => {
      const data = wizardService.getStepData('account-setup') || {};
      return !!(data.username && data.password && data.password.length >= 8);
    });
    
    wizardService.setStepValidation('preferences', () => {
      return true; // Preferences step is valid by default
    });
    
    // Listen for navigation changes
    const handleNavigation = () => {
      setCurrentStep(wizardService.getCurrentStep());
      setCurrentStepIndex(wizardService.getCurrentStepIndex());
    };
    
    window.addEventListener('wizardNavigation', handleNavigation);
    
    return () => {
      window.removeEventListener('wizardNavigation', handleNavigation);
    };
  }, []);
  
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleNext = () => {
    if (wizardService.goToNextStep()) {
      setCurrentStep(wizardService.getCurrentStep());
      setCurrentStepIndex(wizardService.getCurrentStepIndex());
    }
  };
  
  const handlePrevious = () => {
    if (wizardService.goToPreviousStep()) {
      setCurrentStep(wizardService.getCurrentStep());
      setCurrentStepIndex(wizardService.getCurrentStepIndex());
    }
  };
  
  const handleStepClick = (index: number) => {
    if (wizardService.canMoveToStep(index)) {
      wizardService.goToStep(index);
      setCurrentStep(wizardService.getCurrentStep());
      setCurrentStepIndex(wizardService.getCurrentStepIndex());
    }
  };
  
  const handleSubmit = () => {
    const allData = wizardService.getAllData();
    
    // In a real application, you would submit this data to the server
    console.log('Submitting registration data:', allData);
    
    // Simulate API call
    setTimeout(() => {
      alert('Registration successful!');
      wizardService.reset();
      setCurrentStep(wizardService.getCurrentStep());
      setCurrentStepIndex(wizardService.getCurrentStepIndex());
      setStepData({});
    }, 1000);
  };
  
  const handleInputChange = (stepId: string, field: string, value: string) => {
    const updatedData = {
      ...(wizardService.getStepData(stepId) || {}),
      [field]: value
    };
    
    wizardService.setStepData(stepId, updatedData);
    setStepData(wizardService.getAllData());
  };
  
  const renderStepContent = () => {
    const stepId = currentStep.id;
    
    switch (stepId) {
      case 'personal-info':
        return renderPersonalInfoStep();
      case 'account-setup':
        return renderAccountSetupStep();
      case 'preferences':
        return renderPreferencesStep();
      case 'review':
        return renderReviewStep();
      default:
        return <p>Step not found</p>;
    }
  };
  
  const renderPersonalInfoStep = () => {
    const data = stepData['personal-info'] || {};
    
    return (
      <div className="step-content">
        <h3>Personal Information</h3>
        <div className="form-group">
          <label htmlFor="firstName">First Name <span className="required">*</span></label>
          <input
            type="text"
            id="firstName"
            value={data.firstName || ''}
            onChange={(e) => handleInputChange('personal-info', 'firstName', (e.target as HTMLInputElement).value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name <span className="required">*</span></label>
          <input
            type="text"
            id="lastName"
            value={data.lastName || ''}
            onChange={(e) => handleInputChange('personal-info', 'lastName', (e.target as HTMLInputElement).value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email <span className="required">*</span></label>
          <input
            type="email"
            id="email"
            value={data.email || ''}
            onChange={(e) => handleInputChange('personal-info', 'email', (e.target as HTMLInputElement).value)}
            required
          />
          {data.email && !isValidEmail(data.email) && (
            <p className="error-message">Please enter a valid email address</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={data.phone || ''}
            onChange={(e) => handleInputChange('personal-info', 'phone', (e.target as HTMLInputElement).value)}
          />
        </div>
      </div>
    );
  };
  
  const renderAccountSetupStep = () => {
    const data = stepData['account-setup'] || {};
    
    return (
      <div className="step-content">
        <h3>Account Setup</h3>
        <div className="form-group">
          <label htmlFor="username">Username <span className="required">*</span></label>
          <input
            type="text"
            id="username"
            value={data.username || ''}
            onChange={(e) => handleInputChange('account-setup', 'username', (e.target as HTMLInputElement).value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password <span className="required">*</span></label>
          <input
            type="password"
            id="password"
            value={data.password || ''}
            onChange={(e) => handleInputChange('account-setup', 'password', (e.target as HTMLInputElement).value)}
            required
          />
          {data.password && data.password.length < 8 && (
            <p className="error-message">Password must be at least 8 characters long</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password <span className="required">*</span></label>
          <input
            type="password"
            id="confirmPassword"
            value={data.confirmPassword || ''}
            onChange={(e) => handleInputChange('account-setup', 'confirmPassword', (e.target as HTMLInputElement).value)}
            required
          />
          {data.confirmPassword && data.password !== data.confirmPassword && (
            <p className="error-message">Passwords do not match</p>
          )}
        </div>
      </div>
    );
  };
  
  const renderPreferencesStep = () => {
    const data = stepData['preferences'] || {};
    
    return (
      <div className="step-content">
        <h3>Preferences</h3>
        <div className="form-group">
          <label>Notifications</label>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={data.emailNotifications || false}
                onChange={(e) => handleInputChange('preferences', 'emailNotifications', (e.target as HTMLInputElement).checked)}
              />
              <label htmlFor="emailNotifications">Email notifications</label>
            </div>
            
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="smsNotifications"
                checked={data.smsNotifications || false}
                onChange={(e) => handleInputChange('preferences', 'smsNotifications', (e.target as HTMLInputElement).checked)}
              />
              <label htmlFor="smsNotifications">SMS notifications</label>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={data.theme || 'light'}
            onChange={(e) => handleInputChange('preferences', 'theme', (e.target as HTMLSelectElement).value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System default</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={data.language || 'en'}
            onChange={(e) => handleInputChange('preferences', 'language', (e.target as HTMLSelectElement).value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
    );
  };
  
  const renderReviewStep = () => {
    const personalData = stepData['personal-info'] || {};
    const accountData = stepData['account-setup'] || {};
    const preferencesData = stepData['preferences'] || {};
    
    return (
      <div className="step-content">
        <h3>Review Your Information</h3>
        
        <div className="review-section">
          <h4>Personal Information</h4>
          <div className="review-item">
            <span className="review-label">Name:</span>
            <span className="review-value">{personalData.firstName} {personalData.lastName}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Email:</span>
            <span className="review-value">{personalData.email}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Phone:</span>
            <span className="review-value">{personalData.phone || 'Not provided'}</span>
          </div>
          <button 
            className="edit-button"
            onClick={() => handleStepClick(steps.findIndex(s => s.id === 'personal-info'))}
          >
            Edit
          </button>
        </div>
        
        <div className="review-section">
          <h4>Account Information</h4>
          <div className="review-item">
            <span className="review-label">Username:</span>
            <span className="review-value">{accountData.username}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Password:</span>
            <span className="review-value">••••••••</span>
          </div>
          <button 
            className="edit-button"
            onClick={() => handleStepClick(steps.findIndex(s => s.id === 'account-setup'))}
          >
            Edit
          </button>
        </div>
        
        <div className="review-section">
          <h4>Preferences</h4>
          <div className="review-item">
            <span className="review-label">Email Notifications:</span>
            <span className="review-value">{preferencesData.emailNotifications ? 'Yes' : 'No'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">SMS Notifications:</span>
            <span className="review-value">{preferencesData.smsNotifications ? 'Yes' : 'No'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Theme:</span>
            <span className="review-value">{preferencesData.theme || 'Light'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Language:</span>
            <span className="review-value">{preferencesData.language || 'English'}</span>
          </div>
          <button 
            className="edit-button"
            onClick={() => handleStepClick(steps.findIndex(s => s.id === 'preferences'))}
          >
            Edit
          </button>
        </div>
        
        <div className="terms-and-conditions">
          <input
            type="checkbox"
            id="termsAccepted"
            checked={stepData['review']?.termsAccepted || false}
            onChange={(e) => handleInputChange('review', 'termsAccepted', (e.target as HTMLInputElement).checked)}
          />
          <label htmlFor="termsAccepted">
            I agree to the <a href="#" target="_blank">Terms and Conditions</a>
          </label>
        </div>
      </div>
    );
  };
  
  return (
    <div className="registration-wizard">
      <h2>Create Your Account</h2>
      
      <div className="wizard-progress">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`progress-step ${index === currentStepIndex ? 'active' : ''} ${wizardService.isStepCompleted(step.id) ? 'completed' : ''}`}
            onClick={() => handleStepClick(index)}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>
      
      <div className="wizard-content">
        {renderStepContent()}
      </div>
      
      <div className="wizard-actions">
        <button 
          className="button secondary"
          onClick={handlePrevious}
          disabled={wizardService.isFirstStep()}
        >
          Previous
        </button>
        
        {wizardService.isLastStep() ? (
          <button 
            className="button primary"
            onClick={handleSubmit}
            disabled={!stepData['review']?.termsAccepted}
          >
            Complete Registration
          </button>
        ) : (
          <button 
            className="button primary"
            onClick={handleNext}
            disabled={!wizardService.isStepValid(currentStep.id)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
```

#### Client file:

```typescript
// components/registration/wizard/wizard.client.ts
export default function() {
  console.log('Registration wizard component initialized');
}
```

#### Styles:

```scss
// components/registration/wizard/wizard.styles.scss
.registration-wizard {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  
  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #2c3e50;
  }
  
  .wizard-progress {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 25px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #e0e0e0;
      z-index: 1;
    }
    
    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
      cursor: pointer;
      
      .step-number {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #fff;
        border: 2px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-bottom: 10px;
        transition: all 0.3s ease;
      }
      
      .step-title {
        font-size: 14px;
        text-align: center;
        color: #7f8c8d;
        transition: all 0.3s ease;
      }
      
      &.active {
        .step-number {
          background-color: #3498db;
          border-color: #3498db;
          color: white;
        }
        
        .step-title {
          color: #3498db;
          font-weight: bold;
        }
      }
      
      &.completed {
        .step-number {
          background-color: #2ecc71;
          border-color: #2ecc71;
          color: white;
        }
        
        .step-title {
          color: #2ecc71;
        }
      }
    }
  }
  
  .wizard-content {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 30px;
    margin-bottom: 20px;
    min-height: 300px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #2c3e50;
    }
    
    .form-group {
      margin-bottom: 20px;
      
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        
        .required {
          color: #e74c3c;
        }
      }
      
      input[type="text"],
      input[type="email"],
      input[type="tel"],
      input[type="password"],
      select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        transition: border-color 0.3s ease;
        
        &:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
      }
      
      .error-message {
        color: #e74c3c;
        margin-top: 5px;
        font-size: 14px;
      }
      
      .checkbox-group {
        margin-top: 8px;
        
        .checkbox-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          
          input[type="checkbox"] {
            margin-right: 10px;
          }
        }
      }
    }
    
    .review-section {
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
      position: relative;
      
      h4 {
        margin-top: 0;
        color: #2c3e50;
      }
      
      .review-item {
        display: flex;
        margin-bottom: 10px;
        
        .review-label {
          flex: 0 0 150px;
          font-weight: 500;
          color: #7f8c8d;
        }
        
        .review-value {
          flex: 1;
        }
      }
      
      .edit-button {
        position: absolute;
        top: 0;
        right: 0;
        background-color: transparent;
        border: none;
        color: #3498db;
        cursor: pointer;
        font-size: 14px;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
    
    .terms-and-conditions {
      display: flex;
      align-items: center;
      margin-top: 20px;
      
      input[type="checkbox"] {
        margin-right: 10px;
      }
      
      a {
        color: #3498db;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
  
  .wizard-actions {
    display: flex;
    justify-content: space-between;
    
    .button {
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.primary {
        background-color: #3498db;
        color: white;
        border: none;
        
        &:hover:not(:disabled) {
          background-color: #2980b9;
        }
      }
      
      &.secondary {
        background-color: #ecf0f1;
        color: #7f8c8d;
        border: none;
        
        &:hover:not(:disabled) {
          background-color: #bdc3c7;
          color: #2c3e50;
        }
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
```

### 3. Register the Service and Component in Your Server

Update your server.ts file to register the new service and component:

```typescript
// src/server.ts
import { createBlueprintServer } from '@assemblejs/core';
import { WizardService } from './services/wizard.service';
import { vaviteHttpServer } from 'vavite/http-server';
import { viteDevServer } from 'vavite/vite-dev-server';

const server = createBlueprintServer({
  // HTTP and development server configuration
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  // Register components
  components: [
    {
      name: 'registration/wizard',
      routes: ['/registration', '/sign-up']
    }
  ],
  
  // Register services
  services: [
    {
      type: WizardService,
      options: {
        id: 'registration',
        steps: [
          {
            id: 'personal-info',
            title: 'Personal Info'
          },
          {
            id: 'account-setup',
            title: 'Account Setup'
          },
          {
            id: 'preferences',
            title: 'Preferences',
            isOptional: true
          },
          {
            id: 'review',
            title: 'Review'
          }
        ],
        persistState: true,
        allowSkipToAny: false
      }
    }
  ]
});

// Start the server
server.start();
```

### 4. Create a Registration Blueprint

```bash
asm blueprint registration main
```

Implement the blueprint:

```tsx
// blueprints/registration/main/main.view.tsx
import { h } from 'preact';
import { ViewContext } from '@assemblejs/core';

export default function RegistrationPage({ context }: { context: ViewContext }) {
  return (
    <div className="registration-page">
      <header>
        <div className="logo">
          <img src="/logo.svg" alt="Logo" />
        </div>
      </header>
      
      <main>
        <div data-component="registration/wizard"></div>
      </main>
      
      <footer>
        <p>&copy; {new Date().getFullYear()} AssembleJS. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
```

## Advanced Topics

### 1. Creating a Dynamic Form Wizard

For more complex wizards with dynamic steps, you can enhance the WizardService:

```typescript
// Add to WizardService
export class WizardService extends Service {
  // ... existing code
  
  // Add a new step dynamically
  addStep(step: WizardStep, index?: number) {
    if (index !== undefined) {
      this.options.steps.splice(index, 0, step);
    } else {
      this.options.steps.push(step);
    }
    return this;
  }
  
  // Remove a step
  removeStep(stepId: string) {
    const index = this.options.steps.findIndex(s => s.id === stepId);
    if (index !== -1) {
      this.options.steps.splice(index, 1);
      
      // If we removed the current step, adjust the current index
      if (index === this.currentStepIndex) {
        this.currentStepIndex = Math.max(0, index - 1);
      } else if (index < this.currentStepIndex) {
        this.currentStepIndex--;
      }
    }
    return this;
  }
  
  // Hide or show steps conditionally
  setStepVisibility(stepId: string, isHidden: boolean) {
    const step = this.options.steps.find(s => s.id === stepId);
    if (step) {
      step.isHidden = isHidden;
    }
    return this;
  }
  
  // Define dependency between steps
  addStepDependency(stepId: string, dependsOnStepId: string, conditionFn: (data: any) => boolean) {
    const dependencyCheck = () => {
      const dependsOnData = this.getStepData(dependsOnStepId);
      return conditionFn(dependsOnData);
    };
    
    // Check dependency when trying to navigate
    const originalCanMoveToStep = this.canMoveToStep;
    this.canMoveToStep = (stepIndex: number) => {
      // If we're trying to move to the dependent step, check the condition
      const targetStep = this.options.steps[stepIndex];
      if (targetStep?.id === stepId) {
        // Check if the dependency is met
        if (!dependencyCheck()) {
          return false;
        }
      }
      
      // Otherwise, use the original method
      return originalCanMoveToStep.call(this, stepIndex);
    };
    
    return this;
  }
}
```

### 2. Branching Logic

Implement conditional branching in your wizard:

```typescript
// Add to WizardService
export class WizardService extends Service {
  // ... existing code
  
  private branchingRules: Record<string, (data: any) => string> = {};
  
  addBranchingRule(fromStepId: string, branchFn: (data: any) => string) {
    this.branchingRules[fromStepId] = branchFn;
    return this;
  }
  
  // Override goToNextStep to handle branching
  goToNextStep(): boolean {
    const currentStep = this.getCurrentStep();
    
    // Validate current step first
    if (!this.isStepValid(currentStep.id)) {
      return false;
    }
    
    // Mark current step as completed
    this.markStepAsCompleted(currentStep.id);
    
    // Check if we have a branching rule for this step
    if (this.branchingRules[currentStep.id]) {
      const data = this.getStepData(currentStep.id);
      const nextStepId = this.branchingRules[currentStep.id](data);
      
      // Go to the determined next step
      return this.goToStepById(nextStepId);
    }
    
    // Find next visible step (default behavior)
    let nextIndex = this.currentStepIndex + 1;
    while (
      nextIndex < this.options.steps.length && 
      this.options.steps[nextIndex].isHidden
    ) {
      nextIndex++;
    }
    
    if (nextIndex >= this.options.steps.length) {
      return false;
    }
    
    this.currentStepIndex = nextIndex;
    this.persistState();
    
    return true;
  }
}
```

Using branching logic in a component:

```typescript
// In your component initialization
wizardService.addBranchingRule('account-type', (data) => {
  // Branch based on account type selection
  switch (data.accountType) {
    case 'personal':
      return 'personal-details';
    case 'business':
      return 'business-details';
    case 'nonprofit':
      return 'nonprofit-details';
    default:
      return 'personal-details';
  }
});
```

### 3. Form Validation with Schema Validation

Implement robust form validation using a schema validation library:

```typescript
// Add to WizardService
import * as yup from 'yup';

export class WizardService extends Service {
  // ... existing code
  
  private validationSchemas: Record<string, yup.Schema<any>> = {};
  
  setStepValidationSchema(stepId: string, schema: yup.Schema<any>) {
    this.validationSchemas[stepId] = schema;
    return this;
  }
  
  validateStep(stepId: string, data: any): { valid: boolean; errors?: Record<string, string> } {
    const schema = this.validationSchemas[stepId];
    
    if (!schema) {
      return { valid: true };
    }
    
    try {
      schema.validateSync(data, { abortEarly: false });
      return { valid: true };
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        // Convert Yup errors to a more usable format
        const errors: Record<string, string> = {};
        
        error.inner.forEach(err => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        
        return { valid: false, errors };
      }
      
      return { valid: false, errors: { form: 'Validation failed' } };
    }
  }
  
  // Override isStepValid to use schema validation
  isStepValid(stepId: string): boolean {
    // If step has a validation schema, use it
    if (this.validationSchemas[stepId]) {
      const data = this.getStepData(stepId) || {};
      return this.validateStep(stepId, data).valid;
    }
    
    // Otherwise, fall back to the original validation method
    return super.isStepValid(stepId);
  }
}
```

Using schema validation in a component:

```typescript
// In your component initialization
import * as yup from 'yup';

// Define validation schemas for each step
const personalInfoSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().matches(/^\d{10}$/, 'Phone number must be 10 digits').optional()
});

const accountSetupSchema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password')
});

// Register schemas with the wizard service
wizardService.setStepValidationSchema('personal-info', personalInfoSchema);
wizardService.setStepValidationSchema('account-setup', accountSetupSchema);
```

### 4. Wizard Progress Saving and Loading

Implement saving and loading wizard progress to/from the server:

```typescript
// Add to WizardService
export class WizardService extends Service {
  // ... existing code
  
  async saveToServer(userId: string): Promise<boolean> {
    try {
      const state = {
        currentStepIndex: this.currentStepIndex,
        completedSteps: Array.from(this.completedSteps),
        stepData: this.stepData
      };
      
      const response = await fetch(`/api/wizard/${this.options.id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          state
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to save wizard state to server:', error);
      return false;
    }
  }
  
  async loadFromServer(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/wizard/${this.options.id}/load?userId=${userId}`);
      
      if (!response.ok) {
        return false;
      }
      
      const { state } = await response.json();
      
      if (state) {
        this.currentStepIndex = state.currentStepIndex || 0;
        this.completedSteps = new Set(state.completedSteps || []);
        this.stepData = state.stepData || {};
        this.persistState();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to load wizard state from server:', error);
      return false;
    }
  }
}
```

## Conclusion

Multi-step wizards in AssembleJS provide a user-friendly approach to collecting complex information from users. This cookbook has covered:

- Creating a reusable WizardService for managing state and navigation
- Building a multi-step registration form with validation
- Implementing state persistence for resuming progress
- Advanced patterns like dynamic steps, branching logic, and schema validation

By following these patterns, you can create intuitive, maintainable wizards for various workflows in your AssembleJS applications, from user registration and onboarding to complex configuration processes.

For more information on form handling and validation in AssembleJS, refer to the [Forms](../cookbook/forms) cookbook.