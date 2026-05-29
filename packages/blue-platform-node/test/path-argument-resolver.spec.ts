import { describe, test, expect, beforeEach } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { NodePathValueMethodArgumentResolver } from '../src/path-argument-resolver';

function makeRoute(params: Record<string, any> = {}): any {
    return { data: {}, params, attributes: {} };
}

describe('NodePathValueMethodArgumentResolver', () => {
    let resolver: NodePathValueMethodArgumentResolver;

    beforeEach(() => {
        resolver = new NodePathValueMethodArgumentResolver();
    });

    describe('supportsParameter', () => {
        test('should return true for PATH parameter type', () => {
            const param = new MethodParameter(MethodParameterType.PATH, 'test');
            expect(resolver.supportsParameter(param)).toBe(true);
        });

        test('should return false for non-PATH parameter types', () => {
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.QUERY, 'test'))).toBe(false);
            expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.HEADER, 'test'))).toBe(false);
        });
    });

    describe('resolveArgument', () => {
        test('should resolve named value from route.params', () => {
            const route = makeRoute({ id: '123' });
            const param = new MethodParameter(MethodParameterType.PATH, 'id');
            expect(resolver.resolveArgument(param, route, {})).toBe('123');
        });

        test('should return default value when source value is absent', () => {
            const route = makeRoute({});
            const param = new MethodParameter(MethodParameterType.PATH, 'id', false, 'default');
            expect(resolver.resolveArgument(param, route, {})).toBe('default');
        });

        test('should throw when required parameter is absent', () => {
            const route = makeRoute({});
            const param = new MethodParameter(MethodParameterType.PATH, 'id', true);
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(TypeError);
            expect(() => resolver.resolveArgument(param, route, {})).toThrow(/"id" cannot be undefined or null/);
        });

        test('should apply converter when provided', () => {
            const route = makeRoute({ age: '25' });
            const param = new MethodParameter(MethodParameterType.PATH, 'age', false, undefined, 'number');
            expect(resolver.resolveArgument(param, route, {})).toBe(25);
        });

        test('should prefer parameter-level converter over resolver-level converter', () => {
            const route = makeRoute({ age: '25' });
            const booleanResolver = new NodePathValueMethodArgumentResolver((v) => Boolean(v));
            const param = new MethodParameter(MethodParameterType.PATH, 'age', false, undefined, 'number');
            expect(booleanResolver.resolveArgument(param, route, {})).toBe(25);
        });

        test('should handle null route.params gracefully', () => {
            const route = { data: {}, params: null, attributes: {} };
            const param = new MethodParameter(MethodParameterType.PATH, 'id', false, 'default');
            expect(resolver.resolveArgument(param, route as any, {})).toBe('default');
        });
    });
});
