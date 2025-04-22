import {
  getRandomElementSubset,
  reduceAndMergeKeys,
  paginate,
  getDistinctKeys,
} from "../../utils/array.utils";

describe("Array Utilities", () => {
  describe("getRandomElementSubset", () => {
    it("should return a subset of the array", () => {
      const array = [1, 2, 3, 4, 5];

      // Mock Math.random to ensure deterministic behavior
      const originalRandom = Math.random;

      // Force random to return 0.8 first (which will create a 5-element array)
      // and subsequent values to select specific elements
      Math.random = jest
        .fn()
        .mockReturnValueOnce(0.8) // Makes counter = 5
        .mockReturnValueOnce(0.1) // First element
        .mockReturnValueOnce(0.3) // Second element
        .mockReturnValueOnce(0.5) // Third element
        .mockReturnValueOnce(0.7) // Fourth element
        .mockReturnValueOnce(0.9); // Fifth element

      const result = getRandomElementSubset(array);

      // Restore original Math.random
      Math.random = originalRandom;

      // The result should be an array with 5 elements
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5);

      // Every element in the result should be in the original array
      result.forEach((item) => {
        expect(array).toContain(item);
      });
    });

    it("should handle empty arrays", () => {
      const result = getRandomElementSubset([]);
      expect(result).toEqual([
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ]);
    });

    it("should handle arrays with a single element", () => {
      const array = ["single"];
      const result = getRandomElementSubset(array);

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.length).toBeLessThanOrEqual(5);

      // When items are defined, they should be the single element
      result.filter(Boolean).forEach((item) => {
        expect(item).toBe("single");
      });
    });
  });

  describe("reduceAndMergeKeys", () => {
    it("should merge objects by specified keys", () => {
      const data = [
        { id: "a", value: 1 },
        { id: "b", value: 2 },
        { id: "a", value: 3 },
        { id: "c", value: 4 },
        { id: "b", value: 5 },
      ];

      const result = reduceAndMergeKeys(data, "id", "value");

      expect(result).toEqual({
        a: [1, 3],
        b: [2, 5],
        c: [4],
      });
    });

    it("should handle an empty array", () => {
      const result = reduceAndMergeKeys([], "id", "value");
      expect(result).toEqual({});
    });

    it("should handle complex objects", () => {
      const data = [
        { category: "fruit", items: { name: "apple", count: 5 } },
        { category: "vegetable", items: { name: "carrot", count: 10 } },
        { category: "fruit", items: { name: "banana", count: 3 } },
      ];

      const result = reduceAndMergeKeys(data, "category", "items");

      expect(result).toEqual({
        fruit: [
          { name: "apple", count: 5 },
          { name: "banana", count: 3 },
        ],
        vegetable: [{ name: "carrot", count: 10 }],
      });
    });
  });

  describe("paginate", () => {
    it("should return the correct page of data", () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      // First page with size 3
      expect(paginate(data, 3, 0)).toEqual([1, 2, 3]);

      // Second page with size 3
      expect(paginate(data, 3, 1)).toEqual([4, 5, 6]);

      // Third page with size 3
      expect(paginate(data, 3, 2)).toEqual([7, 8, 9]);

      // Fourth page with size 3 (incomplete)
      expect(paginate(data, 3, 3)).toEqual([10]);
    });

    it("should return an empty array for pages beyond the data size", () => {
      const data = [1, 2, 3, 4, 5];

      expect(paginate(data, 2, 3)).toEqual([]);
    });

    it("should handle page size larger than the array", () => {
      const data = [1, 2, 3];

      expect(paginate(data, 5, 0)).toEqual([1, 2, 3]);
    });

    it("should handle empty arrays", () => {
      expect(paginate([], 5, 0)).toEqual([]);
    });
  });

  describe("getDistinctKeys", () => {
    it("should return distinct values for the specified key", () => {
      const data = [
        { id: 1, category: "A" },
        { id: 2, category: "B" },
        { id: 3, category: "A" },
        { id: 4, category: "C" },
        { id: 5, category: "B" },
      ];

      const result = getDistinctKeys(data, "category");
      expect(result).toEqual(["A", "B", "C"]);
    });

    it("should handle numeric keys", () => {
      const data = [
        { id: 1, value: 10 },
        { id: 2, value: 20 },
        { id: 3, value: 10 },
        { id: 4, value: 30 },
        { id: 5, value: 20 },
      ];

      const result = getDistinctKeys(data, "value");
      expect(result).toEqual([10, 20, 30]);
    });

    it("should handle boolean keys", () => {
      const data = [
        { id: 1, active: true },
        { id: 2, active: false },
        { id: 3, active: true },
        { id: 4, active: true },
        { id: 5, active: false },
      ];

      const result = getDistinctKeys(data, "active");
      expect(result).toEqual([true, false]);
    });

    it("should handle empty arrays", () => {
      const result = getDistinctKeys([], "id");
      expect(result).toEqual([]);
    });
  });
});
