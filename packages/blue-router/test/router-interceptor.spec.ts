import { describe, test, expect, vi } from 'vitest';
import { PathRoute } from '../src/path-route';
import { MappedRouterInterceptor, RouterInterceptor } from '../src/router-interceptor';

describe('MappedRouterInterceptor', () => {
    test('it should match include patterns', () => {
        const interceptor: RouterInterceptor = { preHandle: () => true };
        const mapped = new MappedRouterInterceptor(interceptor, ['/users/*']);

        expect(mapped.matchesRoute(new PathRoute('/users/42'))).toBe(true);
        expect(mapped.matchesRoute(new PathRoute('/admin'))).toBe(false);
    });

    test('it should respect exclude patterns', () => {
        const interceptor: RouterInterceptor = { preHandle: () => true };
        const mapped = new MappedRouterInterceptor(interceptor, ['/users/**'], ['/users/private/**']);

        expect(mapped.matchesRoute(new PathRoute('/users/public/42'))).toBe(true);
        expect(mapped.matchesRoute(new PathRoute('/users/private/42'))).toBe(false);
    });

    test('it should match named patterns', () => {
        const interceptor: RouterInterceptor = { preHandle: () => true };
        const mapped = new MappedRouterInterceptor(interceptor, ['/users/:id/orders/{orderId}']);

        expect(mapped.matchesRoute(new PathRoute('/users/42/orders/abc'))).toBe(true);
        expect(mapped.matchesRoute(new PathRoute('/users/42/orders'))).toBe(false);
    });

    test('it should resolve route params for named patterns', () => {
        const interceptor: RouterInterceptor = { preHandle: () => true };
        const mapped = new MappedRouterInterceptor(interceptor, ['/teams/:teamId/users/{userId}']);
        const route = new PathRoute('/teams/77/users/21');

        const params = mapped.resolveRouteParams(route);

        expect(params).toBeTruthy();
        expect(params?.teamId).toBe('77');
        expect(params?.userId).toBe('21');
    });

    test('it should return null for non-named patterns', () => {
        const interceptor: RouterInterceptor = { preHandle: () => true };
        const mapped = new MappedRouterInterceptor(interceptor, ['/teams/*']);

        expect(mapped.resolveRouteParams(new PathRoute('/teams/77'))).toBe(null);
    });

    test('it should delegate preHandle and postHandle', async () => {
        const preHandle = vi.fn(() => true);
        const postHandle = vi.fn();
        const interceptor: RouterInterceptor = { preHandle, postHandle };
        const mapped = new MappedRouterInterceptor(interceptor, ['/users/*']);
        const route = new PathRoute('/users/42');

        expect(await mapped.preHandle(route)).toBe(true);
        await mapped.postHandle(route);

        expect(preHandle).toHaveBeenCalledTimes(1);
        expect(postHandle).toHaveBeenCalledTimes(1);
    });
});
