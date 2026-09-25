/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { MissingParameterError, MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { NodeQueryValueMethodArgumentResolver } from '../src/query-argument-resolver';

// Route-shaped helper; the query resolver only reads data/params/attributes.
function makeRoute(data: Record<string, string> = {}): Route {
    return { data, params: {}, path: '/', raw: '/', id: 'test', length: 0, attributes: {} };
}

describe('NodeQueryValueMethodArgumentResolver', () => {
    let resolver: NodeQueryValueMethodArgumentResolver;

    beforeEach(() => {
        resolver = new NodeQueryValueMethodArgumentResolver();
    });

    describe('supportsParameter', () => {
        test('should return true for QUERY parameter type', () => {
            const param = new MethodParameter(MethodParameterType.QUERY, 'test');
            expect(resolver.supportsParameter(param)).toBe(true);
        });

        test('should return false for non-QUERY parameter types', () => {
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.PATH, 'test'))).toBe(false);
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.HEADER, 'test'))).toBe(false);
        });
    });

    describe('resolveArgument', () => {
        test('should resolve named value from route.data', () => {
            const route = makeRoute({ name: 'John' });
            const param = new MethodParameter(MethodParameterType.QUERY, 'name');
            expect(resolver.resolveArgument(param, route, {})).toBe('John');
        });

        test('queryValue() with no name binds the whole query object', () => {
            const route = makeRoute({ name: 'John', age: '30' });
            const param = new MethodParameter(MethodParameterType.QUERY, '');

            expect(resolver.resolveArgument(param, route, {})).toEqual({ name: 'John', age: '30' });
        });

        test('query is scalar-only — a dotted name is a literal key, never a walk (D-2)', () => {
            const route = makeRoute({ 'a.b': 'literal' });
            const literal = new MethodParameter(MethodParameterType.QUERY, 'a.b');
            expect(resolver.resolveArgument(literal, route, {})).toBe('literal');

            // No nested source: a dotted-only key is absent, not walked.
            const nested = new MethodParameter(MethodParameterType.QUERY, 'a.b');
            const flat = makeRoute({ a: { b: 'nested' } });
            expect(resolver.resolveArgument(nested, flat, {})).toBeNull();
        });

        test('should return default value when source value is absent', () => {
            const route = makeRoute({});
            const param = new MethodParameter(MethodParameterType.QUERY, 'name', false, 'default');
            expect(resolver.resolveArgument(param, route, {})).toBe('default');
        });

        test('should throw when required parameter is absent', () => {
            const route = makeRoute({});
            const param = new MethodParameter(MethodParameterType.QUERY, 'name', true);
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(MissingParameterError);
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(/parameter 'name' is missing/);
        });

        test('should apply type-based conversion when convertType is provided', () => {
            const route = makeRoute({ age: '25' });
            const param = new MethodParameter(MethodParameterType.QUERY, 'age', false, undefined, {
                source: String,
                target: Number,
            });
            expect(resolver.resolveArgument(param, route, {})).toBe(25);
        });

        test('should handle boolean conversion when convertType is provided', () => {
            const route = makeRoute({ active: 'true' });
            const param = new MethodParameter(MethodParameterType.QUERY, 'active', false, undefined, {
                source: String,
                target: Boolean,
            });
            expect(resolver.resolveArgument(param, route, {})).toBe(true);
        });

        test('should handle missing route.data gracefully', () => {
            // Route.data is declared non-nullable; runtime-null data is exercised via cast.
            const route = { data: null, params: {}, path: '/', raw: '/', id: 'test', length: 0, attributes: {} };
            const param = new MethodParameter(MethodParameterType.QUERY, 'name', false, 'default');
            expect(resolver.resolveArgument(param, route as unknown as Route, {})).toBe('default');
        });
    });
});
