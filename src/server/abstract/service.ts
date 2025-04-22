import { Loggable } from "./loggable";

/**
 * Base Service class for AssembleJS services
 * @description Services handle business logic, API communication, and data operations.
 * They serve as a layer between controllers and external resources like APIs or databases.
 * @author Zach Ayers
 */
export abstract class Service extends Loggable {
  /**
   * Optional initialization method that will be called when the service is registered
   * Can be used for setup operations like connecting to databases, initializing clients, etc.
   */
  public async initialize(): Promise<void> {
    // Default implementation does nothing
    // Override in derived classes if needed
  }
}
