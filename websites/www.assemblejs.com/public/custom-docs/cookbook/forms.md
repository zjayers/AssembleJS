# Form Handling

<iframe src="https://placeholder-for-assemblejs-forms-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

Forms are a fundamental part of web applications, allowing users to input and submit data. This cookbook demonstrates how to implement efficient, accessible, and user-friendly forms in AssembleJS applications.

## Prerequisites

- Basic knowledge of AssembleJS components and blueprints
- Understanding of HTML forms and input elements
- Familiarity with form validation concepts

## Implementation Steps

### Step 1: Create a Form Validation Service

First, let's create a service to handle form validation:

1. Use the CLI to generate a validation service:

```bash
npx asm
# Select "Service" from the list
# Enter "validation" as the name
# Follow the prompts
```

2. Implement the validation service:

```typescript
// src/services/validation.service.ts
import { Service } from 'asmbl';

export type ValidationRule<T = any> = (value: T, formValues?: Record<string, any>) => boolean | string;

export interface ValidationOptions {
  stopOnFirstError?: boolean;
}

export class ValidationService extends Service {
  // Common validation rules
  static required: ValidationRule = (value) => {
    if (value === undefined || value === null || value === '') {
      return 'This field is required';
    }
    return true;
  };
  
  static email: ValidationRule<string> = (value) => {
    if (!value) return true;
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value) || 'Please enter a valid email address';
  };
  
  static minLength: (min: number) => ValidationRule<string> = (min) => (value) => {
    if (!value) return true;
    
    return value.length >= min || `Minimum length is ${min} characters`;
  };
  
  static maxLength: (max: number) => ValidationRule<string> = (max) => (value) => {
    if (!value) return true;
    
    return value.length <= max || `Maximum length is ${max} characters`;
  };
  
  static pattern: (regex: RegExp, message?: string) => ValidationRule<string> = 
    (regex, message = 'Value does not match the required pattern') => (value) => {
      if (!value) return true;
      
      return regex.test(value) || message;
    };
  
  static min: (min: number) => ValidationRule<number> = (min) => (value) => {
    if (value === undefined || value === null) return true;
    
    return value >= min || `Minimum value is ${min}`;
  };
  
  static max: (max: number) => ValidationRule<number> = (max) => (value) => {
    if (value === undefined || value === null) return true;
    
    return value <= max || `Maximum value is ${max}`;
  };
  
  static matchField: (fieldName: string, message?: string) => ValidationRule = 
    (fieldName, message) => (value, formValues) => {
      if (!formValues || value === undefined || value === null) return true;
      
      return value === formValues[fieldName] || 
        message || `Must match ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    };
  
  /**
   * Validate a single value against multiple rules
   */
  validateValue(
    value: any, 
    rules: ValidationRule[], 
    formValues?: Record<string, any>,
    options: ValidationOptions = {}
  ): { valid: boolean; errors: string[] } {
    const { stopOnFirstError = false } = options;
    const errors: string[] = [];
    
    for (const rule of rules) {
      const result = rule(value, formValues);
      
      if (result !== true) {
        errors.push(typeof result === 'string' ? result : 'Invalid value');
        
        if (stopOnFirstError) {
          break;
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate a form with multiple fields
   */
  validateForm(
    values: Record<string, any>,
    validationSchema: Record<string, ValidationRule[]>,
    options: ValidationOptions = {}
  ): { valid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};
    let isValid = true;
    
    for (const field in validationSchema) {
      if (Object.prototype.hasOwnProperty.call(validationSchema, field)) {
        const rules = validationSchema[field];
        const value = values[field];
        
        const result = this.validateValue(value, rules, values, options);
        
        if (!result.valid) {
          errors[field] = result.errors;
          isValid = false;
        }
      }
    }
    
    return {
      valid: isValid,
      errors
    };
  }
  
  /**
   * Create a validation schema for a form
   */
  createSchema(schema: Record<string, ValidationRule[]>): Record<string, ValidationRule[]> {
    return schema;
  }
}
```

### Step 2: Create a Basic Form Component

Let's create a simple contact form component that uses our validation service:

```bash
npx asm
# Select "Component" from the list
# Enter "forms/contact-form" as the name
# Follow the prompts
```

First, implement the factory:

```typescript
// src/components/forms/contact-form/contact-form.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { ValidationService } from '../../../services/validation.service';

export class ContactFormFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    const validationService = context.services.get('validationService') as ValidationService;
    
    // Set initial form state
    context.data.set('initialValues', {
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Pass validation service to client-side
    context.data.set('validationService', validationService);
    
    // Handle form submission on the server side
    if (context.request.method === 'POST') {
      const formData = context.request.body;
      
      // Create validation schema
      const validationSchema = {
        name: [ValidationService.required],
        email: [ValidationService.required, ValidationService.email],
        subject: [ValidationService.required, ValidationService.maxLength(100)],
        message: [ValidationService.required, ValidationService.minLength(10)]
      };
      
      // Validate form data
      const validationResult = validationService.validateForm(formData, validationSchema);
      
      if (validationResult.valid) {
        // In a real app, you would process the form data here
        // For example, send an email, save to database, etc.
        context.data.set('formSubmitted', true);
        context.data.set('submitResult', {
          success: true,
          message: 'Thank you for your message. We will get back to you soon.'
        });
      } else {
        // Return validation errors
        context.data.set('formSubmitted', false);
        context.data.set('errors', validationResult.errors);
        context.data.set('submitResult', {
          success: false,
          message: 'Please correct the errors in the form.'
        });
        context.data.set('formValues', formData);
      }
    }
  }
}
```

Now, implement the view:

```tsx
// src/components/forms/contact-form/contact-form.view.tsx
import React, { useState } from 'react';
import { ValidationService } from '../../../services/validation.service';

interface ContactFormProps {
  data: {
    initialValues: {
      name: string;
      email: string;
      subject: string;
      message: string;
    };
    validationService: ValidationService;
    formSubmitted?: boolean;
    submitResult?: {
      success: boolean;
      message: string;
    };
    errors?: Record<string, string[]>;
    formValues?: {
      name: string;
      email: string;
      subject: string;
      message: string;
    };
  };
}

const ContactForm: React.FC<ContactFormProps> = ({ data }) => {
  const { 
    initialValues, 
    validationService, 
    formSubmitted, 
    submitResult, 
    errors: serverErrors,
    formValues: savedValues
  } = data;
  
  const [formValues, setFormValues] = useState(savedValues || initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>(serverErrors || {});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Create validation schema
  const validationSchema = {
    name: [ValidationService.required],
    email: [ValidationService.required, ValidationService.email],
    subject: [ValidationService.required, ValidationService.maxLength(100)],
    message: [ValidationService.required, ValidationService.minLength(10)]
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // Validate field on change
    if (touched[name]) {
      validateField(name, value);
    }
  };
  
  // Handle input blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setTouched({
      ...touched,
      [name]: true
    });
    
    validateField(name, value);
  };
  
  // Validate a single field
  const validateField = (name: string, value: any) => {
    if (!validationSchema[name]) return;
    
    const result = validationService.validateValue(value, validationSchema[name], formValues);
    
    setErrors(prev => ({
      ...prev,
      [name]: result.errors
    }));
    
    return result.valid;
  };
  
  // Validate the entire form
  const validateForm = () => {
    const result = validationService.validateForm(formValues, validationSchema);
    
    setErrors(result.errors);
    
    // Mark all fields as touched
    const newTouched: Record<string, boolean> = {};
    Object.keys(validationSchema).forEach(key => {
      newTouched[key] = true;
    });
    setTouched(newTouched);
    
    return result.valid;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Form is valid, submit it
      // This form uses a traditional form submit to demonstrate server-side validation
      // The form will be submitted to the same URL, and the data will be handled in the factory
      const form = e.target as HTMLFormElement;
      form.submit();
    }
  };
  
  // Get field error message
  const getFieldError = (name: string): string | null => {
    if (!touched[name] || !errors[name] || errors[name].length === 0) {
      return null;
    }
    
    return errors[name][0];
  };
  
  if (formSubmitted && submitResult?.success) {
    return (
      <div className="form-success">
        <h3>Submission Successful</h3>
        <p>{submitResult.message}</p>
        <button 
          className="btn btn-primary"
          onClick={() => {
            window.location.href = window.location.pathname;
          }}
        >
          Send Another Message
        </button>
      </div>
    );
  }
  
  return (
    <div className="contact-form">
      <h2>Contact Us</h2>
      
      {submitResult && !submitResult.success && (
        <div className="form-error-message">
          {submitResult.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} method="POST">
        <div className="form-group">
          <label htmlFor="name">Name <span className="required">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${getFieldError('name') ? 'is-invalid' : ''}`}
          />
          {getFieldError('name') && (
            <div className="invalid-feedback">{getFieldError('name')}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email <span className="required">*</span></label>
          <input
            type="email"
            id="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${getFieldError('email') ? 'is-invalid' : ''}`}
          />
          {getFieldError('email') && (
            <div className="invalid-feedback">{getFieldError('email')}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="subject">Subject <span className="required">*</span></label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formValues.subject}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${getFieldError('subject') ? 'is-invalid' : ''}`}
          />
          {getFieldError('subject') && (
            <div className="invalid-feedback">{getFieldError('subject')}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message <span className="required">*</span></label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formValues.message}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-control ${getFieldError('message') ? 'is-invalid' : ''}`}
          ></textarea>
          {getFieldError('message') && (
            <div className="invalid-feedback">{getFieldError('message')}</div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Send Message</button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
```

Add some styles for the form component:

```scss
// src/components/forms/contact-form/contact-form.styles.scss
.contact-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }
  
  .form-error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 10px 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #f5c6cb;
  }
  
  .form-group {
    margin-bottom: 20px;
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
      
      .required {
        color: #dc3545;
      }
    }
    
    .form-control {
      display: block;
      width: 100%;
      padding: 10px 12px;
      font-size: 16px;
      line-height: 1.5;
      color: #495057;
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid #ced4da;
      border-radius: 4px;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      
      &:focus {
        color: #495057;
        background-color: #fff;
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }
      
      &.is-invalid {
        border-color: #dc3545;
        
        &:focus {
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
      }
    }
    
    .invalid-feedback {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      font-size: 80%;
      color: #dc3545;
    }
  }
  
  .form-actions {
    text-align: right;
    
    .btn {
      display: inline-block;
      font-weight: 400;
      text-align: center;
      vertical-align: middle;
      user-select: none;
      border: 1px solid transparent;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      border-radius: 0.25rem;
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, 
                 border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      
      &.btn-primary {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
        
        &:hover {
          color: #fff;
          background-color: #0069d9;
          border-color: #0062cc;
        }
        
        &:focus {
          box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.5);
        }
      }
    }
  }
}

