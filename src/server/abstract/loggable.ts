import { ConsoleLogger } from "../../utils/logger.utils";

/**
 * Abstract base class that provides logging functionality
 * @description All classes that extend this will have access to standardized logging
 * @author Zachariah Ayers
 * @category Server
 * @public
 */
export abstract class Loggable {
  protected readonly log: ConsoleLogger;

  /**
   * Creates a new Loggable instance
   * @description Initializes a ConsoleLogger with the class name for consistent logging
   * @author Zachariah Ayers
   * @protected
   */
  constructor() {
    this.log = new ConsoleLogger({ className: this.constructor.name });
  }
}
