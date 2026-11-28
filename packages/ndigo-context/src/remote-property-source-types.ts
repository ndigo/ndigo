/**
 * Public contracts for the remote config property source.
 */

/**
 * The default source name for the remote config source.
 */
export const CONFIG_SERVER_SOURCE_NAME = 'configServer';

/**
 * The poll scheduler seam (injectable for deterministic tests). Defaults to
 * `globalThis.setInterval`/`clearInterval`. The handle type is opaque to the
 * source (Node's `setInterval` returns a `Timeout`, an injected fake may use
 * a number) — the seam owns its handle.
 *
 * @example
 * ```ts
 * const scheduler: RemoteSourceScheduler = {
 *     setInterval: (cb, ms) => setInterval(cb, ms),
 *     clearInterval: (handle) => clearInterval(handle as NodeJS.Timeout),
 * };
 * ```
 */
export interface RemoteSourceScheduler {
    /**
     * Schedules a repeated callback. Returns an opaque handle.
     * @param callback - The callback.
     * @param ms - The interval in ms.
     * @returns An opaque handle.
     */
    setInterval(callback: () => void, ms: number): unknown;
    /**
     * Cancels a scheduled callback by its handle.
     * @param handle - The handle.
     */
    clearInterval(handle: unknown): void;
}

/**
 * Options accepted by `RemotePropertySource`.
 *
 * @example
 * ```ts
 * const options: RemoteSourceOptions = { pollMs: 1000 };
 * ```
 */
export interface RemoteSourceOptions {
    /**
     * The remote configuration URL. Required; when using the default fetch,
     * the scheme is validated at construction and must be `https:`.
     */
    url: string;
    /**
     * Polling interval in milliseconds. `0`/absent = fetch once at load,
     * no polling.
     */
    pollMs?: number;
    /**
     * Static headers sent on every request (e.g.
     * `Authorization: Bearer …` sourced from env at the wiring site).
     */
    headers?: Record<string, string>;
    /**
     * `true` (default) — fetch failure warns and boot proceeds; `false` —
     * first fetch failure throws (boot fails loudly naming the URL).
     */
    optional?: boolean;
    /**
     * The fetch implementation (injectable seam for specs / non-fetch
     * runtimes). Defaults to `globalThis.fetch`. Injecting a fetch skips the
     * `https:` scheme check — the seam owns the transport then.
     */
    fetch?: typeof globalThis.fetch;
    /**
     * The poll scheduler seam. Defaults to `globalThis.setInterval`/`clearInterval`.
     */
    scheduler?: RemoteSourceScheduler;
    /**
     * Timeout for one fetch exchange (request + body read) in milliseconds
     * (default `10_000`). On expiry the request is aborted and the failure
     * follows the standard `optional`/keep-last-good policy.
     */
    fetchTimeoutMs?: number;
    /**
     * Maximum accepted response size in bytes (default 1 MiB). Enforced
     * against `Content-Length` when the server declares one, then by
     * counting streamed bytes; an oversized document follows the standard
     * `optional`/keep-last-good policy.
     */
    maxResponseBytes?: number;
}
