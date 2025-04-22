/**
 * Get a subset of random elements from an array.
 * This function uses a Fisher-Yates shuffle algorithm to efficiently select a random subset
 * of elements without duplicates from the provided array.
 *
 * @template T - Type of array elements
 * @param {T[]} arr - Array to get random elements from
 * @return {T[]} Array of 1-5 random elements from the input array
 * @example
 * ```typescript
 * // Get random user IDs for a featured users section
 * const allUserIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * const featuredUserIds = getRandomElementSubset(allUserIds);
 * // Result might be [4, 2, 9] (random subset with random length 1-5)
 * ```
 * @category (Utils)
 * @author Zachariah Ayers
 */
export const getRandomElementSubset = <T>(arr: T[]): T[] => {
  let len = arr.length;
  let counter = Math.floor(Math.random() * 5) + 1;
  const result = new Array(counter);
  const taken = new Array(len);

  while (counter--) {
    const x = Math.floor(Math.random() * len);
    result[counter] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }

  return result;
};

/**
 * Reduce an array and merge any similar keys into an object.
 * This function groups array elements by a specified key and collects values from another key
 * into arrays. Useful for creating categorized data structures from flat arrays.
 *
 * @param {any} arr - Array to reduce
 * @param {any} mainKey - Key to use as the grouping key
 * @param {any} mergeKey - Key to extract values from for each group
 * @return {Record<string, unknown[]>} Object where keys are values from mainKey and values are arrays of mergeKey values
 * @example
 * ```typescript
 * // Group products by category and collect their names
 * const products = [
 *   { id: 1, name: 'T-shirt', category: 'clothing' },
 *   { id: 2, name: 'Pants', category: 'clothing' },
 *   { id: 3, name: 'Apple', category: 'food' }
 * ];
 * const productsByCategory = reduceAndMergeKeys(products, 'category', 'name');
 * // Result: { clothing: ['T-shirt', 'Pants'], food: ['Apple'] }
 * ```
 * @category (Utils)
 * @author Zachariah Ayers
 */
export const reduceAndMergeKeys = <T>(
  arr: T[],
  mainKey: keyof T,
  mergeKey: keyof T
): Record<string, unknown[]> => {
  return arr.reduce((c: Record<string, unknown[]>, v: T) => {
    const k = v[mainKey] as unknown as string;
    c[k] = c[k] || [];
    c[k].push(v[mergeKey]);
    return c;
  }, {});
};

/**
 * Get a specific 'page' from an array.
 * This function implements pagination for arrays, allowing you to split large arrays
 * into smaller chunks for display or processing. Page numbering starts at 0.
 *
 * @template T - Type of elements in the array
 * @param {T[]} array - Array to get page from
 * @param {number} pageSize - Number of elements per page
 * @param {number} pageNumber - Zero-based page index to retrieve
 * @return {T[]} Subset of the array containing the specified page
 * @example
 * ```typescript
 * // Get the second page (items 10-19) from a large array with 10 items per page
 * const allItems = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
 * const secondPage = paginate(allItems, 10, 1);
 * // Result: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
 * ```
 * @category (Utils)
 * @author Zachariah Ayers
 */
export const paginate = <T>(
  array: T[],
  pageSize: number,
  pageNumber: number
): T[] => array.slice(pageNumber * pageSize, pageNumber * pageSize + pageSize);

/**
 * Get all distinct values for a specific key from an array of objects.
 * This function extracts values for a given property from all objects in an array
 * and returns an array of unique values, removing duplicates.
 *
 * @template T - Type of objects in the array
 * @param {any} arr - Array of objects to extract distinct key values from
 * @param {any} key - Property name to extract unique values for
 * @return {any} Array of distinct values for the specified key
 * @example
 * ```typescript
 * // Get all unique categories from a product list
 * const products = [
 *   { id: 1, name: 'T-shirt', category: 'clothing' },
 *   { id: 2, name: 'Pants', category: 'clothing' },
 *   { id: 3, name: 'Apple', category: 'food' },
 *   { id: 4, name: 'Banana', category: 'food' }
 * ];
 * const categories = getDistinctKeys(products, 'category');
 * // Result: ['clothing', 'food']
 * ```
 * @category (Utils)
 * @author Zachariah Ayers
 */
export const getDistinctKeys = <T>(arr: T[], key: keyof T): T[typeof key][] =>
  Array.from(new Set(arr.map((u) => u[key])));
