import { RouteHandlerMethod } from '../src/route-handler-method';

const { expect } = require('chai');

describe('RouteHandlerMethod', function () {
    const foobar = { foo: () => true, bar: () => false };

    test('it should initialize with a handler', function () {
        const foo = new RouteHandlerMethod(foobar, 'foo'),
            bar = new RouteHandlerMethod(foobar, 'bar');
        expect(foo.invoke()).toBe(true);
        expect(bar.invoke()).toBe(false);
    });
});
