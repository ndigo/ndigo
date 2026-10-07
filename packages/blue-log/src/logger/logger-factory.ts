/**
 * @module blue-log
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Exception } from '@opentelemetry/api';
import { Logger, LogAttributes } from './logger';
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
 * The global settings a logger handle resolves against. Held at module scope
 * (not in static class fields) so lazily-resolved handles can read the current
 * values without a registry keeping them alive.
 */
interface LoggerSettings {
    type: LoggerType;
    threshold: SeverityNumber;
    contextAware: boolean;
}

const DEFAULT_SETTINGS: Readonly<LoggerSettings> = {
    type: 'console',
    threshold: SeverityNumber.DEBUG,
    contextAware: true,
};

let settings: LoggerSettings = { ...DEFAULT_SETTINGS };

/**
 * Bumped whenever {@link settings} change. A handle re-resolves its delegate
 * when the revision it last saw differs, so switches made after a logger was
 * created at module load still reach it (KRN-REV-LOG-11).
 */
let revision = 0;

/** Builds the concrete logger for `name` from the current global settings. */
function buildLogger(name: string): Logger {
    let logger: Logger;

    if (settings.type === 'open-telemetry') {
        logger = new OpenTelemetryLogger(name, settings.threshold);
    } else if (settings.type === 'console') {
        logger = new ConsoleLogger(name, settings.threshold);
    } else {
        logger = new NoopLogger();
    }

    return settings.contextAware && settings.type !== 'none' ? new ContextAwareLogger(logger) : logger;
}

/**
 * A `Logger` handle whose concrete implementation is resolved lazily from the
 * current `LoggerFactory` settings and re-resolved whenever they change.
 *
 * `LoggerFactory` returns these handles instead of eagerly-built loggers, so a
 * logger captured at module load (the common
 * `const logger = getLogger('…')` pattern) still follows a later `setType`/
 * `setThreshold`/`setContextAware` — e.g. `configureTelemetry` routing output
 * through OpenTelemetry after the framework modules were imported
 * (KRN-REV-LOG-11).
 */
class ConfigurableLogger implements Logger {
    readonly #name: string;
    #delegate: Logger;
    #revision: number;
    #thresholdOverride: SeverityNumber | undefined;

    constructor(name: string) {
        this.#name = name;
        this.#revision = revision;
        this.#delegate = buildLogger(name);
    }

    /** The delegate for the current settings, rebuilt after any change. */
    #current(): Logger {
        if (this.#revision !== revision) {
            this.#delegate = buildLogger(this.#name);
            if (this.#thresholdOverride !== undefined) {
                this.#delegate.setThreshold(this.#thresholdOverride);
            }
            this.#revision = revision;
        }
        return this.#delegate;
    }

    get threshold(): SeverityNumber {
        return this.#current().threshold;
    }

    setThreshold(threshold: SeverityNumber): void {
        this.#thresholdOverride = threshold;
        this.#delegate.setThreshold(threshold);
    }

    isEnabled(severityNumber: SeverityNumber): boolean {
        return this.#current().isEnabled(severityNumber);
    }

    debug(message: string, attributes?: LogAttributes): void {
        this.#current().debug(message, attributes);
    }

    info(message: string, attributes?: LogAttributes): void {
        this.#current().info(message, attributes);
    }

    warn(message: string, attributes?: LogAttributes): void {
        this.#current().warn(message, attributes);
    }

    error(message: string, error?: Exception, attributes?: LogAttributes): void {
        this.#current().error(message, error, attributes);
    }
}

/**
 * A static factory class for creating `Logger` instances.
 *
 * This factory allows for global configuration of logger types, severity thresholds,
 * and whether loggers should be context-aware (e.g., integrating with OpenTelemetry contexts).
 * Configuration changes apply to every logger already handed out — loggers are
 * lazily-resolved handles, not frozen snapshots.
 */
export class LoggerFactory {
    /**
     * Sets the global logger type for all loggers created by this factory —
     * including those already handed out.
     * @param type - The desired `LoggerType`.
     */
    public static setType(type: LoggerType): void {
        settings.type = type;
        revision += 1;
    }

    /**
     * Sets the global minimum severity threshold for all loggers created by
     * this factory — including those already handed out.
     * @param threshold - The new minimum `SeverityNumber`.
     */
    public static setThreshold(threshold: SeverityNumber): void {
        settings.threshold = threshold;
        revision += 1;
    }

    /**
     * Enables or disables context-aware logging for all loggers.
     * When enabled, loggers will automatically include context information (e.g., trace IDs)
     * if an active OpenTelemetry context is available.
     * @param enabled - `true` to enable context-aware logging, `false` to disable.
     */
    public static setContextAware(enabled: boolean): void {
        settings.contextAware = enabled;
        revision += 1;
    }

    /**
     * Resets the `LoggerFactory` to its default configuration:
     * - Type: `'console'`
     * - Threshold: `SeverityNumber.DEBUG`
     * - Context-aware: `true`
     */
    public static reset(): void {
        settings = { ...DEFAULT_SETTINGS };
        revision += 1;
    }

    /**
     * Creates and returns a `Logger` handle whose configuration follows this
     * factory's current and future global settings.
     * @param name - The name of the logger.
     * @returns A `Logger` instance.
     */
    public static getLogger(name: string): Logger {
        return new ConfigurableLogger(name);
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
