// import { logger } from "./logger.utils"; // Removed unused import
// import { CONSTANTS } from "../constants/blueprint.constants"; // Removed unused import
import { verifyBoolean, verifyDate, verifyText } from "./verify.utils";
// import { isWildcardMatch } from "./pattern.utils";
// import { isEmpty, isNotEmpty } from "./string.utils";

// Create a console-based logger to avoid typing issues
// const log = logger(`${CONSTANTS.defaultLoggerClassName}:validation`);

/**
 * Validation error interface
 */
export interface ValidationError {
  path: string;
  message: string;
  value?: any;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Base rule interface for all validation rules
 */
export interface ValidationRule<T = any> {
  validate(value: T, path: string): ValidationError | null;
}

/**
 * Schema validation type
 */
export type ValidationSchema<T = any> = {
  [K in keyof T]?: ValidationRule | ValidationRule[] | ValidationSchema<T[K]>;
};

/**
 * String validation rules
 */
export class StringRule implements ValidationRule<string> {
  private readonly options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    email?: boolean;
    url?: boolean;
    message?: string;
  };

  constructor(
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      email?: boolean;
      url?: boolean;
      message?: string;
    } = {}
  ) {
    this.options = options;
  }

  validate(value: string, path: string): ValidationError | null {
    // Check if value is required
    if (
      this.options.required &&
      (value === undefined || value === null || value === "")
    ) {
      return {
        path,
        message: this.options.message || `${path} is required`,
        value,
      };
    }

    // If value is optional and not provided, it's valid
    if (
      (value === undefined || value === null || value === "") &&
      !this.options.required
    ) {
      return null;
    }

    // String type validation
    if (typeof value !== "string") {
      return {
        path,
        message: this.options.message || `${path} must be a string`,
        value,
      };
    }

    // Length validation
    if (!verifyText(value, this.options.minLength, this.options.maxLength)) {
      if (this.options.minLength && this.options.maxLength) {
        return {
          path,
          message:
            this.options.message ||
            `${path} length must be between ${this.options.minLength} and ${this.options.maxLength}`,
          value,
        };
      } else if (this.options.minLength) {
        return {
          path,
          message:
            this.options.message ||
            `${path} length must be at least ${this.options.minLength}`,
          value,
        };
      } else if (this.options.maxLength) {
        return {
          path,
          message:
            this.options.message ||
            `${path} length must not exceed ${this.options.maxLength}`,
          value,
        };
      }
    }

    // Pattern validation
    if (this.options.pattern && !this.options.pattern.test(value)) {
      return {
        path,
        message:
          this.options.message || `${path} does not match the required pattern`,
        value,
      };
    }

    // Email validation
    if (this.options.email && !isValidEmail(value)) {
      return {
        path,
        message:
          this.options.message || `${path} must be a valid email address`,
        value,
      };
    }

    // URL validation
    if (this.options.url && !isValidUrl(value)) {
      return {
        path,
        message: this.options.message || `${path} must be a valid URL`,
        value,
      };
    }

    return null;
  }
}

/**
 * Number validation rules
 */
export class NumberRule implements ValidationRule<number> {
  private readonly options: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
    message?: string;
  };

  constructor(
    options: {
      required?: boolean;
      min?: number;
      max?: number;
      integer?: boolean;
      positive?: boolean;
      message?: string;
    } = {}
  ) {
    this.options = options;
  }

  validate(value: number, path: string): ValidationError | null {
    // Check if value is required
    if (this.options.required && (value === undefined || value === null)) {
      return {
        path,
        message: this.options.message || `${path} is required`,
        value,
      };
    }

    // If value is optional and not provided, it's valid
    if ((value === undefined || value === null) && !this.options.required) {
      return null;
    }

    // Number type validation
    if (typeof value !== "number" || isNaN(value)) {
      return {
        path,
        message: this.options.message || `${path} must be a number`,
        value,
      };
    }

    // Range validation
    if (this.options.min !== undefined && value < this.options.min) {
      return {
        path,
        message:
          this.options.message ||
          `${path} must be at least ${this.options.min}`,
        value,
      };
    }

    if (this.options.max !== undefined && value > this.options.max) {
      return {
        path,
        message:
          this.options.message || `${path} must not exceed ${this.options.max}`,
        value,
      };
    }

    // Integer validation
    if (this.options.integer && !Number.isInteger(value)) {
      return {
        path,
        message: this.options.message || `${path} must be an integer`,
        value,
      };
    }

    // Positive validation
    if (this.options.positive && value <= 0) {
      return {
        path,
        message: this.options.message || `${path} must be positive`,
        value,
      };
    }

    return null;
  }
}

/**
 * Boolean validation rules
 */
