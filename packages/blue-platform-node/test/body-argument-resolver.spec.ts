import { describe, test, expect, beforeEach } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { NodeBodyValueMethodArgumentResolver } from '../src/body-argument-resolver';
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

describe('NodeBodyValueMethodArgumentResolver', () => {
    let resolver: NodeBodyValueMethodArgumentResolver;
    beforeEach(() => {
        resolver = new NodeBodyValueMethodArgumentResolver();
    });

    describe('supportsParameter', () => {
        test('should return true for BODY parameter type', () => {
            const param = new MethodParameter(MethodParameterType.BODY, 'test');
            expect(resolver.supportsParameter(param)).toBe(true);
        });

        test('should return false for non-BODY parameter types', () => {
            const param = new MethodParameter(MethodParameterType.QUERY, 'test');
            expect(resolver.supportsParameter(param)).toBe(false);

            const param2 = new MethodParameter(MethodParameterType.PATH, 'test');
            expect(resolver.supportsParameter(param2)).toBe(false);
        });
    });

    describe('resolveArgument', () => {
        test('should resolve named value from route.body', () => {
            const route = makeRoute({
                body: { name: 'John' },
            });

            const param = new MethodParameter(MethodParameterType.BODY, 'name');
            expect(resolver.resolveArgument(param, route, {})).toBe('John');
        });

        test('should return entire body when name is "*"', () => {
            const bodyData = { name: 'John', age: 30 };
            const route = makeRoute({
                body: bodyData,
            });

            const param = new MethodParameter(MethodParameterType.BODY, '*');
            expect(resolver.resolveArgument(param, route, {})).toBe(bodyData);
        });

        test('should return default value when source value is absent', () => {
            const route = makeRoute({
                body: {},
            });

            const param = new MethodParameter(MethodParameterType.BODY, 'name', false, 'default');
            expect(resolver.resolveArgument(param, route, {})).toBe('default');
        });

        test('should throw when required parameter is absent', () => {
            const route = makeRoute({
                body: {},
            });

            const param = new MethodParameter(MethodParameterType.BODY, 'name', true);
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(TypeError);
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(/"name" cannot be undefined or null/);
        });

        test('should apply type-based conversion when convertType is provided', () => {
            const route = makeRoute({
                body: { age: '25' },
            });

            const param = new MethodParameter(MethodParameterType.BODY, 'age', false, undefined, {
                source: String,
                target: Number,
            });
            expect(resolver.resolveArgument(param, route, {})).toBe(25);
        });

        test('should handle boolean conversion when convertType is provided', () => {
            const route = makeRoute({
                body: { active: 'true' },
            });

            const param = new MethodParameter(MethodParameterType.BODY, 'active', false, undefined, {
                source: String,
                target: Boolean,
            });
            expect(resolver.resolveArgument(param, route, {})).toBe(true);
        });

        test('should handle missing route.body gracefully', () => {
            const route = makeRoute({});

            const param = new MethodParameter(MethodParameterType.BODY, 'name', false, 'default');
            expect(resolver.resolveArgument(param, route, {})).toBe('default');
        });
    });
});
