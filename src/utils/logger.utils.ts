import assert from "assert";
import chalk, { ChalkInstance } from "chalk";
import { getObjectKeys } from "./object.utils";
import { defaultString } from "./string.utils";
import { CONSTANTS } from "../constants/blueprint.constants";
import { getEnv } from "./env.utils";

/**
 * Get the Logger ENV for a given class.
 * @description - This will be read from 'ASSEMBLEJS_LOG_LEVEL_<CLASS_NAME>'
 * @param {string} className - The class name to get the logger ENV for.
 * @return {string} - The logger ENV for the given class.
 */
function getClassLogLevel(className: string) {
  try {
    return getEnv(`${CONSTANTS.env.logLevel}${className.toUpperCase()}`);
  } catch {
    return undefined;
  }
}

/**
 * Log Levels. Available Options Include:
 *
 *  1. `STATUS` - Status Messages Will Log unless OFF is configured.
 *  2. `FATAL`  - Fatal messages that should show up in the case that the app should terminate.
 *  3. `ERROR`  - Runtime Errors that should be addressed.
 *  4. `WARN`   - Runtime Warnings. These logs are not problematic but could explain why things don't work.
 *  5. `INFO`   - Provide information about execution. (Sparse detail summarization)
 *  6. `DEBUG`  - Debug logs are for debug use only.
 *  7. `FINE`   - Fine debug logs allow for common debug information.
 *  8. `FINER`  - Finer debug logs allow for more detailed debug information.
 *  9. `FINEST` - Finest debug logs allow for elaborate detailed debug information.
 * 10. `TRACE`  - Trace logs uses the LoggerWriter's trace method. The LogFormatter will not be used.
 * 11. `PRINT`  - No formatting is applied to the logged message.
 *
 * The `ALL` or `OFF` options are only for configuration.
 *
 * @author Zach Ayers
 */
export enum ConsoleLogLevel {
  /** `STATUS` logging. */
  STATUS,

  /**
   * `FATAL` logs enabled.
   */
  FATAL,

  /**
   * `ERROR` and `FATAL` logs enabled. (Default)
   */
  ERROR,

  /**
   * `FATAL`, `ERROR` and `WARN` logs enabled.
   */
  WARN,

  /**
   * `FATAL`, `ERROR`, `WARN` and `INFO` logs enabled.
   */
  INFO,

  /**
   * `FATAL`, `ERROR`, `WARN`, `INFO` and `DEBUG` logs enabled.
   */
  DEBUG,

  /**
   * `FATAL`, `ERROR`, `WARN`, `INFO`, `DEBUG` and `FINE` logs enabled.
   */
  FINE,

  /**
   * `FATAL`, `ERROR`, `WARN`, `INFO`, `DEBUG`, `FINE` and `FINER` logs enabled.
   */
  FINER,

  /**
   * FATAL, ERROR, WARN, INFO, DEBUG, FINE, FINER and FINEST logs enabled.
   */
  FINEST,

  /**
   * `FATAL`, `ERROR`, `WARN`, `INFO`, `DEBUG`, `FINE`, `FINER`, `FINEST` and `TRACE` logs enabled.
   *
   * A TRACE log will be written to stderr and include stack information for detailed debugging.
   */
  TRACE,

  /**
   * `FATAL`, `ERROR`, `WARN`, `INFO`, `DEBUG`, `FINE`, `FINER`, `FINEST`, `TRACE` and `PRINT` logs enabled.
   *
   * A PRINT log will be logged as info without any logger prefix.
   */
  PRINT,

  /**
   * CONFIGURATION ONLY. ALL logs are enabled. (`FATAL`, `ERROR`, `WARN`, `INFO`, `DEBUG`, `FINE`, `FINER`, `FINEST`, `TRACE` and `PRINT`)
   */
  ALL,

  /**
   * CONFIGURATION ONLY. NO logs are enabled.
   */
  OFF = -1,
}

let consoleLogger: LoggerWriter = console;
const CONFIG_ONLY_LEVELS = [ConsoleLogLevel.ALL, ConsoleLogLevel.OFF];
const LOG_LEVEL_STRING_MAP: Map<ConsoleLogLevel, string> = (function (): Map<
  ConsoleLogLevel,
  string
> {
  const response = new Map<ConsoleLogLevel, string>();
  getObjectKeys(ConsoleLogLevel).forEach((key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    response.set((<any>ConsoleLogLevel)[key], key);
  });
  return response;
})();

