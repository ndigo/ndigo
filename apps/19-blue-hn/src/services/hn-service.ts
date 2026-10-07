/**
 * The HN reader's state service: the only thing that talks to the API.
 *
 * Route controllers call `ensureFeed`/`ensureItem` (keyed loads that no-op when
 * the requested resource is already resident) and project the signals into a
 * view model; the views subscribe to those signals and re-render themselves.
 *
 * Design points the demo exists to show:
 *
 *  - **Bounded hydration** — a feed's id list arrives first, then the items are
 *    hydrated through {@link mapConcurrent} with a fixed in-flight limit, so a
 *    500-id list never opens 500 sockets. Items fill their slot by index, so
 *    the list stays ordered while requests complete out of order.
 *  - **Incremental rendering** — `visible` is the render window; the view grows
 *    it (`growVisible`) from an IntersectionObserver sentinel (or a button in
 *    environments without one), and hydration follows the window.
 *  - **Bounded comment trees** — a story's `kids` are walked to
 *    {@link COMMENT_MAX_DEPTH} levels under a total node budget.
 *  - **Cache provenance** — every loaded resource records whether it came from
 *    the wire, the HTTP cache, or a stale snapshot; a stale serve flips the
 *    connection banner and, in the background, replays the request through the
 *    offline queue.
 *
 * @module blue-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import { trace } from '@opentelemetry/api';
import { signal, type Signal } from '@blue/signals';
import { getErrorMessage } from '@blue/util';
import { type HnFeedKey, type HnItem } from '../hn-types';
import { mapConcurrent } from '../api/concurrency';
import type { HNAPI, HnSource } from '../api/hn-api';

/** Maximum concurrent item requests during hydration. */
export const HYDRATION_CONCURRENCY = 6;

/** How many more rows each incremental-render step reveals. */
export const RENDER_CHUNK = 20;

/** Maximum comment-tree depth rendered (the root story is depth 0). */
export const COMMENT_MAX_DEPTH = 3;

/** Maximum concurrent comment requests per tree level. */
export const COMMENT_CONCURRENCY = 6;

/** Total comment nodes fetched for one story before the tree stops. */
export const COMMENT_MAX_NODES = 160;

const tracer = trace.getTracer('blue-hn');

/** Load lifecycle of a feed's id list (item hydration is per-slot). */
export type HnLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

/** The resolved feed state the list view renders. */
export interface HnFeedState {
    readonly key: HnFeedKey;
    readonly ids: readonly number[];
    /** Hydrated items by id-list index; `undefined` = pending, `null` = failed. */
    readonly items: ReadonlyArray<HnItem | null | undefined>;
    readonly status: HnLoadStatus;
    readonly error: string | null;
    readonly source: HnSource | null;
    /** Epoch-ms of the snapshot served as `stale`; `null` when fresh. */
    readonly staleAt: number | null;
    /** Render window: how many list positions are currently materialized. */
    readonly visible: number;
}

/** One node of the bounded comment tree. */
export interface HnCommentNode {
    readonly item: HnItem;
    readonly depth: number;
    readonly children: readonly HnCommentNode[];
}

/** The resolved item/thread state the item view renders. */
export interface HnItemState {
    readonly id: number;
    readonly item: HnItem | null;
    readonly status: HnLoadStatus | 'missing';
    readonly error: string | null;
    readonly source: HnSource | null;
    readonly staleAt: number | null;
    readonly comments: readonly HnCommentNode[];
    readonly commentsStatus: HnLoadStatus;
    readonly commentsError: string | null;
}

/** The connectivity/provenance story the banner renders. */
export interface HnConnectionState {
    readonly online: boolean;
    /** How many loads were served from a stale snapshot this session. */
    readonly servedStale: number;
    readonly lastStaleAt: number | null;
}

/** The empty feed state (nothing loaded yet). */
export const EMPTY_FEED: HnFeedState = {
    key: 'top',
    ids: [],
    items: [],
    status: 'idle',
    error: null,
    source: null,
    staleAt: null,
    visible: RENDER_CHUNK,
};

/** The empty item state (no item selected). */
export const EMPTY_ITEM: HnItemState = {
    id: 0,
    item: null,
    status: 'idle',
    error: null,
    source: null,
    staleAt: null,
    comments: [],
    commentsStatus: 'idle',
    commentsError: null,
};

/** Whether the browser reports connectivity (absent `onLine` counts as online). */
const browserOnline = (): boolean => typeof navigator === 'undefined' || navigator.onLine !== false;

/** Whether two id lists are identical (avoids discarding hydrated items). */
const sameIds = (left: readonly number[], right: readonly number[]): boolean =>
    left.length === right.length && left.every((id, index) => id === right[index]);

/**
 * The reader's state service.
 */
