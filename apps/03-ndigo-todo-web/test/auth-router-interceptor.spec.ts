// @vitest-environment jsdom
import '@tsmetadata/polyfill';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { HashRouter } from '@ndigo/platform-web';
import { authClient, initAuth, login, logout } from '../src/auth-store';
import { AuthRouterInterceptor } from '../src/auth-router-interceptor';

/**
 * HashRouter-level coverage for the auth guard (APP-N2). The interceptor's
 * ROUTE_AUTH table is keyed with absolute paths while `PathRoute.path` drops
 * the leading slash, so the comparison must be normalized or every guard is
 * inert. These specs drive the real router, not the interceptor in isolation.
 */

describe('AuthRouterInterceptor through HashRouter', () => {
    let router: HashRouter;

    beforeAll(() => {
        initAuth();
    });

    beforeEach(async () => {
        sessionStorage.clear();
        await logout();
        location.hash = '/';
        router = new HashRouter(() => {});
        router.addInterceptor(new AuthRouterInterceptor());
        await router.setRoute('/');
    });

    afterEach(() => {
        router.destroy();
    });

    test('redirects an unauthenticated navigation to a protected route to /auth/login', async () => {
        expect(authClient.isAuthenticated).toBe(false);

        await router.setRoute('/auth/profile');

        expect(router.route).toBe('/');
        await vi.waitFor(() => expect(location.hash).toBe('#/auth/login'));
    });

    test('allows an authenticated principal to reach the protected profile route', async () => {
        await login('alice', 'demo');

        await router.setRoute('/auth/profile');

        expect(router.route).toBe('/auth/profile');
    });

    test('redirects a principal without the required role to /auth/forbidden', async () => {
        await login('alice', 'demo');

        await router.setRoute('/auth/admin');

        expect(router.route).toBe('/');
        await vi.waitFor(() => expect(location.hash).toBe('#/auth/forbidden'));
    });

    test('allows an admin principal to reach the admin route', async () => {
        await login('admin', 'demo');

        await router.setRoute('/auth/admin');

        expect(router.route).toBe('/auth/admin');
    });

    test('leaves public routes untouched', async () => {
        await router.setRoute('/todo/active');

        expect(router.route).toBe('/todo/active');
    });
});
