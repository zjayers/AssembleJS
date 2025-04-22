import type { BlueprintInstance } from "../../types/blueprint.simple.types";

/**
 * Triggered when fastify.close() is invoked to stop the server.
 *
 * It is useful when plugins need a "shutdown" event,
 * for example, to close an open connection to a database.
 *
 * @param {BlueprintInstance} app - The Assemble instance.
 * @return {Promise<void>}
 * @internal
 * @category (Hooks)
 * @author Zach Ayers
 * @example
 * ```typescript
 * async (app) => {
 *   // Some async code
 *   await closeDatabaseConnections()
 * }
 * ```
 */
export type OnCloseHook = (app: BlueprintInstance) => Promise<void>;