export class HnService {
    /** The active feed's state. */
    readonly feed: Signal<HnFeedState> = signal(EMPTY_FEED);
    /** The active item's state. */
    readonly item: Signal<HnItemState> = signal(EMPTY_ITEM);
    /** Connectivity + stale-serve counters. */
    readonly connection: Signal<HnConnectionState> = signal({
        online: browserOnline(),
        servedStale: 0,
        lastStaleAt: null,
    });

    readonly #api: HNAPI;
    #feedRequest: Promise<void> | null = null;
    #itemRequest: Promise<void> | null = null;
    #commentBudget = COMMENT_MAX_NODES;

    /**
     * Creates the service.
     *
     * @param api - The data port (HTTP-backed in the running app).
     */
    constructor(api: HNAPI) {
        this.#api = api;
        if (typeof globalThis.addEventListener === 'function') {
            const sync = (): void => {
                this.connection.value = { ...this.connection.value, online: browserOnline() };
            };
            globalThis.addEventListener('online', sync);
            globalThis.addEventListener('offline', sync);
        }
    }

    /**
     * Loads a feed unless its ids are already resident.
     *
     * @param key - The feed to show.
     * @returns A promise that settles once the first render window is hydrated.
     */
    async ensureFeed(key: HnFeedKey): Promise<void> {
        const state = this.feed.value;
        if (state.key === key && (state.status === 'ready' || state.status === 'loading')) {
            return this.#feedRequest ?? Promise.resolve();
        }
        return this.retryFeed(key);
    }

    /**
     * Forces a (re)load of a feed — the retry button's entry point.
     *
     * @param key - The feed to load; defaults to the current one.
     * @returns A promise that settles once the first render window is hydrated.
     */
    retryFeed(key: HnFeedKey = this.feed.value.key): Promise<void> {
        const request = this.#loadFeed(key);
        this.#feedRequest = request;
        return request;
    }

    /**
     * Widen the render window and hydrate the newly revealed slots.
     *
     * @param count - How many positions to add; defaults to {@link RENDER_CHUNK}.
     */
    growVisible(count = RENDER_CHUNK): void {
        const state = this.feed.value;
        if (state.status !== 'ready') {
            return;
        }
        const visible = Math.min(state.ids.length, state.visible + Math.max(1, count));
        if (visible === state.visible) {
            return;
        }
        this.feed.value = { ...state, visible };
        void this.#hydrate(state.key, this.#pendingIndexes());
    }

    /**
     * Loads an item unless the requested one is already resident.
     *
     * @param id - The item id from the route.
     * @returns A promise that settles once the item (and its comments) load.
     */
    async ensureItem(id: number): Promise<void> {
        const state = this.item.value;
        if (state.id === id && state.status !== 'idle' && state.status !== 'error') {
            return this.#itemRequest ?? Promise.resolve();
        }
        return this.retryItem(id);
    }

    /**
     * Forces a (re)load of an item — the retry button's entry point.
     *
     * @param id - The item to load; defaults to the current one.
     * @returns A promise that settles once the item (and its comments) load.
     */
    retryItem(id: number = this.item.value.id): Promise<void> {
        const request = this.#loadItem(id);
        this.#itemRequest = request;
        return request;
    }

