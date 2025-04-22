/**
 * Utility type to represent an Empty object.
 * @description This type enforces an Object must be empty when created.
 * @category (Utility)
 * @author Zach Ayers
 * @public
 * @example
 * ```typescript
 * const obj: EmptyObject = {} // Works
 *
 * const obj: EmptyObject = { foo: 'bar' } // Will throw a Type Error
 * ```
 */
export type EmptyObject = {
  [K in any]: never;
};