/**
 * Provide an interface that allows the use of loggers other than the default JavaScript console.
 *
 * The exported function `configureLogWriter(logWriter)` can be used to set the `LogWriter` instance used by
 * all `ConsoleLogger` instances.
 *
 * @author Zach Ayers
 */
export interface LoggerWriter {
  log(message: string, ...optionalParam: Array<any>): void;

  error(message: string, ...optionalParam: Array<any>): void;

  debug(message: string, ...optionalParam: Array<any>): void;

  info(message: string, ...optionalParam: Array<any>): void;

  trace(message: string, ...optionalParam: Array<any>): void;
}

/**
 * Configure the `LogWriter` to use for persiting `ConsoleLogger` logs. The default writer is the JavaScript `console`.
 *
 * @param {LoggerWriter} logWriter `LogWriter` instance to use to persist logs.
 * @author Zach Ayers
 */
export const configureLogWriter = (logWriter: LoggerWriter): void => {
  consoleLogger = logWriter;
};

/**
 * Provides a log formatter interface to enable customization of a ConsoleLogger's message formatting.
 *
 * @author Zach Ayers
 */
export interface LogFormatter {
  /**
   * Take the provided `message`, `className` and `logLevel` and return a `string` to be persisted to the logs.
   *
   * @param {string} message Message to be decorated for the log entry.
   * @param {string} className Class Name to be included in the log entry.
   * @param {string} logLevel Log Level to be included in the log entry.
   */
  formatLogMessage(
    message: string,
    className: string,
    logLevel: string
  ): string;
}

let defaultFormatter: LogFormatter = {
  formatLogMessage: (
    message: string,
    className: string,
    logLevel: string
  ): string => {
    return [
      new Date().toISOString(),
      " - ",
      logLevel,
      ": <",
      className,
      "> ",
      message,
    ].join("");
  },
};

const simpleFormatter: LogFormatter = {
  formatLogMessage: (message: string): string => {
    return message;
  },
};

/**
 * Configure the default `LogFormatter` to use for all `ConsoleLogger` instances that do not provide one.
 *
 * Default format: `${ISO_DATE} + ' - ' + ${logLevel} + ': <' + ${className} + '> ' + ${message}`
 *
 * @param {LogFormatter} formatter `LogFormatter` instance.
 * @author Zach Ayers
 */
export const configureDefaultLogFormatter = (formatter: LogFormatter): void => {
  defaultFormatter = formatter;
};

/**
 * The `ConsoleLogger` class provides a logging implementation that allows the log level to be configured with class name
 * granularity. It provides for log levels specified by the `CondiontLoggerLevel` enumeration.
 *
 * The following exposed functions allow you to configure the behavior of all implementations of `ConsoleLogger`:
 * 1. `configureLogWriter(logWriter)` - Configure a custom `LogWriter` to persist the logs. By default JavaScript `console` is used.
 * 2. `configureDefaultLogFormatter(formatter)` - Configure a customer `LogFormatter` to allow for custom log formatting of the given `message`, `className` and `logLevel` values.
 *
 * These methods would typically be called in the specific implementation during the configuration portion of the application.
 *
 * @param {string} className Class Name to Associate with the logger.
 * @param {LogFormatter | undefined} formatter Log Formatter instance to use to format the logs.
 *
 * @author Zach Ayers
 */
export class ConsoleLogger {
  private readonly _className: string;
  private readonly _level: ConsoleLogLevel;
  private readonly _formatter: LogFormatter;
  private _stylizer: ChalkInstance | null = null;

  /**
   * Logger Constructor
   * @param {{any}} opts - Options to configure the logger.
   */
  constructor(opts?: { className?: string; formatter?: LogFormatter }) {
    this._className = opts?.className ?? CONSTANTS.defaultLoggerClassName;
    this._level = this.getLoggerLevel(this._className);
    this._formatter =
      opts?.formatter !== undefined ? opts.formatter : defaultFormatter;
  }

