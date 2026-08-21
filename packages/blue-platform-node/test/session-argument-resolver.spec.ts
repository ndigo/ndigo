import { describe, test, expect, beforeEach } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { NodeSessionValueMethodArgumentResolver } from '../src/session-argument-resolver';
import { NODE_REQUEST_ATTRIBUTE } from '../src/node-request';

// Route helper with NodeRequest in attributes:
function makeRoute(req: Partial<any> = {}): any {
    return {
        data: {},
        params: {},
        attributes: { [NODE_REQUEST_ATTRIBUTE]: { headers: {}, body: {}, cookies: {}, session: {}, ...req } },
    };
}

describe('NodeSessionValueMethodArgumentResolver', () => {
    let resolver: NodeSessionValueMethodArgumentResolver;
    beforeEach(() => {
        resolver = new NodeSessionValueMethodArgumentResolver();
    });

    describe('supportsParameter', () => {
        test('should return true for SESSION parameter type', () => {
            const param = new MethodParameter(MethodParameterType.SESSION, 'test');
            expect(resolver.supportsParameter(param)).toBe(true);
        });

        test('should return false for non-SESSION parameter types', () => {
            const param = new MethodParameter(MethodParameterType.QUERY, 'test');
            expect(resolver.supportsParameter(param)).toBe(false);
            
            const param2 = new MethodParameter(MethodParameterType.PATH, 'test');
            expect(resolver.supportsParameter(param2)).toBe(false);
        });
    });

    describe('resolveArgument', () => {
        test('should resolve named value from route.session', () => {
            const route = makeRoute({
                session: { userId: 123 }
            });
            
            const param = new MethodParameter(MethodParameterType.SESSION, 'userId');
            expect(resolver.resolveArgument(param, route, {})).toBe(123);
        });

        test('should return default value when source value is absent', () => {
            const route = makeRoute({
                session: {}
            });
            
            const param = new MethodParameter(MethodParameterType.SESSION, 'userId', false, 'default');
            expect(resolver.resolveArgument(param, route, {})).toBe('default');
        });

        test('should throw when required parameter is absent', () => {
            const route = makeRoute({
                session: {}
            });
            
            const param = new MethodParameter(MethodParameterType.SESSION, 'userId', true);
            expect(() => resolver.resolveArgument(param, route, {}))
                .toThrow(TypeError);
            expect(() => resolver.resolveArgument(param, route, {}))
                .toThrow(/"userId" cannot be undefined or null/);
        });

        test('should apply type-based conversion when convertType is provided', () => {
            const route = makeRoute({
                session: { age: '25' }
            });
            
            const param = new MethodParameter(
                MethodParameterType.SESSION,
                'age',
                false,
                undefined,
                { source: String, target: Number }
            );
            expect(resolver.resolveArgument(param, route, {})).toBe(25);
        });

        test('should handle boolean conversion when convertType is provided', () => {
            const route = makeRoute({
                session: { active: 'true' }
            });
            
            const param = new MethodParameter(
                MethodParameterType.SESSION,
                'active',
                false,
                undefined,
                { source: String, target: Boolean }
            );
            expect(resolver.resolveArgument(param, route, {})).toBe(true);
        });

        test('should handle missing route.session gracefully', () => {
            const route = makeRoute({});
            
            const param = new MethodParameter(MethodParameterType.SESSION, 'userId', false, 'default');
            expect(resolver.resolveArgument(param, route, {})).toBe('default');
        });
    });
});