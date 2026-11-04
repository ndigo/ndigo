/**
 * @module ndigo-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ConduitApiError, type ConduitApi, type ConduitSession } from '../src/lib/api/conduit-types';
import { ConduitTokenStorage, CONDUIT_TOKEN_KEY, SessionService } from '../src/services/session-service';
import { contextWithRouter, createRouterDouble, createStubApi, sessionFixture } from './support/fixtures';

describe('SessionService', () => {
    const router = createRouterDouble();
    const storage = new ConduitTokenStorage(CONDUIT_TOKEN_KEY);

    beforeEach(() => {
        localStorage.clear();
        router.refresh.mockClear();
        router.navigate.mockClear();
    });

    function serviceWith(api: ConduitApi, initial: ConduitSession | null = null) {
        const service = new SessionService(api, storage, initial);
        service.setApplicationContext(contextWithRouter(router));
        return service;
    }

    test('login adopts the session, persists the token, and lands on the home feed', async () => {
        const session = sessionFixture();
        const service = serviceWith(createStubApi({ login: async () => session }));

        await expect(service.login({ email: 'alice@example.com', password: 'secret' })).resolves.toBeNull();

        expect(service.isAuthenticated).toBe(true);
        expect(service.user?.username).toBe('alice');
        expect(service.token).toBe('test-jwt');
        expect(localStorage.getItem(CONDUIT_TOKEN_KEY)).toBe('test-jwt');
        expect(router.navigate).toHaveBeenCalledWith('/');
        expect(router.refresh).toHaveBeenCalledTimes(1);
    });

    test('a rejected login records the envelope for the login form only', async () => {
        const api = createStubApi({
            login: () => Promise.reject(new ConduitApiError(401, { credentials: ['invalid'] })),
        });
        const service = serviceWith(api);

        await expect(service.login({ email: 'a@example.com', password: 'wrong' })).resolves.toEqual({
            credentials: ['invalid'],
        });

        expect(service.errorsFor('login')).toEqual({ credentials: ['invalid'] });
        expect(service.errorsFor('register')).toBeNull();
        expect(service.isAuthenticated).toBe(false);
        expect(router.refresh).toHaveBeenCalledTimes(1);
    });

    test('a duplicate registration maps onto the offending field', async () => {
        const api = createStubApi({
            register: () => Promise.reject(new ConduitApiError(422, { username: ['has already been taken'] })),
        });
        const service = serviceWith(api);

        await service.register({ username: 'alice', email: 'a@example.com', password: 'secret' });

        expect(service.errorsFor('register')).toEqual({ username: ['has already been taken'] });
        expect(service.errorsFor('login')).toBeNull();
    });

    test('a successful write clears the recorded envelope', async () => {
        const api = createStubApi({
            login: () => Promise.reject(new ConduitApiError(401, { credentials: ['invalid'] })),
            register: async () => sessionFixture(),
        });
        const service = serviceWith(api);

        await service.login({ email: 'a@example.com', password: 'wrong' });
        expect(service.errorsFor('login')).not.toBeNull();

        await service.register({ username: 'alice', email: 'a@example.com', password: 'secret' });
        expect(service.errorsFor('login')).toBeNull();
    });

    test('update patches the account and keeps the visitor in place', async () => {
        const api = createStubApi({
            updateUser: async () =>
                sessionFixture({
                    user: { email: 'new@example.com', username: 'alice-renamed', bio: 'hi', image: null },
                }),
        });
        const service = serviceWith(api, sessionFixture());

        await expect(service.update({ email: 'new@example.com' })).resolves.toBeNull();
        expect(service.user?.username).toBe('alice-renamed');
        expect(router.navigate).not.toHaveBeenCalled();
        expect(router.refresh).toHaveBeenCalledTimes(1);
    });

    test('logout forgets the session and the stored token', () => {
        const service = serviceWith(createStubApi(), sessionFixture());
        storage.write('test-jwt');

        service.logout();

        expect(service.isAuthenticated).toBe(false);
        expect(service.token).toBeNull();
        expect(localStorage.getItem(CONDUIT_TOKEN_KEY)).toBeNull();
        expect(router.navigate).toHaveBeenCalledWith('/');
    });

    test('dropSession clears the session without navigating (the 401 path)', () => {
        const service = serviceWith(createStubApi(), sessionFixture());

        service.dropSession();

        expect(service.isAuthenticated).toBe(false);
        expect(router.navigate).not.toHaveBeenCalled();
    });

    test('restore adopts the account behind a persisted token', async () => {
        storage.write('test-jwt');
        const currentUser = vi.fn(async () => sessionFixture());
        const service = serviceWith(createStubApi({ currentUser }));

        await service.restore();

        expect(currentUser).toHaveBeenCalledTimes(1);
        expect(service.isAuthenticated).toBe(true);
    });

    test('restore forgets a token the API rejects', async () => {
        storage.write('stale-jwt');
        const service = serviceWith(
            createStubApi({ currentUser: () => Promise.reject(new ConduitApiError(401, { token: ['is invalid'] })) })
        );

        await service.restore();

        expect(service.isAuthenticated).toBe(false);
        expect(localStorage.getItem(CONDUIT_TOKEN_KEY)).toBeNull();
    });

    test('restore does nothing without a persisted token', async () => {
        const currentUser = vi.fn(async () => sessionFixture());
        const service = serviceWith(createStubApi({ currentUser }));

        await service.restore();

        expect(currentUser).not.toHaveBeenCalled();
        expect(router.refresh).not.toHaveBeenCalled();
    });
});
