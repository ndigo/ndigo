/**
 * `HnService` against an msw-stubbed HN API: hydration order, bounded comment
 * trees, incremental windows, error/retry, and the offline→queued-replay story.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import type { HnItem } from '../src/hn-types';
import { createHnApiClient } from '../src/api/hn-api';
import { COMMENT_MAX_DEPTH, HnService, RENDER_CHUNK, type HnCommentNode } from '../src/services/hn-service';
import { HN_TEST_BASE, commentItem, createHnServer, storyItem } from './support/hn-fixtures';

/** Forces the browser connectivity flag both the client and service read. */
function setOnline(value: boolean): void {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => value });
}

/** Deepest depth present in a comment tree. */
function maxDepth(nodes: readonly HnCommentNode[]): number {
    return nodes.reduce((deepest, node) => Math.max(deepest, node.depth, maxDepth(node.children)), 0);
}

/** 25-story ids for the incremental-window case. */
const LONG_IDS = Array.from({ length: 25 }, (_, index) => 1000 + index);

const items: Record<number, HnItem | null> = {
    1: storyItem(1, { kids: [101], descendants: 4 }),
    2: storyItem(2),
    3: storyItem(3),
    4: storyItem(4),
    101: commentItem(101, 1, [102]),
    102: commentItem(102, 101, [103]),
    103: commentItem(103, 102, [104]),
    104: commentItem(104, 103),
};
for (const id of LONG_IDS) {
    items[id] = storyItem(id);
}

const server = createHnServer({ feeds: { top: [1, 2, 3, 4], best: LONG_IDS }, items });

beforeAll(() => server.server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
    localStorage.clear();
    server.requests.length = 0;
    server.itemRequests.length = 0;
});
afterEach(() => setOnline(true));
afterAll(() => server.server.close());

describe('HnService feeds', () => {
    test('hydrates a feed in id order', async () => {
        const service = new HnService(createHnApiClient({ base: HN_TEST_BASE }));
        await service.ensureFeed('top');

        const state = service.feed.value;
        expect(state.status).toBe('ready');
        expect(state.ids).toEqual([1, 2, 3, 4]);
        expect(state.items.map((item) => item?.id)).toEqual([1, 2, 3, 4]);
        expect(server.itemRequests).toEqual([1, 2, 3, 4]);
    });

    test('renders long lists incrementally and hydrates the revealed window', async () => {
        const service = new HnService(createHnApiClient({ base: HN_TEST_BASE }));
        await service.ensureFeed('best');

        expect(service.feed.value.visible).toBe(RENDER_CHUNK);
        expect(server.itemRequests).toHaveLength(RENDER_CHUNK);
        expect(server.itemRequests).toEqual(LONG_IDS.slice(0, RENDER_CHUNK));

        service.growVisible();
        expect(service.feed.value.visible).toBe(25);
        await vi.waitFor(() => expect(server.itemRequests).toHaveLength(25));
        expect(new Set(server.itemRequests)).toEqual(new Set(LONG_IDS));
    });

    test('surfaces an error (not a hang) when offline with no cached feed', async () => {
        setOnline(false);
        const service = new HnService(createHnApiClient({ base: HN_TEST_BASE }));
        await service.ensureFeed('top');
        expect(service.feed.value.status).toBe('error');
        expect(service.feed.value.error).toMatch(/offline/);
    });

    test('recovers from a failed feed load through retry', async () => {
        server.setFeedFailure('top', true);
        try {
            const service = new HnService(createHnApiClient({ base: HN_TEST_BASE }));
            await service.ensureFeed('top');
            expect(service.feed.value.status).toBe('error');
            expect(service.feed.value.error).toBeTruthy();

            server.setFeedFailure('top', false);
            await service.retryFeed('top');
            expect(service.feed.value.status).toBe('ready');
            expect(service.feed.value.items.map((item) => item?.id)).toEqual([1, 2, 3, 4]);
        } finally {
            server.setFeedFailure('top', false);
        }
    });
});

describe('HnService item threads', () => {
    test('bounds the comment tree to the configured depth', async () => {
        const service = new HnService(createHnApiClient({ base: HN_TEST_BASE }));
        await service.ensureItem(1);

        const state = service.item.value;
        expect(state.status).toBe('ready');
        expect(state.comments).toHaveLength(1);
        expect(maxDepth(state.comments)).toBe(COMMENT_MAX_DEPTH);
        expect(server.itemRequests).not.toContain(104);
    });

    test('renders an offline item when only the item itself is cached (children fail fast)', async () => {
        // Seed only item 1's snapshot — its comment children are not cached.
        const seedApi = createHnApiClient({ base: HN_TEST_BASE });
        await seedApi.getItem(1);

        setOnline(false);
        const service = new HnService(createHnApiClient({ base: HN_TEST_BASE, retryInterval: 20 }));
        await service.ensureItem(1);

        expect(service.item.value.status).toBe('ready');
        expect(service.item.value.source).toBe('stale');
        expect(service.item.value.commentsStatus).toBe('ready');
        expect(service.item.value.comments).toEqual([]);

        // The queued item revalidation drains on reconnect.
        setOnline(true);
        await vi.waitFor(() => expect(service.item.value.source).toBe('network'), { timeout: 3000, interval: 25 });
    });

    test('serves a deep link from the persisted snapshot offline, then replays on reconnect', async () => {
        // Phase 1 — online: seed the list + every item snapshot the feed hydrates.
        const seedingApi = createHnApiClient({ base: HN_TEST_BASE, retryInterval: 20 });
        await new HnService(seedingApi).ensureFeed('top');
        const requestsBeforeReplay = server.requests.length;

        // Phase 2 — offline: a fresh client answers the deep link from the snapshot.
        setOnline(false);
        const offline = new HnService(createHnApiClient({ base: HN_TEST_BASE, retryInterval: 20 }));
        await offline.ensureFeed('top');

        expect(offline.feed.value.source).toBe('stale');
        expect(offline.feed.value.staleAt).toBeTypeOf('number');
        expect(offline.connection.value.online).toBe(false);
        expect(offline.connection.value.servedStale).toBeGreaterThan(0);

        // Phase 3 — reconnect: the queued revalidation replays and goes live.
        setOnline(true);
        await vi.waitFor(() => expect(offline.feed.value.source).toBe('network'), { timeout: 3000, interval: 25 });
        expect(offline.feed.value.staleAt).toBeNull();
        expect(server.requests.length).toBeGreaterThan(requestsBeforeReplay);
    });
});
