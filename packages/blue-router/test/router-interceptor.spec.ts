import { describe, test, expect, vi } from 'vitest';
import { PathRoute } from '../src/path-route';
import { MappedRouterInterceptor, RouterInterceptor } from '../src/router-interceptor';

describe('MappedRouterInterceptor', () => {
    test('it should match include patterns', () => {
        const interceptor: RouterInterceptor = { preRoute: () => true };
        const mapped = new MappedRouterInterceptor(interceptor, ['/users/*']);

        expect(mapped.matchesRoute(new PathRoute('/users/42'))).toBe(true);
        expect(mapped.matchesRoute(new PathRoute('/admin'))).toBe(false);
    });

    test('it should respect exclude patterns', () => {
        const interceptor: RouterInterceptor = { preRoute: () => true };
        const mapped = new MappedRouterInterceptor(interceptor, ['/users/**'], ['/users/private/**']);

        expect(mapped.matchesRoute(new PathRoute('/users/public/42'))).toBe(true);
        expect(mapped.matchesRoute(new PathRoute('/users/private/42'))).toBe(false);
    });

    test('it should match named patterns', () => {
        const interceptor: RouterInterceptor = { preRoute: () => true };
        const mapped = new MappedRouterInterceptor(interceptor, ['/users/:id/orders/{orderId}']);

        expect(mapped.matchesRoute(new PathRoute('/users/42/orders/abc'))).toBe(true);
        expect(mapped.matchesRoute(new PathRoute('/users/42/orders'))).toBe(false);
    });

    test('it should resolve route params for named patterns', () => {
        const interceptor: RouterInterceptor = { preRoute: () => true };
        const mapped = new MappedRouterInterceptor(interceptor, ['/teams/:teamId/users/{userId}']);
        const route = new PathRoute('/teams/77/users/21');

        const params = mapped.resolveRouteParams(route);

        expect(params).toBeTruthy();
        expect(params?.teamId).toBe('77');
        expect(params?.userId).toBe('21');
    });

    test('it should return null for non-named patterns', () => {
        const interceptor: RouterInterceptor = { preRoute: () => true };
        const mapped = new MappedRouterInterceptor(interceptor, ['/teams/*']);

        expect(mapped.resolveRouteParams(new PathRoute('/teams/77'))).toBe(null);
    });

    test('it should delegate preRoute and postRoute', async () => {
        const preRoute = vi.fn(() => true);
        const postRoute = vi.fn();
        const interceptor: RouterInterceptor = { preRoute, postRoute };
        const mapped = new MappedRouterInterceptor(interceptor, ['/users/*']);
        const route = new PathRoute('/users/42');

        expect(await mapped.preRoute(route)).toBe(true);
        await mapped.postRoute(route);

        expect(preRoute).toHaveBeenCalledTimes(1);
        expect(postRoute).toHaveBeenCalledTimes(1);
    });
});