.form-success {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px 20px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  h3 {
    margin-top: 0;
    font-size: 24px;
  }
  
  p {
    margin-bottom: 20px;
    font-size: 16px;
  }
  
  .btn-primary {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    color: #fff;
    background-color: #28a745;
    border-color: #28a745;
    
    &:hover {
      background-color: #218838;
      border-color: #1e7e34;
    }
  }
}
```

### Step 3: Create a Complex Form Component with Dynamic Fields

Now, let's create a more complex form with dynamic fields:

```bash
npx asm
# Select "Component" from the list
# Enter "forms/registration-form" as the name
# Follow the prompts
```

First, implement the factory:

```typescript
// src/components/forms/registration-form/registration-form.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { ValidationService } from '../../../services/validation.service';

export class RegistrationFormFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    const validationService = context.services.get('validationService') as ValidationService;
    
    // Set initial form state
    context.data.set('initialValues', {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      occupation: '',
      skills: [],
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      agreeToTerms: false
    });
    
    // Set available options for select fields
    context.data.set('occupations', [
      { value: 'developer', label: 'Software Developer' },
      { value: 'designer', label: 'UX/UI Designer' },
      { value: 'manager', label: 'Product Manager' },
      { value: 'marketing', label: 'Marketing Professional' },
      { value: 'other', label: 'Other' }
    ]);
    
    context.data.set('skills', [
      { value: 'javascript', label: 'JavaScript' },
      { value: 'react', label: 'React' },
      { value: 'angular', label: 'Angular' },
      { value: 'vue', label: 'Vue' },
      { value: 'node', label: 'Node.js' },
      { value: 'python', label: 'Python' },
      { value: 'design', label: 'UI/UX Design' },
      { value: 'writing', label: 'Content Writing' }
    ]);
    
    context.data.set('states', [
      { value: 'AL', label: 'Alabama' },
      { value: 'AK', label: 'Alaska' },
      { value: 'AZ', label: 'Arizona' },
      // ... other states
      { value: 'WY', label: 'Wyoming' }
    ]);
    
    // Pass validation service to client-side
    context.data.set('validationService', validationService);
    
    // Handle form submission
    if (context.request.method === 'POST') {
      const formData = context.request.body;
      
      // Create validation schema
      const validationSchema = {
        firstName: [ValidationService.required],
        lastName: [ValidationService.required],
        email: [ValidationService.required, ValidationService.email],
        password: [
          ValidationService.required, 
          ValidationService.minLength(8),
          ValidationService.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
          )
        ],
        confirmPassword: [
          ValidationService.required, 
          ValidationService.matchField('password', 'Passwords must match')
        ],
        occupation: [ValidationService.required],
        'address.street': [ValidationService.required],
        'address.city': [ValidationService.required],
        'address.state': [ValidationService.required],
        'address.zipCode': [
          ValidationService.required,
          ValidationService.pattern(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
        ],
        agreeToTerms: [(value) => value === true || 'You must agree to the terms and conditions']
      };
      
      // Validate form data
      const validationResult = validationService.validateForm(formData, validationSchema);
      
      if (validationResult.valid) {
        // In a real app, you would process the form data here
        context.data.set('formSubmitted', true);
        context.data.set('submitResult', {
          success: true,
          message: 'Registration successful! Thank you for signing up.'
        });
      } else {
        // Return validation errors
        context.data.set('formSubmitted', false);
        context.data.set('errors', validationResult.errors);
        context.data.set('submitResult', {
          success: false,
          message: 'Please correct the errors in the form.'
        });
        context.data.set('formValues', formData);
      }
    }
  }
}
```

Now, implement the view:

```tsx
// src/components/forms/registration-form/registration-form.view.tsx
import React, { useState } from 'react';
import { ValidationService } from '../../../services/validation.service';

