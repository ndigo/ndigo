/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { PathViewController } from '../src/controller';

describe('PathViewController', () => {
    const route = { path: '/foo;a=1/bar;b=2?c=3' };
    let controller: PathViewController;

    afterEach(() => {
        controller = undefined as unknown as PathViewController;
    });

    beforeEach(() => {
        controller = new PathViewController();
    });

    test('it should handle routes', () => {
        const mav = controller.handleRoute(route);
        expect(mav).toHaveProperty('viewName');
        expect(mav.viewName).toBe('foo/bar');
    });

    test('it should cache results', () => {
        controller._viewNameCache.set(route.path, 'fuz');
        const mav = controller.handleRoute(route);
        expect(mav).toHaveProperty('viewName');
        expect(mav.viewName).toBe('fuz');
    });

    test('it should apply prefixes and suffixes', () => {
        controller.prefix = 'qux/';
        controller.suffix = '/baz';
        const mav = controller.handleRoute(route);
        expect(mav).toHaveProperty('viewName');
        expect(mav.viewName).toBe('qux/foo/bar/baz');
    });
});
