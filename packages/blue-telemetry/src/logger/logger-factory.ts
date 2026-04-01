import { Logger } from './logger';
import { OpenTelemetryLogger } from './open-telemetry-logger';
import { ConsoleLogger } from './console-logger';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { ContextAwareLogger } from './context-aware-logger';

/**
 * Defines the available types of loggers that can be created by the `LoggerFactory`.
 * - `'open-telemetry'`: Uses OpenTelemetry for logging.
 * - `'console'`: Logs directly to the console.
 * - `'none'`: A no-operation logger that discards all log messages.
 */
export type LoggerType = 'open-telemetry' | 'console' | 'none';

class NoopLogger implements Logger {
    #threshold: SeverityNumber = SeverityNumber.FATAL4;

    get threshold(): SeverityNumber {
        return this.#threshold;
    }

    setThreshold(threshold: SeverityNumber): void {
        this.#threshold = threshold;
    }

    isEnabled(severityNumber: SeverityNumber): boolean {
        return severityNumber >= this.#threshold;
    }

    debug(): void {}

    info(): void {}

    warn(): void {}

    error(): void {}
}

/**
 * A static factory class for creating `Logger` instances.
 *
 * This factory allows for global configuration of logger types, severity thresholds,
 * and whether loggers should be context-aware (e.g., integrating with OpenTelemetry contexts).
 */
export class LoggerFactory {
    private static type: LoggerType = 'console';
    private static threshold: SeverityNumber = SeverityNumber.DEBUG;
    private static contextAware: boolean = true;

    /**
     * Sets the global logger type for all subsequent loggers created by this factory.
     * @param type - The desired `LoggerType`.
     */
    public static setType(type: LoggerType): void {
        this.type = type;
    }

    /**
     * Sets the global minimum severity threshold for all subsequent loggers created by this factory.
     * @param threshold - The new minimum `SeverityNumber`.
     */
    public static setThreshold(threshold: SeverityNumber): void {
        this.threshold = threshold;
    }

    /**
     * Enables or disables context-aware logging for all subsequent loggers.
     * When enabled, loggers will automatically include context information (e.g., trace IDs)
     * if an active OpenTelemetry context is available.
     * @param enabled - `true` to enable context-aware logging, `false` to disable.
     */
    public static setContextAware(enabled: boolean): void {
        this.contextAware = enabled;
    }

    /**
     * Resets the `LoggerFactory` to its default configuration:
     * - Type: `'console'`
     * - Threshold: `SeverityNumber.DEBUG`
     * - Context-aware: `true`
     */
    public static reset(): void {
        this.type = 'console';
        this.threshold = SeverityNumber.DEBUG;
        this.contextAware = true;
    }

    /**
     * Creates and returns a `Logger` instance with the specified name,
     * configured according to the current global settings of the factory.
     * @param name - The name of the logger.
     * @returns A `Logger` instance.
     */
    public static getLogger(name: string): Logger {
        let logger: Logger;

        if (this.type === 'open-telemetry') {
            logger = new OpenTelemetryLogger(name, this.threshold);
        } else if (this.type === 'console') {
            logger = new ConsoleLogger(name, this.threshold);
        } else {
            logger = new NoopLogger();
        }

        if (this.contextAware && this.type !== 'none') {
            return new ContextAwareLogger(logger);
        }

        return logger;
    }
}

/**
 * A convenience function to get a `Logger` instance from the `LoggerFactory`.
 * @param name - The name of the logger.
 * @returns A `Logger` instance.
 */
export function getLogger(name: string): Logger {
    return LoggerFactory.getLogger(name);
}
