import {
  toBoolean,
  isTrue,
  isNotTrue,
  allBooleansAreTrue,
} from "../../utils/boolean.utils";

describe("Boolean Utilities", () => {
  describe("toBoolean", () => {
    it("should handle boolean values", () => {
      expect(toBoolean(true)).toBe(true);
      expect(toBoolean(false)).toBe(false);
    });

    it("should handle undefined and null values", () => {
      expect(toBoolean(undefined)).toBe(false);
      expect(toBoolean(null)).toBe(false);
    });

    it("should handle number values", () => {
      expect(toBoolean(1)).toBe(true);
      expect(toBoolean(42)).toBe(true);
      expect(toBoolean(-1)).toBe(true);
      expect(toBoolean(0)).toBe(false);
    });

    it("should handle string number values", () => {
      expect(toBoolean("1")).toBe(true);
      expect(toBoolean("42")).toBe(true);
      expect(toBoolean("-1")).toBe(true);
      expect(toBoolean("0")).toBe(false);
    });

    it("should handle case-insensitive special string values", () => {
      // True values
      expect(toBoolean("Y")).toBe(true);
      expect(toBoolean("y")).toBe(true);
      expect(toBoolean("YES")).toBe(true);
      expect(toBoolean("yes")).toBe(true);
      expect(toBoolean("Yes")).toBe(true);
      expect(toBoolean("T")).toBe(true);
      expect(toBoolean("t")).toBe(true);
      expect(toBoolean("TRUE")).toBe(true);
      expect(toBoolean("true")).toBe(true);
      expect(toBoolean("True")).toBe(true);

      // False values
      expect(toBoolean("N")).toBe(false);
      expect(toBoolean("NO")).toBe(false);
      expect(toBoolean("F")).toBe(false);
      expect(toBoolean("FALSE")).toBe(false);
      expect(toBoolean("random string")).toBe(false);
      expect(toBoolean("")).toBe(false);
    });
  });

  describe("isTrue", () => {
    it("should be true for true values", () => {
      expect(isTrue(true)).toBe(true);
      expect(isTrue(1)).toBe(true);
      expect(isTrue("Y")).toBe(true);
      expect(isTrue("YES")).toBe(true);
      expect(isTrue("T")).toBe(true);
      expect(isTrue("TRUE")).toBe(true);
    });

    it("should be false for false values", () => {
      expect(isTrue(false)).toBe(false);
      expect(isTrue(0)).toBe(false);
      expect(isTrue(null)).toBe(false);
      expect(isTrue(undefined)).toBe(false);
      expect(isTrue("N")).toBe(false);
      expect(isTrue("NO")).toBe(false);
      expect(isTrue("F")).toBe(false);
      expect(isTrue("FALSE")).toBe(false);
      expect(isTrue("")).toBe(false);
    });
  });

  describe("isNotTrue", () => {
    it("should be false for true values", () => {
      expect(isNotTrue(true)).toBe(false);
      expect(isNotTrue(1)).toBe(false);
      expect(isNotTrue("Y")).toBe(false);
      expect(isNotTrue("YES")).toBe(false);
      expect(isNotTrue("T")).toBe(false);
      expect(isNotTrue("TRUE")).toBe(false);
    });

    it("should be true for false values", () => {
      expect(isNotTrue(false)).toBe(true);
      expect(isNotTrue(0)).toBe(true);
      expect(isNotTrue(null)).toBe(true);
      expect(isNotTrue(undefined)).toBe(true);
      expect(isNotTrue("N")).toBe(true);
      expect(isNotTrue("NO")).toBe(true);
      expect(isNotTrue("F")).toBe(true);
      expect(isNotTrue("FALSE")).toBe(true);
      expect(isNotTrue("")).toBe(true);
    });
  });

  describe("allBooleansAreTrue", () => {
    it("should return true if all expressions are true", () => {
      expect(allBooleansAreTrue([true, true, true])).toBe(true);
    });

    it("should return false if any expression is false", () => {
      expect(allBooleansAreTrue([true, false, true])).toBe(false);
      expect(allBooleansAreTrue([false, false, false])).toBe(false);
    });

    it("should handle empty arrays", () => {
      // According to the implementation of Array.every(),
      // an empty array will return true
      expect(allBooleansAreTrue([])).toBe(true);
    });

    it("should handle single value arrays", () => {
      expect(allBooleansAreTrue([true])).toBe(true);
      expect(allBooleansAreTrue([false])).toBe(false);
    });
  });
});
