/**
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ArticleService, FEED_PAGE_SIZE } from '../src/services/article-service';
import { ConduitTokenStorage, SessionService } from '../src/services/session-service';
import { ConduitApiError } from '../src/lib/api/conduit-types';
import {
    articleFixture,
    contextWithRouter,
    createRouterDouble,
    createStubApi,
    pageFixture,
    profileFixture,
    sessionFixture,
} from './support/fixtures';

describe('ArticleService', () => {
    const router = createRouterDouble();

    beforeEach(() => {
        router.refresh.mockClear();
        router.navigate.mockClear();
    });

    function serviceWith(api: ReturnType<typeof createStubApi>, authenticated = false) {
        const session = new SessionService(api, new ConduitTokenStorage(), authenticated ? sessionFixture() : null);
        session.setApplicationContext(contextWithRouter(router));
        const articles = new ArticleService(api, session);
        articles.setApplicationContext(contextWithRouter(router));
        return articles;
    }

    test('ensureFeed loads the global feed once per query', async () => {
        const listArticles = vi.fn(async () => pageFixture([articleFixture()]));
        const articles = serviceWith(createStubApi({ listArticles }));

        await articles.ensureFeed();
        await articles.ensureFeed();

        expect(listArticles).toHaveBeenCalledTimes(1);
        expect(listArticles).toHaveBeenCalledWith({ limit: FEED_PAGE_SIZE, offset: 0, tag: undefined });
        expect(articles.feed.tab).toBe('global');
        expect(articles.feed.articles).toHaveLength(1);
    });

    test('an authenticated visitor is served the followed-authors feed by default', async () => {
        const getFeed = vi.fn(async () => pageFixture([articleFixture()]));
        const articles = serviceWith(createStubApi({ getFeed }), true);

        await articles.ensureFeed();

        expect(getFeed).toHaveBeenCalledWith({ limit: FEED_PAGE_SIZE, offset: 0 });
        expect(articles.feed.tab).toBe('feed');
    });

    test('pagination state: pageCount follows articlesCount and setPage windows the fetch', async () => {
        const listArticles = vi.fn(async () => pageFixture([articleFixture()], 25));
        const articles = serviceWith(createStubApi({ listArticles }));

        await articles.ensureFeed();
        expect(articles.pageCount).toBe(2);
        expect(articles.feed.page).toBe(1);

        articles.setPage(2);
        expect(router.refresh).toHaveBeenCalledTimes(1);

        await articles.ensureFeed();
        expect(listArticles).toHaveBeenLastCalledWith({ limit: FEED_PAGE_SIZE, offset: 20, tag: undefined });
        expect(articles.feed.page).toBe(2);
    });

    test('setPage ignores a page outside the window', async () => {
        const articles = serviceWith(createStubApi({ listArticles: async () => pageFixture([articleFixture()], 25) }));
        await articles.ensureFeed();

        articles.setPage(0);
        articles.setPage(9);
        articles.setPage(1.5);

        expect(router.refresh).not.toHaveBeenCalled();
        expect(articles.feed.page).toBe(1);
    });

    test('setTag filters the feed and returns to page one', async () => {
        const listArticles = vi.fn(async () => pageFixture([articleFixture()], 25));
        const articles = serviceWith(createStubApi({ listArticles }));
        await articles.ensureFeed();
        articles.setPage(2);
        await articles.ensureFeed();

        articles.setTag('realworld');
        await articles.ensureFeed();

        expect(articles.feed.tag).toBe('realworld');
        expect(articles.feed.page).toBe(1);
        expect(listArticles).toHaveBeenLastCalledWith({ limit: FEED_PAGE_SIZE, offset: 0, tag: 'realworld' });
    });

    test('a failing feed records the message instead of throwing', async () => {
        const articles = serviceWith(
            createStubApi({ listArticles: () => Promise.reject(new ConduitApiError(500, { body: ['boom'] })) })
        );

        await expect(articles.ensureFeed()).resolves.toBeUndefined();
        expect(articles.feed.articles).toEqual([]);
        expect(articles.feed.error).toContain('status 500');
    });

    test('favoriting is optimistic and rolls back when the API refuses', async () => {
        const article = articleFixture({ favorited: false, favoritesCount: 2 });
        const articles = serviceWith(
            createStubApi({
                listArticles: async () => pageFixture([article]),
                favoriteArticle: () => Promise.reject(new ConduitApiError(500, { body: ['boom'] })),
            })
        );
        await articles.ensureFeed();

        const pending = articles.setFavorited(article.slug, true);

        // Optimistic: the state flips before the call settles.
        expect(articles.feed.articles[0]?.favorited).toBe(true);
        expect(articles.feed.articles[0]?.favoritesCount).toBe(3);

        await pending;

        expect(articles.feed.articles[0]?.favorited).toBe(false);
        expect(articles.feed.articles[0]?.favoritesCount).toBe(2);
        // One refresh for the optimistic flip, one for the rollback.
        expect(router.refresh).toHaveBeenCalledTimes(2);
    });

    test('a successful favorite merges the counts the server reports', async () => {
        const article = articleFixture({ favorited: false, favoritesCount: 2 });
        const articles = serviceWith(
            createStubApi({
                listArticles: async () => pageFixture([article]),
                favoriteArticle: async () => articleFixture({ favorited: true, favoritesCount: 5 }),
            })
        );
        await articles.ensureFeed();

        await articles.setFavorited(article.slug, true);

        expect(articles.feed.articles[0]?.favorited).toBe(true);
        expect(articles.feed.articles[0]?.favoritesCount).toBe(5);
    });

    test('unfavoriting from a favorited state rolls back to the favorited state', async () => {
        const article = articleFixture({ favorited: true, favoritesCount: 4 });
        const articles = serviceWith(
            createStubApi({
                listArticles: async () => pageFixture([article]),
                unfavoriteArticle: () => Promise.reject(new ConduitApiError(500, { body: ['boom'] })),
            })
        );
        await articles.ensureFeed();

        await articles.setFavorited(article.slug, false);

        expect(articles.feed.articles[0]?.favorited).toBe(true);
        expect(articles.feed.articles[0]?.favoritesCount).toBe(4);
    });

    test('a tag gesture outranks the signed-in default feed tab', async () => {
        const listArticles = vi.fn(async () => pageFixture([articleFixture()]));
        const getFeed = vi.fn(async () => pageFixture([articleFixture()]));
        const articles = serviceWith(createStubApi({ listArticles, getFeed }), true);

        articles.setTag('realworld');
        await articles.ensureFeed();

        expect(getFeed).not.toHaveBeenCalled();
        expect(listArticles).toHaveBeenCalledWith({ limit: FEED_PAGE_SIZE, offset: 0, tag: 'realworld' });
        expect(articles.feed.tab).toBe('global');
        expect(articles.feed.tag).toBe('realworld');
    });

    test('setAuthorFollowing flips the cached by-lines and re-renders', async () => {
        const article = articleFixture({ author: profileFixture({ username: 'alice', following: false }) });
        const articles = serviceWith(
            createStubApi({
                getArticle: async () => article,
                listArticles: async () => pageFixture([article]),
            })
        );

        await articles.ensureFeed();
        await articles.ensureArticle('how-to-conform');

        articles.setAuthorFollowing('alice', true);

        expect(articles.articleState.article?.author.following).toBe(true);
        expect(articles.feed.articles[0]?.author.following).toBe(true);
        expect(router.refresh).toHaveBeenCalledTimes(1);
    });

    test('ensureArticle caches by slug and flags a 404 as notFound', async () => {
        const getArticle = vi.fn(async (slug: string) =>
            slug === 'missing' ? Promise.reject(new ConduitApiError(404, { article: ['not found'] })) : articleFixture()
        );
        const articles = serviceWith(createStubApi({ getArticle }));

        await articles.ensureArticle('how-to-conform');
        await articles.ensureArticle('how-to-conform');
        expect(getArticle).toHaveBeenCalledTimes(1);
        expect(articles.articleState.notFound).toBe(false);
        expect(articles.articleState.article?.slug).toBe('how-to-conform');

        await articles.ensureArticle('missing');
        expect(articles.articleState.article).toBeNull();
        expect(articles.articleState.notFound).toBe(true);
    });

    test('save publishes and navigates to the article the API created', async () => {
        const navigate = router.navigate;
        const articles = serviceWith(
            createStubApi({ createArticle: async () => articleFixture({ slug: 'fresh-article' }) })
        );

        const errors = await articles.save({ title: 'Fresh', description: 'd', body: 'b', tagList: [] }, null);

        expect(errors).toBeNull();
        expect(navigate).toHaveBeenCalledWith('/article/fresh-article');
    });

    test('a rejected save records the editor envelope and stays put', async () => {
        const articles = serviceWith(
            createStubApi({
                createArticle: () => Promise.reject(new ConduitApiError(422, { title: ["can't be blank"] })),
            })
        );

        const errors = await articles.save({ title: '', description: 'd', body: 'b', tagList: [] }, null);

        expect(errors).toEqual({ title: ["can't be blank"] });
        expect(articles.editorErrors()).toEqual({ title: ["can't be blank"] });
        expect(router.navigate).not.toHaveBeenCalled();
        expect(router.refresh).toHaveBeenCalledTimes(1);
    });

    test('remove navigates home after the API accepts the delete', async () => {
        const articles = serviceWith(createStubApi({ deleteArticle: async () => undefined }));

        await articles.remove('how-to-conform');

        expect(router.navigate).toHaveBeenCalledWith('/');
        expect(articles.articleState.article).toBeNull();
    });

    test('invalidate drops the cached window so the next ensure re-fetches', async () => {
        const listArticles = vi.fn(async () => pageFixture([articleFixture()]));
        const articles = serviceWith(createStubApi({ listArticles }));
        await articles.ensureFeed();
        await articles.ensureFeed();
        expect(listArticles).toHaveBeenCalledTimes(1);

        articles.invalidate();
        await articles.ensureFeed();

        expect(listArticles).toHaveBeenCalledTimes(2);
    });
});
