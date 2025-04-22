import { ConsoleLogger } from "../../utils/logger.utils";

/**
 * Abstract base class that provides logging functionality
 * All classes that extend this will have access to standardized logging
 * @author Zach Ayers
 */
export abstract class Loggable {
  protected readonly log: ConsoleLogger;

  /**
   * Creates a new Loggable instance
   * Initializes a ConsoleLogger with the class name for consistent logging
   */
  constructor() {
    this.log = new ConsoleLogger({ className: this.constructor.name });
  }
}
