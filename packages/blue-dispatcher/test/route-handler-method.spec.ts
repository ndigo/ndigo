/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { RouteHandlerMethod } from '../src/route-handler-method';

describe('RouteHandlerMethod', () => {
    const foobar = { foo: () => true, bar: () => false };

    test('it should initialize with a handler', () => {
        const foo = new RouteHandlerMethod(foobar, 'foo'),
            bar = new RouteHandlerMethod(foobar, 'bar');
        expect(foo.invoke()).toBe(true);
        expect(bar.invoke()).toBe(false);
    });
});
