import { describe, test, expect, beforeEach } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { NodeCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';
import { NODE_REQUEST_ATTRIBUTE, NodeRequest } from '../src/node-request';

// Route helper with NodeRequest in attributes:
function makeRoute(req: Partial<NodeRequest> = {}): Route {
    return {
        data: {},
        params: {},
        path: '/',
        raw: '/',
        id: 'test',
        length: 0,
        attributes: { [NODE_REQUEST_ATTRIBUTE]: { headers: {}, body: {}, cookies: {}, session: {}, ...req } },
    };
}

describe('NodeCookieValueMethodArgumentResolver', () => {
    let resolver: NodeCookieValueMethodArgumentResolver;
    beforeEach(() => {
        resolver = new NodeCookieValueMethodArgumentResolver();
    });

    describe('supportsParameter', () => {
        test('should return true for COOKIE parameter type', () => {
            const param = new MethodParameter(MethodParameterType.COOKIE, 'test');
            expect(resolver.supportsParameter(param)).toBe(true);
        });

        test('should return false for non-COOKIE parameter types', () => {
            const param = new MethodParameter(MethodParameterType.QUERY, 'test');
            expect(resolver.supportsParameter(param)).toBe(false);

            const param2 = new MethodParameter(MethodParameterType.PATH, 'test');
            expect(resolver.supportsParameter(param2)).toBe(false);
        });
    });

    describe('resolveArgument', () => {
        test('should resolve named value from route.cookies', () => {
            const route = makeRoute({
                cookies: { session: 'abc123' },
            });

            const param = new MethodParameter(MethodParameterType.COOKIE, 'session');
            expect(resolver.resolveArgument(param, route, {})).toBe('abc123');
        });

        test('should return default value when source value is absent', () => {
            const route = makeRoute({
                cookies: {},
            });

            const param = new MethodParameter(MethodParameterType.COOKIE, 'session', false, 'default');
            expect(resolver.resolveArgument(param, route, {})).toBe('default');
        });

        test('should throw when required parameter is absent', () => {
            const route = makeRoute({
                cookies: {},
            });

            const param = new MethodParameter(MethodParameterType.COOKIE, 'session', true);
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(TypeError);
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(/"session" cannot be undefined or null/);
        });

        test('should apply type-based conversion when convertType is provided', () => {
            const route = makeRoute({
                cookies: { age: '25' },
            });

            const param = new MethodParameter(MethodParameterType.COOKIE, 'age', false, undefined, {
                source: String,
                target: Number,
            });
            expect(resolver.resolveArgument(param, route, {})).toBe(25);
        });

        test('should handle boolean conversion when convertType is provided', () => {
            const route = makeRoute({
                cookies: { active: 'true' },
            });

            const param = new MethodParameter(MethodParameterType.COOKIE, 'active', false, undefined, {
                source: String,
                target: Boolean,
            });
            expect(resolver.resolveArgument(param, route, {})).toBe(true);
        });

        test('should handle missing route.cookies gracefully', () => {
            const route = makeRoute({});

            const param = new MethodParameter(MethodParameterType.COOKIE, 'session', false, 'default');
            expect(resolver.resolveArgument(param, route, {})).toBe('default');
        });
    });
});
