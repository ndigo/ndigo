import { PathViewController } from '../src/controller';

describe('PathViewController', function () {
    const route = { path: '/foo;a=1/bar;b=2?c=3' };
    let controller;

    afterEach(function () {
        controller = undefined;
    });

    beforeEach(function () {
        controller = new PathViewController();
    });

    test('it should handle routes', function () {
        const mav = controller.handleRoute(route);
        expect(mav).toHaveProperty('viewName').that.equals('foo/bar');
    });

    test('it should cache results', function () {
        controller._viewNameCache.set(route.path, 'fuz');
        const mav = controller.handleRoute(route);
        expect(mav).toHaveProperty('viewName').that.equals('fuz');
    });

    test('it should apply prefixes and suffixes', function () {
        controller.prefix = 'qux/';
        controller.suffix = '/baz';
        const mav = controller.handleRoute(route);
        expect(mav).toHaveProperty('viewName').that.equals('qux/foo/bar/baz');
    });
});
