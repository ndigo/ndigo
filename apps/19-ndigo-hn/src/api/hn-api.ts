/**
 * The `HNAPI` port and its HTTP-backed implementation.
 *
 * The client owns the two-layer cache story the app demonstrates:
 *
 *  1. **Fresh cache** — `@ndigo/http`'s `CacheInterceptor` (inside the
 *     {@link HNHTTP} chain) answers a repeat request within its TTL. The
 *     wrapper's network counter reveals whether the wire was touched, so a
 *     result carries `source: 'cache'` instead of `source: 'network'`.
 *  2. **Snapshot cache** — every successful payload is also written to a
 *     {@link SnapshotStore} (localStorage-backed). When the browser is offline
 *     (or a request fails), the last snapshot is served as `source: 'stale'`
 *     with its stored timestamp, which is what the connection banner reports.
 *
 * A caller that wants the offline-replay path can pass `allowStale: false`: the
 * offline short-circuit is skipped and the request flows into
 * `RetryOnOfflineInterceptor`, which queues it and replays it on reconnect.
 *
 * @module ndigo-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Fetch, HTTP } from '@ndigo/http';
import { DEFAULT_HN_API_BASE, FEED_ENDPOINTS, type HnFeedKey, type HnItem } from '../hn-types';
import { createHnHttp } from './hn-http';

/** Where a payload came from. */
export type HnSource = 'network' | 'cache' | 'stale';

/** A payload plus its provenance. */
export interface HnResult<T> {
    readonly data: T;
    readonly source: HnSource;
    /** Epoch-ms the snapshot was stored; set only for `source: 'stale'`. */
    readonly storedAt: number | null;
}

/** Per-call options. */
export interface HnRequestOptions {
    /**
     * Whether an offline read may be answered from the snapshot cache.
     * Defaults to `true`.
     */
    allowStale?: boolean;
    /**
     * What an offline read with no cached snapshot does. `'fail'` (default)
     * throws immediately — the caller shows an error/retry instead of holding
     * the page open. `'queue'` routes the request through the
     * {@link RetryOnOfflineInterceptor} queue, so it replays on reconnect; use
     * it for a background revalidation, never for a route's first paint.
     */
    whenOffline?: 'queue' | 'fail';
}

/** The data port the service depends on. */
export interface HNAPI {
    /** The ordered story ids of a feed. */
    listStoryIds(feed: HnFeedKey, options?: HnRequestOptions): Promise<HnResult<number[]>>;
    /** One item by id; `null` when the API has no such item. */
    getItem(id: number, options?: HnRequestOptions): Promise<HnResult<HnItem | null>>;
}

/** A failed HN request (`status` is `0` for transport failures). */
export class HNAPIError extends Error {
    readonly status: number;
    readonly url: string;

    /**
     * Creates the error.
     *
     * @param status - HTTP status, or `0` when the request never got a response.
     * @param url - The requested URL.
     * @param options - Optional message override and underlying cause.
     */
    constructor(status: number, url: string, options: { cause?: unknown; message?: string } = {}) {
        super(
            options.message ?? `HN request failed (${status}) for ${url}`,
            options.cause === undefined ? undefined : { cause: options.cause }
        );
        this.name = 'HNAPIError';
        this.status = status;
        this.url = url;
    }
}

/** A stored snapshot of a successful payload. */
export interface HnSnapshot {
    readonly data: unknown;
    readonly storedAt: number;
}

/** localStorage key for the persisted snapshot map (versioned for a clean cut). */
export const SNAPSHOT_STORAGE_KEY = 'ndigo-hn:snapshots:v1';

/** Upper bound on persisted snapshots (oldest entry evicted first). */
export const SNAPSHOT_MAX_ENTRIES = 300;

/** The browser-local storage, or `null` when unavailable/denied. */
function defaultStorage(): Storage | null {
    try {
        return globalThis.localStorage ?? null;
    } catch {
        return null;
    }
}

/**
 * An in-memory snapshot map mirrored to localStorage.
 *
 * The mirror is what makes a deep link work after a reload with no network: the
 * list/item payload written before the reload is still there, so the route
 * renders from cache first and revalidates in the background.
 */
