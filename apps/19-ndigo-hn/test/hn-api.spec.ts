/**
 * `HNAPIClient` against an msw-stubbed HN API: the two-layer cache story
 * (fresh cache TTL, snapshot fallback) and error surfacing.
 *
 * @module ndigo-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { delay } from '@ndigo/util';
import { HNAPIError, SnapshotStore, SNAPSHOT_STORAGE_KEY, createHnApiClient, resolveApiBase } from '../src/api/hn-api';
import { HN_TEST_BASE, createHnServer, storyItem } from './support/hn-fixtures';

const server = createHnServer({
    feeds: { top: [1, 2, 3], new: [4] },
    items: { 1: storyItem(1), 2: storyItem(2), 3: storyItem(3), 4: storyItem(4) },
});

/** Forces the browser connectivity flag the client reads. */
function setOnline(value: boolean): void {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => value });
}

beforeAll(() => server.server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
    localStorage.clear();
    server.requests.length = 0;
    server.itemRequests.length = 0;
});
afterEach(() => setOnline(true));
afterAll(() => server.server.close());

describe('HNAPIClient', () => {
    test('lists feed ids and reads a single item from the network', async () => {
        const api = createHnApiClient({ base: HN_TEST_BASE });

        const list = await api.listStoryIds('top');
        expect(list.source).toBe('network');
        expect(list.data).toEqual([1, 2, 3]);

        const item = await api.getItem(1);
        expect(item.source).toBe('network');
        expect(item.data?.title).toBe('Story 1');
    });

    test('serves a repeat request from the HTTP cache until its TTL expires', async () => {
        const api = createHnApiClient({ base: HN_TEST_BASE, cacheTtl: 60 });

        expect((await api.listStoryIds('top')).source).toBe('network');
        expect((await api.listStoryIds('top')).source).toBe('cache');
        expect(server.requests.filter((entry) => entry === 'topstories.json')).toHaveLength(1);

        await delay(90);
        expect((await api.listStoryIds('top')).source).toBe('network');
        expect(server.requests.filter((entry) => entry === 'topstories.json')).toHaveLength(2);
    });

    test('falls back to a stale snapshot while offline without touching the network', async () => {
        const api = createHnApiClient({ base: HN_TEST_BASE });
        await api.listStoryIds('top');

        setOnline(false);
        const stale = await api.listStoryIds('top');

        expect(stale.source).toBe('stale');
        expect(stale.data).toEqual([1, 2, 3]);
        expect(typeof stale.storedAt).toBe('number');
        expect(server.requests.filter((entry) => entry === 'topstories.json')).toHaveLength(1);
    });

    test('persists snapshots so a reload can answer from cache', async () => {
        const api = createHnApiClient({ base: HN_TEST_BASE });
        await api.listStoryIds('top');

        expect(localStorage.getItem(SNAPSHOT_STORAGE_KEY)).not.toBeNull();
        const reloaded = new SnapshotStore(globalThis.localStorage);
        expect(reloaded.peek(`${HN_TEST_BASE}topstories.json`)?.data).toEqual([1, 2, 3]);
    });

    test('throws an HNAPIError when the API fails and no snapshot exists', async () => {
        const api = createHnApiClient({ base: HN_TEST_BASE, snapshots: new SnapshotStore(null) });
        server.setFeedFailure('new', true);
        try {
            await expect(api.listStoryIds('new')).rejects.toBeInstanceOf(HNAPIError);
            await expect(api.listStoryIds('new')).rejects.toMatchObject({ status: 500 });
        } finally {
            server.setFeedFailure('new', false);
        }
    });

    test('fails fast when offline with no cached snapshot', async () => {
        const api = createHnApiClient({ base: HN_TEST_BASE, snapshots: new SnapshotStore(null) });
        setOnline(false);
        await expect(api.listStoryIds('top')).rejects.toMatchObject({ status: 0 });
        await expect(api.listStoryIds('top')).rejects.toThrow(/offline/);
        expect(server.requests.filter((entry) => entry === 'topstories.json')).toHaveLength(0);
    });

    test('resolves an absolute base with a trailing slash from configuration', () => {
        expect(resolveApiBase().endsWith('/')).toBe(true);
    });
});
