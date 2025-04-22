import { defaultNumber, toNumber } from "../../utils/number.utils";

describe("Number Utilities", () => {
  describe("defaultNumber", () => {
    it("should return the number if it is a valid number", () => {
      expect(defaultNumber(5)).toBe(5);
      expect(defaultNumber(0)).toBe(0);
      expect(defaultNumber(-10)).toBe(-10);
      expect(defaultNumber(3.14)).toBe(3.14);
    });

    it("should return the default value (0) if undefined is provided", () => {
      expect(defaultNumber(undefined)).toBe(0);
    });

    it("should return the default value (0) if null is provided", () => {
      expect(defaultNumber(null)).toBe(0);
    });

    it("should return the specified default value if provided and the input is invalid", () => {
      expect(defaultNumber(undefined, 10)).toBe(10);
      expect(defaultNumber(null, -5)).toBe(-5);
    });

    it("should return the default value for falsy numbers like 0", () => {
      // The current implementation treats 0 as falsy and returns the default value
      expect(defaultNumber(0, 42)).toBe(42);
    });
  });

  describe("toNumber", () => {
    it("should return undefined for undefined input", () => {
      expect(toNumber(undefined)).toBeUndefined();
    });

    it("should return undefined for null input", () => {
      expect(toNumber(null)).toBeUndefined();
    });

    it("should return the number for valid number inputs", () => {
      expect(toNumber(5)).toBe(5);
      expect(toNumber(0)).toBe(0);
      expect(toNumber(-10)).toBe(-10);
      expect(toNumber(3.14)).toBe(3.14);
    });

    it("should convert string numbers to actual numbers", () => {
      expect(toNumber("5")).toBe(5);
      expect(toNumber("0")).toBe(0);
      expect(toNumber("-10")).toBe(-10);
      expect(toNumber("3.14")).toBe(3.14);
    });

    it("should return undefined for NaN number inputs", () => {
      expect(toNumber(NaN)).toBeUndefined();
    });

    it("should handle non-numeric strings appropriately", () => {
      expect(toNumber("not a number")).toBeUndefined();
      expect(toNumber("123abc")).toBeUndefined();
      // Empty string converts to 0 with Number(), and the implementation returns that
      expect(toNumber("")).toBe(0);
    });
  });
});
