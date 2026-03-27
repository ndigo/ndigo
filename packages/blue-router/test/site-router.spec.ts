import { describe, expect, test, vi } from 'vitest';
import { PathRoute } from '../src/path-route';
import { SiteRouter } from '../src/site-router';
import { restorePartitionPrefix } from '../src/route-partition';

describe('SiteRouter', () => {
    test('it should route partitioned paths to mounted feature callback', () => {
        const todoCallback = vi.fn();
        const accountCallback = vi.fn();
        const router = new SiteRouter();

        router.mount('/todo', todoCallback);
        router.mount('/account', accountCallback);

        const handled = router.navigate('/todo/active');

        expect(handled).toBe(true);
        expect(todoCallback).toHaveBeenCalledTimes(1);
        expect(accountCallback).not.toHaveBeenCalled();

        const route = todoCallback.mock.calls[0]?.[0];
        expect(route).toBeInstanceOf(PathRoute);
        expect(route.toString()).toBe('/active');
    });

    test('it should pass root feature path when navigating to feature prefix', () => {
        const todoCallback = vi.fn();
        const router = new SiteRouter();

        router.mount('/todo', todoCallback);
        router.navigate('/todo');

        const route = todoCallback.mock.calls[0]?.[0];
        expect(route.toString()).toBe('/');
    });

    test('it should return false when no mount matches', () => {
        const todoCallback = vi.fn();
        const router = new SiteRouter();

        router.mount('/todo', todoCallback);

        const handled = router.navigate('/reports/summary');

        expect(handled).toBe(false);
        expect(todoCallback).not.toHaveBeenCalled();
    });

    test('it should use current route on refresh', () => {
        const todoCallback = vi.fn();
        const router = new SiteRouter();

        router.mount('/todo', todoCallback);
        router.navigate('/todo/completed');
        router.refresh();

        expect(todoCallback).toHaveBeenCalledTimes(2);
        const refreshedRoute = todoCallback.mock.calls[1]?.[0];
        expect(refreshedRoute.toString()).toBe('/completed');
    });

    test('it should restore shell route from feature-local path', () => {
        expect(restorePartitionPrefix('/active', '/todo')).toBe('/todo/active');
    });
});
