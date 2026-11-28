/**
 * Remote config fetch pipeline: timeout, size cap, change gating, and the
 * optional/keep-last-good failure policy.
 */
import { IllegalStateError, JSONObject } from '@ndigo/core';
import { getLogger } from '@ndigo/log';
import type { RemoteSourceOptions } from './remote-property-source-types.js';

const logger = getLogger('ndigo-context:remote-property-source');

/** Default fetch timeout for one remote config exchange (10 s; mirrors the OIDC adapter). */
const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

/** Default maximum accepted remote config response size (1 MiB; mirrors the OIDC adapter). */
const DEFAULT_MAX_RESPONSE_BYTES = 1_048_576;

/** Configuration for {@link RemoteSourceFetcher}. */
export interface RemoteSourceFetcherOptions extends RemoteSourceOptions {
    /** Source name used in diagnostics. */
    readonly name: string;
    /** Applies a changed document to the environment. */
    readonly apply: (document: JSONObject) => void;
}

/**
 * Fetches a remote JSON document and applies it when it changes.
 *
 * Owns the ETag/body-text change gate, the timeout and size caps, and the
 * failure policy: before the first successful apply, `optional: false` throws;
 * after it, every failure keeps the last-good document and warns.
 */
export class RemoteSourceFetcher {
    readonly #options: RemoteSourceFetcherOptions;
    #lastBody: string | null = null;
    #etag: string | null = null;
    #fetchInFlight = false;

    constructor(options: RemoteSourceFetcherOptions) {
        this.#options = options;
    }

    /** Whether a poll tick is already in flight. */
    get fetching(): boolean {
        return this.#fetchInFlight;
    }

