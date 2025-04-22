import type { AnyObject } from "../types/object.any";

/**
 * Get an `Array` containing the keys from an object variable.
 *
 * @param {Record<string, unknown>} object Object Variable.
 * @return {Array<string>} Array of Strings.
 * @author Zach Ayers
 */
export const getObjectKeys = (
  object: Record<string, unknown>
): Array<string> => {
  return Object.keys(object).filter((x) => isNaN(Number(x)));
};

/**
 * If the value is not undefined, this will return a spreadable object containing (key: value).
 * @param {string} key - Key to use in the object.
 * @param {unknown} value - Value to use in the object.
 * @return {Record< string, unknown>} - Spreadable object containing (key: value).
 * @author Zach Ayers
 */
export const conditionallyAddKey = (
  key: string,
  value?: unknown
): Record<string, unknown> => {
  return value ? { [key]: value } : {};
};

/**
 * Remove a key from an object and return a clone of the object (minus the key).
 * @param {any} obj - Object to remove key from.
 * @param {any} key - Key to remove from object.
 * @return {any} - Cloned object with key removed.
 * @author Zach Ayers
 */
export function omitKey<T>(obj: T, key: keyof T): Omit<T, typeof key> {
  const { [key]: ommited, ...rest } = obj;
  return rest;
}

/**
 * Remove a series of keys from an object and return a clone of the object (minus the keys).
 * @param {any} obj - Object to remove keys from.
 * @param {Array<any>} keys - Keys to remove from object.
 * @return {any} - Cloned object with keys removed.
 * @author Zach Ayers
 */
export function omit<T>(obj: T, ...keys: Array<keyof T>): Partial<T> {
  let retObj: Partial<T> = obj;
  keys.forEach((key) => {
    retObj = omitKey(retObj as T, key) as Partial<T>;
  });
  return retObj;
}

/**
 * Combine and flatten objects into a single object.
 * @param {AnyObject[]} objs - Array of objects to combine.
 * @return {any} - Combined and flattened object.
 * @author Zach Ayers
 */
export function combine<T = AnyObject>(...objs: AnyObject[]): T {
  return objs.flat().reduce((hash, part) => ({ ...hash, ...part }), {}) as T;
}

/**
 * Get the first valid value passed to the function or undefined if no valid value is found.
 *
 * @param  {Array<T | undefined | null>} values Array of <T>.
 * @return {T | undefined} First Valid <T> or Undefined if No Valid Value Was Provided.
 * @author Zach Ayers
 */
export const coalesce = <T>(
  ...values: Array<T | undefined | null>
): T | undefined => {
  let returnValue: T | undefined;

  values.every((value) => {
    if (value !== undefined && value !== null) {
      returnValue = value;
      return false;
    }

    return true;
  });
  return returnValue;
};
