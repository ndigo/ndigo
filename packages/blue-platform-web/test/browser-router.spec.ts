import { describe, test, expect, vi, afterEach, beforeAll } from 'vitest';
import { BrowserRouter } from '../src/browser-router';

describe('BrowserRouter', () => {
    let callback: ReturnType<typeof vi.fn>;

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
        callback = vi.fn();
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
});
