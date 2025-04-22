/**
 * Stub for React for browser bundle
 * This is a minimal implementation to avoid bundling issues
 */

// Export an empty object as React
export default {
  createElement: () => ({}),
  Fragment: Symbol("React.Fragment"),
};

// Named exports
export const createElement = () => ({});
export const Fragment = Symbol("React.Fragment");
