/**
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { MissingParameterError, MethodParameter, MethodParameterType } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
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

        test('should resolve dotted keys by walking the JSON body (nested-capable, D-2)', () => {
            const route = makeRoute({
                body: { address: { city: 'York', street: 'Main' } },
            });

            const param = new MethodParameter(MethodParameterType.BODY, 'address.city');
            expect(resolver.resolveArgument(param, route, {})).toBe('York');

            const flat = new MethodParameter(MethodParameterType.BODY, 'address');
            expect(resolver.resolveArgument(flat, route, {})).toEqual({ city: 'York', street: 'Main' });
        });

        test('a literal dotted body key wins over the dotted walk (D-2)', () => {
            const route = makeRoute({
                body: { 'a.b': 'literal', a: { b: 'nested' } },
            });

            const param = new MethodParameter(MethodParameterType.BODY, 'a.b');
            expect(resolver.resolveArgument(param, route, {})).toBe('literal');
        });

        test('should return entire body when name is omitted (whole-source rule)', () => {
            const bodyData = { name: 'John', age: 30 };
            const route = makeRoute({
                body: bodyData,
            });

            const param = new MethodParameter(MethodParameterType.BODY, '');
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
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(MissingParameterError);
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(/parameter 'name' is missing/);
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