    /** Indexes inside the render window whose items are not yet hydrated. */
    #pendingIndexes(): number[] {
        const state = this.feed.value;
        const limit = Math.min(state.visible, state.ids.length);
        const pending: number[] = [];
        for (let index = 0; index < limit; index += 1) {
            if (state.items[index] === undefined) {
                pending.push(index);
            }
        }
        return pending;
    }

    /** Runs the feed load: id list, then the first hydration window. */
    async #loadFeed(key: HnFeedKey): Promise<void> {
        this.feed.value = { ...EMPTY_FEED, key, status: 'loading' };
        const span = tracer.startSpan('hn.feed.load');
        span.setAttribute('hn.feed', key);
        try {
            const list = await this.#api.listStoryIds(key);
            if (this.feed.value.key !== key) {
                return;
            }
            this.feed.value = {
                ...this.feed.value,
                ids: list.data,
                status: 'ready',
                source: list.source,
                staleAt: list.storedAt,
            };
            this.#noteSource(list.source, list.storedAt);
            await this.#hydrate(key, this.#pendingIndexes());
            if (list.source === 'stale' || list.source === 'cache') {
                this.#revalidateFeed(key);
            }
        } catch (error) {
            this.feed.value = { ...this.feed.value, status: 'error', error: getErrorMessage(error) };
        } finally {
            span.end();
        }
    }

    /** Hydrates the given slots with bounded concurrency, patching by index. */
    async #hydrate(key: HnFeedKey, indexes: readonly number[]): Promise<void> {
        await mapConcurrent(indexes, HYDRATION_CONCURRENCY, async (index) => {
            const state = this.feed.value;
            if (state.key !== key) {
                return;
            }
            const id = state.ids[index];
            if (id === undefined) {
                return;
            }
            let item: HnItem | null = null;
            try {
                item = (await this.#api.getItem(id)).data;
            } catch {
                // A single failed item degrades to its own row, not the list.
                item = null;
            }
            const current = this.feed.value;
            if (current.key !== key) {
                return;
            }
            const items = current.items.slice();
            items[index] = item;
            this.feed.value = { ...current, items };
        });
    }

    /** Runs the item load: the item, then its bounded comment tree. */
    async #loadItem(id: number): Promise<void> {
        this.item.value = { ...EMPTY_ITEM, id, status: 'loading' };
        const span = tracer.startSpan('hn.item.load');
        span.setAttribute('hn.item.id', id);
        try {
            const result = await this.#api.getItem(id);
            if (this.item.value.id !== id) {
                return;
            }
            const item = result.data;
            this.item.value = {
                ...this.item.value,
                item,
                status: item ? 'ready' : 'missing',
                source: result.source,
                staleAt: result.storedAt,
            };
            this.#noteSource(result.source, result.storedAt);
            if (item?.kids?.length) {
                await this.#loadComments(id, item.kids);
            }
            if (result.source === 'stale' || result.source === 'cache') {
                this.#revalidateItem(id);
            }
        } catch (error) {
            this.item.value = { ...this.item.value, status: 'error', error: getErrorMessage(error) };
        } finally {
            span.end();
        }
    }

    /** Loads the bounded comment tree for a story. */
    async #loadComments(itemId: number, kids: readonly number[]): Promise<void> {
        this.item.value = { ...this.item.value, commentsStatus: 'loading', commentsError: null };
        this.#commentBudget = COMMENT_MAX_NODES;
        try {
            const comments = await this.#fetchComments(kids, 1);
            if (this.item.value.id !== itemId) {
                return;
            }
            this.item.value = { ...this.item.value, comments, commentsStatus: 'ready' };
        } catch (error) {
            if (this.item.value.id !== itemId) {
                return;
            }
            this.item.value = { ...this.item.value, commentsStatus: 'error', commentsError: getErrorMessage(error) };
        }
    }

    /**
     * Fetches one comment level and recurses to the depth/budget limits.
     *
     * @param ids - The child ids at this level.
     * @param depth - The depth of items fetched here (1..{@link COMMENT_MAX_DEPTH}).
     * @returns The nodes at this level, in id order.
     */
    async #fetchComments(ids: readonly number[], depth: number): Promise<HnCommentNode[]> {
        const items = await mapConcurrent(ids, COMMENT_CONCURRENCY, async (id) => {
            try {
                return (await this.#api.getItem(id)).data;
            } catch {
                return null;
            }
        });
        const nodes: HnCommentNode[] = [];
        for (const item of items) {
            if (this.#commentBudget <= 0) {
                break;
            }
            if (!item || item.deleted) {
                continue;
            }
            this.#commentBudget -= 1;
            let children: HnCommentNode[] = [];
            if (depth < COMMENT_MAX_DEPTH && item.kids?.length) {
                // eslint-disable-next-line no-await-in-loop -- the comment-tree walk is depth-ordered and budget-metered; sibling fetches would race the shared budget.
                children = await this.#fetchComments(item.kids, depth + 1);
            }
            nodes.push({ item, depth, children });
        }
        return nodes;
    }

    /** Records a stale serve and refreshes the connectivity signal. */
    #noteSource(source: HnSource, storedAt: number | null): void {
        if (source !== 'stale') {
            return;
        }
        this.connection.value = {
            online: browserOnline(),
            servedStale: this.connection.value.servedStale + 1,
            lastStaleAt: storedAt ?? Date.now(),
        };
    }

    /** Replays a stale/stored feed load through the offline queue, then updates. */
    #revalidateFeed(key: HnFeedKey): void {
        void this.#api.listStoryIds(key, { allowStale: false, whenOffline: 'queue' }).then(
            (fresh) => {
                const state = this.feed.value;
                if (state.key !== key) {
                    return;
                }
                const items = sameIds(state.ids, fresh.data) ? state.items : [];
                this.feed.value = { ...state, ids: fresh.data, items, source: fresh.source, staleAt: null };
                void this.#hydrate(key, this.#pendingIndexes());
            },
            () => {
                // Replay failure keeps the stale view; the next navigation retries.
            }
        );
    }

    /** Replays a stale/stored item load through the offline queue, then updates. */
    #revalidateItem(id: number): void {
        void this.#api.getItem(id, { allowStale: false, whenOffline: 'queue' }).then(
            (fresh) => {
                const state = this.item.value;
                if (state.id !== id) {
                    return;
                }
                const item = fresh.data;
                // Refresh the item header only: the comment tree is already
                // loaded, and re-entering `#loadComments` here would flip the
                // view back to "loading" after the route has committed.
                this.item.value = {
                    ...state,
                    item,
                    status: item ? 'ready' : 'missing',
                    source: fresh.source,
                    staleAt: null,
                };
            },
            () => {
                // Replay failure keeps the stale view.
            }
        );
    }
}
