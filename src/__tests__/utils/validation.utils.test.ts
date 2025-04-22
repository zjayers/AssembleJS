import {
  Validation,
  validateSchema,
  validate,
  isValidEmail,
  isValidUrl,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isDate,
  createValidator,
  StringRule,
  NumberRule,
  BooleanRule,
  DateRule,
  ArrayRule,
  ObjectRule,
  CustomRule,
  OneOfRule,
  ConditionalRule,
} from "../../utils/validation.utils";

describe("Validation Utilities", () => {
  // Test Type Guards
  describe("Type Guards", () => {
    test("isString should correctly identify strings", () => {
      expect(isString("test")).toBe(true);
      expect(isString("")).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
    });

    test("isNumber should correctly identify numbers", () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-1.5)).toBe(true);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber("123")).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });

    test("isBoolean should correctly identify booleans", () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean("true")).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });

    test("isObject should correctly identify objects", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: "value" })).toBe(true);
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject("string")).toBe(false);
      expect(isObject(123)).toBe(false);
    });

    test("isArray should correctly identify arrays", () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray("string")).toBe(false);
      expect(isArray(null)).toBe(false);
    });

    test("isDate should correctly identify valid dates", () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date("2023-01-01"))).toBe(true);
      expect(isDate(new Date("invalid"))).toBe(false);
      expect(isDate("2023-01-01")).toBe(false);
      expect(isDate({})).toBe(false);
      expect(isDate(null)).toBe(false);
    });
  });

  // Test Common Validators
  describe("Common Validators", () => {
    test("isValidEmail should validate email addresses", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name+tag@example.co.uk")).toBe(true);
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("invalid@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("test@example")).toBe(false);
    });

    test("isValidUrl should validate URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://example.com/path")).toBe(true);
      expect(isValidUrl("www.example.com")).toBe(true);
      expect(isValidUrl("example.com")).toBe(true);
      expect(isValidUrl("invalid")).toBe(false);
      expect(isValidUrl("http://")).toBe(false);
    });
  });

  // Test String Rule
  describe("StringRule", () => {
    test("should validate required strings", () => {
      const rule = new StringRule({ required: true });
      expect(rule.validate("test", "field")).toBeNull();
      expect(rule.validate("", "field")).toEqual({
        path: "field",
        message: "field is required",
        value: "",
      });
      expect(rule.validate(undefined as any, "field")).toEqual({
        path: "field",
        message: "field is required",
        value: undefined,
      });
    });

    test("should validate optional strings", () => {
      const rule = new StringRule();
      expect(rule.validate("test", "field")).toBeNull();
      expect(rule.validate("", "field")).toBeNull();
      expect(rule.validate(undefined as any, "field")).toBeNull();
    });

    test("should validate string length", () => {
      const rule = new StringRule({ minLength: 2, maxLength: 5 });
      expect(rule.validate("abc", "field")).toBeNull();
      expect(rule.validate("a", "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("length must be between 2 and 5"),
      });
      expect(rule.validate("abcdef", "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("length must be between 2 and 5"),
      });
    });

    test("should validate against patterns", () => {
      const rule = new StringRule({ pattern: /^[a-z]+$/ });
      expect(rule.validate("abc", "field")).toBeNull();
      expect(rule.validate("123", "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("does not match the required pattern"),
      });
    });

    test("should validate email addresses", () => {
      const rule = new StringRule({ email: true });
      expect(rule.validate("test@example.com", "field")).toBeNull();
      expect(rule.validate("invalid", "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be a valid email address"),
      });
    });

    test("should validate URLs", () => {
      const rule = new StringRule({ url: true });
      expect(rule.validate("https://example.com", "field")).toBeNull();
      expect(rule.validate("invalid", "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be a valid URL"),
      });
    });

    test("should use custom error messages", () => {
      const rule = new StringRule({ required: true, message: "Custom error" });
      expect(rule.validate("", "field")).toEqual({
        path: "field",
        message: "Custom error",
        value: "",
      });
    });
  });

  // Test Number Rule
  describe("NumberRule", () => {
    test("should validate required numbers", () => {
      const rule = new NumberRule({ required: true });
      expect(rule.validate(123, "field")).toBeNull();
      expect(rule.validate(undefined as any, "field")).toEqual({
        path: "field",
        message: "field is required",
        value: undefined,
      });
    });

    test("should validate number type", () => {
      const rule = new NumberRule();
      expect(rule.validate(123, "field")).toBeNull();
      expect(rule.validate("123" as any, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be a number"),
      });
    });

    test("should validate numeric range", () => {
      const rule = new NumberRule({ min: 5, max: 10 });
      expect(rule.validate(7, "field")).toBeNull();
      expect(rule.validate(4, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be at least 5"),
      });
      expect(rule.validate(11, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must not exceed 10"),
      });
    });

    test("should validate integers", () => {
      const rule = new NumberRule({ integer: true });
      expect(rule.validate(123, "field")).toBeNull();
      expect(rule.validate(123.45, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be an integer"),
      });
    });

    test("should validate positive numbers", () => {
      const rule = new NumberRule({ positive: true });
      expect(rule.validate(123, "field")).toBeNull();
      expect(rule.validate(0, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be positive"),
      });
      expect(rule.validate(-123, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be positive"),
      });
    });
  });

  // Test Boolean Rule
  describe("BooleanRule", () => {
    test("should validate required booleans", () => {
      const rule = new BooleanRule({ required: true });
      expect(rule.validate(true, "field")).toBeNull();
      expect(rule.validate(false, "field")).toBeNull();
      expect(rule.validate(undefined as any, "field")).toEqual({
        path: "field",
        message: "field is required",
        value: undefined,
      });
    });

    test("should validate boolean type", () => {
      const rule = new BooleanRule();
      expect(rule.validate(true, "field")).toBeNull();
      expect(rule.validate(false, "field")).toBeNull();

      // Note: In verifyBoolean, 'true' as a string might be converted to boolean value
      // Instead test with a value that's definitely not a boolean
      expect(rule.validate(123 as any, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be a boolean"),
      });
    });
  });

  // Test Array Rule
  describe("ArrayRule", () => {
    test("should validate required arrays", () => {
      // Use Record<string, any> type to match the class constraint
      const rule = new ArrayRule<Record<string, any>>({ required: true });
      expect(rule.validate([], "field")).toBeNull();
      expect(
        rule.validate([{ id: 1 }, { id: 2 }, { id: 3 }], "field")
      ).toBeNull();
      expect(rule.validate(undefined as any, "field")).toEqual({
        path: "field",
        message: "field is required",
        value: undefined,
      });
    });

    test("should validate array type", () => {
      const rule = new ArrayRule<Record<string, any>>();
      expect(rule.validate([], "field")).toBeNull();
      expect(rule.validate({} as any, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be an array"),
      });
    });

    test("should validate array length", () => {
      const rule = new ArrayRule<Record<string, any>>({
        minLength: 2,
        maxLength: 4,
      });
      expect(rule.validate([{ id: 1 }, { id: 2 }], "field")).toBeNull();
      expect(rule.validate([{ id: 1 }], "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must contain at least 2 items"),
      });
      expect(
        rule.validate(
          [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
          "field"
        )
      ).toMatchObject({
        path: "field",
        message: expect.stringContaining("must not contain more than 4 items"),
      });
    });

    test("should validate array items using itemRule", () => {
      // The ArrayRule constraint requires Record<string, any>
      // So we'll use any type to bypass it for our test
      const rule = new ArrayRule<any>({
        itemRule: new StringRule({ minLength: 3 }) as any,
      });

      // But actually pass string values in the test
      expect(rule.validate(["abc", "defg"], "field")).toBeNull();
      expect(rule.validate(["abc", "de"], "field")).toMatchObject({
        path: expect.stringContaining("field"),
        message: expect.stringContaining("length must be"),
      });
    });

    test("should validate array items using itemSchema", () => {
      interface TestItem extends Record<string, any> {
        name: string;
        age: number;
      }

      const rule = new ArrayRule<TestItem>({
        itemSchema: {
          name: new StringRule({ required: true }),
          age: new NumberRule({ min: 18 }),
        },
      });
      expect(rule.validate([{ name: "Alice", age: 25 }], "field")).toBeNull();
      expect(rule.validate([{ name: "Bob", age: 16 }], "field")).toMatchObject({
        path: "field[0].age",
        message: expect.stringContaining("must be at least 18"),
      });
    });
  });

  // Test Object Rule
  describe("ObjectRule", () => {
    test("should validate required objects", () => {
      const rule = new ObjectRule({ required: true });
      expect(rule.validate({}, "field")).toBeNull();
      expect(rule.validate({ key: "value" }, "field")).toBeNull();
      expect(rule.validate(undefined as any, "field")).toEqual({
        path: "field",
        message: "field is required",
        value: undefined,
      });
    });

    test("should validate object type", () => {
      const rule = new ObjectRule();
      expect(rule.validate({}, "field")).toBeNull();
      expect(rule.validate([] as any, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be an object"),
      });
      expect(rule.validate("string" as any, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be an object"),
      });
    });

    test("should validate object against schema", () => {
      // We need to create a wrapper object that will handle the type validation
      interface TestObject extends Record<string, any> {
        name?: any;
        age?: any;
      }

      const schema = {
        name: new StringRule({ required: true }),
        age: new NumberRule({ min: 18 }),
      };

      const rule = new ObjectRule<TestObject>({
        schema,
      });

      const testObj1: TestObject = { name: "Alice", age: 25 };
      const testObj2: TestObject = { age: 25 };
      const testObj3: TestObject = { name: "Bob", age: 16 };

      expect(rule.validate(testObj1, "field")).toBeNull();
      expect(rule.validate(testObj2, "field")).toMatchObject({
        path: "field.name",
        message: expect.stringContaining("is required"),
      });
      expect(rule.validate(testObj3, "field")).toMatchObject({
        path: "field.age",
        message: expect.stringContaining("must be at least 18"),
      });
    });

    test("should check for unknown properties when allowUnknown is false", () => {
      interface TestObject extends Record<string, any> {
        name?: any;
        extra?: any;
      }

      const rule = new ObjectRule<TestObject>({
        schema: { name: new StringRule() },
        allowUnknown: false,
      });

      const testObj1: TestObject = { name: "Alice" };
      const testObj2: TestObject = { name: "Bob", extra: "field" };

      expect(rule.validate(testObj1, "field")).toBeNull();
      expect(rule.validate(testObj2, "field")).toMatchObject({
        path: "field.extra",
        message: expect.stringContaining("contains an unknown property"),
      });
    });

    test("should allow unknown properties by default", () => {
      interface TestObject extends Record<string, any> {
        name?: any;
        extra?: any;
      }

      const rule = new ObjectRule<TestObject>({
        schema: { name: new StringRule() },
      });

      const testObj: TestObject = { name: "Alice", extra: "field" };
      expect(rule.validate(testObj, "field")).toBeNull();
    });
  });

  // Test Custom Rule
  describe("CustomRule", () => {
    test("should use custom validator function", () => {
      const isPrime = (n: number) => {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        for (let i = 5; i * i <= n; i += 6) {
          if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
      };

      const rule = new CustomRule<number>((value, path) => {
        if (!isPrime(value)) {
          return {
            path,
            message: `${path} must be a prime number`,
            value,
          };
        }
        return null;
      });

      expect(rule.validate(7, "field")).toBeNull();
      expect(rule.validate(4, "field")).toMatchObject({
        path: "field",
        message: "field must be a prime number",
      });
    });
  });

  // Test OneOf Rule
  describe("OneOfRule", () => {
    test("should validate if any rule passes", () => {
      const rule = new OneOfRule([
        new StringRule({ pattern: /^[A-Z]{2}\d{4}$/ }), // Format: AB1234
        new StringRule({ pattern: /^\d{6}$/ }), // Format: 123456
      ]);

      expect(rule.validate("AB1234", "field")).toBeNull();
      expect(rule.validate("123456", "field")).toBeNull();
      expect(rule.validate("invalid", "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining(
          "did not match any of the allowed types"
        ),
      });
    });

    test("should handle custom error message", () => {
      const rule = new OneOfRule(
        [new StringRule({ email: true }), new StringRule({ url: true })],
        "Must be either an email or URL"
      );

      expect(rule.validate("test@example.com", "field")).toBeNull();
      expect(rule.validate("https://example.com", "field")).toBeNull();
      expect(rule.validate("invalid", "field")).toEqual({
        path: "field",
        message: "Must be either an email or URL",
        value: "invalid",
      });
    });
  });

  // Test Conditional Rule
  describe("ConditionalRule", () => {
    test("should apply different rules based on condition", () => {
      // Create a union type for the test
      type TestValueType = string | number;

      const isString = (v: TestValueType): v is string => typeof v === "string";

      // Create a properly typed conditional rule
      const rule = new ConditionalRule<TestValueType>(
        isString,
        new StringRule({ minLength: 3 }) as any,
        new NumberRule({ min: 10 }) as any
      );

      // Now test with string values
      const stringValue1 = "abcdef" as TestValueType;
      const stringValue2 = "ab" as TestValueType;

      expect(rule.validate(stringValue1, "field")).toBeNull();
      expect(rule.validate(stringValue2, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("length must be at least 3"),
      });

      // And with number values
      const numberValue1 = 15 as TestValueType;
      const numberValue2 = 5 as TestValueType;

      expect(rule.validate(numberValue1, "field")).toBeNull();
      expect(rule.validate(numberValue2, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must be at least 10"),
      });
    });

    test("should handle missing else rule gracefully", () => {
      const isPositive = (v: number): boolean => v > 0;
      const rule = new ConditionalRule<number>(
        isPositive,
        new NumberRule({ max: 100 })
      );

      expect(rule.validate(50, "field")).toBeNull();
      expect(rule.validate(150, "field")).toMatchObject({
        path: "field",
        message: expect.stringContaining("must not exceed 100"),
      });
      // No else rule, so negative numbers pass with no validation
      expect(rule.validate(-10, "field")).toBeNull();
    });
  });

  // Test Schema Validation
  describe("Schema Validation", () => {
    test("validateSchema should validate an object against a schema", () => {
      const schema = {
        name: new StringRule({ required: true }),
        age: new NumberRule({ min: 18, max: 100 }),
        email: new StringRule({ email: true }),
      };

      const validObj = { name: "Alice", age: 25, email: "alice@example.com" };
      expect(validateSchema(validObj, schema).valid).toBe(true);

      const invalidObj1 = { age: 15, email: "alice@example.com" };
      const result1 = validateSchema(invalidObj1, schema);
      expect(result1.valid).toBe(false);
      expect(result1.errors[0].path).toBe("name");

      const invalidObj2 = { name: "Bob", age: 15, email: "bob@example.com" };
      const result2 = validateSchema(invalidObj2, schema);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0].path).toBe("age");
    });

    test("validateSchema should handle nested objects", () => {
      const schema = {
        user: new ObjectRule({
          schema: {
            name: new StringRule({ required: true }),
            contact: new ObjectRule({
              schema: {
                email: new StringRule({ email: true }),
                phone: new StringRule({ pattern: /^\d{10}$/ }),
              },
            }),
          },
        }),
      };

      const validObj = {
        user: {
          name: "Alice",
          contact: {
            email: "alice@example.com",
            phone: "1234567890",
          },
        },
      };
      expect(validateSchema(validObj, schema).valid).toBe(true);

      const invalidObj = {
        user: {
          name: "Bob",
          contact: {
            email: "invalid-email",
            phone: "123",
          },
        },
      };
      const result = validateSchema(invalidObj, schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].path).toBe("user.contact.email");
    });
  });

  // Test Validation Factory Functions
  describe("Validation Factory Functions", () => {
    test("factory functions should create appropriate validation rules", () => {
      expect(Validation.string()).toBeInstanceOf(StringRule);
      expect(Validation.number()).toBeInstanceOf(NumberRule);
      expect(Validation.boolean()).toBeInstanceOf(BooleanRule);
      expect(Validation.date()).toBeInstanceOf(DateRule);
      expect(Validation.array()).toBeInstanceOf(ArrayRule);
      expect(Validation.object()).toBeInstanceOf(ObjectRule);
      expect(Validation.custom(() => null)).toBeInstanceOf(CustomRule);
      expect(Validation.oneOf([])).toBeInstanceOf(OneOfRule);
      expect(
        Validation.conditional(() => true, Validation.string())
      ).toBeInstanceOf(ConditionalRule);
    });

    test("shorthand factories should create appropriate rules", () => {
      const emailRule = Validation.email();
      expect(emailRule).toBeInstanceOf(StringRule);
      expect(emailRule.validate("test@example.com", "field")).toBeNull();
      expect(emailRule.validate("invalid", "field")).not.toBeNull();

      const urlRule = Validation.url();
      expect(urlRule).toBeInstanceOf(StringRule);
      expect(urlRule.validate("https://example.com", "field")).toBeNull();
      expect(urlRule.validate("invalid", "field")).not.toBeNull();
    });
  });

  // Test Validator Creation and Usage
  describe("Validator Creation", () => {
    test("createValidator should create a validator function", () => {
      // Define an interface for our test user
      interface TestUser {
        name: string;
        age: number;
      }

      // Create a schema for this interface
      const schema = {
        name: Validation.string({ required: true }),
        age: Validation.number({ min: 18 }),
      };

      // Create a typed validator function
      const validateUser = createValidator<TestUser>(schema);
      expect(typeof validateUser).toBe("function");

      // Test with valid data
      const validUser: TestUser = { name: "Alice", age: 25 };
      const validResult = validateUser(validUser);
      expect(validResult.valid).toBe(true);

      // Test with invalid data
      const invalidUser: TestUser = { name: "Bob", age: 16 };
      const invalidResult = validateUser(invalidUser);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors[0].path).toBe("age");
    });

    test("validate function should throw on validation error", () => {
      // Define an interface for our test user
      interface TestUser {
        name: string;
        age: number;
      }

      // Create a schema for this interface
      const schema = {
        name: Validation.string({ required: true }),
        age: Validation.number({ min: 18 }),
      };

      // Test with valid data
      const validUser: TestUser = { name: "Alice", age: 25 };
      expect(() => validate<TestUser>(validUser, schema)).not.toThrow();

      // Test with invalid data
      const invalidUser: TestUser = { name: "Bob", age: 16 };
      expect(() => validate<TestUser>(invalidUser, schema)).toThrow(
        "Validation error"
      );
      expect(() =>
        validate<TestUser>(invalidUser, schema, "Custom prefix")
      ).toThrow("Custom prefix");
    });
  });
});
