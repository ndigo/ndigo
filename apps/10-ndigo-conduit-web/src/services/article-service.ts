/**
 * Articles: the home feed, a single article page, and every write against them.
 *
 * The service owns the list/article state as `@ndigo/signals` signals and is the
 * only thing that talks to the API for articles; controllers read the signals
 * to build a model, and mutations call `router.refresh()` so the current route
 * re-renders from the new state (AD-53 D-3).
 *
 * **Loading is keyed, not per-render.** A route dispatch calls
 * {@link ArticleService.ensureFeed}, which fetches only when the query changed
 * (tab/tag/page) since the last successful load. That is what makes optimistic
 * updates viable: favoriting patches the cached list and refreshes, and the
 * refresh re-renders the patch instead of re-fetching the pre-mutation list
 * over it.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { ROUTER } from '@ndigo/router';
import { signal, type Signal } from '@ndigo/signals';
import {
    ConduitApiError,
    type ConduitApi,
    type ConduitArticle,
    type ConduitArticleDraft,
    type ConduitArticleSummary,
    type ConduitErrors,
} from '../lib/api/conduit-types';
import { FormErrorState } from './form-errors';
import type { SessionService } from './session-service';

/** The page size the RealWorld API defaults to; the UI pages in the same steps. */
export const FEED_PAGE_SIZE = 20;

/** Which feed the home page is showing. */
export type ConduitFeedTab = 'feed' | 'global';

/** The loaded home-feed state. */
export interface ConduitFeedState {
    tab: ConduitFeedTab;
    tag: string | null;
    page: number;
    articles: ConduitArticleSummary[];
    articlesCount: number;
    error: string | null;
}

/** The loaded article-page state. */
export interface ConduitArticleState {
    slug: string | null;
    article: ConduitArticle | null;
    notFound: boolean;
}

const EMPTY_FEED: ConduitFeedState = {
    tab: 'global',
    tag: null,
    page: 1,
    articles: [],
    articlesCount: 0,
    error: null,
};

/**
 * The article service.
 */
