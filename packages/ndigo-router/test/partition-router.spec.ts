/**
 */
import { describe, expect, test, vi } from 'vitest';
import { PathRoute } from '../src/path-route';
import { PartitionRouter } from '../src/partition-router';
import { restorePartitionPrefix } from '../src/route-partition';

describe('PartitionRouter', () => {
    test('it should route partitioned paths to mounted feature callback', () => {
        const todoCallback = vi.fn();
        const accountCallback = vi.fn();
        const router = new PartitionRouter();

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
        const router = new PartitionRouter();

        router.mount('/todo', todoCallback);
        router.navigate('/todo');

        const route = todoCallback.mock.calls[0]?.[0];
        expect(route.toString()).toBe('/');
    });

    test('it should return false when no mount matches', () => {
        const todoCallback = vi.fn();
        const router = new PartitionRouter();

        router.mount('/todo', todoCallback);

        const handled = router.navigate('/reports/summary');

        expect(handled).toBe(false);
        expect(todoCallback).not.toHaveBeenCalled();
    });

    test('it should use current route on refresh', () => {
        const todoCallback = vi.fn();
        const router = new PartitionRouter();

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

    test('it should unmount a mounted prefix', () => {
        const todoCallback = vi.fn();
        const accountCallback = vi.fn();
        const router = new PartitionRouter();

        router.mount('/todo', todoCallback);
        router.mount('/account', accountCallback);

        expect(router.unmount('/todo')).toBe(true);
        expect(router.navigate('/todo/active')).toBe(false);
        expect(todoCallback).not.toHaveBeenCalled();
        expect(router.navigate('/account')).toBe(true);

        expect(router.unmount('/account')).toBe(true);
        expect(router.unmount('/account')).toBe(false);
        expect(router.navigate('/account')).toBe(false);
    });

    test('it should normalize prefixes on unmount', () => {
        const router = new PartitionRouter();

        router.mount('/todo', vi.fn());
        expect(router.unmount('todo')).toBe(true);
        expect(router.unmount('todo')).toBe(false);
    });

    test('it should reject a duplicate normalized prefix at mount (HT-10)', () => {
        const todoCallback = vi.fn();
        const router = new PartitionRouter();

        router.mount('/todo', todoCallback);
        expect(() => router.mount('todo', vi.fn())).toThrowError("A feature is already mounted at prefix '/todo'");

        // The original mount is intact and still the only one: unmounting it
        // cannot take a sibling with it.
        expect(router.navigate('/todo/active')).toBe(true);
        expect(todoCallback).toHaveBeenCalledTimes(1);
        expect(router.unmount('/todo')).toBe(true);
        expect(router.navigate('/todo/active')).toBe(false);
    });
});
