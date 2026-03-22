import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import HashRouter from '../src/hash-router';
import { RouterInterceptor } from '../src/router-interceptor';
import { Route } from '../src/route';

describe('HashRouter', () => {
    let router: HashRouter | undefined;

    beforeEach(() => {
        if (typeof location !== 'undefined') {
            location.hash = '';
        }
    });

    afterEach(() => {
        router && router.destroy();
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

        const preRoute = vi.fn(() => true);
        const postRoute = vi.fn();
        const interceptor: RouterInterceptor = {
            preRoute,
            postRoute,
        };

        router.use(interceptor);
        await router.setRoute('/foo');

        expect(preRoute).toHaveBeenCalledTimes(1);
        expect(postRoute).toHaveBeenCalledTimes(1);
    });

    test('it should execute mapped middleware only for matching routes', async () => {
        const onComplete = (_route: Route) => {};
        router = new HashRouter(onComplete);

        const preRoute = vi.fn(() => true);
        const interceptor: RouterInterceptor = {
            preRoute,
        };

        router.use('/users/*', interceptor);
        await router.setRoute('/users/42');
        await router.setRoute('/admin');

        expect(preRoute).toHaveBeenCalledTimes(1);
    });

    test('it should bind named route params during mapped middleware', async () => {
        const onComplete = (_route: Route) => {};
        router = new HashRouter(onComplete);

        let capturedParams: Record<string, string> | null = null;
        const interceptor: RouterInterceptor = {
            preRoute(route) {
                capturedParams = route.params as Record<string, string>;
                return true;
            },
        };

        router.use('/users/:userId/orders/{orderId}', interceptor);
        await router.setRoute('/users/42/orders/abc');

        expect(capturedParams).toBeTruthy();
        expect(capturedParams?.userId).toBe('42');
        expect(capturedParams?.orderId).toBe('abc');
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

    test('it should rollback when preRoute returns false', async () => {
        const onComplete = vi.fn((_route: Route) => null);
        router = new HashRouter(onComplete);
        await router.setRoute('/original');

        const interceptor: RouterInterceptor = {
            preRoute: () => false,
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

        router.use({ preRoute: () => false });
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
});
