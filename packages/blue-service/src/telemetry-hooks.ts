import { EventEmitter } from '@blue/context';

/**
 * Interface for telemetry hooks that track service request lifecycles.
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
 */
export class EventEmitterTelemetryHooks implements TelemetryHooks {
    #emitter: EventEmitter;

    /**
     * Creates a new telemetry hooks implementation.
     *
     * @param emitter - The event emitter to use for notifications.
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
