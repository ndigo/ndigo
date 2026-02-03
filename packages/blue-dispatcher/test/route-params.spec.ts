/**
 * @author Jeff Rose
 * Behavioral tests for @routeParams pattern (TC39 parameter injection)
 */

import { describe, it, expect } from 'vitest';
import '@tsmetadata/polyfill';
import {
    routeParams,
    queryValue,
    matrixValue,
    cookieValue,
    getMethodParameter,
    hasMethodParameter,
    MethodParameterType,
} from '../src/route-parameter';

describe('@routeParams - TC39 Parameter Injection Pattern', () => {
    describe('Factory Functions', () => {
        it('queryValue should create query parameter extractor', () => {
            const extractor = queryValue('page');
            expect(extractor.type).toEqual(MethodParameterType.QUERY);
            expect(extractor.name).toBe('page');
            expect(extractor.required).toBe(false);
            expect(extractor.defaultValue).toBeNull();
        });

        it('queryValue should accept options', () => {
            const extractor = queryValue('limit', { required: true, defaultValue: '10' });
            expect(extractor.type).toEqual(MethodParameterType.QUERY);
            expect(extractor.name).toBe('limit');
            expect(extractor.required).toBe(true);
            expect(extractor.defaultValue).toBe('10');
        });

        it('matrixValue should create matrix parameter extractor', () => {
            const extractor = matrixValue('color');
            expect(extractor.type).toEqual(MethodParameterType.MATRIX);
            expect(extractor.name).toBe('color');
            expect(extractor.required).toBe(false);
        });

        it('cookieValue should create cookie parameter extractor', () => {
            const extractor = cookieValue('session');
            expect(extractor.type).toEqual(MethodParameterType.COOKIE);
            expect(extractor.name).toBe('session');
            expect(extractor.required).toBe(false);
        });
    });

    describe('@routeParams Decorator', () => {
        it('should map single parameter', () => {
            class TestController {
                @routeParams({
                    page: queryValue('page'),
                })
                handleQuery(page: string) {}
            }

            expect(hasMethodParameter(TestController.prototype, 'handleQuery')).toBe(true);
            const params = getMethodParameter(TestController.prototype, 'handleQuery');
            expect(params).toHaveLength(1);
            expect(params![0].name).toBe('page');
            expect(params![0].type).toEqual(MethodParameterType.QUERY);
        });

        it('should map multiple parameters', () => {
            class TestController {
                @routeParams({
                    page: queryValue('page'),
                    limit: queryValue('limit'),
                })
                handleQuery(page: string, limit: string) {}
            }

            const params = getMethodParameter(TestController.prototype, 'handleQuery');
            expect(params).toHaveLength(2);
            expect(params![0].name).toBe('page');
            expect(params![1].name).toBe('limit');
        });

        it('should handle mixed parameter types', () => {
            class TestController {
                @routeParams({
                    page: queryValue('page'),
                    session: cookieValue('SESSIONID'),
                    color: matrixValue('color'),
                })
                handleMixed(page: string, session: string, color: string) {}
            }

            const params = getMethodParameter(TestController.prototype, 'handleMixed');
            expect(params).toHaveLength(3);
            expect(params![0].type).toEqual(MethodParameterType.QUERY);
            expect(params![1].type).toEqual(MethodParameterType.COOKIE);
            expect(params![2].type).toEqual(MethodParameterType.MATRIX);
        });

        it('should handle sparse parameters (not all decorated)', () => {
            class TestController {
                @routeParams({
                    page: queryValue('page'),
                    session: cookieValue('SESSIONID'),
                })
                handleSparse(normal: string, page: string, another: number, session: string) {}
            }

            const params = getMethodParameter(TestController.prototype, 'handleSparse');
            // params array has holes for non-decorated parameters
            expect(params![0]).toBeUndefined(); // normal
            expect(params![1].name).toBe('page');
            expect(params![2]).toBeUndefined(); // another
            expect(params![3].name).toBe('SESSIONID');
        });

        it('should preserve parameter options', () => {
            class TestController {
                @routeParams({
                    limit: queryValue('limit', { required: true, defaultValue: '10' }),
                })
                handleQuery(limit: string) {}
            }

            const params = getMethodParameter(TestController.prototype, 'handleQuery');
            expect(params![0].required).toBe(true);
            expect(params![0].defaultValue).toBe('10');
        });

        it('should throw error if parameter name not found', () => {
            expect(() => {
                class TestController {
                    @routeParams({
                        wrongName: queryValue('page'),
                    })
                    handleQuery(page: string) {}
                }
            }).toThrow('Parameter "wrongName" not found in method signature');
        });
    });

    describe('Integration with Route Mapping', () => {
        it('should work alongside route mapping', async () => {
            const { routeMapping, getRouteMapping } = await import('../src/route-mapping');

            class TestController {
                @routeMapping('/users')
                @routeParams({
                    page: queryValue('page'),
                    limit: queryValue('limit'),
                })
                getUsers(page: string, limit: string) {}
            }

            // Both decorators work
            const mapping = getRouteMapping(TestController.prototype, 'getUsers');
            expect(mapping.value).toBe('/users');

            const params = getMethodParameter(TestController.prototype, 'getUsers');
            expect(params).toHaveLength(2);
        });
    });

    describe('Comparison with Legacy Pattern', () => {
        it('demonstrates new API pattern', () => {
            // New TC39 pattern
            class NewController {
                @routeParams({
                    name: queryValue('name'),
                    id: matrixValue('id'),
                })
                handleRequest(name: string, id: string) {
                    return { name, id };
                }
            }

            const params = getMethodParameter(NewController.prototype, 'handleRequest');
            expect(params![0].type).toEqual(MethodParameterType.QUERY);
            expect(params![1].type).toEqual(MethodParameterType.MATRIX);

            // Benefits of new pattern:
            // 1. ✅ TC39 compliant (no parameter decorators)
            // 2. ✅ Clear parameter mapping in one place
            // 3. ✅ Type-safe with TypeScript
            // 4. ✅ Easier to test and debug
        });
    });
});
