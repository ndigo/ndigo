/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { EventEmitter } from '@blue/context';
import { HTTPInit, ResponseAwareHTTPInterceptor } from '@blue/http';

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

 */
export class OfflineInterceptor implements ResponseAwareHTTPInterceptor {
    #config: OfflineInterceptorConfig;
    #emitter: EventEmitter;
    #isOnline: boolean = navigator.onLine;

    /**
     * Creates a new offline interceptor.
     *
     * @param config - Offline interceptor configuration.
     * @param emitter - Event emitter to notify about status changes.
     */
    constructor(config: OfflineInterceptorConfig = {}, emitter: EventEmitter) {
        this.#config = config;
        this.#emitter = emitter;

        this.#setupListeners();
        this.#startHeartbeat();
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
        window.addEventListener('online', () => this.#updateStatus(true));
        window.addEventListener('offline', () => this.#updateStatus(false));
    }

    #startHeartbeat(): void {
        const interval = this.#config.checkInterval ?? 5000;
        setInterval(() => {
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
