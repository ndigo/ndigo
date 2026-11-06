/**
 * Remote config property source (AD-29 D-6..D-8).
 *
 * A named, reorderable property source whose values are fetched over HTTP(S)
 * as a plain JSON document (`{"key": value, ...}` — the own-contract wire
 * format). Change detection:
 *   - with server `ETag`: polls send `If-None-Match`, a `304` skips re-merge
 *     and fires no refresh event;
 *   - without `ETag`: the raw body text is compared — an unchanged body
 *     skips re-merge and fires no refresh event.
 *
 * On a detected change the source `replace`s its own registry entry (keeping
 * its precedence position), then calls `environment.refresh()` → emits
 * `config:refresh` → `@refreshScope` beans rebind (the full loop, D-8). No
 * change → no event → no rebinding (no storms).
 *
 * Failure semantics mirror the config-file loader's `optional:`/`required:`
 * convention: `optional: true` (default) — a fetch failure at boot warns and
 * proceeds (env/files still run the app); `optional: false` fails boot
 * loudly naming the URL. After a document has been applied at least once
 * (`#lastBody !== null`), a poll failure — HTTP error, transport rejection,
 * timeout, oversized body, or unparseable body — keeps the last-good
 * document with a warning; the source retries on the next tick.
 *
 * Fetch hardening mirrors the OIDC adapter (SE-10): `fetchTimeoutMs`
 * (default 10s) bounds the whole exchange via `AbortController`, and
 * `maxResponseBytes` (default 1 MiB) is enforced against `Content-Length`
 * when present plus by counting streamed bytes; breaches route through the
 * same `optional`/keep-last-good policy as every other fetch failure.
 *
 * Auth: static headers via `headers` (sourced from env at the wiring site —
 * e.g. `NDIGO_CONFIG_SERVER_TOKEN` — never from `application.json`; the
 * token header is itself a secret). No token-provider callback seam in v1;
 * the `fetch` seam is the extension point.
 *
 * Runtime delivery (rung 5): a `vault://`-style URL + custom `fetch` seam is
 * the documented extension shape — no Vault-specific code ships here.
 *
 * The source is isomorphic: `fetch` is injected (Node ≥ 22 / browsers have
 * the standard), defaulting to `globalThis.fetch`; specs inject a stub.
 * When using the default fetch, the URL scheme is checked at construction
 * (the source is created at load): it must be `https:` — config in transit
 * is a secret-bearing channel, and an operator error or influenced env
 * value must not silently downgrade it to plaintext HTTP.
 */
import { IllegalStateError, JSONObject } from '@ndigo/core';
import { ConfigurableEnvironment } from './environment';
import { MutablePropertySources } from './property-sources';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-context:remote-property-source');

/**
 * The default source name for the remote config source.
 */
export const CONFIG_SERVER_SOURCE_NAME = 'configServer';

/**
 * The poll scheduler seam (injectable for deterministic tests). Defaults to
 * `globalThis.setInterval`/`clearInterval`. The handle type is opaque to the
 * source (Node's `setInterval` returns a `Timeout`, an injected fake may use
 * a number) — the seam owns its handle.
 */
export interface RemoteSourceScheduler {
    /**
     * Schedules a repeated callback. Returns an opaque handle.
     */
    setInterval(callback: () => void, ms: number): unknown;
    /**
     * Cancels a scheduled callback by its handle.
     */
    clearInterval(handle: unknown): void;
}

/**
 * Options accepted by {@link RemotePropertySource}.
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
     * follows the standard `optional`/keep-last-good policy (SE-10).
     */
    fetchTimeoutMs?: number;
    /**
     * Maximum accepted response size in bytes (default 1 MiB). Enforced
     * against `Content-Length` when the server declares one, then by
     * counting streamed bytes; an oversized document follows the standard
     * `optional`/keep-last-good policy (SE-10).
     */
    maxResponseBytes?: number;
}

/** Default fetch timeout for one remote config exchange (10 s; mirrors the OIDC adapter). */
const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

/** Default maximum accepted remote config response size (1 MiB; mirrors the OIDC adapter). */
const DEFAULT_MAX_RESPONSE_BYTES = 1_048_576;

/**
 * A named remote property source: fetches a JSON document, merges changes
 * into the environment, and (optionally) polls with ETag/body-text gating.
 */
