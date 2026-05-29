import { describe, test, expect, beforeEach } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { NodeQueryValueMethodArgumentResolver } from '../src/query-argument-resolver';

function makeRoute(data: Record<string, any> = {}): any {
    return { data, params: {}, attributes: {} };
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

        test('should apply converter when provided', () => {
            const route = makeRoute({ age: '25' });
            const param = new MethodParameter(MethodParameterType.QUERY, 'age', false, undefined, 'number');
            expect(resolver.resolveArgument(param, route, {})).toBe(25);
        });

        test('should prefer parameter-level converter over resolver-level converter', () => {
            const route = makeRoute({ age: '25' });
            const booleanResolver = new NodeQueryValueMethodArgumentResolver((v) => Boolean(v));
            const param = new MethodParameter(MethodParameterType.QUERY, 'age', false, undefined, 'number');
            expect(booleanResolver.resolveArgument(param, route, {})).toBe(25);
        });

        test('should handle missing route.data gracefully', () => {
            const route = { data: null, params: {}, attributes: {} };
            const param = new MethodParameter(MethodParameterType.QUERY, 'name', false, 'default');
            expect(resolver.resolveArgument(param, route as any, {})).toBe('default');
        });
    });
});