export class ArticleService extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    readonly #api: ConduitApi;
    readonly #session: SessionService;
    readonly #feed: Signal<ConduitFeedState>;
    readonly #article: Signal<ConduitArticleState>;
    readonly #errors: FormErrorState;

    /** The query key the feed currently holds, or `null` when nothing is loaded. */
    #loadedKey: string | null = null;

    /** Whether the visitor picked a tab explicitly (rather than the default). */
    #tabRequested = false;

    /** Requested query intent (the loaded state trails it by one fetch). */
    #requestedTab: ConduitFeedTab = 'global';
    #requestedTag: string | null = null;
    #page = 1;

    /**
     * Creates the service.
     *
     * @param api - The Conduit API port.
     * @param session - The session, needed for the authenticated feed and for
     *   the view-relative `favorited`/`following` flags the API returns.
     */
    constructor(api: ConduitApi, session: SessionService) {
        super();
        this.#api = api;
        this.#session = session;
        this.#feed = signal(EMPTY_FEED);
        this.#article = signal({ slug: null, article: null, notFound: false });
        this.#errors = new FormErrorState();
    }

    /** The loaded feed state. */
    get feed(): ConduitFeedState {
        return this.#feed.value;
    }

    /** The loaded article-page state. */
    get articleState(): ConduitArticleState {
        return this.#article.value;
    }

    /** The number of pages the current feed window spans (never less than one). */
    get pageCount(): number {
        return Math.max(1, Math.ceil(this.#feed.value.articlesCount / FEED_PAGE_SIZE));
    }

    /**
     * The envelope the editor failed with, when the editor produced it.
     *
     * @returns The envelope, or `null`.
     */
    editorErrors(): ConduitErrors | null {
        return this.#errors.for('editor');
    }

    /**
     * Loads the feed when the query changed since the last successful load.
     *
     * @returns A promise resolved once the state matches the requested query.
     */
    async ensureFeed(): Promise<void> {
        const tab = this.#effectiveTab();
        const key = `${tab}|${this.#requestedTag ?? ''}|${this.#page}`;
        if (key === this.#loadedKey) {
            return;
        }
        await this.#loadFeed(key, tab);
    }

    /**
     * Drops the loaded window so the next {@link ensureFeed} re-fetches.
     *
     * Used when the *viewer* changes rather than the query: the API's
     * `favorited`/`following` members are view-relative, so a cached window
     * belongs to the session that fetched it and cannot be shown to another.
     */
    invalidate(): void {
        this.#loadedKey = null;
    }

    /**
     * Selects a feed tab and returns to page one.
     *
     * @param tab - The requested tab.
     */
    setTab(tab: ConduitFeedTab): void {
        this.#tabRequested = true;
        this.#requestedTab = tab;
        this.#requestedTag = null;
        this.#page = 1;
        this.#refresh();
    }

    /**
     * Filters the global feed by tag (page one) or clears the filter.
     *
     * @param tag - The tag to filter by, or `null` for the unfiltered feed.
     */
    setTag(tag: string | null): void {
        // Filtering by tag is a global-feed gesture: it both selects that tab
        // and records the choice, so an authenticated visitor's default "Your
        // Feed" cannot override a tag they just clicked.
        this.#tabRequested = true;
        this.#requestedTag = tag;
        this.#requestedTab = 'global';
        this.#page = 1;
        this.#refresh();
    }

    /**
     * Moves the feed window.
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
     * Loads the article page for a slug, once per slug.
     *
     * @param slug - The article slug.
     */
    async ensureArticle(slug: string): Promise<void> {
        if (this.#article.value.slug === slug && this.#article.value.article !== null) {
            return;
        }
        try {
            const article = await this.#api.getArticle(slug);
            this.#article.value = { slug, article, notFound: false };
        } catch (error) {
            this.#article.value = { slug, article: null, notFound: ConduitApiError.from(error)?.status === 404 };
        }
    }

    /**
     * Favorites or unfavorites an article **optimistically**: the cached list
     * and article are flipped and re-rendered immediately, the API call is
     * awaited, and a failure rolls the flip back (re-rendering the original
     * state). A success merges the server's authoritative count, so a
     * duplicated favorite cannot drift the number.
     *
     * @param slug - The article slug.
     * @param favorited - The target state.
     */
    async setFavorited(slug: string, favorited: boolean): Promise<void> {
        const snapshot = this.#favoriteSnapshot(slug);
        this.#applyFavorite(slug, favorited);
        this.#refresh();

        try {
            const updated = favorited ? await this.#api.favoriteArticle(slug) : await this.#api.unfavoriteArticle(slug);
            this.#mergeArticle(updated);
        } catch {
            if (snapshot) {
                this.#applyFavorite(slug, snapshot.favorited, snapshot.favoritesCount);
            }
        } finally {
            this.#refresh();
        }
    }

    /**
     * Flips an author's `following` flag on the cached article and feed
     * by-lines and re-renders.
     *
     * Follow/unfollow is a profile-service write, but the control the visitor
     * pressed lives on an article by-line, so the article state has to follow
     * the same intent — otherwise the button under the cursor would disagree
     * with the one on the profile page until the next visit.
     *
     * @param username - The author whose flag changed.
     * @param following - The target state.
     */
    setAuthorFollowing(username: string, following: boolean): void {
        const patchAuthor = <T extends ConduitArticleSummary>(article: T): T =>
            article.author.username === username ? { ...article, author: { ...article.author, following } } : article;

        const state = this.#article.value;
        if (state.article) {
            this.#article.value = { ...state, article: patchAuthor(state.article) };
        }

        const feed = this.#feed.value;
        this.#feed.value = { ...feed, articles: feed.articles.map(patchAuthor) };
        this.#refresh();
    }

    /**
     * Publishes or updates an article. On success the visitor lands on the
     * article page; on failure the envelope is recorded for the editor.
     *
     * @param draft - The article fields.
     * @param slug - The slug being updated, or `null` to create.
     * @returns The envelope on failure, `null` on success.
     */
    async save(draft: ConduitArticleDraft, slug: string | null): Promise<ConduitErrors | null> {
        this.#errors.clear();
        try {
            const article =
                slug === null ? await this.#api.createArticle(draft) : await this.#api.updateArticle(slug, draft);
            this.#loadedKey = null;
            this.#article.value = { slug: article.slug, article, notFound: false };
            await this.#navigate(`/article/${article.slug}`);
            return null;
        } catch (error) {
            const errors = ConduitApiError.from(error)?.errors ?? { body: ['The article could not be saved.'] };
            this.#errors.set('editor', errors);
            this.#refresh();
            return errors;
        }
    }

    /**
     * Deletes an article and returns to the home feed.
     *
     * @param slug - The article slug.
     */
    async remove(slug: string): Promise<void> {
        try {
            await this.#api.deleteArticle(slug);
        } catch {
            // A delete the API refused leaves the page as it was; the caller
            // sees the unchanged article rather than a fabricated success.
            this.#refresh();
            return;
        }
        this.#loadedKey = null;
        this.#article.value = { slug: null, article: null, notFound: false };
        await this.#navigate('/');
    }

    /**
     * The tab the visitor is actually served: an explicit request wins, a
     * signed-in visitor with no request yet defaults to their feed (the
     * RealWorld landing behaviour), and an anonymous visitor always has the
     * global feed.
     *
     * @returns The tab to load.
     */
    #effectiveTab(): ConduitFeedTab {
        const requested = this.#tabRequested ? this.#requestedTab : this.#session.isAuthenticated ? 'feed' : 'global';
        return requested === 'feed' && this.#session.isAuthenticated ? 'feed' : 'global';
    }

    /**
     * Fetches one feed window and stores it.
     *
     * @param key - The query key this window belongs to.
     * @param tab - The effective tab being loaded.
     */
    async #loadFeed(key: string, tab: ConduitFeedTab): Promise<void> {
        const query = { limit: FEED_PAGE_SIZE, offset: (this.#page - 1) * FEED_PAGE_SIZE };
        // A tag is only ever set alongside the *global* tab (`setTag` selects it
        // and `setTab` clears the tag), so the followed-authors feed never
        // carries a filter — the two request shapes cannot drift.
        const tag = this.#requestedTag;
        try {
            const page =
                tab === 'feed'
                    ? await this.#api.getFeed(query)
                    : await this.#api.listArticles({ ...query, tag: tag ?? undefined });
            this.#feed.value = {
                tab,
                tag,
                page: this.#page,
                articles: page.articles,
                articlesCount: page.articlesCount,
                error: null,
            };
        } catch (error) {
            this.#feed.value = {
                tab,
                tag,
                page: this.#page,
                articles: [],
                articlesCount: 0,
                error: error instanceof Error ? error.message : 'The feed could not be loaded.',
            };
        }
        this.#loadedKey = key;
    }

    /**
     * Reads the favorite members an article currently shows, for rollback.
     *
     * @param slug - The article slug.
     * @returns The snapshot, or `null` when the slug is not in the state.
     */
    #favoriteSnapshot(slug: string): { favorited: boolean; favoritesCount: number } | null {
        const article = this.#article.value.article;
        if (article?.slug === slug) {
            return { favorited: article.favorited, favoritesCount: article.favoritesCount };
        }
        const summary = this.#feed.value.articles.find((item) => item.slug === slug);
        return summary ? { favorited: summary.favorited, favoritesCount: summary.favoritesCount } : null;
    }

    /**
     * Flips the favorite members of the cached article and list entry.
     *
     * @param slug - The article slug.
     * @param favorited - The target state.
     * @param favoritesCount - An explicit count (rollback); derived when omitted.
     */
    #applyFavorite(slug: string, favorited: boolean, favoritesCount?: number): void {
        const patch = (article: ConduitArticleSummary): ConduitArticleSummary => ({
            ...article,
            favorited,
            favoritesCount:
                favoritesCount ?? article.favoritesCount + (favorited === article.favorited ? 0 : favorited ? 1 : -1),
        });

        const state = this.#article.value;
        const article = state.article;
        if (article && article.slug === slug) {
            this.#article.value = { ...state, article: { ...article, ...patch(article) } };
        }

        const feed = this.#feed.value;
        if (feed.articles.some((item) => item.slug === slug)) {
            this.#feed.value = {
                ...feed,
                articles: feed.articles.map((item) => (item.slug === slug ? patch(item) : item)),
            };
        }
    }

    /**
     * Adopts the server's authoritative article payload after a write.
     *
     * @param updated - The article the API returned.
     */
    #mergeArticle(updated: ConduitArticle): void {
        const state = this.#article.value;
        if (state.article?.slug === updated.slug) {
            this.#article.value = { ...state, article: { ...state.article, ...updated } };
        }
        const feed = this.#feed.value;
        if (feed.articles.some((item) => item.slug === updated.slug)) {
            const { body: _body, ...summary } = updated;
            this.#feed.value = {
                ...feed,
                articles: feed.articles.map((item) => (item.slug === updated.slug ? summary : item)),
            };
        }
    }

    /** Re-renders the current route from the mutated state. */
    #refresh(): void {
        this.applicationContext?.getValue(ROUTER)?.refresh();
    }

    /**
     * Navigates to an app path.
     *
     * @param path - The absolute app path.
     */
    async #navigate(path: string): Promise<void> {
        const router = this.applicationContext?.getValue(ROUTER);
        if (router?.navigate) {
            await router.navigate(path);
            return;
        }
        globalThis.location.hash = `#${path}`;
    }
}