export class SnapshotStore {
    readonly #entries = new Map<string, HnSnapshot>();
    readonly #storage: Storage | null;

    /**
     * Creates the store and hydrates it from storage.
     *
     * @param storage - Storage to mirror to; defaults to `localStorage`.
     */
    constructor(storage: Storage | null = defaultStorage()) {
        this.#storage = storage;
        this.#hydrate();
    }

    /** Number of entries currently held. */
    get size(): number {
        return this.#entries.size;
    }

    /**
     * Reads the snapshot for a URL.
     *
     * @param url - The absolute request URL.
     * @returns The snapshot, or `undefined` when none is stored.
     */
    peek(url: string): HnSnapshot | undefined {
        return this.#entries.get(url);
    }

    /**
     * Stores a payload for a URL, stamping it with the current time.
     *
     * @param url - The absolute request URL.
     * @param data - The successful payload.
     */
    put(url: string, data: unknown): void {
        this.#entries.set(url, { data, storedAt: Date.now() });
        this.#trim();
        this.#persist();
    }

    /** Evicts the oldest entries beyond the cap (insertion order). */
    #trim(): void {
        while (this.#entries.size > SNAPSHOT_MAX_ENTRIES) {
            const oldest = this.#entries.keys().next().value;
            if (oldest === undefined) {
                return;
            }
            this.#entries.delete(oldest);
        }
    }

    /** Loads the persisted map, tolerating absent/corrupt storage. */
    #hydrate(): void {
        const storage = this.#storage;
        if (!storage) {
            return;
        }
        try {
            const raw = storage.getItem(SNAPSHOT_STORAGE_KEY);
            if (!raw) {
                return;
            }
            const parsed = JSON.parse(raw) as Record<string, HnSnapshot>;
            for (const [url, snapshot] of Object.entries(parsed)) {
                if (snapshot && typeof snapshot.storedAt === 'number') {
                    this.#entries.set(url, snapshot);
                }
            }
        } catch {
            // A corrupt or unreadable cache must never break boot.
        }
    }

    /** Mirrors the map to storage, tolerating quota/security failures. */
    #persist(): void {
        const storage = this.#storage;
        if (!storage) {
            return;
        }
        try {
            storage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(Object.fromEntries(this.#entries)));
        } catch {
            // Quota exceeded / disabled storage: the in-memory map still serves.
        }
    }
}

/** Dependencies of {@link HNAPIClient}. */
export interface HNAPIClientDependencies {
    readonly http: HTTP;
    readonly base: string;
    readonly networkCalls: () => number;
    readonly snapshots?: SnapshotStore;
    readonly online?: () => boolean;
}

/**
 * The HTTP-backed `HNAPI`: runs each request through the interceptor chain and
 * layers the snapshot cache over the result.
 */
export class HNAPIClient implements HNAPI {
    readonly #http: HTTP;
    readonly #base: string;
    readonly #networkCalls: () => number;
    readonly #snapshots: SnapshotStore;
    readonly #online: () => boolean;

    /**
     * Creates the client.
     *
     * @param dependencies - The wired client, its base, and the caches.
     */
    constructor(dependencies: HNAPIClientDependencies) {
        this.#http = dependencies.http;
        this.#base = dependencies.base;
        this.#networkCalls = dependencies.networkCalls;
        this.#snapshots = dependencies.snapshots ?? new SnapshotStore();
        this.#online = dependencies.online ?? (() => typeof navigator === 'undefined' || navigator.onLine !== false);
    }

    /** @inheritdoc */
    async listStoryIds(feed: HnFeedKey, options: HnRequestOptions = {}): Promise<HnResult<number[]>> {
        return this.#fetch<number[]>(`${FEED_ENDPOINTS[feed]}.json`, options);
    }

    /** @inheritdoc */
    async getItem(id: number, options: HnRequestOptions = {}): Promise<HnResult<HnItem | null>> {
        return this.#fetch<HnItem | null>(`item/${id}.json`, options);
    }

