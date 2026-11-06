/**
 * Test doubles and fixtures shared by the app's specs.
 *
 * The stub API is a hand-written implementation of the {@link ConduitApi} port
 * (not a mocking framework): every method rejects until a spec stubs it, so a
 * test that forgets a call fails loudly instead of silently resolving.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { vi, type Mock } from 'vitest';
import type { ApplicationContext } from '@ndigo/context';
import { ROUTER } from '@ndigo/router';
import type {
    ConduitApi,
    ConduitArticle,
    ConduitArticlePage,
    ConduitComment,
    ConduitProfile,
    ConduitSession,
} from '../../src/lib/api/conduit-types';

/** A router double recording refreshes and navigations. */
export interface RouterDouble {
    route: string;
    refresh: Mock;
    navigate: Mock;
}

/**
 * Creates a router double.
 *
 * @returns The double, with `refresh`/`navigate` spies.
 */
export function createRouterDouble(): RouterDouble {
    return {
        route: '/',
        refresh: vi.fn(),
        navigate: vi.fn(async () => undefined),
    };
}

/**
 * Wraps a router double as the application context a service reads it from.
 *
 * @param router - The router double.
 * @returns A context whose only resolvable token is `ROUTER`.
 */
export function contextWithRouter(router: RouterDouble): ApplicationContext {
    return {
        getValue: (token: unknown) => (token === ROUTER ? router : undefined),
    } as unknown as ApplicationContext;
}

/**
 * Creates an API stub whose every method rejects until it is stubbed.
 *
 * @param overrides - The methods this spec exercises.
 * @returns The stub API.
 */
export function createStubApi(overrides: Partial<ConduitApi> = {}): ConduitApi {
    const unstubbed = (name: string) => () => Promise.reject(new Error(`stub ${name} was not configured`));
    const stub: ConduitApi = {
        register: unstubbed('register'),
        login: unstubbed('login'),
        currentUser: unstubbed('currentUser'),
        updateUser: unstubbed('updateUser'),
        listArticles: unstubbed('listArticles'),
        getFeed: unstubbed('getFeed'),
        getArticle: unstubbed('getArticle'),
        createArticle: unstubbed('createArticle'),
        updateArticle: unstubbed('updateArticle'),
        deleteArticle: unstubbed('deleteArticle'),
        favoriteArticle: unstubbed('favoriteArticle'),
        unfavoriteArticle: unstubbed('unfavoriteArticle'),
        getProfile: unstubbed('getProfile'),
        follow: unstubbed('follow'),
        unfollow: unstubbed('unfollow'),
        listComments: unstubbed('listComments'),
        addComment: unstubbed('addComment'),
        deleteComment: unstubbed('deleteComment'),
        listTags: unstubbed('listTags'),
    };
    return Object.assign(stub, overrides);
}

/**
 * Builds a profile fixture.
 *
 * @param overrides - Fields to override.
 * @returns The profile payload.
 */
export function profileFixture(overrides: Partial<ConduitProfile> = {}): ConduitProfile {
    return { username: 'alice', bio: null, image: null, following: false, ...overrides };
}

/**
 * Builds an article fixture.
 *
 * @param overrides - Fields to override.
 * @returns The article payload.
 */
export function articleFixture(overrides: Partial<ConduitArticle> = {}): ConduitArticle {
    return {
        slug: 'how-to-conform',
        title: 'How to conform',
        description: 'A description',
        body: '# Body',
        tagList: ['realworld'],
        createdAt: '2026-10-06T10:00:00.000Z',
        updatedAt: '2026-10-06T10:00:00.000Z',
        favorited: false,
        favoritesCount: 2,
        author: profileFixture(),
        ...overrides,
    };
}

/**
 * Drops an article's `body`, producing the list shape.
 *
 * @param article - The full article payload.
 * @returns The summary payload.
 */
export function summaryOf({ body: _body, ...summary }: ConduitArticle) {
    return summary;
}

/**
 * Builds an article page fixture.
 *
 * @param articles - The window's articles.
 * @param articlesCount - The total match count.
 * @returns The list payload.
 */
export function pageFixture(articles: ConduitArticle[], articlesCount: number = articles.length): ConduitArticlePage {
    return { articles: articles.map(summaryOf), articlesCount };
}

/**
 * Builds a comment fixture.
 *
 * @param overrides - Fields to override.
 * @returns The comment payload.
 */
export function commentFixture(overrides: Partial<ConduitComment> = {}): ConduitComment {
    return {
        id: 1,
        createdAt: '2026-10-06T10:00:00.000Z',
        updatedAt: '2026-10-06T10:00:00.000Z',
        body: 'A comment',
        author: profileFixture(),
        ...overrides,
    };
}

/**
 * Builds a session fixture.
 *
 * @param overrides - Fields to override.
 * @returns The session payload.
 */
export function sessionFixture(overrides: Partial<ConduitSession> = {}): ConduitSession {
    return {
        token: 'test-jwt',
        user: { email: 'alice@example.com', username: 'alice', bio: null, image: null },
        ...overrides,
    };
}
