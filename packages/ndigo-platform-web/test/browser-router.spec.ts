/**
 */
import { describe, test, expect, vi, afterEach, beforeAll, type Mock } from 'vitest';
import { BrowserRouter } from '../src/browser-router';
import { Route, RouterInterceptor, RouterCallback } from '@ndigo/router';

describe('BrowserRouter', () => {
    let callback: Mock<RouterCallback>;

    beforeAll(() => {
        // jsdom doesn't provide full History API — stub what we need
        vi.stubGlobal('history', {
            pushState: vi.fn(),
            replaceState: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            go: vi.fn(),
            length: 1,
            state: null,
            scrollRestoration: 'auto' as ScrollRestoration,
        });
        vi.stubGlobal('addEventListener', vi.fn());
        vi.stubGlobal('removeEventListener', vi.fn());

        // Ensure window.location is available (jsdom provides it)
        Object.defineProperty(window, 'location', {
            value: { pathname: '/', search: '', href: 'http://localhost/' },
            configurable: true,
            writable: true,
        });
    });

    beforeEach(() => {
        callback = vi.fn<RouterCallback>();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('creates a router with the current path', () => {
        const router = new BrowserRouter(callback);
        expect(router.route).toBe('/');
        expect(router.destroyed).toBe(false);
        router.destroy();
    });

    test('navigate updates the route and calls callback', async () => {
        const router = new BrowserRouter(callback);
        await router.navigate('/test-path');

        expect(callback).toHaveBeenCalled();
        expect(router.route).toBe('/test-path');
        router.destroy();
    });

    test('navigate calls history.pushState for public routes', async () => {
        const router = new BrowserRouter(callback);
        const pushStateSpy = vi.spyOn(history, 'pushState');

        await router.navigate('/about');

        expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/about');
        router.destroy();
    });

    test('setRoute with isPublic=false does not call pushState', async () => {
        const router = new BrowserRouter(callback);
        const pushStateSpy = vi.spyOn(history, 'pushState');

        await router.setRoute('/private', false);

        expect(pushStateSpy).not.toHaveBeenCalled();
        expect(router.route).toBe('/private');
        router.destroy();
    });

    test('destroy removes popstate listener', () => {
        const router = new BrowserRouter(callback);
        router.destroy();

        expect(router.destroyed).toBe(true);
        expect(removeEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    });

    test('refresh invokes callback with current route', () => {
        const router = new BrowserRouter(callback);
        callback.mockClear();

        router.refresh();

        expect(callback).toHaveBeenCalled();
        router.destroy();
    });

    test('runs preHandle, postHandle, and afterCompletion around a committed route', async () => {
        const router = new BrowserRouter(callback);
        const events: string[] = [];
        const routeSeenByPostHandle: string[] = [];

        router.use({
            preHandle: () => {
                events.push('pre-global');
                return true;
            },
            postHandle: () => {
                events.push('post-global');
                routeSeenByPostHandle.push(router.route);
            },
            afterCompletion: () => {
                events.push('complete-global');
            },
        });
        router.use('/admin/*', {
            preHandle: () => {
                events.push('pre-mapped');
                return true;
            },
            postHandle: () => {
                events.push('post-mapped');
            },
            afterCompletion: () => {
                events.push('complete-mapped');
            },
        });

        await router.setRoute('/admin/report');

        expect(events).toEqual([
            'pre-global',
            'pre-mapped',
            'post-mapped',
            'post-global',
            'complete-mapped',
            'complete-global',
        ]);
        expect(routeSeenByPostHandle).toEqual(['/admin/report']);
        router.destroy();
    });

    test('binds named route params for mapped interceptors', async () => {
        const router = new BrowserRouter(callback);
        let capturedParams: Record<string, string> | null = null;

        router.use('/users/:userId/orders/{orderId}', {
            preHandle(route: Route) {
                capturedParams = route.params as Record<string, string>;
                return true;
            },
        });

        await router.setRoute('/users/42/orders/abc');

        expect(capturedParams).toBeTruthy();
        expect((capturedParams as unknown as Record<string, string>).userId).toBe('42');
        expect((capturedParams as unknown as Record<string, string>).orderId).toBe('abc');
        router.destroy();
    });

    test('unwinds afterCompletion for accepted interceptors when a route is rejected', async () => {
        const router = new BrowserRouter(callback);
        await router.setRoute('/original');
        callback.mockClear();

        const events: string[] = [];
        const accepted: RouterInterceptor = {
            preHandle: () => {
                events.push('pre-accepted');
                return true;
            },
            postHandle: () => {
                events.push('post-accepted');
            },
            afterCompletion: () => {
                events.push('complete-accepted');
            },
        };
        const rejected: RouterInterceptor = {
            preHandle: () => {
                events.push('pre-rejected');
                return false;
            },
            postHandle: () => {
                events.push('post-rejected');
            },
            afterCompletion: () => {
                events.push('complete-rejected');
            },
        };

        router.use(accepted);
        router.use(rejected);

        await router.setRoute('/blocked');

        expect(events).toEqual(['pre-accepted', 'pre-rejected', 'complete-accepted']);
        expect(router.route).toBe('/original');
        expect(callback).not.toHaveBeenCalled();
        router.destroy();
    });

    test('restores the route and runs afterCompletion when postHandle throws', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const router = new BrowserRouter(callback);
        await router.setRoute('/original');
        callback.mockClear();

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
        expect(callback).not.toHaveBeenCalled();
        // The failure is surfaced rather than silently swallowed.
        expect(errorSpy).toHaveBeenCalledTimes(1);
        errorSpy.mockRestore();
        router.destroy();
    });

    test('a rejected private navigation restores the pre-call route, not the last public route (PWB-REV-004)', async () => {
        const router = new BrowserRouter(callback);
        await router.setRoute('/public');
        await router.setRoute('/private-1', false);

        router.use({ preHandle: () => false });
        await router.setRoute('/private-2', false);

        expect(router.route).toBe('/private-1');
        router.destroy();
    });

    test('surfaces pipeline failures through the onError hook (PWB-REV-015)', async () => {
        const onError = vi.fn();
        const router = new BrowserRouter(callback, { onError });
        await router.setRoute('/original');

        router.use({
            preHandle: () => true,
            postHandle: () => {
                throw new Error('postHandle boom');
            },
        });

        await router.setRoute('/next');

        expect(onError).toHaveBeenCalledTimes(1);
        const captured = onError.mock.calls[0]?.[0] as Error | undefined;
        expect(captured?.message).toBe('postHandle boom');
        expect(router.route).toBe('/original');
        router.destroy();
    });

    test('serializes concurrent navigations, last one winning (PWB-REV-005)', async () => {
        const router = new BrowserRouter(callback);
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

        await vi.waitFor(() => expect(preHandle).toHaveBeenCalledTimes(1));
        release();
        await Promise.all([first, second]);

        expect(router.route).toBe('/b');
        expect(callback).toHaveBeenCalledTimes(2);
        router.destroy();
    });
});
