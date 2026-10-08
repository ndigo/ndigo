/**
 * @module blue-log
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Exception } from '@opentelemetry/api';
import { Logger, LogAttributes } from './logger.js';
import { OpenTelemetryLogger } from './open-telemetry-logger.js';
import { ConsoleLogger } from './console-logger.js';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { ContextAwareLogger } from './context-aware-logger.js';

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
 * Per-name threshold overrides (AD-76 D-7): names and severities only — no
 * registry keeps handles alive, so lazy `ConfigurableLogger` handles stay
 * collectible (the AD-67 property). Changes bump {@link revision}.
 */
const levelOverrides = new Map<string, SeverityNumber>();

/** The names ever requested through `getLogger`, for `/loggers` enumeration. */
const requestedNames = new Set<string>();

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
            this.#revision = revision;
        }
        // Registry override wins over the handle-local one; both sit above
        // the global settings floor. Idempotent per call, so a rebuild or a
        // later registry change is reflected without extra bookkeeping.
        const effective = levelOverrides.get(this.#name) ?? this.#thresholdOverride;
        if (effective !== undefined) {
            this.#delegate.setThreshold(effective);
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
     * - Per-name overrides and requested-name tracking: cleared (AD-76 D-7)
     */
    public static reset(): void {
        settings = { ...DEFAULT_SETTINGS };
        levelOverrides.clear();
        requestedNames.clear();
        revision += 1;
    }

    /**
     * Creates and returns a `Logger` handle whose configuration follows this
     * factory's current and future global settings (plus any per-name
     * override, {@link LoggerFactory.setLevel}).
     * @param name - The name of the logger.
     * @returns A `Logger` instance.
     */
    public static getLogger(name: string): Logger {
        requestedNames.add(name);
        return new ConfigurableLogger(name);
    }

    /**
     * Sets a per-name threshold override (AD-76 D-7). Applies to every
     * handle for the name — including ones handed out before this call —
     * and survives global `setThreshold` calls until cleared.
     * @param name - The logger name.
     * @param level - The threshold severity.
     */
    public static setLevel(name: string, level: SeverityNumber): void {
        levelOverrides.set(name, level);
        revision += 1;
    }

    /**
     * Removes a per-name threshold override, falling back to the global
     * settings for the name.
     * @param name - The logger name.
     */
    public static clearLevel(name: string): void {
        if (levelOverrides.delete(name)) {
            revision += 1;
        }
    }

    /**
     * The logger names known to the factory — ever requested through
     * {@link LoggerFactory.getLogger} plus any name with a level override
     * (a `/loggers` POST names a logger without a handle, AD-76 D-7) —
     * sorted: the `/loggers` enumeration surface.
     * @returns The known logger names.
     */
    public static loggerNames(): readonly string[] {
        const names = new Set([...requestedNames, ...levelOverrides.keys()]);
        return Object.freeze([...names].sort());
    }

    /**
     * Whether a logger with this name is known (requested or overridden).
     * @param name - The logger name.
     * @returns `true` when the name is known.
     */
    public static hasLogger(name: string): boolean {
        return requestedNames.has(name) || levelOverrides.has(name);
    }

    /**
     * The per-name threshold override for a logger, when set.
     * @param name - The logger name.
     * @returns The override severity, or `undefined`.
     */
    public static configuredLevel(name: string): SeverityNumber | undefined {
        return levelOverrides.get(name);
    }

    /**
     * The effective threshold for a logger: the per-name override when set,
     * otherwise the current global threshold.
     * @param name - The logger name.
     * @returns The effective severity.
     */
    public static effectiveLevel(name: string): SeverityNumber {
        return levelOverrides.get(name) ?? settings.threshold;
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