  /**
   * Build a new condition logger for the specified class name.
   *
   * @param {string} className Class Name to Associate with the logger.
   * @param {LogFormatter | undefined} formatter Log Formatter instance to use to format the logs.
   * @return {ConsoleLogger} New Logger.
   */
  public static buildLogger(
    className: string,
    formatter?: LogFormatter
  ): ConsoleLogger {
    return new ConsoleLogger({ className, formatter });
  }

  /**
   * Add a style to the next line written by the logger. The style will be forgotten once the line is logged.
   * @param {Function} stylizer - Function that takes a string and returns a string.
   * @return {void}
   */
  public stylize(stylizer: (style: ChalkInstance) => ChalkInstance) {
    this._stylizer = stylizer(chalk);
  }

  /**
   * Convenience method for creating a status log.
   *
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional)
   * @example log(ConsoleLogLevel.STATUS, message, ...optionalParam)
   */
  public status(message: string, ...optionalParam: Array<any>): void {
    this.log(ConsoleLogLevel.STATUS, message, ...optionalParam);
  }

  /**
   * Convenience method for creating a fatal log.
   *
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional)
   * @example `log(ConsoleLogLevel.FATAL, message, ...optionalParam)`
   */
  public fatal(message: string, ...optionalParam: Array<any>): void {
    this.log(ConsoleLogLevel.FATAL, message, ...optionalParam);
  }

  /**
   * Convenience method for creating an error log.
   *
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional)
   * @example `log(ConsoleLogLevel.ERROR, message, ...optionalParam)`
   */
  public error(message: string, ...optionalParam: Array<any>): void {
    this.log(ConsoleLogLevel.ERROR, message, ...optionalParam);
  }

  /**
   * Convenience method for creating a warning log.
   *
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional)
   * @example `log(ConsoleLogLevel.WARN, message, ...optionalParam)`
   */
  public warn(message: string, ...optionalParam: Array<any>): void {
    this.log(ConsoleLogLevel.WARN, message, ...optionalParam);
  }

  /**
   * Convenience method for creating an info log.
   *
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional)
   * @example `log(ConsoleLogLevel.INFO, message, ...optionalParam)`
   */
  public info(message: string, ...optionalParam: Array<any>): void {
    this.log(ConsoleLogLevel.INFO, message, ...optionalParam);
  }

  /**
   * Convenience method for creating a debug log.
   *
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional)
   * @example `log(ConsoleLogLevel.DEBUG, message, ...optionalParam)`
   */
  public debug(message: string, ...optionalParam: Array<any>): void {
    this.log(ConsoleLogLevel.DEBUG, message, ...optionalParam);
  }

  /**
   * Convenience method for creating a fine detail log.
   *
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional)
   * @example `log(ConsoleLogLevel.FINE, message, ...optionalParam)`
   */
  public fine(message: string, ...optionalParam: Array<any>): void {
    this.log(ConsoleLogLevel.FINE, message, ...optionalParam);
  }

  /**
   * Convenience method for creating a finer detail log.
   *
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional)
   * @example `log(ConsoleLogLevel.FINER, message, ...optionalParam)`
   */
  public finer(message: string, ...optionalParam: Array<any>): void {
    this.log(ConsoleLogLevel.FINER, message, ...optionalParam);
  }

  /**
   * Convenience method for creating a finest detail log.
   *
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional)
   * @example `log(ConsoleLogLevel.FINEST, message, ...optionalParam)`
   */
  public finest(message: string, ...optionalParam: Array<any>): void {
    this.log(ConsoleLogLevel.FINEST, message, ...optionalParam);
  }

  /**
   * Convenience method for creating a system trace log.
   *
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional)
   * @example `log(ConsoleLogLevel.TRACE, message, ...optionalParam)`
   */
  public trace(message: string, ...optionalParam: Array<any>): void {
    this.log(ConsoleLogLevel.TRACE, message, ...optionalParam);
  }

  /**
   * Print a message to the console.
   *
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional)
   * @example `log(ConsoleLogLevel.PRINT, message, ...optionalParam)`
   */
  public print(message: string, ...optionalParam: Array<any>): void {
    this.log(ConsoleLogLevel.PRINT, message, ...optionalParam);
  }

