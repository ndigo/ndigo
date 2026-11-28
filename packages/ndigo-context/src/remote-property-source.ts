/**
 * Remote config property source.
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
 * `config:refresh` → `@refreshScope` entries rebind (the full loop, D-8). No
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
 * Fetch hardening mirrors the OIDC adapter: `fetchTimeoutMs`
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
import type { ConfigurableEnvironment } from './environment.js';
import type { MutablePropertySources } from './property-sources.js';
import { RemoteSourceFetcher } from './_remote-source-fetcher.js';
import { CONFIG_SERVER_SOURCE_NAME } from './remote-property-source-types.js';
import type { RemoteSourceOptions, RemoteSourceScheduler } from './remote-property-source-types.js';

export * from './remote-property-source-types.js';

/**
 * A named remote property source: fetches a JSON document, merges changes
 * into the environment, and (optionally) polls with ETag/body-text gating.
 *
 * @example
 * ```ts
 * const source = new RemotePropertySource(env, { url: 'https://config.example.com/app.json' });
 * await source.load();
 * ```
 */
export class RemotePropertySource {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "RemotePropertySource".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object RemotePropertySource]"
     */
    get [Symbol.toStringTag](): string {
        return 'RemotePropertySource';
    }

    #environment: ConfigurableEnvironment;
    #name: string;
    #options: RemoteSourceOptions & { optional: boolean };
    #fetcher: RemoteSourceFetcher;
    #timerHandle: unknown = null;
    #started: boolean = false;

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
     * @throws When the URL is missing, or — with the
     * default fetch (no injected seam) — when the URL scheme is not `https:`.
     */
    constructor(environment: ConfigurableEnvironment, options: RemoteSourceOptions) {
        if (!options.url || options.url.length === 0) {
            throw new IllegalStateError('RemotePropertySource requires a url');
        }
        if (!options.fetch) {
            // Config in transit is a secret-bearing channel; never
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
        this.#fetcher = new RemoteSourceFetcher({
            ...this.#options,
            name: this.#name,
            apply: (document) => this.#apply(document),
        });
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
     * @throws When `optional: false` and the fetch fails,
     * or the response is not a JSON object.
     */
    async load(): Promise<boolean> {
        return this.#fetcher.fetchAndApply();
    }

    /**
     * Starts polling. Idempotent — a second call is a no-op on an already
     * started source.
     *
     * @throws When `pollMs` is 0 (nothing to poll).
     */
    start(): void {
        if (this.#started) return;
        const pollMs = this.#options.pollMs ?? 0;
        if (pollMs <= 0) {
            throw new IllegalStateError(`RemotePropertySource "${this.#name}" has no pollMs; nothing to poll`);
        }
        const { setInterval } = this.#scheduler();
        this.#timerHandle = setInterval(() => void this.#fetcher.poll(), pollMs);
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
     * Merges an applied document into the environment at the anchored
     * precedence slot, then refreshes so `@refreshScope` entries rebind.
     * A re-applied document `replace`s the source's own entry, preserving
     * its position (and bumping the registry version).
     *
     * @param document - The fetched configuration document.
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

    /**
     * Registers the source at the documented precedence slot: after
     * `systemEnvironment` when present, else before `application` when
     * present, else before `defaults` when present (boot always registers
     * `defaults` last, so this preserves the documented order), else append.
     *
     * @param sources - The environment's mutable source registry.
     * @param document - The fetched configuration document.
     */
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
     * Resolves the poll scheduler seam, defaulting to the global timer
     * functions.
     *
     * @returns The configured or default scheduler.
     */
    #scheduler(): RemoteSourceScheduler {
        return (
            this.#options.scheduler ?? {
                setInterval: (callback, ms) => globalThis.setInterval(callback, ms),
                clearInterval: (handle) => globalThis.clearInterval(handle as never),
            }
        );
    }
}
