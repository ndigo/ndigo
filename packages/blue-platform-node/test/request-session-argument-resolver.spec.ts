/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { MissingParameterError, MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { NodeRequestSessionValueMethodArgumentResolver } from '../src/request-session-argument-resolver';
import { NODE_REQUEST_ATTRIBUTE } from '../src/node-request';

/** Builds a route carrying a NodeRequest with the given session bag. */
function makeRoute(session: Record<string, unknown>): Route {
    return {
        data: {},
        params: null,
        path: '/',
        raw: '/',
        id: 'test',
        length: 0,
        attributes: { [NODE_REQUEST_ATTRIBUTE]: { session } },
    } as unknown as Route;
}

describe('NodeRequestSessionValueMethodArgumentResolver', () => {
    test('supports REQUEST_SESSION parameters', () => {
        const resolver = new NodeRequestSessionValueMethodArgumentResolver();
        const param = new MethodParameter(MethodParameterType.REQUEST_SESSION, 'userId');

        expect(resolver.supportsParameter(param)).toBe(true);
    });

    test('requestSessionValue() with no name binds the whole session bag', () => {
        const resolver = new NodeRequestSessionValueMethodArgumentResolver();
        const route = makeRoute({ userId: 123, theme: 'dark' });
        const param = new MethodParameter(MethodParameterType.REQUEST_SESSION, '');

        expect(resolver.resolveArgument(param, route, {})).toEqual({ userId: 123, theme: 'dark' });
    });

    test('does not support non-REQUEST_SESSION parameter types', () => {
        const resolver = new NodeRequestSessionValueMethodArgumentResolver();
        expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.QUERY, 'userId'))).toBe(false);
        // The old unified session type is gone — session storage is a browser source.
        expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.SESSION_STORAGE, 'userId'))).toBe(
            false
        );
    });

    test('resolves request session values by name', () => {
        const resolver = new NodeRequestSessionValueMethodArgumentResolver();
        const route = makeRoute({ userId: 123 });
        const param = new MethodParameter(MethodParameterType.REQUEST_SESSION, 'userId');

        expect(resolver.resolveArgument(param, route, {})).toBe(123);
    });

    test('resolves dotted keys by walking the session bag (nested-capable, D-2)', () => {
        const resolver = new NodeRequestSessionValueMethodArgumentResolver();
        const route = makeRoute({ profile: { name: 'Jeff' } });
        const param = new MethodParameter(MethodParameterType.REQUEST_SESSION, 'profile.name');

        expect(resolver.resolveArgument(param, route, {})).toBe('Jeff');
    });

    test('applies default value when session value is missing', () => {
        const resolver = new NodeRequestSessionValueMethodArgumentResolver();
        const route = makeRoute({});
        const param = new MethodParameter(MethodParameterType.REQUEST_SESSION, 'userId', false, 'default');

        expect(resolver.resolveArgument(param, route, {})).toBe('default');
    });

    test('throws when required session value is missing', () => {
        const resolver = new NodeRequestSessionValueMethodArgumentResolver();
        const route = makeRoute({});
        const param = new MethodParameter(MethodParameterType.REQUEST_SESSION, 'userId', true);

        expect(() => resolver.resolveArgument(param, route, {})).toThrow(MissingParameterError);
        expect(() => resolver.resolveArgument(param, route, {})).toThrow(/parameter 'userId' is missing/);
    });

    test('applies type-based conversion when convertType is provided', () => {
        const resolver = new NodeRequestSessionValueMethodArgumentResolver();
        const route = makeRoute({ age: '25' });
        const param = new MethodParameter(MethodParameterType.REQUEST_SESSION, 'age', false, undefined, {
            source: String,
            target: Number,
        });

        expect(resolver.resolveArgument(param, route, {})).toBe(25);
    });

    test('applies boolean conversion when convertType is provided', () => {
        const resolver = new NodeRequestSessionValueMethodArgumentResolver();
        const route = makeRoute({ active: 'true' });
        const param = new MethodParameter(MethodParameterType.REQUEST_SESSION, 'active', false, undefined, {
            source: String,
            target: Boolean,
        });

        expect(resolver.resolveArgument(param, route, {})).toBe(true);
    });

    test('uses default value when no request is attached to the route', () => {
        const resolver = new NodeRequestSessionValueMethodArgumentResolver();
        const route = { data: {}, params: null, path: '/', raw: '/', id: 'test', length: 0, attributes: {} };
        const param = new MethodParameter(MethodParameterType.REQUEST_SESSION, 'userId', false, 'default');

        expect(resolver.resolveArgument(param, route as unknown as Route, {})).toBe('default');
    });
});
