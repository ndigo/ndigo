import { describe, test, expect, beforeEach } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { NodeHeaderValueMethodArgumentResolver } from '../src/header-argument-resolver';
import { NODE_REQUEST_ATTRIBUTE } from '../src/node-request';

// Route helper with NodeRequest in attributes:
function makeRoute(req: Partial<any> = {}): any {
    return {
        data: {},
        params: {},
        attributes: { [NODE_REQUEST_ATTRIBUTE]: { headers: {}, body: {}, cookies: {}, session: {}, ...req } },
    };
}

describe('NodeHeaderValueMethodArgumentResolver', () => {
    let resolver: NodeHeaderValueMethodArgumentResolver;
    beforeEach(() => {
        resolver = new NodeHeaderValueMethodArgumentResolver();
    });

    describe('supportsParameter', () => {
        test('should return true for HEADER parameter type', () => {
            const param = new MethodParameter(MethodParameterType.HEADER, 'test');
            expect(resolver.supportsParameter(param)).toBe(true);
        });

        test('should return false for non-HEADER parameter types', () => {
            const param = new MethodParameter(MethodParameterType.QUERY, 'test');
            expect(resolver.supportsParameter(param)).toBe(false);
            
            const param2 = new MethodParameter(MethodParameterType.PATH, 'test');
            expect(resolver.supportsParameter(param2)).toBe(false);
        });
    });

    describe('resolveArgument', () => {
        test('should resolve named value from route.headers (case-insensitive)', () => {
            const route = makeRoute({
                headers: { 'content-type': 'application/json' }
            });
            
            const param = new MethodParameter(MethodParameterType.HEADER, 'content-type');
            expect(resolver.resolveArgument(param, route, {})).toBe('application/json');
        });

        test('should resolve named value from route.headers with different case', () => {
            const route = makeRoute({
                headers: { 'content-type': 'application/json' }
            });
            
            const param = new MethodParameter(MethodParameterType.HEADER, 'content-type');
            expect(resolver.resolveArgument(param, route, {})).toBe('application/json');
        });

        test('should handle multi-value headers by joining with comma', () => {
            const route = makeRoute({
                headers: { 'accept': ['text/html', 'application/json'] }
            });
            
            const param = new MethodParameter(MethodParameterType.HEADER, 'accept');
            expect(resolver.resolveArgument(param, route, {})).toBe('text/html, application/json');
        });

        test('should return default value when source value is absent', () => {
            const route = makeRoute({
                headers: {}
            });
            
            const param = new MethodParameter(MethodParameterType.HEADER, 'content-type', false, 'default');
            expect(resolver.resolveArgument(param, route, {})).toBe('default');
        });

        test('should throw when required parameter is absent', () => {
            const route = makeRoute({
                headers: {}
            });
            
            const param = new MethodParameter(MethodParameterType.HEADER, 'content-type', true);
            expect(() => resolver.resolveArgument(param, route, {}))
                .toThrow(TypeError);
            expect(() => resolver.resolveArgument(param, route, {}))
                .toThrow(/"content-type" cannot be undefined or null/);
        });

        test('should apply converter when provided', () => {
            const route = makeRoute({
                headers: { 'content-length': '1024' }
            });
            
            const param = new MethodParameter(MethodParameterType.HEADER, 'content-length', false, undefined, 'number');
            expect(resolver.resolveArgument(param, route, {})).toBe(1024);
        });

        test('should prefer parameter-level converter over resolver-level converter', () => {
            const route = makeRoute({
                headers: { 'content-length': '1024' }
            });
            
            const param = new MethodParameter(MethodParameterType.HEADER, 'content-length', false, undefined, 'number');
            expect(resolver.resolveArgument(param, route, {})).toBe(1024);
        });

        test('should handle missing route.headers gracefully', () => {
            const route = makeRoute({});
            
            const param = new MethodParameter(MethodParameterType.HEADER, 'content-type', false, 'default');
            expect(resolver.resolveArgument(param, route, {})).toBe('default');
        });
    });
});