interface RegistrationFormProps {
  data: {
    initialValues: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
      occupation: string;
      skills: string[];
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
      };
      agreeToTerms: boolean;
    };
    occupations: Array<{ value: string; label: string }>;
    skills: Array<{ value: string; label: string }>;
    states: Array<{ value: string; label: string }>;
    validationService: ValidationService;
    formSubmitted?: boolean;
    submitResult?: {
      success: boolean;
      message: string;
    };
    errors?: Record<string, string[]>;
    formValues?: any;
  };
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ data }) => {
  const { 
    initialValues, 
    occupations, 
    skills, 
    states,
    validationService, 
    formSubmitted, 
    submitResult, 
    errors: serverErrors,
    formValues: savedValues
  } = data;
  
  const [formValues, setFormValues] = useState(savedValues || initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>(serverErrors || {});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  // Create validation schema
  const validationSchema = {
    firstName: [ValidationService.required],
    lastName: [ValidationService.required],
    email: [ValidationService.required, ValidationService.email],
    password: [
      ValidationService.required, 
      ValidationService.minLength(8),
      ValidationService.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
    ],
    confirmPassword: [
      ValidationService.required, 
      ValidationService.matchField('password', 'Passwords must match')
    ],
    occupation: [ValidationService.required],
    'address.street': [ValidationService.required],
    'address.city': [ValidationService.required],
    'address.state': [ValidationService.required],
    'address.zipCode': [
      ValidationService.required,
      ValidationService.pattern(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
    ],
    agreeToTerms: [(value) => value === true || 'You must agree to the terms and conditions']
  };
  
  // Handle basic input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    // Handle nested fields (e.g., address.street)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormValues({
        ...formValues,
        [parent]: {
          ...formValues[parent],
          [child]: value
        }
      });
    } else if (type === 'checkbox') {
      setFormValues({
        ...formValues,
        [name]: checked
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
    
    // Validate field on change
    if (touched[name]) {
      validateField(name, type === 'checkbox' ? checked : value);
    }
  };
  
  // Handle multiple select (skills)
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormValues({
        ...formValues,
        skills: [...formValues.skills, value]
      });
    } else {
      setFormValues({
        ...formValues,
        skills: formValues.skills.filter((skill: string) => skill !== value)
      });
    }
  };
  
  // Handle input blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setTouched({
      ...touched,
      [name]: true
    });
    
    validateField(name, type === 'checkbox' ? checked : value);
  };
  
  // Validate a single field
  const validateField = (name: string, value: any) => {
    if (!validationSchema[name]) return true;
    
    const result = validationService.validateValue(value, validationSchema[name], formValues);
    
    setErrors(prev => ({
      ...prev,
      [name]: result.errors
    }));
    
    return result.valid;
  };
  
  // Validate the entire form
  const validateForm = () => {
    const result = validationService.validateForm(formValues, validationSchema);
    
    setErrors(result.errors);
    
    // Mark all fields as touched
    const newTouched: Record<string, boolean> = {};
    Object.keys(validationSchema).forEach(key => {
      newTouched[key] = true;
    });
    setTouched(newTouched);
    
    return result.valid;
  };
  
  // Validate the current step
  const validateStep = (step: number) => {
    let isValid = true;
    const fieldsToValidate: Record<number, string[]> = {
      1: ['firstName', 'lastName', 'email'],
      2: ['password', 'confirmPassword', 'occupation', 'skills'],
      3: ['address.street', 'address.city', 'address.state', 'address.zipCode', 'agreeToTerms']
    };
    
    const currentFields = fieldsToValidate[step] || [];
    
    // Mark fields as touched
    const newTouched = { ...touched };
    currentFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    // Validate each field
    for (const field of currentFields) {
      let value;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        value = formValues[parent]?.[child];
      } else {
        value = formValues[field];
      }
      
      const fieldValid = validateField(field, value);
      isValid = isValid && fieldValid;
    }
    
    return isValid;
  };
  
  // Move to the next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Move to the previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Form is valid, submit it
      const form = e.target as HTMLFormElement;
      form.submit();
    }
  };
  
  // Get field error message
  const getFieldError = (name: string): string | null => {
    if (!touched[name] || !errors[name] || errors[name].length === 0) {
      return null;
    }
    
    return errors[name][0];
  };
  
  if (formSubmitted && submitResult?.success) {
    return (
      <div className="form-success">
        <h3>Registration Successful</h3>
        <p>{submitResult.message}</p>
        <button 
          className="btn btn-primary"
          onClick={() => {
            window.location.href = window.location.pathname;
          }}
        >
          Create Another Account
        </button>
      </div>
    );
  }
  
  return (
    <div className="registration-form">
      <h2>Create an Account</h2>
      
      {submitResult && !submitResult.success && (
        <div className="form-error-message">
          {submitResult.message}
        </div>
      )}
      
      <div className="form-steps">
        <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>1</div>
        <div className="step-connector"></div>
        <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>2</div>
        <div className="step-connector"></div>
        <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>3</div>
      </div>
      
      <form onSubmit={handleSubmit} method="POST">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="form-step">
            <h3>Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formValues.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${getFieldError('firstName') ? 'is-invalid' : ''}`}
                />
                {getFieldError('firstName') && (
                  <div className="invalid-feedback">{getFieldError('firstName')}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${getFieldError('lastName') ? 'is-invalid' : ''}`}
                />
                {getFieldError('lastName') && (
                  <div className="invalid-feedback">{getFieldError('lastName')}</div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${getFieldError('email') ? 'is-invalid' : ''}`}
              />
              {getFieldError('email') && (
                <div className="invalid-feedback">{getFieldError('email')}</div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Account Information */}
        {currentStep === 2 && (
          <div className="form-step">
            <h3>Account Information</h3>
            
            <div className="form-group">
              <label htmlFor="password">Password <span className="required">*</span></label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formValues.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${getFieldError('password') ? 'is-invalid' : ''}`}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {getFieldError('password') && (
                <div className="invalid-feedback">{getFieldError('password')}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password <span className="required">*</span></label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formValues.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${getFieldError('confirmPassword') ? 'is-invalid' : ''}`}
              />
              {getFieldError('confirmPassword') && (
                <div className="invalid-feedback">{getFieldError('confirmPassword')}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="occupation">Occupation <span className="required">*</span></label>
              <select
                id="occupation"
                name="occupation"
                value={formValues.occupation}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${getFieldError('occupation') ? 'is-invalid' : ''}`}
              >
                <option value="">Select an occupation</option>
                {occupations.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {getFieldError('occupation') && (
                <div className="invalid-feedback">{getFieldError('occupation')}</div>
              )}
            </div>
            
            <div className="form-group">
              <label>Skills (optional)</label>
              <div className="checkbox-group">
                {skills.map(skill => (
                  <div key={skill.value} className="form-check">
                    <input
                      type="checkbox"
                      id={`skill-${skill.value}`}
                      name="skills"
                      value={skill.value}
                      checked={formValues.skills.includes(skill.value)}
                      onChange={handleSkillsChange}
                      className="form-check-input"
                    />
                    <label htmlFor={`skill-${skill.value}`} className="form-check-label">
                      {skill.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                Previous
              </button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Address and Terms */}
        {currentStep === 3 && (
          <div className="form-step">
            <h3>Address Information</h3>
            
            <div className="form-group">
              <label htmlFor="street">Street Address <span className="required">*</span></label>
              <input
                type="text"
                id="street"
                name="address.street"
                value={formValues.address.street}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${getFieldError('address.street') ? 'is-invalid' : ''}`}
              />
              {getFieldError('address.street') && (
                <div className="invalid-feedback">{getFieldError('address.street')}</div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City <span className="required">*</span></label>
                <input
                  type="text"
                  id="city"
                  name="address.city"
                  value={formValues.address.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${getFieldError('address.city') ? 'is-invalid' : ''}`}
                />
                {getFieldError('address.city') && (
                  <div className="invalid-feedback">{getFieldError('address.city')}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State <span className="required">*</span></label>
                <select
                  id="state"
                  name="address.state"
                  value={formValues.address.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${getFieldError('address.state') ? 'is-invalid' : ''}`}
                >
                  <option value="">Select a state</option>
                  {states.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {getFieldError('address.state') && (
                  <div className="invalid-feedback">{getFieldError('address.state')}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code <span className="required">*</span></label>
                <input
                  type="text"
                  id="zipCode"
                  name="address.zipCode"
                  value={formValues.address.zipCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${getFieldError('address.zipCode') ? 'is-invalid' : ''}`}
                  placeholder="12345 or 12345-6789"
                />
                {getFieldError('address.zipCode') && (
                  <div className="invalid-feedback">{getFieldError('address.zipCode')}</div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formValues.agreeToTerms}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-check-input ${getFieldError('agreeToTerms') ? 'is-invalid' : ''}`}
                />
                <label htmlFor="agreeToTerms" className="form-check-label">
                  I agree to the <a href="#" target="_blank">Terms and Conditions</a> <span className="required">*</span>
                </label>
                {getFieldError('agreeToTerms') && (
                  <div className="invalid-feedback">{getFieldError('agreeToTerms')}</div>
                )}
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                Previous
              </button>
              <button type="submit" className="btn btn-primary">
                Register
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegistrationForm;
```

Add some styles for the registration form:

```scss
// src/components/forms/registration-form/registration-form.styles.scss
.registration-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }
  
  h3 {
    font-size: 18px;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .form-error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 10px 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #f5c6cb;
  }
  
  .form-steps {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
    
    .step-indicator {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #eee;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #666;
      
      &.active {
        background-color: #007bff;
        color: white;
      }
    }
    
    .step-connector {
      flex: 1;
      height: 2px;
      background-color: #eee;
      max-width: 100px;
    }
  }
  
  .form-row {
    display: flex;
    flex-wrap: wrap;
    margin-left: -10px;
    margin-right: -10px;
    
    .form-group {
      flex: 1;
      padding: 0 10px;
      min-width: 200px;
    }
  }
  
  .form-group {
    margin-bottom: 20px;
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
      
      .required {
        color: #dc3545;
      }
    }
    
    .form-control {
      display: block;
      width: 100%;
      padding: 10px 12px;
      font-size: 16px;
      line-height: 1.5;
      color: #495057;
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid #ced4da;
      border-radius: 4px;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      
      &:focus {
        color: #495057;
        background-color: #fff;
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }
      
      &.is-invalid {
        border-color: #dc3545;
        
        &:focus {
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
      }
    }
    
    .invalid-feedback {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      font-size: 80%;
      color: #dc3545;
    }
    
    .password-input {
      position: relative;
      
      .password-toggle {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #6c757d;
        cursor: pointer;
        
        &:hover {
          color: #333;
        }
      }
    }
    
    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
      
      .form-check {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        
        .form-check-input {
          margin-right: 8px;
        }
        
        .form-check-label {
          margin-bottom: 0;
          cursor: pointer;
        }
      }
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    
    .btn {
      display: inline-block;
      font-weight: 400;
      text-align: center;
      vertical-align: middle;
      user-select: none;
      border: 1px solid transparent;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      border-radius: 0.25rem;
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, 
                 border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      
      &.btn-primary {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
        
        &:hover {
          color: #fff;
          background-color: #0069d9;
          border-color: #0062cc;
        }
        
        &:focus {
          box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.5);
        }
      }
      
      &.btn-secondary {
        color: #fff;
        background-color: #6c757d;
        border-color: #6c757d;
        
        &:hover {
          color: #fff;
          background-color: #5a6268;
          border-color: #545b62;
        }
        
        &:focus {
          box-shadow: 0 0 0 0.2rem rgba(130, 138, 145, 0.5);
        }
      }
    }
  }
}

.form-success {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px 20px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  h3 {
    margin-top: 0;
    font-size: 24px;
  }
  
  p {
    margin-bottom: 20px;
    font-size: 16px;
  }
  
  .btn-primary {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    color: #fff;
    background-color: #28a745;
    border-color: #28a745;
    
    &:hover {
      background-color: #218838;
      border-color: #1e7e34;
    }
  }
}
```

### Step 4: Create a Form Demo Blueprint

Let's create a blueprint to showcase our form components:

```bash
npx asm
# Select "Blueprint" from the list
# Enter "forms-demo" as the name
# Follow the prompts
```

Implement the blueprint view:

```tsx
// src/blueprints/forms-demo/main/main.view.tsx
import React, { useState } from 'react';

const FormsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('contact');
  
  return (
    <div className="forms-demo">
      <header className="header">
        <h1>Form Handling in AssembleJS</h1>
        <p>Demonstrating different form implementations with validation and accessibility</p>
      </header>
      
      <main className="main-content">
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact Form
          </button>
          <button 
            className={`tab-button ${activeTab === 'registration' ? 'active' : ''}`}
            onClick={() => setActiveTab('registration')}
          >
            Registration Form
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'contact' && (
            <section className="form-section">
              <h2>Simple Contact Form</h2>
              <p>A basic contact form with validation and error handling.</p>
              <div className="form-container" data-component="forms/contact-form"></div>
            </section>
          )}
          
          {activeTab === 'registration' && (
            <section className="form-section">
              <h2>Multi-step Registration Form</h2>
              <p>A more complex form with multiple steps, various input types, and nested fields.</p>
              <div className="form-container" data-component="forms/registration-form"></div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default FormsDemo;
```

Add some styles for the demo blueprint:

```scss
// src/blueprints/forms-demo/main/main.styles.scss
.forms-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  .header {
    text-align: center;
    margin-bottom: 40px;
    
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    
    p {
      color: #666;
    }
  }
  
  .tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
    border-bottom: 1px solid #dee2e6;
    
    .tab-button {
      background: none;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      color: #495057;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      
      &:hover {
        color: #007bff;
      }
      
      &.active {
        color: #007bff;
        border-bottom-color: #007bff;
      }
    }
  }
  
  .form-section {
    text-align: center;
    margin-bottom: 40px;
    
    h2 {
      font-size: 24px;
      margin-bottom: 10px;
      color: #333;
    }
    
    p {
      margin-bottom: 30px;
      color: #666;
    }
    
    .form-container {
      margin: 0 auto;
    }
  }
}
```

### Step 5: Register Services, Components, and Blueprints

Update your server.ts to include the validation service, form components, and forms demo blueprint:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { ValidationService } from "./services/validation.service";
import { ContactFormFactory } from "./components/forms/contact-form/contact-form.factory";
import { RegistrationFormFactory } from "./components/forms/registration-form/registration-form.factory";

// Create validation service
const validationService = new ValidationService();

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'forms/contact-form',
        views: [{
          viewName: 'default',
          templateFile: 'contact-form.view.tsx',
          factory: new ContactFormFactory()
        }]
      },
      {
        path: 'forms/registration-form',
        views: [{
          viewName: 'default',
          templateFile: 'registration-form.view.tsx',
          factory: new RegistrationFormFactory()
        }]
      }
    ],
    blueprints: [
      {
        path: 'forms-demo',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/forms-demo'
        }]
      }
    ],
    services: [
      {
        name: 'validationService',
        service: validationService
      }
    ]
  }
});
```

## Advanced Topics

### Creating Custom Form Controls

Here's an example of a custom form control component for file uploads with previews:

```tsx
// Custom file upload control with preview
const FileUploadControl = ({ 
  id, 
  name,
  accept = 'image/*', 
  multiple = false,
  onChange,
  onBlur,
  value,
  error
}) => {
  const [previews, setPreviews] = useState<string[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    // Create new FileList from files
    const fileList = Array.from(files);
    
    // Generate previews for images
    const newPreviews: string[] = [];
    fileList.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string);
            setPreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Call onChange handler
    if (onChange) {
      onChange({
        target: {
          name,
          value: multiple ? fileList : fileList[0]
        }
      } as any);
    }
  };
  
  return (
    <div className="file-upload-control">
      <div className="file-input-wrapper">
        <input
          type="file"
          id={id}
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          onBlur={onBlur}
          className={`file-input ${error ? 'is-invalid' : ''}`}
        />
        <label htmlFor={id} className="file-input-label">
          <span className="file-input-button">Choose Files</span>
          <span className="file-input-text">
            {value ? (multiple ? `${(value as File[]).length} files selected` : (value as File).name) : 'No file selected'}
          </span>
        </label>
      </div>
      
      {error && <div className="invalid-feedback">{error}</div>}
      
      {previews.length > 0 && (
        <div className="file-previews">
          {previews.map((preview, index) => (
            <div key={index} className="file-preview">
              <img src={preview} alt={`Preview ${index}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Form Accessibility Best Practices

Here are some best practices for creating accessible forms:

1. **Use semantic HTML elements**:
   - Use `<label>` elements for form controls
   - Group related fields with `<fieldset>` and `<legend>`
   - Use appropriate input types (`text`, `email`, `number`, etc.)

2. **Provide clear instructions and error messages**:
   - Use `aria-describedby` to associate error messages with inputs
   - Provide clear validation messages
   - Use `aria-invalid="true"` for invalid inputs

3. **Keyboard accessibility**:
   - Ensure all form controls are keyboard accessible
   - Maintain a logical tab order
   - Provide focus styles for interactive elements

Example of an accessible form control:

```tsx
// Accessible form field
const FormField = ({ 
  id, 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  onBlur,
  error,
  required = false,
  ...props 
}) => {
  const fieldId = id || `field-${name}`;
  const errorId = `${fieldId}-error`;
  
  return (
    <div className="form-group">
      <label htmlFor={fieldId}>
        {label} {required && <span className="required" aria-hidden="true">*</span>}
      </label>
      <input
        type={type}
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        required={required}
        {...props}
      />
      {error && (
        <div id={errorId} className="invalid-feedback" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
```

### Form State Management with React Context

For larger applications, you can create a form context for global form state management:

```tsx
// src/contexts/FormContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

type FormAction = 
  | { type: 'SET_FIELD_VALUE'; field: string; value: any }
  | { type: 'SET_FIELD_ERROR'; field: string; error: string | null }
  | { type: 'SET_FIELD_TOUCHED'; field: string; touched: boolean }
  | { type: 'SET_IS_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_IS_VALID'; isValid: boolean }
  | { type: 'RESET_FORM'; values: Record<string, any> };

interface FormContextType {
  state: FormState;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string | null) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setIsValid: (isValid: boolean) => void;
  resetForm: (values: Record<string, any>) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value
        }
      };
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      };
    case 'SET_FIELD_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: action.touched
        }
      };
    case 'SET_IS_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting
      };
    case 'SET_IS_VALID':
      return {
        ...state,
        isValid: action.isValid
      };
    case 'RESET_FORM':
      return {
        values: action.values,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: true
      };
    default:
      return state;
  }
};

interface FormProviderProps {
  initialValues: Record<string, any>;
  children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ initialValues, children }) => {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true
  });
  
  const setFieldValue = (field: string, value: any) => {
    dispatch({ type: 'SET_FIELD_VALUE', field, value });
  };
  
  const setFieldError = (field: string, error: string | null) => {
    dispatch({ type: 'SET_FIELD_ERROR', field, error });
  };
  
  const setFieldTouched = (field: string, touched: boolean) => {
    dispatch({ type: 'SET_FIELD_TOUCHED', field, touched });
  };
  
  const setIsSubmitting = (isSubmitting: boolean) => {
    dispatch({ type: 'SET_IS_SUBMITTING', isSubmitting });
  };
  
  const setIsValid = (isValid: boolean) => {
    dispatch({ type: 'SET_IS_VALID', isValid });
  };
  
  const resetForm = (values: Record<string, any>) => {
    dispatch({ type: 'RESET_FORM', values });
  };
  
  return (
    <FormContext.Provider
      value={{
        state,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        setIsSubmitting,
        setIsValid,
        resetForm
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};
```

## Conclusion

This cookbook has demonstrated how to implement various form handling patterns in AssembleJS. We've covered basic form validation, complex multi-step forms, and accessible form controls.

By following these patterns, you can build user-friendly forms that provide a great user experience. The validation service makes it easy to implement consistent form validation across your application, while the custom form controls and accessibility best practices ensure your forms are usable by everyone.

Forms are an essential part of web applications, and implementing them correctly can greatly improve your application's usability and accessibility.