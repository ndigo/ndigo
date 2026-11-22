/**
 * Serves dynamic log-level inspection and changes under `/loggers`
 *. Registered WITHOUT route decorators — the auto-configuration
 * wires the routes explicitly so exposure can gate them.
 */
import { AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { IllegalStateError, Null } from '@ndigo/core';
import { LoggerFactory } from '@ndigo/log';
import { LOGGER_LEVEL_NAMES, loggerLevelName, resolveLoggerLevel } from '@ndigo/log';
import { getMapping, postMapping, requestMapping, parameters, pathVariable, validatedBody } from '@ndigo/dispatcher';
import { ResponseEntity } from '@ndigo/platform-node';
import { isEndpointExposed } from './management-properties';
import { z } from 'zod';

/** The POST body contract: `{"configuredLevel": "…"}` sets, `{}` clears. */
const LOGGER_BODY_SCHEMA = z.object({
    configuredLevel: z.enum(LOGGER_LEVEL_NAMES).optional(),
});

/**
 * Serves `/loggers`: the level index, per-logger reads, and per-logger
 * level changes (runtime, process-local — lost on restart).
 *
 * Payloads follow the actuator loggers endpoint: the index is
 * `{ levels, loggers: { <name>: { configuredLevel?, effectiveLevel } } }`,
 * a single logger is `{ configuredLevel?, effectiveLevel }` (404 when the
 * name was never requested), and a POST body of
 * `{"configuredLevel": "debug"}` sets a level while `{}` clears it back to
 * the global settings floor. Unknown level names are rejected 400 by the
 * body schema's enum.
 *
 * @example
 * ```ts
 * const controller = new LoggersController();
 * ```
 */
@requestMapping('/loggers')
export class LoggersController extends AsApplicationContextAware(Null) {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "LoggersController".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object LoggersController]"
     */
    get [Symbol.toStringTag](): string {
        return 'LoggersController';
    }

    /** The application context injected by the aware mixin. */
    readonly applicationContext!: ApplicationContext;
    readonly #exposure: { include?: string[]; exclude?: string[] };

    /**
     * Creates the `/loggers` controller.
     *
     * @param exposure - The programmatic exposure override;
     *   wins over the `management.*` source section.
     */
    constructor(exposure: { include?: string[]; exclude?: string[] } = {}) {
        super();
        this.#exposure = exposure;
    }

    /** Whether the `loggers` endpoint is served. */
    #exposed(): boolean {
        return isEndpointExposed(this.applicationContext?.environment, this.#exposure, 'loggers');
    }

    /**
     * The level document for a name: the override when set, always the
     * effective level.
     *
     * @param name - The logger name.
     * @returns The level document.
     */
    #document(name: string): { configuredLevel?: string; effectiveLevel: string } {
        const configured = LoggerFactory.configuredLevel(name);
        return configured === undefined
            ? { effectiveLevel: loggerLevelName(LoggerFactory.effectiveLevel(name)) }
            : {
                  configuredLevel: loggerLevelName(configured),
                  effectiveLevel: loggerLevelName(LoggerFactory.effectiveLevel(name)),
              };
    }

    /**
     * The level index: the canonical vocabulary and every requested logger
     * with its configured (override) and effective level.
     *
     * @returns The index document.
     */
    @getMapping('/')
    index() {
        if (!this.#exposed()) {
            return ResponseEntity.notFound();
        }
        const loggers: Record<string, { configuredLevel?: string; effectiveLevel: string }> = {};
        for (const name of LoggerFactory.loggerNames()) {
            const configured = LoggerFactory.configuredLevel(name);
            const entry: { configuredLevel?: string; effectiveLevel: string } = {
                effectiveLevel: loggerLevelName(LoggerFactory.effectiveLevel(name)),
            };
            if (configured !== undefined) {
                entry.configuredLevel = loggerLevelName(configured);
            }
            loggers[name] = entry;
        }
        return { levels: [...LOGGER_LEVEL_NAMES], loggers };
    }

    /**
     * Reads one logger's levels; 404 when the name was never requested.
     *
     * @param name - The logger name.
     * @returns The level document, or 404.
     */
    @getMapping('/:name')
    @parameters({ name: pathVariable('name') })
    getLogger(name: string) {
        if (!this.#exposed() || !LoggerFactory.hasLogger(name)) {
            return ResponseEntity.notFound();
        }
        return this.#document(name);
    }

    /**
     * Sets or clears a logger's level. A body with
     * `configuredLevel` sets a per-name override; an empty body clears it.
     * Invalid level names fail validation with 400.
     *
     * Named `updateLogger`, not `setLogger`: the aware processor duck-types
     * `setLogger` as the `LoggerAware` callback and would invoke it with a
     * `Logger` at configuration time.
     *
     * @param name - The logger name.
     * @param body - The parsed request body.
     * @returns The resulting level document.
     */
    @postMapping('/:name')
    @parameters({ name: pathVariable('name'), body: validatedBody(LOGGER_BODY_SCHEMA) })
    updateLogger(name: string, body: { configuredLevel?: string }) {
        if (!this.#exposed()) {
            return ResponseEntity.notFound();
        }
        const requested = body.configuredLevel;
        if (requested === undefined) {
            LoggerFactory.clearLevel(name);
        } else {
            // The body schema's enum (built from LOGGER_LEVEL_NAMES) rejected
            // unknown names already; if the two ever drift, fail loudly
            // instead of applying a wrong threshold.
            const severity = resolveLoggerLevel(requested);
            if (severity === undefined) {
                throw new IllegalStateError(`level table drift: "${requested}" passed the schema enum`);
            }
            LoggerFactory.setLevel(name, severity);
        }
        return this.#document(name);
    }
}
