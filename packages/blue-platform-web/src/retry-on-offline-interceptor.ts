/**
 * @author Jeff Rose
 */

import { HTTP, RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '@blue/http';

/**
 * Configuration options for the RetryOnOfflineInterceptor.
 */
export interface RetryOnOfflineConfig {
    /**
     * Maximum number of retry attempts when offline. Defaults to 5.
     */
    maxRetries?: number;
    /**
     * Interval in milliseconds between retry attempts. Defaults to 3000.
     */
    retryInterval?: number;
    /**
     * Whether to log retry attempts. Defaults to `false`.
     */
    enableLogging?: boolean;
}

/**
 * Interceptor that queues failed requests when offline and replays them when online.
 *
 * Uses the browser's `navigator.onLine` property to detect connectivity.
 * When a request fails and the browser is offline, the request is queued
 * and retried at the configured interval until it succeeds or the max retries
 * is reached.
 *
 * @example
 * ```ts
 * const http = new HTTP([new RetryOnOfflineInterceptor()]);
 * await http.get('/api/data');
 * // If offline, the request is queued and retried automatically
 * ```
 */
export class RetryOnOfflineInterceptor implements RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor {
    readonly #config: RetryOnOfflineConfig;
    #queue: Array<{
        request: Request;
        http: HTTP;
        resolve: (r: Response) => void;
        reject: (e: Error) => void;
        retries: number;
    }>;
    #timer: ReturnType<typeof setInterval> | null;

    constructor(config: RetryOnOfflineConfig = {}) {
        this.#config = config;
        this.#queue = [];
        this.#timer = null;
    }

    /**
     * Returns the number of currently queued requests.
     */
    get queuedCount(): number {
        return this.#queue.length;
    }

    /**
     * Checks the cache for a matching response before the request is sent.
     *
     * @param request - The outgoing request.
     * @param http - The HTTP client.
     * @returns A cached response when available, otherwise void.
     */
    async preRequest(request: Request, http: HTTP): Promise<Response | void> {
        if (navigator.onLine) {
            return;
        }

        // Queue the request for later retry
        return new Promise<Response>((resolve, reject) => {
            this.#queue.push({ request, http, resolve, reject, retries: 0 });
            this.#startRetryTimer();
        });
    }

    /**
     * Handles failed responses by queuing them for retry when offline.
     *
     * @param response - The response from the server.
     * @param settings - The request settings.
     * @returns The response, or a queued promise when offline.
     */
    async postResponse(response: Response, settings: any): Promise<Response | void> {
        if (response.ok) {
            return response;
        }

        if (!navigator.onLine) {
            const request = new Request(response.url, {
                method: response.headers.get('X-HTTP-Method') || 'GET',
            });

            return new Promise<Response>((resolve, reject) => {
                this.#queue.push({ request, http: undefined as any, resolve, reject, retries: 0 });
                this.#startRetryTimer();
            });
        }

        return response;
    }

    /**
     * Starts the retry timer if not already running.
     */
    #startRetryTimer(): void {
        if (this.#timer) {
            return;
        }

        const interval = this.#config.retryInterval ?? 3000;
        this.#timer = setInterval(() => this.#processQueue(), interval);
    }

    /**
     * Stops the retry timer when the queue is empty.
     */
    #stopRetryTimer(): void {
        if (this.#timer) {
            clearInterval(this.#timer);
            this.#timer = null;
        }
    }

    /**
     * Processes the queue, retrying each request.
     */
    async #processQueue(): Promise<void> {
        if (!navigator.onLine) {
            return;
        }

        const queue = [...this.#queue];
        this.#queue = [];

        for (const entry of queue) {
            try {
                // oxlint-disable-next-line no-await-in-loop -- sequential queue drain: retries are paced by the retry timer; parallelizing would burst all queued requests and reorder retry scheduling.
                const response = await fetch(entry.request);
                entry.resolve(response);
            } catch (error) {
                const maxRetries = this.#config.maxRetries ?? 5;
                if (entry.retries < maxRetries) {
                    this.#queue.push({ ...entry, retries: entry.retries + 1 });
                    if (this.#config.enableLogging) {
                        console.warn(
                            `[RetryOnOffline] Retry ${entry.retries + 1}/${maxRetries} for ${entry.request.url}`
                        );
                    }
                } else {
                    entry.reject(error as Error);
                }
            }
        }

        if (this.#queue.length === 0) {
            this.#stopRetryTimer();
        }
    }
}
