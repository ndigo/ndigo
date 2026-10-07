/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    HTTPInit,
    HTTP,
    RequestAwareHTTPInterceptor,
    ResponseAwareHTTPInterceptor,
    CompletionAwareHTTPInterceptor,
} from '@blue/http';
import { FrameworkError } from '@blue/core';

/** Stable identity for a replay clone: a later interceptor may replace the Request object. */
const requestKey = (request: Request): string => `${request.method} ${request.url}`;

/**
 * Builds the client init for replaying a queued request through `HTTP.request`.
 *
 * The `body` stream belongs to a fresh clone, so consuming it does not disturb
 * the pristine clone the queue keeps for further retries.
 */
function toReplayInit(request: Request): HTTPInit & { duplex?: 'half' } {
    return {
        method: request.method as HTTPInit['method'],
        headers: request.headers,
        body: request.body,
        // Node's fetch refuses a ReadableStream body without an explicit
        // half-duplex mode.
        duplex: request.body ? 'half' : undefined,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        integrity: request.integrity,
        keepalive: request.keepalive,
    };
}

/** Default base interval before the first retry, and the timer cadence. */
export const DEFAULT_RETRY_INTERVAL = 3000;
/** Default per-entry queue cap. */
export const DEFAULT_QUEUE_CAP = 100;
/** Default upper bound on the per-entry backoff interval. */
export const DEFAULT_MAX_RETRY_INTERVAL = 30000;

/**
 * Configuration options for the RetryOnOfflineInterceptor.
 */
export interface RetryOnOfflineConfig {
    /**
     * Maximum number of retry attempts when offline. Defaults to 5.
     */
    maxRetries?: number;
    /**
     * Base interval in milliseconds used for the offline retry cadence and as
     * the first (attempt-0) per-entry backoff. Defaults to 3000.
     */
    retryInterval?: number;
    /**
     * Upper bound (in milliseconds) on the per-entry exponential backoff
     * interval (`retryInterval * 2^attempt`). Defaults to 30000 (30 s).
     */
    maxRetryInterval?: number;
    /**
     * Maximum number of entries that may be queued for offline retry.
     * Defaults to 100.
     *
     * Overflow policy (documented, fail-fast): when the queue is full, the
     * NEWEST request is rejected with a `FrameworkError` rather than growing
     * the queue without bound — silent unbounded growth would let an offline
     * burst accumulate unbounded memory and delay recovery. Raise this cap
     * (or treat the error as a client-side 503) when bursts legitimately
     * exceed it. The oldest entries are always kept.
     */
    queueCap?: number;
    /**
     * Whether to log retry attempts. Defaults to `false`.
     */
    enableLogging?: boolean;
}

/**
 * A queued offline request awaiting retry.
 *
 * `retries` counts failures already sustained; `nextRetryAt` is the epoch-ms
 * before which the entry must not be retried (per-entry exponential backoff).
 */
