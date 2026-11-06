/**
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { HashRouter } from '../src/hash-router';
import { RouterInterceptor } from '@ndigo/router';
import { Route } from '@ndigo/router';

describe('HashRouter', () => {
    let router: HashRouter | undefined;

    beforeEach(() => {
        if (typeof location !== 'undefined') {
            location.hash = '';
        }
    });

    afterEach(() => {
        if (router) {
            router.destroy();
        }
    });

    test('it should create a HashRouter instance', () => {
        const onComplete = (_route: Route) => {};
        router = new HashRouter(onComplete);

        expect(router).toBeDefined();
        expect(router.destroyed).toBe(false);
        expect(router.route).toBeDefined();
    });

    test('it should have initial route', () => {
        const onComplete = (_route: Route) => {};
        router = new HashRouter(onComplete);

        // Router should be initialized with current location hash or '/'
        expect(typeof router.route).toBe('string');
    });

    test('it should cleanup on destroy', () => {
        const onComplete = (_route: Route) => {};
        router = new HashRouter(onComplete);

        expect(router.destroyed).toBe(false);

        router.destroy();

        expect(router.destroyed).toBe(true);

        // Calling destroy again should be safe
        router.destroy();
        expect(router.destroyed).toBe(true);
    });

    test('it should have a history', () => {
        const onComplete = (_route: Route) => {};
        router = new HashRouter(onComplete);

        expect(router.history).toBeDefined();
        expect(router.history.length).toBeGreaterThan(0);
    });

    test('it should execute global middleware', async () => {
        const onComplete = (_route: Route) => {};
        router = new HashRouter(onComplete);

        const preHandle = vi.fn(() => true);
        const postHandle = vi.fn();
        const interceptor: RouterInterceptor = {
            preHandle,
            postHandle,
        };

        router.use(interceptor);
        await router.setRoute('/foo');

        expect(preHandle).toHaveBeenCalledTimes(1);
        expect(postHandle).toHaveBeenCalledTimes(1);
    });

    test('it should execute mapped middleware only for matching routes', async () => {
        const onComplete = (_route: Route) => {};
        router = new HashRouter(onComplete);

        const preHandle = vi.fn(() => true);
        const interceptor: RouterInterceptor = {
            preHandle,
        };

        router.use('/users/*', interceptor);
        await router.setRoute('/users/42');
        await router.setRoute('/admin');

        expect(preHandle).toHaveBeenCalledTimes(1);
    });

    test('it should bind named route params during mapped middleware', async () => {
        const onComplete = (_route: Route) => {};
        router = new HashRouter(onComplete);

        let capturedParams: Record<string, string> | null = null;
        const interceptor: RouterInterceptor = {
            preHandle(route) {
                capturedParams = route.params as Record<string, string>;
                return true;
            },
        };

        router.use('/users/:userId/orders/{orderId}', interceptor);
        await router.setRoute('/users/42/orders/abc');

        expect(capturedParams).toBeTruthy();
        expect((capturedParams as unknown as Record<string, string>).userId).toBe('42');
        expect((capturedParams as unknown as Record<string, string>).orderId).toBe('abc');
    });

    test('it should support function middleware shorthand', async () => {
        const onComplete = (_route: Route) => {};
        router = new HashRouter(onComplete);

        const middleware = vi.fn((route: Route) => true);

        router.use('/teams/:teamId', middleware);
        await router.setRoute('/teams/77');

        const firstCall = middleware.mock.calls.at(0);

        expect(middleware).toHaveBeenCalledTimes(1);
        expect(firstCall?.[0]?.params?.teamId).toBe('77');
    });

    test('it should pass a Route object to callback', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);

        await router.setRoute('/users/42');

        const route = onComplete.mock.calls[0]?.[0] as Route;

        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(route).toBeTruthy();
        expect(route.path).toBe('users/42');
    });

    test('it should rollback when preHandle returns false', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);
        await router.setRoute('/original');

        const interceptor: RouterInterceptor = {
            preHandle: () => false,
        };

        router.use(interceptor);
        await router.setRoute('/blocked');

        expect(router.route).toBe('/original');
        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('it should process private routes', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);
        const initialHash = location.hash;

        await router.setRoute('/private-route', false);

        expect(router.route).toBe('/private-route');
        expect(location.hash).toBe(initialHash);
        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('it should rollback private route rejection to last public route', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);

        await router.setRoute('/public-1');
        const hashAfterPublic = location.hash;

        await router.setRoute('/private-1', false);

        router.use({ preHandle: () => false });
        await router.setRoute('/private-2', false);

        expect(router.route).toBe('/private-1');
        expect(location.hash).toBe(hashAfterPublic);
    });

    test('it should refresh current route without changing history', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);

        await router.setRoute('/users/42');

        const before = router.history.length;
        const firstCallRoute = onComplete.mock.calls[0]?.[0] as Route;

        router.refresh();

        const secondCallRoute = onComplete.mock.calls[1]?.[0] as Route;

        expect(onComplete).toHaveBeenCalledTimes(2);
        expect(secondCallRoute).toBe(firstCallRoute);
        expect(router.history.length).toBe(before);
    });

    test('it should sync the URL hash on a successful public route change', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);

        await router.setRoute('/foo');

        expect(router.route).toBe('/foo');
        expect(location.hash).toBe('#/foo');
    });

    test('it should sync the URL hash when navigating', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);

        await router.navigate('/bar');

        expect(router.route).toBe('/bar');
        expect(location.hash).toBe('#/bar');
    });

    test('it should restore the hash when a public route change is rejected', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);
        await router.setRoute('/original');

        expect(location.hash).toBe('#/original');

        router.use({ preHandle: () => false });
        await router.setRoute('/blocked');

        expect(router.route).toBe('/original');
        expect(location.hash).toBe('#/original');
    });

    test('it should ignore its own hashchange echo while still dispatching external changes', async () => {
        // Flush any hashchange event left pending by the shared jsdom location before wiring listeners.
        const { promise: hashChangeFlushed, resolve: flushHashChange } = Promise.withResolvers<void>();
        setTimeout(flushHashChange, 50);
        await hashChangeFlushed;

        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);

        const preHandle = vi.fn(() => true);
        router.use({ preHandle });

        const hashChangeSeen = vi.fn();
        window.addEventListener('hashchange', hashChangeSeen);

        await router.navigate('/synced');
        expect(location.hash).toBe('#/synced');

        // The echo of the write above must not run the pipeline a second time.
        await vi.waitFor(() => expect(hashChangeSeen).toHaveBeenCalled());
        expect(router.route).toBe('/synced');
        expect(preHandle).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledTimes(1);

        // External hash changes keep dispatching.
        location.hash = '/external';
        await vi.waitFor(() => expect(router?.route).toBe('/external'));
        expect(preHandle).toHaveBeenCalledTimes(2);
        expect(onComplete).toHaveBeenCalledTimes(2);

        window.removeEventListener('hashchange', hashChangeSeen);
    });

    test('it should roll back the in-memory route when postHandle throws (PWB-REV-002)', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        const onError = vi.fn();
        router = new HashRouter(onComplete, { onError });

        await router.setRoute('/original');
        onComplete.mockClear();

        const afterCompletion = vi.fn();
        router.use({
            preHandle: () => true,
            postHandle: () => {
                throw new Error('postHandle boom');
            },
            afterCompletion,
        });

        await expect(router.setRoute('/next')).resolves.toBeUndefined();

        expect(afterCompletion).toHaveBeenCalledTimes(1);
        expect(router.route).toBe('/original');
        expect(onComplete).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
    });

    test('it should not reject when afterCompletion throws (PWB-REV-015)', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        const onError = vi.fn();
        router = new HashRouter(onComplete, { onError });

        router.use({
            preHandle: () => true,
            afterCompletion: () => {
                throw new Error('afterCompletion boom');
            },
        });

        await expect(router.setRoute('/x')).resolves.toBeUndefined();

        expect(onError).toHaveBeenCalledTimes(1);
        const captured = onError.mock.calls[0]?.[0] as Error | undefined;
        expect(captured?.message).toBe('afterCompletion boom');
    });

    test('it should not re-dispatch the restored route after a rejected external navigation (PWB-REV-003)', async () => {
        // Flush any hashchange event left pending by the shared jsdom location
        // before wiring the listener (otherwise it dispatches into the router).
        const { promise: flushed, resolve: flush } = Promise.withResolvers<void>();
        setTimeout(flush, 50);
        await flushed;

        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);

        await router.setRoute('/original');
        onComplete.mockClear();

        const preHandle = vi.fn(() => false);
        router.use({ preHandle });

        location.hash = '/blocked';
        await vi.waitFor(() => expect(preHandle).toHaveBeenCalled());

        // Give any un-suppressed rollback echo time to re-run the pipeline.
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(preHandle).toHaveBeenCalledTimes(1);
        expect(onComplete).not.toHaveBeenCalled();
        expect(router.route).toBe('/original');
        expect(location.hash).toBe('#/original');
    });

    test('it should serialize concurrent navigations, last one winning (PWB-REV-005)', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);

        const { promise: gate, resolve: release } = Promise.withResolvers<void>();
        const preHandle = vi.fn(async (route: Route) => {
            if (route.path === 'a') {
                await gate;
            }
            return true;
        });
        router.use({ preHandle });

        const first = router.setRoute('/a');
        const second = router.setRoute('/b');

        // The first navigation is held at its gate; the second must wait.
        await vi.waitFor(() => expect(preHandle).toHaveBeenCalledTimes(1));
        release();
        await Promise.all([first, second]);

        expect(router.route).toBe('/b');
        expect(onComplete).toHaveBeenCalledTimes(2);
    });
});