    /**
     * Fetches once and applies the document when the ETag/body gate says it
     * changed.
     *
     * @returns `true` when a document was applied, `false` when skipped or
     * failed under the optional policy.
     * @throws When `optional: false` and no document has ever been applied.
     */
    async fetchAndApply(): Promise<boolean> {
        const headers: Record<string, string> = { ...this.#options.headers };
        // Header keys in `headers` follow the canonical-case convention (only
        // exact matches are consulted; callers pass `If-None-Match`, not the
        // lower-cased form — RUS-5b).
        if (this.#etag && headers['If-None-Match'] === undefined) {
            headers['If-None-Match'] = this.#etag;
        }

        const doFetch = this.#options.fetch ?? globalThis.fetch;
        const timeoutMs = this.#options.fetchTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
        const maxBytes = this.#options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
        // Bound the whole exchange (request + body read) so a stalled
        // config server cannot pin a poll tick or boot; the abort rejects the
        // fetch and routes through the standard failure policy below.
        const controller = new AbortController();
        const timer = setTimeout(
            () => controller.abort(new IllegalStateError(`Remote config fetch timed out after ${timeoutMs}ms`)),
            timeoutMs
        );
        let body: string;
        let etag: string | null;
        try {
            let response: {
                ok: boolean;
                status: number;
                headers: { get(name: string): string | null };
                body?: ReadableStream<Uint8Array> | null;
                text(): Promise<string>;
            };
            try {
                response = await doFetch(this.#options.url, { headers, signal: controller.signal });
            } catch (err) {
                // Transport rejection (DNS/TLS/refused/timeout): same policy
                // as an HTTP error — throw only while nothing was applied yet.
                return this.#lastBody === null ? this.#handleBootFailure('<transport>', err) : this.#keepLastGood(err);
            }
            if (response.status === 304) {
                return false; // unchanged — no re-merge, no event
            }
            if (!response.ok) {
                // `optional: false` fails boot only on the FIRST (never-applied)
                // fetch; later poll failures keep last-good.
                const cause = new IllegalStateError(`HTTP ${response.status}`);
                return this.#lastBody === null
                    ? this.#handleBootFailure(String(response.status), cause)
                    : this.#keepLastGood(cause);
            }
            // Content-Length pre-check: refuse an oversized document before
            // reading a byte; a missing/unparseable length falls through to
            // the streamed accounting in `#readBody`.
            const contentLength = Number(response.headers.get('content-length'));
            if (Number.isFinite(contentLength) && contentLength > maxBytes) {
                const cause = this.#oversizedError(maxBytes);
                return this.#lastBody === null ? this.#handleBootFailure('<size>', cause) : this.#keepLastGood(cause);
            }
            try {
                body = await this.#readBody(response, maxBytes);
            } catch (err) {
                return this.#lastBody === null ? this.#handleBootFailure('<body>', err) : this.#keepLastGood(err);
            }
            // Intentional no-dep exception: `@ndigo/http`'s ETAG constant is not
            // adopted to avoid adding a new base-package dependency for a single
            // read. Fetch `Headers.get` is case-insensitive per spec, so the
            // literal is spec-safe.
            etag = response.headers.get('etag');
        } finally {
            clearTimeout(timer);
        }
        if (etag) {
            this.#etag = etag;
        }

        if (body === this.#lastBody) {
            return false; // unchanged body — no re-merge, no event
        }

        let document: unknown;
        try {
            document = JSON.parse(body);
        } catch {
            const cause = new IllegalStateError(
                `Remote config from "${this.#options.url}" is not valid JSON (source "${this.#options.name}")`
            );
            return this.#lastBody === null ? this.#handleBootFailure('<json>', cause) : this.#keepLastGood(cause);
        }
        if (document === null || typeof document !== 'object' || Array.isArray(document)) {
            const cause = new IllegalStateError(
                `Remote config from "${this.#options.url}" must be a JSON object (source "${this.#options.name}")`
            );
            return this.#lastBody === null ? this.#handleBootFailure('<shape>', cause) : this.#keepLastGood(cause);
        }

        this.#lastBody = body;
        this.#options.apply(document as JSONObject);
        return true;
    }

    /**
     * One poll cycle: fetch, gate on change, apply on change. An in-flight
     * guard skips a tick whose previous fetch has not resolved yet
     * (out-of-order applies could regress rotated/revoked secrets).
     */
    async poll(): Promise<void> {
        if (this.#fetchInFlight) return;
        this.#fetchInFlight = true;
        try {
            await this.fetchAndApply();
        } catch (err) {
            this.#keepLastGood(err);
        } finally {
            this.#fetchInFlight = false;
        }
    }

    /**
     * Reads a response body with `maxBytes` enforced while streaming.
     * The caller's `Content-Length` pre-check is the fast path; counting
     * actual bytes also bounds chunked responses and servers that lie about
     * the length. Without a streaming body (spec stubs, legacy fetch),
     * `text()` is the only read path and the encoded size is checked after
     * the fact.
     *
     * @param response - The fetch response (streaming body optional).
     * @param maxBytes - The byte cap; exceeding it cancels the stream and
     * throws, so the caller can apply the `optional`/keep-last-good policy.
     * @throws When the document exceeds `maxBytes`.
     */
    async #readBody(
        response: { body?: ReadableStream<Uint8Array> | null; text(): Promise<string> },
        maxBytes: number
    ): Promise<string> {
        const stream = response.body;
        if (!stream) {
            const text = await response.text();
            if (new TextEncoder().encode(text).byteLength > maxBytes) {
                throw this.#oversizedError(maxBytes);
            }
            return text;
        }
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        for (;;) {
            // oxlint-disable-next-line no-await-in-loop -- a ReadableStream must be consumed sequentially; chunks are validated and accumulated in order.
            const { done, value } = await reader.read();
            if (done) break;
            received += value.byteLength;
            if (received > maxBytes) {
                void reader.cancel();
                throw this.#oversizedError(maxBytes);
            }
            chunks.push(value);
        }
        const bytes = new Uint8Array(received);
        let offset = 0;
        for (const chunk of chunks) {
            bytes.set(chunk, offset);
            offset += chunk.byteLength;
        }
        return new TextDecoder().decode(bytes);
    }

    /** The single oversized-document failure shared by every size gate. */
    #oversizedError(maxBytes: number): IllegalStateError {
        return new IllegalStateError(
            `Remote config from "${this.#options.url}" exceeds the ${maxBytes}-byte limit (source "${this.#options.name}")`
        );
    }

    /**
     * Logs a keep-last-good warning and returns `false`. The existing
     * document/ETag stay applied and consistent; the next tick retries.
     */
    #keepLastGood(cause: unknown): false {
        const detail = cause instanceof Error ? `: ${cause.message}` : '';
        logger.warn(
            `[@ndigo/context] Remote config poll failed for source "${this.#options.name}" — keeping last-good values` +
                detail
        );
        return false;
    }

    /**
     * Resolves a boot-time fetch failure (no document applied yet) per the
     * `optional` contract.
     *
     * @param failure - Short failure classifier for the message (HTTP status,
     * `'<transport>'`, …).
     * @param cause - The underlying error, when one was thrown.
     * @throws When `optional: false` on the first fetch.
     */
    #handleBootFailure(failure: string, cause?: unknown): false {
        const reason = cause instanceof Error ? ` (${cause.message})` : '';
        if (this.#options.optional) {
            logger.warn(
                `[@ndigo/context] Remote config fetch failed at boot (${failure}) for source "${this.#options.name}" — ` +
                    `boot proceeds with env/files` +
                    reason
            );
            return false;
        }
        throw new IllegalStateError(
            `Remote config fetch failed (${failure}) for "${this.#options.url}" (source "${this.#options.name}"): ` +
                `optional:false — boot aborts.` +
                reason,
            cause instanceof Error ? { cause } : undefined
        );
    }
}
