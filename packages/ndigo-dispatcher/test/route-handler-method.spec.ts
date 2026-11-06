/**
 */
import { describe, test, expect } from 'vitest';
import { RouteHandlerMethod } from '../src/route-handler-method';
import { Route } from '@ndigo/router';

describe('RouteHandlerMethod', () => {
    const foobar = { foo: () => true, bar: () => false },
        route = {} as unknown as Route;

    test('it should initialize with a handler', () => {
        const foo = new RouteHandlerMethod(foobar, 'foo'),
            bar = new RouteHandlerMethod(foobar, 'bar');
        expect(foo.invoke(route)).toBe(true);
        expect(bar.invoke(route)).toBe(false);
    });
});