type OfflineQueueEntry = {
    request: Request;
    http: HTTP | undefined;
    resolve: (r: Response) => void;
    reject: (e: Error) => void;
    retries: number;
    nextRetryAt: number;
};

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
export class RetryOnOfflineInterceptor
    implements RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor, CompletionAwareHTTPInterceptor
{
    readonly #config: RetryOnOfflineConfig;
    /**
     * Undisturbed `Request.clone()` per live request, captured in `preRequest`
     * before fetch reads the body stream. The failed request's body is
     * consumed/disturbed by the time `postResponse` runs, so a queued replay
     * must be rebuilt from this clone to keep method, headers, and body.
     */
    readonly #pristineClones = new WeakMap<Request, Request>();
    /**
     * The same clones keyed by `method + url`. A later interceptor may replace
     * the `Request` object, so the identity map misses and `postResponse` must
     * still find the undisturbed body (PWB-REV-006). Cleared in `postComplete`
     * so the map holds only in-flight requests.
     */
    readonly #pristineByKey = new Map<string, Request>();
    #queue: OfflineQueueEntry[];
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
     * Captures an undisturbed clone of each outgoing request for offline
     * replay, then queues the request when the browser is already offline.
     *
     * @param request - The outgoing request.
     * @param http - The HTTP client.
     * @returns A queued promise while offline, otherwise void.
     */
    async preRequest(request: Request, http: HTTP): Promise<Response | void> {
        if (navigator.onLine) {
            const clone = request.clone();
            this.#pristineClones.set(request, clone);
            this.#pristineByKey.set(requestKey(request), clone);
            return;
        }

        // Queue the request for later retry (bounded by the queue cap). The
        // owning client is retained so the drain replays through the full
        // interceptor pipeline rather than a bare fetch (PWB-REV-007).
        return new Promise<Response>((resolve, reject) => {
            try {
                this.#enqueue({ request, http, resolve, reject, retries: 0, nextRetryAt: 0 });
            } catch (error) {
                reject(error as Error);
            }
        });
    }

    /**
     * Handles failed responses by queuing them for retry when offline.
     *
     * @param response - The response from the server.
     * @param settings - The request settings.
     * @param request - The final request that was sent, when available.
     * @returns The response, or a queued promise when offline.
     */
    async postResponse(response: Response, settings: HTTPInit, request?: Request): Promise<Response | void> {
        if (response.ok) {
            return response;
        }

        if (!navigator.onLine) {
            if (!request) {
                if (!response.url) {
                    // Unkeyable response (mock/stub) — no replay possible.
                    return response;
                }

                return this.#enqueueResponse(
                    new Request(response.url, {
                        method: response.headers.get('X-HTTP-Method') || 'GET',
                    })
                );
            }

            // Replay the undisturbed clone captured in preRequest: synthesizing
            // a request from the response headers would drop the original
            // method, headers, and body. The identity map is consulted first,
            // then the method+url map — a later interceptor may have replaced
            // the Request object (PWB-REV-006).
            const candidate =
                this.#pristineClones.get(request) ?? this.#pristineByKey.get(requestKey(request)) ?? request;

            if (candidate.bodyUsed) {
                // No undisturbed clone: replaying a consumed body would throw a
                // disturbed-body TypeError on the drain. Fail the queue entry
                // instead (PWB-REV-006).
                return Promise.reject(
                    new FrameworkError(
                        `[RetryOnOffline] cannot queue ${candidate.method} ${candidate.url} for replay: the request body was already consumed and no undisturbed clone is available`
                    )
                );
            }

            return this.#enqueueResponse(candidate);
        }

        return response;
    }

    /**
     * Releases the method+url clone for a completed request so the map tracks
     * only in-flight requests.
     */
    postComplete(request: Request): void {
        this.#pristineByKey.delete(requestKey(request));
    }

    /**
     * Queues a request for offline retry and returns the promise that settles
     * when the drain succeeds or the retries are exhausted.
     */
    #enqueueResponse(request: Request): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            // postResponse has no HTTP client; the queue is drained over fetch().
            try {
                this.#enqueue({ request, http: undefined, resolve, reject, retries: 0, nextRetryAt: 0 });
            } catch (error) {
                reject(error as Error);
            }
        });
    }

    /**
     * Starts the retry timer if not already running.
     */
    #startRetryTimer(): void {
        if (this.#timer) {
            return;
        }

        const interval = this.#config.retryInterval ?? DEFAULT_RETRY_INTERVAL;
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
     * Enqueues a request for offline retry, enforcing the queue cap.
     *
     * Overflow policy (fail-fast): when the queue holds `queueCap` entries the
     * NEWEST request is rejected with a `FrameworkError` instead of growing
     * the queue without bound.
     *
     * @param entry - The entry to queue (with `nextRetryAt` unset).
     * @throws {FrameworkError} When the queue is at capacity.
     */
    #enqueue(entry: OfflineQueueEntry): void {
        const cap = this.#config.queueCap ?? DEFAULT_QUEUE_CAP;
        if (this.#queue.length >= cap) {
            throw new FrameworkError(
                `[RetryOnOffline] queue full (${cap}): rejected newest request to ${entry.request.url} — fail-fast overflow policy; raise queueCap to allow more queued retries`
            );
        }
        entry.nextRetryAt = Date.now() + this.#backoffFor(0);
        this.#queue.push(entry);
        this.#startRetryTimer();
    }

    /**
     * Computes the per-entry exponential backoff for a retry attempt.
     *
     * Attempt 0 waits `retryInterval`, attempt 1 waits `2 * retryInterval`,
     * attempt 2 waits `4 * retryInterval`, … capped at `maxRetryInterval`.
     *
     * @param attempt - The zero-based retry attempt index.
     * @returns The backoff interval in milliseconds.
     */
    #backoffFor(attempt: number): number {
        const base = this.#config.retryInterval ?? DEFAULT_RETRY_INTERVAL;
        const cap = this.#config.maxRetryInterval ?? DEFAULT_MAX_RETRY_INTERVAL;
        return Math.min(cap, base * 2 ** attempt);
    }

    /**
     * Re-issues a queued request for one drain attempt.
     *
     * When the entry carries its owning client (the offline-at-`preRequest`
     * path), the replay runs through `HTTP.request` so the full interceptor
     * pipeline applies (PWB-REV-007). Otherwise — a `postResponse` queue entry
     * has no client — it falls back to `fetch`.
     *
     * A fresh clone is taken per attempt: fetch consumes the body stream, so
     * the never-fetched queued clone stays pristine for later retries.
     */
    async #replay(entry: OfflineQueueEntry): Promise<Response> {
        const attempt = entry.request.clone();

        return entry.http ? entry.http.request(attempt.url, toReplayInit(attempt)) : fetch(attempt);
    }

    /**
     * Processes the queue, retrying each request.
     */
    async #processQueue(): Promise<void> {
        if (!navigator.onLine) {
            return;
        }

        const now = Date.now();
        const due = this.#queue.filter((entry) => entry.nextRetryAt <= now);
        // Entries whose backoff window has not elapsed stay queued.
        this.#queue = this.#queue.filter((entry) => entry.nextRetryAt > now);
        const stillQueued: OfflineQueueEntry[] = [];

        for (const entry of due) {
            try {
                // oxlint-disable-next-line no-await-in-loop -- sequential queue drain: retries are paced by the retry timer; parallelizing would burst all queued requests and reorder retry scheduling.
                const response = await this.#replay(entry);

                // A client-drained transport failure surfaces as a ResponseError
                // (`type === 'error'`) rather than a rejection; treat it as a
                // failed attempt so retry accounting still runs.
                if (response.type === 'error') {
                    throw response;
                }

                entry.resolve(response);
            } catch (error) {
                const maxRetries = this.#config.maxRetries ?? 5;
                if (entry.retries < maxRetries) {
                    entry.retries += 1;
                    entry.nextRetryAt = Date.now() + this.#backoffFor(entry.retries);
                    stillQueued.push(entry);
                    if (this.#config.enableLogging) {
                        console.warn(
                            `[RetryOnOffline] Retry ${entry.retries}/${maxRetries} for ${entry.request.url} in ${entry.nextRetryAt - Date.now()}ms`
                        );
                    }
                } else {
                    entry.reject(error as Error);
                }
            }
        }

        this.#queue.push(...stillQueued);

        if (this.#queue.length === 0) {
            this.#stopRetryTimer();
        }
    }
}
