/**
 * Telemetry hooks for service request lifecycles.
 */
import { EventEmitter } from '@ndigo/context';

/**
 * Interface for telemetry hooks that track service request lifecycles.
 *
 * @example
 * ```ts
 * const hooks: TelemetryHooks = new EventEmitterTelemetryHooks(emitter);
 * ```
 */
export interface TelemetryHooks {
    /**
     * Called before a service request is sent.
     *
     * @param request - The HTTP request.
     */
    onRequest(request: Request): void;
    /**
     * Called after a service response is received.
     *
     * @param response - The HTTP response.
     */
    onResponse(response: Response): void;
    /**
     * Called when a service request fails.
     *
     * @param error - The error that occurred.
     */
    onError(error: Error): void;
}

/**
 * Telemetry hooks implementation that uses an EventEmitter to notify about service events.
 *
 * @example
 * ```ts
 * const hooks = new EventEmitterTelemetryHooks(context.eventEmitter);
 * ```
 */
export class EventEmitterTelemetryHooks implements TelemetryHooks {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "EventEmitterTelemetryHooks".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object EventEmitterTelemetryHooks]"
     */
    get [Symbol.toStringTag](): string {
        return 'EventEmitterTelemetryHooks';
    }

    #emitter: EventEmitter;

    /**
     * Creates a new telemetry hooks implementation.
     *
     * @param emitter - The event emitter to use for notifications.
     *
     * @example
     * ```ts
     * const hooks = new EventEmitterTelemetryHooks(context.eventEmitter);
     * ```
     */
    constructor(emitter: EventEmitter) {
        this.#emitter = emitter;
    }

    /**
     * Records the start of a service request.
     *
     * @param request - The HTTP request.
     */
    onRequest(request: Request): void {
        this.#emitter.emit('service:request:start', {
            url: request.url,
            method: request.method,
        });
    }

    /**
     * Records the completion of a service request.
     *
     * @param response - The HTTP response.
     */
    onResponse(response: Response): void {
        this.#emitter.emit('service:request:end', {
            url: response.url,
            status: response.status,
        });
    }

    /**
     * Records a service request failure.
     *
     * @param error - The error that occurred.
     */
    onError(error: Error): void {
        this.#emitter.emit('service:request:error', {
            error: error.message,
            stack: error.stack,
        });
    }
}
