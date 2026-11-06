/**
 * Shared fixtures and an msw-backed HN API stub for the app's specs.
 *
 * Every spec stubs the official HN endpoints (`/v0/<feed>.json` and
 * `/v0/item/<id>.json`) with the recorded `requests`/`itemRequests` arrays, so
 * tests assert request order and coverage without touching the network.
 */
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { FEED_ENDPOINTS, FEED_KEYS, type HnFeedKey, type HnItem } from '../../src/hn-types';

/** The API base the specs point the client at. */
export const HN_TEST_BASE = 'https://hn.test/v0/';

/** Builds a story item with sane defaults. */
export function storyItem(id: number, overrides: Partial<HnItem> = {}): HnItem {
    return {
        id,
        type: 'story',
        by: `user${id}`,
        time: 1_700_000_000 + id,
        title: `Story ${id}`,
        url: `https://example.com/${id}`,
        score: id * 10,
        descendants: 0,
        ...overrides,
    };
}

/** Builds a comment item with the given parent and child ids. */
export function commentItem(id: number, parent: number, kids: readonly number[] = []): HnItem {
    return {
        id,
        type: 'comment',
        by: `commenter${id}`,
        time: 1_700_100_000 + id,
        text: `Comment ${id}`,
        parent,
        kids,
    };
}

/** The API stub configuration. */
export interface HnServerConfig {
    /** Story ids per feed; absent feeds answer `[]`. */
    feeds?: Partial<Record<HnFeedKey, number[]>>;
    /** Items by id; absent ids answer `null` (HN's deleted/missing shape). */
    items?: Record<number, HnItem | null>;
    /** Feeds whose id list answers `500`. */
    failingFeeds?: HnFeedKey[];
    /** Item ids that answer `500`. */
    failingItems?: number[];
}

/** An msw stub server plus the request journal the specs assert on. */
export interface HnServer {
    server: ReturnType<typeof setupServer>;
    /** Requested resource paths, in order (`topstories.json`, `item/1.json`). */
    requests: string[];
    /** Requested item ids, in order. */
    itemRequests: number[];
    /** Sets a feed's id list, or clears it with `undefined`. */
    setFeed(feed: HnFeedKey, ids: number[] | undefined): void;
    /** Makes a feed's id list answer `500` (or clears the failure). */
    setFeedFailure(feed: HnFeedKey, failing: boolean): void;
}

/**
 * Builds the HN API stub.
 *
 * @param config - Feeds/items to serve and the failure switches.
 * @returns The msw server, the request journal, and mutators for retry specs.
 */
export function createHnServer(config: HnServerConfig = {}): HnServer {
    const feeds: Partial<Record<HnFeedKey, number[]>> = { ...config.feeds };
    const items: Record<number, HnItem | null> = { ...config.items };
    const failingFeeds = new Set<HnFeedKey>(config.failingFeeds ?? []);
    const failingItems = new Set<number>(config.failingItems ?? []);
    const requests: string[] = [];
    const itemRequests: number[] = [];

    const handlers = FEED_KEYS.map((key) => {
        const path = `${HN_TEST_BASE}${FEED_ENDPOINTS[key]}.json`;
        return http.get(path, () => {
            requests.push(`${FEED_ENDPOINTS[key]}.json`);
            if (failingFeeds.has(key)) {
                return new HttpResponse(null, { status: 500 });
            }
            return HttpResponse.json(feeds[key] ?? []);
        });
    });

    handlers.push(
        http.get(`${HN_TEST_BASE}item/:id.json`, ({ params }) => {
            const id = Number.parseInt(String(params.id), 10);
            requests.push(`item/${id}.json`);
            itemRequests.push(id);
            if (failingItems.has(id)) {
                return new HttpResponse(null, { status: 500 });
            }
            return HttpResponse.json(items[id] ?? null);
        })
    );

    return {
        server: setupServer(...handlers),
        requests,
        itemRequests,
        setFeed(feed, ids) {
            if (ids === undefined) {
                delete feeds[feed];
            } else {
                feeds[feed] = ids;
            }
        },
        setFeedFailure(feed, failing) {
            if (failing) {
                failingFeeds.add(feed);
            } else {
                failingFeeds.delete(feed);
            }
        },
    };
}
