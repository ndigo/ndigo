/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { HashRouter } from '@ndigo/platform-web';
import { AuthRouterInterceptor, absolutePath, requiresAuth } from '../src/app/auth-router-interceptor';

/**
 * The guard is exercised through the real `HashRouter`, not in isolation: its
 * redirect is written from `afterCompletion` precisely because the router
 * restores the previous route in between, so an isolated unit test would not
 * observe the contract that matters.
 */
describe('AuthRouterInterceptor through HashRouter', () => {
    let router: HashRouter;

    beforeEach(async () => {
        location.hash = '/';
        router = new HashRouter(() => {});
        await router.setRoute('/');
    });

    afterEach(() => {
        router.destroy();
    });

    test('absolutePath normalizes the router path shape', () => {
        expect(absolutePath('editor/foo')).toBe('/editor/foo');
        expect(absolutePath('/settings/')).toBe('/settings');
        expect(absolutePath('/')).toBe('/');
    });

    test('requiresAuth matches a prefix and its descendants only', () => {
        expect(requiresAuth('/settings')).toBe(true);
        expect(requiresAuth('/editor/how-to')).toBe(true);
        expect(requiresAuth('/settings-personal')).toBe(false);
        expect(requiresAuth('/article/x')).toBe(false);
    });

    test('refuses an anonymous navigation to /settings and lands on /login', async () => {
        router.addInterceptor(new AuthRouterInterceptor(() => false));

        await router.setRoute('/settings');

        expect(router.route).toBe('/');
        await vi.waitFor(() => expect(location.hash).toBe('#/login'));
    });

    test('refuses an anonymous navigation to a guarded editor slug', async () => {
        router.addInterceptor(new AuthRouterInterceptor(() => false));

        await router.setRoute('/editor/how-to-conform');

        expect(router.route).toBe('/');
        await vi.waitFor(() => expect(location.hash).toBe('#/login'));
    });

    test('allows an authenticated navigation to the guarded routes', async () => {
        router.addInterceptor(new AuthRouterInterceptor(() => true));

        await router.setRoute('/settings');
        expect(router.route).toBe('/settings');

        await router.setRoute('/editor/how-to-conform');
        expect(router.route).toBe('/editor/how-to-conform');
    });

    test('leaves public routes untouched for an anonymous visitor', async () => {
        router.addInterceptor(new AuthRouterInterceptor(() => false));

        await router.setRoute('/article/how-to-conform');
        expect(router.route).toBe('/article/how-to-conform');

        await router.setRoute('/profile/alice');
        expect(router.route).toBe('/profile/alice');
    });

    test('a later allowed navigation clears any pending redirect', async () => {
        let authenticated = false;
        router.addInterceptor(new AuthRouterInterceptor(() => authenticated));

        await router.setRoute('/settings');
        await vi.waitFor(() => expect(location.hash).toBe('#/login'));

        authenticated = true;
        await router.setRoute('/settings');

        expect(router.route).toBe('/settings');
        // The refused navigation left nothing pending: the allowed one stays put.
        await vi.waitFor(() => expect(location.hash).toBe('#/settings'));
    });
});
