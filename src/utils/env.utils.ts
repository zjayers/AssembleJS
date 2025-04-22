/**
 * Get an env.
 * @description - Any ENV prefixed with 'ASSEMBLE_' will be available on the client or browser using this method.
 * @param {string} env - The env to get.
 * @return {string | undefined} - The env value or undefined if not found.
 * @author Zach Ayers
 */
export function getEnv(env: string): string | undefined {
  try {
    // For server-side, use process.env
    if (typeof process !== "undefined" && process.env) {
      return process.env[env];
    }

    // For browser/Vite, use import.meta.env if available
    if (
      typeof window !== "undefined" &&
      typeof (window as any).__ENV__ !== "undefined"
    ) {
      return (window as any).__ENV__[env];
    }

    // Handle testing environment
    if (typeof global !== "undefined" && (global as any).import?.meta?.env) {
      return (global as any).import.meta.env[env];
    }

    return undefined;
  } catch {
    return undefined;
  }
}
