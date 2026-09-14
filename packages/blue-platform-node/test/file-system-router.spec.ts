/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { FileSystemRouter } from '../src/file-system-router';

describe('FileSystemRouter', () => {
    test('creates a router with default route', () => {
        const callback = vi.fn();
        const router = new FileSystemRouter(callback);

        expect(router.route).toBe('/');
        expect(router.callback).toBe(callback);
    });

    test('navigate updates the route and calls refresh', () => {
        const callback = vi.fn();
        const router = new FileSystemRouter(callback);

        router.navigate('/users');

        expect(router.route).toBe('/users');
        // refresh() invokes the callback
        expect(callback).toHaveBeenCalled();
    });

    test('navigate sets route and fires callback with PathRoute', () => {
        const callback = vi.fn();
        const router = new FileSystemRouter(callback);
        callback.mockClear();

        router.navigate('/about');

        expect(callback).toHaveBeenCalledTimes(1);
        const routeArg = callback.mock.calls[0][0];
        // Route string keeps the path; PathRoute.path normalizes the leading slash
        expect(router.route).toBe('/about');
        expect(routeArg.path).toBe('about');
    });
});
