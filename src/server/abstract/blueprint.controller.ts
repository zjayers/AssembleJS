import type { Assembly } from "../../types/blueprint.simple.types";
import { Loggable } from "./loggable";
import { ServiceContainer } from "../app/service-container";
import type { Service } from "./service";

/**
 * Abstract definition of an AssembleJS Controller.
 * @description Blueprint controllers provide the foundation for defining server-side routes
 * and handlers in AssembleJS applications. This base class includes dependency injection
 * capabilities through the ServiceContainer, allowing controllers to easily access shared
 * services. All custom controllers in an AssembleJS application should extend this class.
 *
 * @example
 * ```typescript
 * import { Blueprint, BlueprintController, Assembly } from "asmbl";
 *
 * export class UserController extends BlueprintController {
 *   // Implement the required register method
 *   register(app: Assembly): void {
 *     // Register a GET route for user data
 *     app.get('/users', async (req, reply) => {
 *       // Use injected service if available
 *       if (this.hasService('userService')) {
 *         const userService = this.getService<UserService>('userService');
 *         const users = await userService.getAllUsers();
 *         return users;
 *       }
 *
 *       // Fallback if service not available
 *       return { error: 'User service not available' };
 *     });
 *   }
 * }
 * ```
 *
 * @category (Server)
 * @author Zachariah Ayers
 */
export abstract class BlueprintController extends Loggable {
  /**
   * Get a service from the container.
   * This method retrieves a service instance from the global ServiceContainer.
   * Services are singleton instances that provide shared functionality across the application.
   *
   * @template T The service type that extends the Service base class
   * @param {string} token - The service identifier used during registration
   * @returns {T} The service instance of the requested type
   * @throws {Error} When the requested service is not found in the container
   * @example
   * ```typescript
   * // Get the user service from the container
   * const userService = this.getService<UserService>('userService');
   * const currentUser = await userService.getCurrentUser(req.userId);
   * ```
   */
  protected getService<T extends Service>(token: string): T {
    return ServiceContainer.getInstance().get<T>(token);
  }

  /**
   * Check if a service is available in the container.
   * This method verifies if a service with the given token exists in the ServiceContainer
   * before attempting to retrieve it. This allows for graceful fallbacks when optional
   * services are not available.
   *
   * @param {string} token - The service identifier to check
   * @returns {boolean} True if the service is registered, false otherwise
   * @example
   * ```typescript
   * // Check if the optional caching service is available
   * if (this.hasService('cacheService')) {
   *   const cacheService = this.getService<CacheService>('cacheService');
   *   return await cacheService.getCachedData(key);
   * } else {
   *   // Fallback to database lookup if cache isn't available
   *   return await this.fetchDataFromDatabase(key);
   * }
   * ```
   */
  protected hasService(token: string): boolean {
    return ServiceContainer.getInstance().has(token);
  }

  /**
   * Register a controller with the server.
   * This abstract method must be implemented by all concrete controller classes.
   * It's where you define all routes, hooks, and handlers for your controller.
   * The method is called during server initialization to set up the controller's
   * functionality.
   *
   * @param {Assembly} app - The server instance to register the controller with
   * @returns {void}
   * @example
   * ```typescript
   * // Sample implementation in a concrete controller
   * register(app: Assembly): void {
   *   // Define a route group with a common prefix
   *   const routes = app.register({
   *     prefix: '/api/products'
   *   });
   *
   *   // Register route handlers
   *   routes.get('/', this.getAllProducts.bind(this));
   *   routes.get('/:id', this.getProductById.bind(this));
   *   routes.post('/', this.createProduct.bind(this));
   *   routes.put('/:id', this.updateProduct.bind(this));
   *   routes.delete('/:id', this.deleteProduct.bind(this));
   * }
   * ```
   */
  abstract register(app: Assembly): void;
}