export class BooleanRule implements ValidationRule<boolean> {
  private readonly options: {
    required?: boolean;
    message?: string;
  };

  constructor(
    options: {
      required?: boolean;
      message?: string;
    } = {}
  ) {
    this.options = options;
  }

  validate(value: boolean, path: string): ValidationError | null {
    // Check if value is required
    if (this.options.required && (value === undefined || value === null)) {
      return {
        path,
        message: this.options.message || `${path} is required`,
        value,
      };
    }

    // If value is optional and not provided, it's valid
    if ((value === undefined || value === null) && !this.options.required) {
      return null;
    }

    // Boolean type validation
    if (typeof value !== "boolean" && !verifyBoolean(value as any)) {
      return {
        path,
        message: this.options.message || `${path} must be a boolean`,
        value,
      };
    }

    return null;
  }
}

/**
 * Date validation rules
 */
export class DateRule implements ValidationRule<Date | string> {
  private readonly options: {
    required?: boolean;
    before?: Date;
    after?: Date;
    format?: string;
    message?: string;
  };

  constructor(
    options: {
      required?: boolean;
      before?: Date;
      after?: Date;
      format?: string;
      message?: string;
    } = {}
  ) {
    this.options = options;
  }

  validate(value: Date | string, path: string): ValidationError | null {
    // Check if value is required
    if (this.options.required && (value === undefined || value === null)) {
      return {
        path,
        message: this.options.message || `${path} is required`,
        value,
      };
    }

    // If value is optional and not provided, it's valid
    if ((value === undefined || value === null) && !this.options.required) {
      return null;
    }

    let dateValue: Date;

    // Convert string to Date if needed
    if (typeof value === "string") {
      if (!verifyDate(value)) {
        return {
          path,
          message: this.options.message || `${path} must be a valid date`,
          value,
        };
      }

      const parts = value.split(/[-/.]/);
      const month = parseInt(parts[0], 10) - 1; // JS months are 0-based
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      dateValue = new Date(year, month, day);
    } else if (value instanceof Date) {
      dateValue = value;
    } else {
      return {
        path,
        message: this.options.message || `${path} must be a valid date`,
        value,
      };
    }

    // Date range validations
    if (this.options.before && dateValue >= this.options.before) {
      return {
        path,
        message:
          this.options.message ||
          `${path} must be before ${this.options.before.toLocaleDateString()}`,
        value,
      };
    }

    if (this.options.after && dateValue <= this.options.after) {
      return {
        path,
        message:
          this.options.message ||
          `${path} must be after ${this.options.after.toLocaleDateString()}`,
        value,
      };
    }

    return null;
  }
}

/**
 * Array validation rules
 */
export class ArrayRule<T extends Record<string, any> = Record<string, any>>
  implements ValidationRule<T[]>
{
  private readonly options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    itemRule?: ValidationRule<T>;
    itemSchema?: ValidationSchema<T>;
    message?: string;
  };

  constructor(
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      itemRule?: ValidationRule<T>;
      itemSchema?: ValidationSchema<T>;
      message?: string;
    } = {}
  ) {
    this.options = options;
  }

  validate(value: T[], path: string): ValidationError | null {
    // Check if value is required
    if (this.options.required && (value === undefined || value === null)) {
      return {
        path,
        message: this.options.message || `${path} is required`,
        value,
      };
    }

    // If value is optional and not provided, it's valid
    if ((value === undefined || value === null) && !this.options.required) {
      return null;
    }

    // Array type validation
    if (!Array.isArray(value)) {
      return {
        path,
        message: this.options.message || `${path} must be an array`,
        value,
      };
    }

    // Length validation
    if (
      this.options.minLength !== undefined &&
      value.length < this.options.minLength
    ) {
      return {
        path,
        message:
          this.options.message ||
          `${path} must contain at least ${this.options.minLength} items`,
        value,
      };
    }

    if (
      this.options.maxLength !== undefined &&
      value.length > this.options.maxLength
    ) {
      return {
        path,
        message:
          this.options.message ||
          `${path} must not contain more than ${this.options.maxLength} items`,
        value,
      };
    }

    // Item validation
    if (this.options.itemRule || this.options.itemSchema) {
      for (let i = 0; i < value.length; i++) {
        const itemPath = `${path}[${i}]`;
        const item = value[i];

        if (this.options.itemRule) {
          const error = this.options.itemRule.validate(item, itemPath);
          if (error) {
            return error;
          }
        } else if (this.options.itemSchema) {
          const result = validateSchema(
            item,
            this.options.itemSchema,
            itemPath
          );
          if (!result.valid) {
            // Return the first error from the schema validation
            return result.errors[0];
          }
        }
      }
    }

    return null;
  }
}

/**
 * Object validation rules
 */
