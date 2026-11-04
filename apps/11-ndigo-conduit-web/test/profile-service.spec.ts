/**
 * @module ndigo-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ProfileService } from '../src/services/profile-service';
import { FEED_PAGE_SIZE } from '../src/services/article-service';
import { ConduitApiError } from '../src/lib/api/conduit-types';
import {
    articleFixture,
    contextWithRouter,
    createRouterDouble,
    createStubApi,
    pageFixture,
    profileFixture,
} from './support/fixtures';

describe('ProfileService', () => {
    const router = createRouterDouble();

    beforeEach(() => {
        router.refresh.mockClear();
    });

    function serviceWith(api: ReturnType<typeof createStubApi>) {
        const profiles = new ProfileService(api);
        profiles.setApplicationContext(contextWithRouter(router));
        return profiles;
    }

    test('ensureProfile loads the authored tab for the route', async () => {
        const listArticles = vi.fn(async () => pageFixture([articleFixture()]));
        const profiles = serviceWith(createStubApi({ getProfile: async () => profileFixture(), listArticles }));

        profiles.setRouteTarget('alice', 'author');
        await profiles.ensureProfile('alice');
        await profiles.ensureProfile('alice');

        expect(listArticles).toHaveBeenCalledTimes(1);
        expect(listArticles).toHaveBeenCalledWith({ limit: FEED_PAGE_SIZE, offset: 0, author: 'alice' });
        expect(profiles.profileState.profile?.username).toBe('alice');
        expect(profiles.profileState.tab).toBe('author');
    });

    test('the favorited route loads the favorited tab', async () => {
        const listArticles = vi.fn(async () => pageFixture([articleFixture()]));
        const profiles = serviceWith(createStubApi({ getProfile: async () => profileFixture(), listArticles }));

        profiles.setRouteTarget('alice', 'favorited');
        await profiles.ensureProfile('alice');

        expect(listArticles).toHaveBeenCalledWith({ limit: FEED_PAGE_SIZE, offset: 0, favorited: 'alice' });
        expect(profiles.profileState.tab).toBe('favorited');
    });

    test('setRouteTarget resets the window when the tab or username changes', async () => {
        const listArticles = vi.fn(async () => pageFixture([articleFixture()], 25));
        const profiles = serviceWith(createStubApi({ getProfile: async () => profileFixture(), listArticles }));
        profiles.setRouteTarget('alice', 'author');
        await profiles.ensureProfile('alice');
        profiles.setPage(2);
        await profiles.ensureProfile('alice');
        expect(profiles.profileState.page).toBe(2);

        profiles.setRouteTarget('alice', 'favorited');
        await profiles.ensureProfile('alice');
        expect(profiles.profileState.page).toBe(1);

        profiles.setRouteTarget('bob', 'author');
        await profiles.ensureProfile('bob');
        expect(profiles.profileState.page).toBe(1);
        expect(listArticles).toHaveBeenLastCalledWith({ limit: FEED_PAGE_SIZE, offset: 0, author: 'bob' });
    });

    test('an unknown user flags notFound', async () => {
        const profiles = serviceWith(
            createStubApi({ getProfile: () => Promise.reject(new ConduitApiError(404, { profile: ['not found'] })) })
        );

        profiles.setRouteTarget('ghost', 'author');
        await profiles.ensureProfile('ghost');

        expect(profiles.profileState.notFound).toBe(true);
        expect(profiles.profileState.profile).toBeNull();
    });

    test('following is optimistic and rolls back when the API refuses', async () => {
        const article = articleFixture({ author: profileFixture({ username: 'alice', following: false }) });
        const profiles = serviceWith(
            createStubApi({
                getProfile: async () => profileFixture({ username: 'alice', following: false }),
                listArticles: async () => pageFixture([article]),
                follow: () => Promise.reject(new ConduitApiError(500, { body: ['boom'] })),
            })
        );
        profiles.setRouteTarget('alice', 'author');
        await profiles.ensureProfile('alice');

        const pending = profiles.setFollowing('alice', true);
        expect(profiles.profileState.profile?.following).toBe(true);
        expect(profiles.profileState.articles[0]?.author.following).toBe(true);

        await pending;

        expect(profiles.profileState.profile?.following).toBe(false);
        expect(profiles.profileState.articles[0]?.author.following).toBe(false);
        expect(router.refresh).toHaveBeenCalledTimes(2);
    });

    test('a successful follow keeps the server view of the flag', async () => {
        const profiles = serviceWith(
            createStubApi({
                getProfile: async () => profileFixture({ username: 'alice', following: false }),
                listArticles: async () => pageFixture([articleFixture()]),
                follow: async () => profileFixture({ username: 'alice', following: true }),
            })
        );
        profiles.setRouteTarget('alice', 'author');
        await profiles.ensureProfile('alice');

        await profiles.setFollowing('alice', true);

        expect(profiles.profileState.profile?.following).toBe(true);
    });
});
