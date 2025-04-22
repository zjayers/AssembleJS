import type { BlueprintInstance } from "../../types/blueprint.simple.types";

/**
 * Triggered when a new plugin is registered and a new encapsulation context is created.
 * The hook will be executed before the registered code.
 *
 * This hook can be useful
 * if you are developing a plugin that needs to know when a plugin context is formed,
 * and you want to operate in that specific context, thus this hook is encapsulated.
 *
 * Note: This hook will not be called if a plugin is wrapped inside fastify-plugin.
 *
 * @param {BlueprintInstance} app - The AssembleJS instance.
 * @returns {Promise<void>}
 * @internal
 * @author Zach Ayers
 * @category (Hooks)
 * @example
 * ```typescript
 * (app) => {
 *   console.log(app.data) // []
 * }
 * ```
 */
export type OnRegisterHook = (app: BlueprintInstance) => void;
