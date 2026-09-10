import { describe, test, expect, beforeEach } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
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

        test('should return default value when source value is absent', () => {
            const route = makeRoute({});
            const param = new MethodParameter(MethodParameterType.QUERY, 'name', false, 'default');
            expect(resolver.resolveArgument(param, route, {})).toBe('default');
        });

        test('should throw when required parameter is absent', () => {
            const route = makeRoute({});
            const param = new MethodParameter(MethodParameterType.QUERY, 'name', true);
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(TypeError);
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(/"name" cannot be undefined or null/);
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
