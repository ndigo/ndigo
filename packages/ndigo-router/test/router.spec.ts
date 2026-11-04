/**
 * @module ndigo-router
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import { ROUTER } from '../src/context-tokens';
import { AbstractRouter, RouterCallback } from '../src/router';
import { PathRoute } from '../src/path-route';

class TestRouter extends AbstractRouter {
    readonly callback: RouterCallback;
    #route: string;

    constructor(callback: RouterCallback, route: string) {
        super();
        this.callback = callback;
        this.#route = route;
    }

    get route(): string {
        return this.#route;
    }
}

describe('AbstractRouter', () => {
    test('it should provide ROUTER context token', () => {
        expect(ROUTER.description).toBe('router');
    });

    test('it should refresh current route with a new PathRoute', () => {
        const callback = vi.fn();
        const router = new TestRouter(callback, '/users/42');

        router.refresh();

        expect(callback).toHaveBeenCalledTimes(1);
        const route = callback.mock.calls[0]?.[0];
        expect(route).toBeInstanceOf(PathRoute);
        expect(route.toString()).toBe('/users/42');
    });

    test('it should skip refresh when current route is empty', () => {
        const callback = vi.fn();
        const router = new TestRouter(callback, '');

        router.refresh();

        expect(callback).not.toHaveBeenCalled();
    });
});