export class ObjectRule<T extends Record<string, any> = Record<string, any>>
  implements ValidationRule<T>
{
  private readonly options: {
    required?: boolean;
    schema?: ValidationSchema<T>;
    message?: string;
    allowUnknown?: boolean;
  };

  constructor(
    options: {
      required?: boolean;
      schema?: ValidationSchema<T>;
      message?: string;
      allowUnknown?: boolean;
    } = {}
  ) {
    this.options = {
      allowUnknown: true, // By default, allow unknown properties
      ...options,
    };
  }

  validate(value: T, path: string): ValidationError | null {
    // Check if value is required
    if (this.options.required && (value === undefined || value === null)) {
      return {
        path,
        message: this.options.message || `${path} is required`,
        value,
      };
    }

    // If value is optional and not provided, it's valid
    if ((value === undefined || value === null) && !this.options.required) {
      return null;
    }

    // Object type validation
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return {
        path,
        message: this.options.message || `${path} must be an object`,
        value,
      };
    }

    // Schema validation
    if (this.options.schema) {
      const result = validateSchema(value, this.options.schema, path);
      if (!result.valid) {
        // Return the first error from the schema validation
        return result.errors[0];
      }
    }

    // Check for unknown properties if allowUnknown is false
    if (this.options.schema && this.options.allowUnknown === false) {
      const schemaKeys = Object.keys(this.options.schema);
      const valueKeys = Object.keys(value);

      for (const key of valueKeys) {
        if (!schemaKeys.includes(key)) {
          return {
            path: `${path}.${key}`,
            message: `${path} contains an unknown property: ${key}`,
            value: value[key],
          };
        }
      }
    }

    return null;
  }
}

/**
 * Custom validation rule
 */
export class CustomRule<T = any> implements ValidationRule<T> {
  private readonly validator: (
    value: T,
    path: string
  ) => ValidationError | null;

  constructor(validator: (value: T, path: string) => ValidationError | null) {
    this.validator = validator;
  }

  validate(value: T, path: string): ValidationError | null {
    return this.validator(value, path);
  }
}

/**
 * Union of validation rules
 */
export class OneOfRule<T = any> implements ValidationRule<T> {
  private readonly rules: ValidationRule<T>[];
  private readonly message?: string;

  constructor(rules: ValidationRule<T>[], message?: string) {
    this.rules = rules;
    this.message = message;
  }

  validate(value: T, path: string): ValidationError | null {
    const errors: ValidationError[] = [];

    for (const rule of this.rules) {
      // Check if rule has a validate method before calling it
      const error =
        rule && typeof rule.validate === "function"
          ? rule.validate(value, path)
          : null;
      if (!error) {
        // If any rule passes, the value is valid
        return null;
      }
      errors.push(error);
    }

    // If we get here, none of the rules passed
    return {
      path,
      message: this.message || `${path} did not match any of the allowed types`,
      value,
    };
  }
}

/**
 * Conditional validation rule
 */
export class ConditionalRule<T = any> implements ValidationRule<T> {
  private readonly condition: (value: T) => boolean;
  private readonly thenRule: ValidationRule<T>;
  private readonly elseRule?: ValidationRule<T>;

  constructor(
    condition: (value: T) => boolean,
    thenRule: ValidationRule<T>,
    elseRule?: ValidationRule<T>
  ) {
    this.condition = condition;
    this.thenRule = thenRule;
    this.elseRule = elseRule;
  }

  validate(value: T, path: string): ValidationError | null {
    if (this.condition(value)) {
      return this.thenRule.validate(value, path);
    } else if (this.elseRule) {
      return this.elseRule.validate(value, path);
    }
    return null;
  }
}

/**
 * Helper for validating objects against a schema
 */
