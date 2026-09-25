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
 * loudly naming the URL.
 *
 * Auth: static headers via `headers` (sourced from env at the wiring site —
 * e.g. `BLUE_CONFIG_SERVER_TOKEN` — never from `application.json`; the
 * token header is itself a secret). No token-provider callback seam in v1;
 * the `fetch` seam is the extension point.
 *
 * Runtime delivery (rung 5): a `vault://`-style URL + custom `fetch` seam is
 * the documented extension shape — no Vault-specific code ships here.
 *
 * The source is isomorphic: `fetch` is injected (Node ≥ 22 / browsers have
 * the standard), defaulting to `globalThis.fetch`; specs inject a stub.
 * When using the default fetch, the URL scheme must be `https:` (enforced
 * at load — config in transit is a secret-bearing channel).
 *
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError, JSONObject } from "@blue/core";
import { ConfigurableEnvironment } from "./environment";
import { MutablePropertySources } from "./property-sources";

/**
 * The default source name for the remote config source.
 */
export const CONFIG_SERVER_SOURCE_NAME = "configServer";

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
   * the scheme must be `https:`.
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
   * runtimes). Defaults to `globalThis.fetch`.
   */
  fetch?: typeof globalThis.fetch;
  /**
   * The poll scheduler seam. Defaults to `globalThis.setInterval`/`clearInterval`.
   */
  scheduler?: RemoteSourceScheduler;
}

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
  };
  #lastBody: string | null = null;
  #etag: string | null = null;
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
   */
  constructor(
    environment: ConfigurableEnvironment,
    options: RemoteSourceOptions,
  ) {
    if (!options.url || options.url.length === 0) {
      throw new IllegalStateError("RemotePropertySource requires a url");
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
      throw new IllegalStateError(
        `RemotePropertySource "${this.#name}" has no pollMs; nothing to poll`,
      );
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

  /** One poll cycle: fetch, gate on change, merge + refresh on change. */
  async #poll(): Promise<void> {
    const applied = await this.#fetchAndApply();
    void applied; // poll results are asynchronous; errors are handled inside
  }

  /**
   * Fetches and, when the document changed (ETag/body-text gate), merges it
   * into the environment and refreshes. The body gate is always active
   * (identical to the previous body → skip); `optional: false` throws only
   * when NO document has ever been applied (boot-time failure).
   *
   * @returns The applied document, or `null` when skipped/failed-optional.
   */
  async #fetchAndApply(): Promise<JSONObject | null> {
    const headers: Record<string, string> = { ...this.#options.headers };
    if (this.#etag && headers["If-None-Match"] === undefined) {
      headers["If-None-Match"] = this.#etag;
    }

    const doFetch = this.#options.fetch ?? globalThis.fetch;
    const response = await doFetch(this.#options.url, { headers });
    if (response.status === 304) {
      return null; // unchanged — no re-merge, no event
    }
    if (!response.ok) {
      // `optional: false` fails boot only on the FIRST (never-applied)
      // fetch; later poll failures keep last-good.
      return this.#lastBody === null
        ? this.#handleBootFailure(response.status)
        : null;
    }

    const body = await response.text();
    const etag = response.headers.get("etag");
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
      throw new IllegalStateError(
        `Remote config from "${this.#options.url}" is not valid JSON (source "${this.#name}")`,
      );
    }
    if (
      document === null ||
      typeof document !== "object" ||
      Array.isArray(document)
    ) {
      throw new IllegalStateError(
        `Remote config from "${this.#options.url}" must be a JSON object (source "${this.#name}")`,
      );
    }

    this.#lastBody = body;
    this.#apply(document as JSONObject);
    return document as JSONObject;
  }

  /**
   * Registers/replaces the source entry at the documented precedence slot.
   *
   * Positioning (highest → lowest): `commandLine > boot > systemEnvironment
   * > configServer > dotenv > application(+-profile) > defaults`. Anchors:
   * after `systemEnvironment` when present, else before `application` when
   * present, else append (a later `defaults` registration lands below).
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
    if (sources.contains("systemEnvironment")) {
      sources.addAfter("systemEnvironment", this.#name, document);
    } else if (sources.contains("application")) {
      sources.addBefore("application", this.#name, document);
    } else {
      sources.addLast(this.#name, document);
    }
  }

  /**
   * Resolves a boot-time fetch failure per the `optional` contract.
   *
   * @param status - The HTTP status code.
   * @throws {IllegalStateError} When `optional: false` on the first fetch.
   */
  #handleBootFailure(status: number): null {
    if (this.#options.optional) return null; // warn-level skip (boot proceeds)
    throw new IllegalStateError(
      `Remote config fetch failed (HTTP ${status}) for "${this.#options.url}" (source "${this.#name}"): ` +
        "optional:false — boot aborts.",
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