  /**
   * Log a message to the console using the specified log level only when the log level specified has been configured.
   *
   * @param {ConsoleLogLevel} level Level of Logging for Message. (`ConsoleLogLevel.ALL` and `ConsoleLogLevel.OFF` will raise an exception)
   * @param {string} message Message to Log.
   * @param {Array<any>} optionalParam Parameters to include in the log. (Optional))
   */
  public log(
    level: ConsoleLogLevel,
    message: string,
    ...optionalParam: Array<any>
  ): void {
    if (this._stylizer) {
      message = this._stylizer(message);
      this._stylizer = null;
    }

    this.assertLoggingLevel(level);

    const levelString = LOG_LEVEL_STRING_MAP.get(level);
    const logMessage = this._formatter.formatLogMessage(
      message,
      this._className,
      defaultString(levelString, "NA")
    );

    if (level === ConsoleLogLevel.STATUS) {
      consoleLogger.info(logMessage, ...optionalParam);
    }

    if (this._level !== ConsoleLogLevel.OFF && level <= this._level) {
      switch (level) {
        case ConsoleLogLevel.FATAL:
        case ConsoleLogLevel.ERROR:
        case ConsoleLogLevel.WARN:
          consoleLogger.error(logMessage, ...optionalParam);
          break;
        case ConsoleLogLevel.INFO:
        case ConsoleLogLevel.DEBUG:
          consoleLogger.debug(logMessage, ...optionalParam);
          break;
        case ConsoleLogLevel.FINE:
        case ConsoleLogLevel.FINER:
        case ConsoleLogLevel.FINEST:
          consoleLogger.info(logMessage, ...optionalParam);
          break;
        case ConsoleLogLevel.TRACE:
          consoleLogger.trace(message, ...optionalParam);
          break;
        default:
          consoleLogger.log(message, ...optionalParam);
      }
    }
  }

  /**
   * Assert that the specified log level is valid.
   * @param {ConsoleLogLevel} level - Level of Logging for Message.
   * @private
   * @author Zach Ayers
   */
  private assertLoggingLevel(level: ConsoleLogLevel): void {
    CONFIG_ONLY_LEVELS.forEach((assertLevel) => {
      assert(
        level !== assertLevel,
        [
          "The log level, ",
          LOG_LEVEL_STRING_MAP.get(level),
          ", is for configuration only.",
        ].join(" ")
      );
    });
  }

  /**
   * Get the current logger level.
   * @param {string} className - Class name to get the level for.
   * @return {ConsoleLogLevel} - The current logger level.
   * @private
   * @author Zach Ayers
   */
  private getLoggerLevel(className: string): ConsoleLogLevel {
    let configuredLevel: string | undefined = getClassLogLevel(className);

    if (configuredLevel === undefined) {
      configuredLevel = getEnv(CONSTANTS.env.logLevel.key);
    }

    const response: ConsoleLogLevel | undefined = this.loggerLevel(
      defaultString(configuredLevel)
    );

    if (response !== undefined) {
      return response;
    }

    return ConsoleLogLevel.ALL;
  }

  /**
   * Getter for the current logger level.
   * @param {string} key - Key to get the level for.
   * @return {ConsoleLogLevel | undefined} - The current logger level.
   * @private
   * @author Zach Ayers
   */
  private loggerLevel(key: string): ConsoleLogLevel | undefined {
    if ((<any>ConsoleLogLevel)[key]) {
      return (<any>ConsoleLogLevel)[key];
    }

    return (<any>ConsoleLogLevel)[key.toUpperCase()];
  }

  /* eslint-enable */
}

/**
 * Creates a logger instance for the specified class
 * @param {string} className - The class name for the logger
 * @return {ConsoleLogger} A logger configured for the specified class
 * @author Zach Ayers
 */
export function logger(className: string): ConsoleLogger {
  return ConsoleLogger.buildLogger(className);
}

/**
 * Creates a simple logger without timestamps or class formatting
 * @param {string} className - The class name for the logger
 * @return {ConsoleLogger} A simple logger for the specified class
 * @author Zach Ayers
 */
export function simpleLogger(className: string): ConsoleLogger {
  return ConsoleLogger.buildLogger(className, simpleFormatter);
}