export function validateSchema<T extends Record<string, any>>(
  obj: T,
  schema: ValidationSchema<T>,
  basePath = ""
): ValidationResult {
  const errors: ValidationError[] = [];

  // Handle undefined or null objects
  if (obj === undefined || obj === null) {
    return {
      valid: false,
      errors: [{ path: basePath, message: "Object is null or undefined" }],
    };
  }

  // Validate each property against its schema rule
  for (const [key, rule] of Object.entries(schema)) {
    const path = basePath ? `${basePath}.${key}` : key;
    const value = obj[key];

    if (Array.isArray(rule)) {
      // Multiple rules for one property
      for (const singleRule of rule) {
        const error = singleRule.validate(value, path);
        if (error) {
          errors.push(error);
          break; // Stop at first error for this property
        }
      }
    } else if (rule && typeof rule === "object" && "validate" in rule) {
      // Single validation rule
      // Check if rule has a validate method before calling it
      const error =
        rule && typeof rule.validate === "function"
          ? rule.validate(value, path)
          : null;
      if (error) {
        errors.push(error);
      }
    } else if (rule && typeof rule === "object") {
      // Nested schema for object properties
      if (value !== undefined && value !== null && typeof value === "object") {
        const nestedResult = validateSchema(
          value,
          rule as ValidationSchema,
          path
        );
        if (!nestedResult.valid) {
          errors.push(...nestedResult.errors);
        }
      } else if (value !== undefined && value !== null) {
        errors.push({
          path,
          message: `${path} must be an object`,
          value,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create and validate a schema in one step
 */
export function createValidator<T extends Record<string, any>>(
  schema: ValidationSchema<T>
) {
  return (obj: T): ValidationResult => validateSchema(obj, schema);
}

/**
 * Utility functions for common validations
 */

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// URL validation regex
const URL_REGEX =
  /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url);
}

/**
 * Type guard for checking if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Type guard for checking if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Type guard for checking if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Type guard for checking if a value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Type guard for checking if a value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard for checking if a value is a Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Factory functions for creating validation rules
 */
export const Validation = {
  string(options?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    email?: boolean;
    url?: boolean;
    message?: string;
  }): StringRule {
    return new StringRule(options);
  },

  number(options?: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
    message?: string;
  }): NumberRule {
    return new NumberRule(options);
  },

  boolean(options?: { required?: boolean; message?: string }): BooleanRule {
    return new BooleanRule(options);
  },

  date(options?: {
    required?: boolean;
    before?: Date;
    after?: Date;
    format?: string;
    message?: string;
  }): DateRule {
    return new DateRule(options);
  },

  array<T extends Record<string, any>>(options?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    itemRule?: ValidationRule<T>;
    itemSchema?: ValidationSchema<T>;
    message?: string;
  }): ArrayRule<T> {
    return new ArrayRule<T>(options);
  },

  object<T extends Record<string, any>>(options?: {
    required?: boolean;
    schema?: ValidationSchema<T>;
    message?: string;
    allowUnknown?: boolean;
  }): ObjectRule<T> {
    return new ObjectRule<T>(options);
  },

  custom<T>(
    validator: (value: T, path: string) => ValidationError | null
  ): CustomRule<T> {
    return new CustomRule<T>(validator);
  },

  oneOf<T>(rules: ValidationRule<T>[], message?: string): OneOfRule<T> {
    return new OneOfRule<T>(rules, message);
  },

  conditional<T>(
    condition: (value: T) => boolean,
    thenRule: ValidationRule<T>,
    elseRule?: ValidationRule<T>
  ): ConditionalRule<T> {
    return new ConditionalRule<T>(condition, thenRule, elseRule);
  },

  email(options?: { required?: boolean; message?: string }): StringRule {
    return new StringRule({
      ...options,
      email: true,
      message: options?.message || "Must be a valid email address",
    });
  },

  url(options?: { required?: boolean; message?: string }): StringRule {
    return new StringRule({
      ...options,
      url: true,
      message: options?.message || "Must be a valid URL",
    });
  },
};

/**
 * Validate function that throws an error if validation fails
 */
export function validate<T extends Record<string, any>>(
  value: T,
  schema: ValidationSchema<T>,
  errorPrefix = "Validation error"
): T {
  const result = validateSchema(value, schema);

  if (!result.valid) {
    const errorMessages = result.errors
      .map((e) => `${e.path}: ${e.message}`)
      .join(", ");
    throw new Error(`${errorPrefix}: ${errorMessages}`);
  }

  return value;
}

/**
 * Example schema usage:
 *
 * const userSchema = {
 *   id: Validation.string({ required: true }),
 *   name: Validation.string({ required: true, minLength: 2, maxLength: 100 }),
 *   email: Validation.email({ required: true }),
 *   age: Validation.number({ min: 18, max: 120 }),
 *   isActive: Validation.boolean(),
 *   address: Validation.object({
 *     schema: {
 *       street: Validation.string({ required: true }),
 *       city: Validation.string({ required: true }),
 *       zipCode: Validation.string({ pattern: /^\d{5}$/, message: 'Zip code must be 5 digits' })
 *     }
 *   }),
 *   tags: Validation.array({ itemRule: Validation.string() })
 * };
 *
 * const validateUser = createValidator(userSchema);
 * const result = validateUser({
 *   id: '1234',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   age: 30,
 *   isActive: true,
 *   address: {
 *     street: '123 Main St',
 *     city: 'Anytown',
 *     zipCode: '12345'
 *   },
 *   tags: ['customer', 'premium']
 * });
 *
 * if (result.valid) {
 *   // Process valid data
 * } else {
 *   // Handle validation errors
 *   console.error(result.errors);
 * }
 */