export class RemotePropertySource {
    #environment: ConfigurableEnvironment;
    #name: string;
    #options: {
        url: string;
        pollMs?: number;
        headers?: Record<string, string>;
        optional: boolean;
        fetch?: typeof globalThis.fetch;
        scheduler?: RemoteSourceScheduler;
        fetchTimeoutMs?: number;
        maxResponseBytes?: number;
    };
    #lastBody: string | null = null;
    #etag: string | null = null;
    #timerHandle: unknown = null;
    #started: boolean = false;
    #fetchInFlight: boolean = false;

    /**
     * The name this source is registered under.
     */
    get name(): string {
        return this.#name;
    }

    /**
     * Creates a remote property source.
     *
     * @param environment - The environment the source fetches into.
     * @param options - The source configuration.
     * @throws {IllegalStateError} When the URL is missing, or — with the
     * default fetch (no injected seam) — when the URL scheme is not `https:`.
     */
    constructor(environment: ConfigurableEnvironment, options: RemoteSourceOptions) {
        if (!options.url || options.url.length === 0) {
            throw new IllegalStateError('RemotePropertySource requires a url');
        }
        if (!options.fetch) {
            // SEC-1: config in transit is a secret-bearing channel; never
            // silently downgrade it to plaintext because an operator error or
            // influenced env value named an `http:` URL. The injected-fetch
            // seam owns the transport and skips the check.
            let scheme: string | null = null;
            try {
                scheme = new URL(options.url).protocol;
            } catch {
                // unparseable — the default fetch would fail loudly anyway
            }
            if (scheme !== 'https:') {
                throw new IllegalStateError(
                    `Remote config URL must use scheme https: (option "url"; got "${scheme ?? 'unparseable'}")`
                );
            }
        }
        this.#environment = environment;
        this.#name = CONFIG_SERVER_SOURCE_NAME;
        this.#options = {
            ...options,
            optional: options.optional ?? true,
        };
    }

    /**
     * Whether the source is currently polling.
     */
    get started(): boolean {
        return this.#started;
    }

    /**
     * Fetches the remote document once and merges it into the environment at
     * the documented precedence slot (`configServer` between
     * `systemEnvironment` and `application`/`dotenv` — anchored so the
     * position is correct regardless of which platform sources exist).
     *
     * The source is registered at load time; a later poll only `replace`s
     * its own entry (position preserved, version bumped).
     *
     * @returns `true` when a document was applied, `false` when skipped
     * (optional failure).
     * @throws {IllegalStateError} When `optional: false` and the fetch fails,
     * or the response is not a JSON object.
     */
    async load(): Promise<boolean> {
        const applied = await this.#fetchAndApply();
        return applied !== null;
    }

    /**
     * Starts polling. Idempotent — a second call is a no-op on an already
     * started source.
     *
     * @throws {IllegalStateError} When `pollMs` is 0 (nothing to poll).
     */
    start(): void {
        if (this.#started) return;
        const pollMs = this.#options.pollMs ?? 0;
        if (pollMs <= 0) {
            throw new IllegalStateError(`RemotePropertySource "${this.#name}" has no pollMs; nothing to poll`);
        }
        const { setInterval } = this.#scheduler();
        this.#timerHandle = setInterval(() => void this.#poll(), pollMs);
        this.#started = true;
    }

    /**
     * Stops polling and clears the pending interval. Idempotent.
     */
    stop(): void {
        if (!this.#started) return;
        const { clearInterval } = this.#scheduler();
        if (this.#timerHandle !== null) {
            clearInterval(this.#timerHandle);
            this.#timerHandle = null;
        }
        this.#started = false;
    }

    /**
     * One poll cycle: fetch, gate on change, merge + refresh on change. An
     * in-flight guard skips a tick whose previous fetch has not resolved yet
     * (ARC-4 — out-of-order applies could regress rotated/revoked secrets).
     * Transport/parse failures are caught here (SEC-2): warn, keep last-good,
     * retry next tick — no unhandled promise rejection.
     */
    async #poll(): Promise<void> {
        if (this.#fetchInFlight) return; // previous tick still unresolved — skip
        this.#fetchInFlight = true;
        try {
            await this.#fetchAndApply();
        } catch (err) {
            // `#fetchAndApply` already handled the keep-last-good/optional
            // policy for HTTP errors; reaching this catch means the transport
            // rejected or the body was unparseable, and nothing was applied.
            // Keep last-good and warn; retry next tick (SEC-12).
            this.#keepLastGood(err);
        } finally {
            this.#fetchInFlight = false;
        }
    }

    /**
     * Fetches and, when the document changed (ETag/body-text gate), merges it
     * into the environment and refreshes. The body gate is always active
     * (identical to the previous body → skip). One failure policy for all
     * failure classes (SEC-3): HTTP errors, transport rejections, timeouts,
     * oversized documents and body/JSON-parse failures all route through
     * `optional`/last-good — after the first successful apply,
     * `optional: false` keeps last-good too.
     *
     * @returns The applied document, or `null` when skipped/failed-optional.
     * @throws {IllegalStateError} When `optional: false` and no document has
     * ever been applied (boot-time failure).
     */
    async #fetchAndApply(): Promise<JSONObject | null> {
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
        // SE-10: bound the whole exchange (request + body read) so a stalled
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
                return null; // unchanged — no re-merge, no event
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
            // Intentional no-dep exception (REUSE-5): `@ndigo/http`'s ETAG constant is not
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
            return null; // unchanged body — no re-merge, no event
        }

        let document: unknown;
        try {
            document = JSON.parse(body);
        } catch {
            const cause = new IllegalStateError(
                `Remote config from "${this.#options.url}" is not valid JSON (source "${this.#name}")`
            );
            return this.#lastBody === null ? this.#handleBootFailure('<json>', cause) : this.#keepLastGood(cause);
        }
        if (document === null || typeof document !== 'object' || Array.isArray(document)) {
            const cause = new IllegalStateError(
                `Remote config from "${this.#options.url}" must be a JSON object (source "${this.#name}")`
            );
            return this.#lastBody === null ? this.#handleBootFailure('<shape>', cause) : this.#keepLastGood(cause);
        }

        this.#lastBody = body;
        this.#apply(document as JSONObject);
        return document as JSONObject;
    }

    /**
     * Reads a response body with `maxBytes` enforced while streaming (SE-10).
     * The caller's `Content-Length` pre-check is the fast path; counting
     * actual bytes also bounds chunked responses and servers that lie about
     * the length. Without a streaming body (spec stubs, legacy fetch),
     * `text()` is the only read path and the encoded size is checked after
     * the fact.
     *
     * @param response - The fetch response (streaming body optional).
     * @param maxBytes - The byte cap; exceeding it cancels the stream and
     * throws, so the caller can apply the `optional`/keep-last-good policy.
     * @throws {IllegalStateError} When the document exceeds `maxBytes`.
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

    /** The single oversized-document failure shared by every size gate (SE-10). */
    #oversizedError(maxBytes: number): IllegalStateError {
        return new IllegalStateError(
            `Remote config from "${this.#options.url}" exceeds the ${maxBytes}-byte limit (source "${this.#name}")`
        );
    }

    /**
     * Registers/replaces the source entry at the documented precedence slot.
     *
     * Positioning (highest → lowest): `commandLine > boot > systemEnvironment
     * > configServer > dotenv > application(+-profile) > defaults`. Anchors:
     * after `systemEnvironment` when present, else before `application` when
     * present, else before `defaults` when present (boot always registers
     * `defaults` last, so this preserves the documented order), else append.
     */
    #apply(document: JSONObject): void {
        const sources = this.#environment.getPropertySources();
        if (sources.contains(this.#name)) {
            sources.replace(this.#name, document);
        } else {
            this.#register(sources, document);
        }
        this.#environment.refresh();
    }

    #register(sources: MutablePropertySources, document: JSONObject): void {
        if (sources.contains('systemEnvironment')) {
            sources.addAfter('systemEnvironment', this.#name, document);
        } else if (sources.contains('application')) {
            sources.addBefore('application', this.#name, document);
        } else if (sources.contains('defaults')) {
            // ARC-2: without this, the fallback appended BELOW `defaults`,
            // inverting the documented precedence.
            sources.addBefore('defaults', this.#name, document);
        } else {
            sources.addLast(this.#name, document);
        }
    }

    /**
     * Logs a keep-last-good warning (SEC-12) and returns `null`. The existing
     * document/ETag stay applied and consistent; the next tick retries.
     *
     * @param cause - The failure cause, when one was thrown.
     */
    #keepLastGood(cause: unknown): null {
        const detail = cause instanceof Error ? `: ${cause.message}` : '';
        logger.warn(
            `[@ndigo/context] Remote config poll failed for source "${this.#name}" — keeping last-good values` + detail
        );
        return null;
    }

    /**
     * Resolves a boot-time fetch failure (no document applied yet) per the
     * `optional` contract.
     *
     * @param failure - Short failure classifier for the message (HTTP status,
     * `'<transport>'`, …).
     * @param cause - The underlying error, when one was thrown.
     * @throws {IllegalStateError} When `optional: false` on the first fetch.
     */
    #handleBootFailure(failure: string, cause?: unknown): null {
        const reason = cause instanceof Error ? ` (${cause.message})` : '';
        if (this.#options.optional) {
            // warn-level skip (boot proceeds)
            logger.warn(
                `[@ndigo/context] Remote config fetch failed at boot (${failure}) for source "${this.#name}" — ` +
                    `boot proceeds with env/files` +
                    reason
            );
            return null;
        }
        throw new IllegalStateError(
            `Remote config fetch failed (${failure}) for "${this.#options.url}" (source "${this.#name}"): ` +
                `optional:false — boot aborts.` +
                reason,
            cause instanceof Error ? { cause } : undefined
        );
    }

    #scheduler(): RemoteSourceScheduler {
        return (
            this.#options.scheduler ?? {
                setInterval: (callback, ms) => globalThis.setInterval(callback, ms),
                clearInterval: (handle) => globalThis.clearInterval(handle as never),
            }
        );
    }
}
