/**
 * The Hacker News domain vocabulary: the story feeds the app routes expose, the
 * feed→endpoint table from the official API
 * (https://github.com/HackerNews/API), and the `Item` shape the API returns.
 *
 * Deliberately no runtime dependency on the network here — this module is pure
 * data and types, shared by the HTTP client, the service, and the views.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

/** The six story feeds exposed as hash routes. */
export type HnFeedKey = 'top' | 'new' | 'best' | 'ask' | 'show' | 'jobs';

/** The feeds in tab order. */
export const FEED_KEYS: readonly HnFeedKey[] = ['top', 'new', 'best', 'ask', 'show', 'jobs'];

/** Human labels for the feed tabs. */
export const FEED_LABELS: Record<HnFeedKey, string> = {
    top: 'Top',
    new: 'New',
    best: 'Best',
    ask: 'Ask',
    show: 'Show',
    jobs: 'Jobs',
};

/** The hash route each feed owns (`#/` is the default top feed). */
export const FEED_ROUTES: Record<HnFeedKey, string> = {
    top: '/',
    new: '/new',
    best: '/best',
    ask: '/ask',
    show: '/show',
    jobs: '/jobs',
};

/** The HN API resource segment backing each feed (the client appends `.json`). */
export const FEED_ENDPOINTS: Record<HnFeedKey, string> = {
    top: 'topstories',
    new: 'newstories',
    best: 'beststories',
    ask: 'askstories',
    show: 'showstories',
    jobs: 'jobstories',
};

/**
 * One Hacker News `Item`. Only the fields this reader renders are described;
 * the API omits the rest per item type (`story`, `comment`, `job`, `poll`).
 */
export interface HnItem {
    readonly id: number;
    readonly type?: 'story' | 'comment' | 'job' | 'poll' | 'pollopt';
    readonly by?: string;
    /** Creation time, Unix seconds. */
    readonly time?: number;
    readonly title?: string;
    /** External story URL; absent for Ask HN / jobs (they carry `text`). */
    readonly url?: string;
    /** Body for text posts and comments (HTML-escaped on the wire). */
    readonly text?: string;
    readonly score?: number;
    /** Number of descendants (total comments) — stories carry it. */
    readonly descendants?: number;
    /** Direct child item ids. */
    readonly kids?: readonly number[];
    readonly parent?: number;
    readonly deleted?: boolean;
    readonly dead?: boolean;
}

/** The default HN API base (Vite build overrides it with `VITE_HN_API_BASE`). */
export const DEFAULT_HN_API_BASE = 'https://hacker-news.firebaseio.com/v0/';

/** All feed routes, used by the route table and the README. */
export const FEED_ROUTE_LIST: readonly string[] = FEED_KEYS.map((key) => FEED_ROUTES[key]);
