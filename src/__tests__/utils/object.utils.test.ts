import {
  getObjectKeys,
  conditionallyAddKey,
  omitKey,
  omit,
  combine,
  coalesce,
} from "../../utils/object.utils";

describe("Object Utilities", () => {
  describe("getObjectKeys", () => {
    it("should return an array of string keys from an object", () => {
      const obj = {
        name: "test",
        age: 30,
        active: true,
      };

      expect(getObjectKeys(obj)).toEqual(["name", "age", "active"]);
    });

    it("should filter out numeric keys", () => {
      const obj = {
        name: "test",
        "0": "zero",
        "1": "one",
        age: 30,
      };

      expect(getObjectKeys(obj)).toEqual(["name", "age"]);
    });

    it("should handle empty objects", () => {
      expect(getObjectKeys({})).toEqual([]);
    });
  });

  describe("conditionallyAddKey", () => {
    it("should add the key-value pair when value is defined", () => {
      const result = conditionallyAddKey("name", "John");
      expect(result).toEqual({ name: "John" });
    });

    it("should not add the key-value pair when value is undefined", () => {
      const result = conditionallyAddKey("name", undefined);
      expect(result).toEqual({});
    });

    it("should not add the key-value pair for falsy values", () => {
      // The function checks if value is truthy, so all falsy values will result in empty object
      expect(conditionallyAddKey("count", 0)).toEqual({});
      expect(conditionallyAddKey("active", false)).toEqual({});
      expect(conditionallyAddKey("empty", "")).toEqual({});
      expect(conditionallyAddKey("null", null)).toEqual({});
    });
  });

  describe("omitKey", () => {
    it("should remove the specified key from an object", () => {
      const obj = {
        name: "John",
        age: 30,
        active: true,
      };

      const result = omitKey(obj, "age");
      expect(result).toEqual({
        name: "John",
        active: true,
      });

      // Original object should not be modified
      expect(obj).toEqual({
        name: "John",
        age: 30,
        active: true,
      });
    });

    it("should handle empty objects", () => {
      const obj = { dummy: "value" };
      const result = omitKey(obj, "dummy");
      expect(result).toEqual({});
    });
  });

  describe("omit", () => {
    it("should remove multiple keys from an object", () => {
      const obj = {
        name: "John",
        age: 30,
        active: true,
        email: "john@example.com",
      };

      const result = omit(obj, "age", "email");
      expect(result).toEqual({
        name: "John",
        active: true,
      });

      // Original object should not be modified
      expect(obj).toEqual({
        name: "John",
        age: 30,
        active: true,
        email: "john@example.com",
      });
    });

    it("should handle no keys to omit", () => {
      const obj = {
        name: "John",
        age: 30,
      };

      const result = omit(obj);
      expect(result).toEqual({
        name: "John",
        age: 30,
      });
    });

    it("should handle objects with no keys to remove", () => {
      const obj = { test: "value" };
      const result = omit(obj);
      expect(result).toEqual({ test: "value" });
    });
  });

  describe("combine", () => {
    it("should combine multiple objects into one", () => {
      const obj1 = { name: "John" };
      const obj2 = { age: 30 };
      const obj3 = { active: true };

      const result = combine(obj1, obj2, obj3);
      expect(result).toEqual({
        name: "John",
        age: 30,
        active: true,
      });
    });

    it("should handle overlapping keys by using the last value", () => {
      const obj1 = { name: "John", age: 25 };
      const obj2 = { age: 30, active: true };

      const result = combine(obj1, obj2);
      expect(result).toEqual({
        name: "John",
        age: 30,
        active: true,
      });
    });

    it("should handle empty objects", () => {
      const obj1 = {};
      const obj2 = { name: "John" };
      const obj3 = {};

      const result = combine(obj1, obj2, obj3);
      expect(result).toEqual({
        name: "John",
      });
    });

    it("should handle no objects", () => {
      const result = combine();
      expect(result).toEqual({});
    });

    it("should flatten arrays of objects", () => {
      const objs = [{ name: "John" }, { age: 30 }];

      const result = combine(objs);
      expect(result).toEqual({
        name: "John",
        age: 30,
      });
    });
  });

  describe("coalesce", () => {
    it("should return the first non-undefined, non-null value", () => {
      expect(coalesce(null, undefined, "Hello", "World")).toBe("Hello");
    });

    it("should return undefined if all values are undefined or null", () => {
      expect(coalesce(undefined, null, undefined)).toBeUndefined();
    });

    it("should handle falsy values correctly", () => {
      expect(coalesce<number | string>(undefined, null, 0, "test")).toBe(0);
      expect(coalesce<string | number>(undefined, null, "", "test")).toBe("");
      expect(coalesce<boolean | string>(undefined, null, false, "test")).toBe(
        false
      );
    });

    it("should return the first value if it is defined", () => {
      expect(coalesce("First", "Second")).toBe("First");
    });

    it("should work with complex objects", () => {
      const obj = { key: "value" };
      expect(coalesce(undefined, obj)).toBe(obj);
    });
  });
});
