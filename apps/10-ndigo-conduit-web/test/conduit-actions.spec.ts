import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import type { ApplicationContext } from '@ndigo/context';
import { delay } from '@ndigo/test';
import { ROUTER } from '@ndigo/router';
import { CONDUIT_EVENTS } from '../src/app/conduit-events';
import { wireConduitActions } from '../src/app/conduit-actions';
import type { ConduitServices } from '../src/app/conduit-services';
import { ArticleService } from '../src/services/article-service';
import { CommentService } from '../src/services/comment-service';
import { ProfileService } from '../src/services/profile-service';
import { ConduitTokenStorage, SessionService } from '../src/services/session-service';
import { TagService } from '../src/services/tag-service';
import {
    articleFixture,
    commentFixture,
    contextWithRouter,
    createRouterDouble,
    createStubApi,
    pageFixture,
    profileFixture,
    sessionFixture,
} from './support/fixtures';

/**
 * A context double that records the subscriptions `wireConduitActions` makes, so
 * a spec can fire an event the way the view target's bridge would.
 */
function createContextDouble(router: ReturnType<typeof createRouterDouble>) {
    const handlers = new Map<string, Function[]>();
    const context = {
        on: (name: string, handler: Function) => {
            handlers.set(name, [...(handlers.get(name) ?? []), handler]);
        },
        getValue: (token: unknown) => (token === ROUTER ? router : undefined),
    } as unknown as ApplicationContext;

    const emit = (name: string, payload?: unknown) => {
        for (const handler of handlers.get(name) ?? []) {
            handler(payload);
        }
    };
    return { context, emit };
}

describe('wireConduitActions', () => {
    const router = createRouterDouble();

    let services: ConduitServices;
    let emit: (name: string, payload?: unknown) => void;
    let listArticles: Mock;

    beforeEach(() => {
        router.refresh.mockClear();
        router.navigate.mockClear();

        listArticles = vi.fn(async () => pageFixture([articleFixture()]));
        const api = createStubApi({
            listArticles,
            updateUser: async () => sessionFixture(),
            getArticle: async () => articleFixture(),
            getProfile: async () => profileFixture({ username: 'alice', following: false }),
            follow: async () => profileFixture({ username: 'alice', following: true }),
            listComments: vi.fn(async () => [commentFixture()]),
            addComment: async () => commentFixture(),
            login: async () => sessionFixture(),
        });
        const session = new SessionService(api, new ConduitTokenStorage(), null);
        session.setApplicationContext(contextWithRouter(router));
        const articles = new ArticleService(api, session);
        articles.setApplicationContext(contextWithRouter(router));
        const profiles = new ProfileService(api);
        profiles.setApplicationContext(contextWithRouter(router));
        const comments = new CommentService(api);
        comments.setApplicationContext(contextWithRouter(router));
        const tags = new TagService(api);

        services = {
            storage: new ConduitTokenStorage(),
            http: {} as ConduitServices['http'],
            api,
            session,
            articles,
            tags,
            profiles,
            comments,
        };

        const double = createContextDouble(router);
        emit = double.emit;
        wireConduitActions(double.context, services);
    });

    test('an article favorite reaches the article service', async () => {
        await services.articles.ensureFeed();
        const article = services.articles.feed.articles[0];
        expect(article?.favorited).toBe(false);

        emit(CONDUIT_EVENTS.articleFavorite, { slug: article?.slug, favorited: true });

        expect(services.articles.feed.articles[0]?.favorited).toBe(true);
        expect(router.refresh).toHaveBeenCalled();
    });

    test('a follow flips the by-line and re-reads the feed window', async () => {
        await services.articles.ensureFeed();
        expect(services.articles.feed.articles[0]?.author.following).toBe(false);
        expect(listArticles).toHaveBeenCalledTimes(1);

        emit(CONDUIT_EVENTS.authorFollow, { username: 'alice', following: true });
        expect(services.articles.feed.articles[0]?.author.following).toBe(true);

        // The completed follow invalidates the window, so the next visit
        // re-reads it instead of serving the pre-follow list.
        await delay(0);
        await services.articles.ensureFeed();
        expect(listArticles).toHaveBeenCalledTimes(2);
        expect(router.refresh).toHaveBeenCalled();
    });

    test('a login adopts the session and invalidates the feed window', async () => {
        emit(CONDUIT_EVENTS.authLogin, { email: 'alice@example.com', password: 'secret' });

        await vi.waitFor(() => expect(services.session.isAuthenticated).toBe(true));
        expect(services.session.user?.username).toBe('alice');
    });

    test('a logout drops the session and invalidates the feed window', async () => {
        emit(CONDUIT_EVENTS.authLogin, { email: 'alice@example.com', password: 'secret' });
        await vi.waitFor(() => expect(services.session.isAuthenticated).toBe(true));

        emit(CONDUIT_EVENTS.authLogout);

        expect(services.session.isAuthenticated).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith('/');
    });

    test('a comment add reloads the comment list', async () => {
        emit(CONDUIT_EVENTS.commentAdd, { slug: 'how-to-conform', body: 'Nice' });

        await vi.waitFor(() => expect(services.comments.comments).toHaveLength(1));
        expect(services.comments.comments[0]?.body).toBe('A comment');
        expect(router.refresh).toHaveBeenCalled();
    });

    test('a feed tab intent reaches the article service and refreshes', () => {
        emit(CONDUIT_EVENTS.feedTab, { tab: 'feed' });

        expect(router.refresh).toHaveBeenCalledTimes(1);
    });

    test('a settings save patches the account without navigating', async () => {
        emit(CONDUIT_EVENTS.settingsSave, {
            username: 'alice',
            email: 'alice@example.com',
            password: '',
            bio: '',
            image: '',
        });

        await vi.waitFor(() => expect(services.session.isAuthenticated).toBe(true));
        expect(router.navigate).not.toHaveBeenCalled();
    });
});
