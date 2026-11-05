/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { EventEmitter } from '@ndigo/context';
import { HTTPInit, ResponseAwareHTTPInterceptor } from '@ndigo/http';

/**
 * Configuration options for the OfflineInterceptor.
 */
export interface OfflineInterceptorConfig {
    /**
     * The interval in milliseconds to check for online status.
     * @default 5000
     */
    checkInterval?: number;
}

/**
 * HTTP interceptor that detects browser offline status.
 *
 * This interceptor monitors the browser's online/offline state and can
 * be used to trigger retry logic or notify the application.
 *
 * The window listeners and heartbeat interval run until
 * {@link OfflineInterceptor.dispose | dispose()} is called.
 */
export class OfflineInterceptor implements ResponseAwareHTTPInterceptor {
    #config: OfflineInterceptorConfig;
    #emitter: EventEmitter;
    #isOnline: boolean = navigator.onLine;
    #heartbeat: ReturnType<typeof setInterval> | undefined;
    #disposed = false;
    #onOnline: () => void;
    #onOffline: () => void;

    /**
     * Creates a new offline interceptor.
     *
     * @param config - Offline interceptor configuration.
     * @param emitter - Event emitter to notify about status changes.
     */
    constructor(config: OfflineInterceptorConfig = {}, emitter: EventEmitter) {
        this.#config = config;
        this.#emitter = emitter;
        this.#onOnline = () => this.#updateStatus(true);
        this.#onOffline = () => this.#updateStatus(false);

        this.#setupListeners();
        this.#startHeartbeat();
    }

    /**
     * Stops the heartbeat and removes the window listeners. Idempotent.
     */
    dispose(): void {
        if (this.#disposed) {
            return;
        }
        this.#disposed = true;
        if (this.#heartbeat !== undefined) {
            clearInterval(this.#heartbeat);
            this.#heartbeat = undefined;
        }
        window.removeEventListener('online', this.#onOnline);
        window.removeEventListener('offline', this.#onOffline);
    }

    /**
     * Returns the current online status.
     */
    get isOnline(): boolean {
        return this.#isOnline;
    }

    /**
     * Handles the response after a request.
     *
     * @param response - The response returned by fetch.
     * @param settings - The request settings used for the call.
     * @returns The response.
     */
    async postResponse(response: Response, settings: HTTPInit): Promise<Response | void> {
        return response;
    }

    #setupListeners(): void {
        window.addEventListener('online', this.#onOnline);
        window.addEventListener('offline', this.#onOffline);
    }

    #startHeartbeat(): void {
        const interval = this.#config.checkInterval ?? 5000;
        this.#heartbeat = setInterval(() => {
            const currentStatus = navigator.onLine;
            if (currentStatus !== this.#isOnline) {
                this.#updateStatus(currentStatus);
            }
        }, interval);
    }

    #updateStatus(status: boolean): void {
        if (this.#isOnline !== status) {
            this.#isOnline = status;
            this.#emitter.emit(status ? 'online' : 'offline', {
                isOnline: status,
                timestamp: Date.now(),
            });
        }
    }
}
