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
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        expect(router).toBeDefined();
        expect(router.destroyed).toBe(false);
        expect(router.route).toBeDefined();
    });

    test('it should have initial route', () => {
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        // Router should be initialized with current location hash or '/'
        expect(typeof router.route).toBe('string');
    });

    test('it should cleanup on destroy', () => {
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        expect(router.destroyed).toBe(false);

        router.destroy();

        expect(router.destroyed).toBe(true);

        // Calling destroy again should be safe
        router.destroy();
        expect(router.destroyed).toBe(true);
    });

    test('it should have a history', () => {
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        expect(router.history).toBeDefined();
        expect(router.history.length).toBeGreaterThan(0);
    });

    test('it should execute global middleware', () => {
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        const preRoute = vi.fn(() => true);
        const postRoute = vi.fn();
        const interceptor: RouterInterceptor = {
            preRoute,
            postRoute,
        };

        router.use(interceptor);
        router.setRoute('/foo');

        expect(preRoute).toHaveBeenCalledTimes(1);
        expect(postRoute).toHaveBeenCalledTimes(1);
    });

    test('it should execute mapped middleware only for matching routes', () => {
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        const preRoute = vi.fn(() => true);
        const interceptor: RouterInterceptor = {
            preRoute,
        };

        router.use('/users/*', interceptor);
        router.setRoute('/users/42');
        router.setRoute('/admin');

        expect(preRoute).toHaveBeenCalledTimes(1);
    });

    test('it should bind named route params during mapped middleware', () => {
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        let capturedParams: Record<string, string> | null = null;
        const interceptor: RouterInterceptor = {
            preRoute(route) {
                capturedParams = route.params as Record<string, string>;
                return true;
            },
        };

        router.use('/users/:userId/orders/{orderId}', interceptor);
        router.setRoute('/users/42/orders/abc');

        expect(capturedParams).toBeTruthy();
        expect(capturedParams?.userId).toBe('42');
        expect(capturedParams?.orderId).toBe('abc');
    });

    test('it should support function middleware shorthand', () => {
        const onComplete = () => {};
        router = new HashRouter(onComplete);

        const middleware = vi.fn((route: Route) => true);

        router.use('/teams/:teamId', middleware);
        router.setRoute('/teams/77');

        const firstCall = middleware.mock.calls.at(0);

        expect(middleware).toHaveBeenCalledTimes(1);
        expect(firstCall?.[0]?.params?.teamId).toBe('77');
    });
});