    /**
     * Fetches a JSON resource through the client chain, falling back to the
     * snapshot cache.
     *
     * @param segment - The resource path relative to the base (`topstories.json`).
     * @param options - Snapshot/offline behavior for this call.
     * @returns The payload with its provenance.
     * @throws {HNAPIError} When the request fails and no snapshot can serve it.
     */
    async #fetch<T>(segment: string, options: HnRequestOptions): Promise<HnResult<T>> {
        const url = new URL(segment, this.#base).href;
        const allowStale = options.allowStale !== false;
        const online = this.#online();
        const snapshot = this.#snapshots.peek(url);

        if (allowStale && !online && snapshot) {
            return { data: snapshot.data as T, source: 'stale', storedAt: snapshot.storedAt };
        }

        // Offline and nothing cached: fail fast unless the caller explicitly
        // wants the offline queue (a background revalidation), otherwise the
        // request would hang the route until connectivity returns.
        if (!online && options.whenOffline !== 'queue') {
            throw new HNAPIError(0, url, {
                message: `offline: no cached copy of ${url}`,
                cause: new Error('browser is offline'),
            });
        }

        const before = this.#networkCalls();
        try {
            const response = await this.#http.get(url);
            if (!response.ok) {
                throw new HNAPIError(response.status, url);
            }
            const data = (await response.json()) as T;
            const source: HnSource = this.#networkCalls() === before ? 'cache' : 'network';
            if (source === 'network') {
                this.#snapshots.put(url, data);
            }
            return { data, source, storedAt: null };
        } catch (error) {
            if (allowStale && snapshot) {
                return { data: snapshot.data as T, source: 'stale', storedAt: snapshot.storedAt };
            }
            throw error instanceof HNAPIError ? error : new HNAPIError(0, url, { cause: error });
        }
    }
}

/** Options for {@link createHnApiClient}. */
export interface CreateHNAPIClientOptions {
    /** API base; defaults to `VITE_HN_API_BASE` then the public HN base. */
    base?: string;
    /** Snapshot storage; defaults to `localStorage`-backed. */
    snapshots?: SnapshotStore;
    /** Response-cache TTL (`CacheInterceptor`). */
    cacheTtl?: number;
    /** Offline retry cadence (`RetryOnOfflineInterceptor`). */
    retryInterval?: number;
    /** Custom Fetch (tests). */
    fetch?: Fetch;
    /** Connectivity probe (tests). */
    online?: () => boolean;
}

/**
 * Reads the Vite-injected `VITE_HN_API_BASE`, if present.
 *
 * The cast is the documented boundary: Vite defines `import.meta.env` at build
 * time, which TypeScript's `ImportMeta` does not declare.
 *
 * @returns The configured base, or `undefined`.
 */
function configuredApiBase(): string | undefined {
    const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
    const value = meta.env?.VITE_HN_API_BASE;
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

/**
 * Resolves the API base: `VITE_HN_API_BASE` when configured, else the public HN
 * API. The returned base always ends in `/` so resource segments resolve
 * beneath it.
 *
 * @returns An absolute base URL ending in `/`.
 */
export function resolveApiBase(): string {
    const base = configuredApiBase() ?? DEFAULT_HN_API_BASE;
    return base.endsWith('/') ? base : `${base}/`;
}

/**
 * Builds the app's HN API client from the (optionally overridden) base.
 *
 * @param options - Base/storage/TTL overrides.
 * @returns A configured {@link HNAPIClient}.
 */
export function createHnApiClient(options: CreateHNAPIClientOptions = {}): HNAPIClient {
    const provided = options.base ?? resolveApiBase();
    const base = provided.endsWith('/') ? provided : `${provided}/`;
    const { http, networkCalls } = createHnHttp({
        base,
        ...(options.cacheTtl === undefined ? {} : { cacheTtl: options.cacheTtl }),
        ...(options.retryInterval === undefined ? {} : { retryInterval: options.retryInterval }),
        ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
    });
    return new HNAPIClient({
        http,
        base,
        networkCalls,
        ...(options.snapshots === undefined ? {} : { snapshots: options.snapshots }),
        ...(options.online === undefined ? {} : { online: options.online }),
    });
}
