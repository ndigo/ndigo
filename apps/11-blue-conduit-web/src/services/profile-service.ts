/**
 * Profiles: the `#/profile/:username` page (authored / favorited tabs, paging)
 * and the follow / unfollow writes that appear on that page and on every
 * article by-lines.
 *
 * Follow is optimistic in the same shape as favoriting an article: the cached
 * profile and every cached article by-line flip immediately and re-render, the
 * call is awaited, and a rejected call rolls the flip back. See
 * `article-service.ts` for the rationale of keyed loading.
 *
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@blue/context';
import { Null } from '@blue/core';
import { ROUTER } from '@blue/router';
import { signal, type Signal } from '@blue/signals';
import type { ConduitApi, ConduitArticleSummary, ConduitProfile } from '../lib/api/conduit-types';
import { FEED_PAGE_SIZE } from './article-service';

/** Which of a profile's article tabs is showing. */
export type ConduitProfileTab = 'author' | 'favorited';

/** The loaded profile-page state. */
export interface ConduitProfileState {
    profile: ConduitProfile | null;
    tab: ConduitProfileTab;
    page: number;
    articles: ConduitArticleSummary[];
    articlesCount: number;
    notFound: boolean;
    error: string | null;
}

const EMPTY_STATE: ConduitProfileState = {
    profile: null,
    tab: 'author',
    page: 1,
    articles: [],
    articlesCount: 0,
    notFound: false,
    error: null,
};

/**
 * The profile service.
 */
export class ProfileService extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    readonly #api: ConduitApi;
    readonly #state: Signal<ConduitProfileState>;

    /** The query key the state currently holds, or `null` when nothing is loaded. */
    #loadedKey: string | null = null;
    #requestedTab: ConduitProfileTab = 'author';
    #requestedUsername: string | null = null;
    #page = 1;

    /**
     * Creates the service.
     *
     * @param api - The Conduit API port.
     */
    constructor(api: ConduitApi) {
        super();
        this.#api = api;
        this.#state = signal(EMPTY_STATE);
    }

    /** The loaded profile-page state. */
    get profileState(): ConduitProfileState {
        return this.#state.value;
    }

    /** The number of pages the profile's article window spans (never less than one). */
    get pageCount(): number {
        return Math.max(1, Math.ceil(this.#state.value.articlesCount / FEED_PAGE_SIZE));
    }

    /**
     * Loads a profile page when its query changed since the last load.
     *
     * @param username - The profile's username.
     */
    async ensureProfile(username: string): Promise<void> {
        const key = `${username}|${this.#requestedTab}|${this.#page}`;
        if (key === this.#loadedKey) {
            return;
        }
        await this.#load(username, key);
    }

    /**
     * Adopts the tab a profile *route* selects (`#/profile/:username` is the
     * authored tab, `#/profile/:username/favorited` the favorited one).
     *
     * Called by the controller during dispatch, so it never refreshes: the
     * route is already rendering. A tab or username change resets the window to
     * page one, which is what a fresh location should show.
     *
     * @param username - The profile the route addressed.
     * @param tab - The tab the route selects.
     */
    setRouteTarget(username: string, tab: ConduitProfileTab): void {
        if (this.#requestedUsername === username && this.#requestedTab === tab) {
            return;
        }
        this.#requestedUsername = username;
        this.#requestedTab = tab;
        this.#page = 1;
    }

    /**
     * Moves the profile's article window.
     *
     * @param page - The 1-based page number; out-of-range values are ignored.
     */
    setPage(page: number): void {
        if (!Number.isInteger(page) || page < 1 || page > this.pageCount) {
            return;
        }
        this.#page = page;
        this.#refresh();
    }

    /**
     * Follows or unfollows a profile optimistically.
     *
     * @param username - The profile's username.
     * @param following - The target state.
     */
    async setFollowing(username: string, following: boolean): Promise<void> {
        const snapshot = this.#followingSnapshot(username);
        this.#applyFollowing(username, following);
        this.#refresh();

        try {
            const profile = following ? await this.#api.follow(username) : await this.#api.unfollow(username);
            this.#applyFollowing(username, profile.following);
        } catch {
            if (snapshot !== null) {
                this.#applyFollowing(username, snapshot);
            }
        } finally {
            this.#refresh();
        }
    }

    /**
     * Fetches a profile and one of its article tabs.
     *
     * @param username - The profile's username.
     * @param key - The query key this page belongs to.
     */
    async #load(username: string, key: string): Promise<void> {
        const window = { limit: FEED_PAGE_SIZE, offset: (this.#page - 1) * FEED_PAGE_SIZE };
        const tab = this.#requestedTab;
        try {
            const profile = await this.#api.getProfile(username);
            const articles =
                tab === 'author'
                    ? await this.#api.listArticles({ ...window, author: username })
                    : await this.#api.listArticles({ ...window, favorited: username });
            this.#state.value = {
                profile,
                tab,
                page: this.#page,
                articles: articles.articles,
                articlesCount: articles.articlesCount,
                notFound: false,
                error: null,
            };
        } catch (error) {
            this.#state.value = {
                profile: null,
                tab,
                page: this.#page,
                articles: [],
                articlesCount: 0,
                notFound: true,
                error: error instanceof Error ? error.message : 'The profile could not be loaded.',
            };
        }
        this.#loadedKey = key;
    }

    /**
     * Reads the `following` flag the by-lines currently show, for rollback.
     *
     * @param username - The profile's username.
     * @returns The flag, or `null` when the username is not in the state.
     */
    #followingSnapshot(username: string): boolean | null {
        const state = this.#state.value;
        if (state.profile?.username === username) {
            return state.profile.following;
        }
        const article = state.articles.find((item) => item.author.username === username);
        return article ? article.author.following : null;
    }

    /**
     * Flips the `following` flag on the cached profile and its article by-lines.
     *
     * @param username - The profile's username.
     * @param following - The target state.
     */
    #applyFollowing(username: string, following: boolean): void {
        const state = this.#state.value;
        this.#state.value = {
            ...state,
            profile: state.profile?.username === username ? { ...state.profile, following } : state.profile,
            articles: state.articles.map((article) =>
                article.author.username === username
                    ? { ...article, author: { ...article.author, following } }
                    : article
            ),
        };
    }

    /** Re-renders the current route from the mutated state. */
    #refresh(): void {
        this.applicationContext?.getValue(ROUTER)?.refresh();
    }
}
