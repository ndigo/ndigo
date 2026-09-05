/**
 * Behavioral tests for @routeParams pattern (TC39 parameter injection)
 */

import { describe, it, expect } from 'vitest';
import '@tsmetadata/polyfill';
import {
    routeParams,
    queryValue,
    matrixValue,
    cookieValue,
    modelValue,
    stateValue,
    sessionValue,
    pathValue,
    asNumber,
    asBoolean,
    asDate,
    asJson,
    bindValue,
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
            expect(extractor.convertType).toBeUndefined();
        });

        it('queryValue should accept converter option', () => {
            const converter = (value) => Number(value);
            const extractor = queryValue('limit', { convertType: converter });

            expect(extractor.convertType).toBe(converter);
        });

        it('queryValue should accept named converter option', () => {
            const extractor = queryValue('limit', { convertType: 'number' });

            expect(extractor.convertType).toBe('number');
        });

        it('queryValue should accept optional converter descriptor', () => {
            const extractor = queryValue('limit', { convertType: { optional: true, use: 'number' } });

            expect(extractor.convertType).toEqual({ optional: true, use: 'number' });
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

        it('pathValue should create path parameter extractor', () => {
            const extractor = pathValue('userId');
            expect(extractor.type).toEqual(MethodParameterType.PATH);
            expect(extractor.name).toBe('userId');
            expect(extractor.required).toBe(false);
        });

        it('modelValue should create model parameter extractor', () => {
            const extractor = modelValue('profile');
            expect(extractor.type).toEqual(MethodParameterType.MODEL);
            expect(extractor.name).toBe('profile');
            expect(extractor.required).toBe(false);
            expect(extractor.defaultValue).toBeNull();
        });

        it('sessionValue should create session parameter extractor', () => {
            const extractor = sessionValue('sessionId');
            expect(extractor.type).toEqual(MethodParameterType.SESSION);
            expect(extractor.name).toBe('sessionId');
            expect(extractor.required).toBe(false);
            expect(extractor.defaultValue).toBeNull();
        });

        it('stateValue should create state parameter extractor', () => {
            const extractor = stateValue('token');
            expect(extractor.type).toEqual(MethodParameterType.STATE);
            expect(extractor.name).toBe('token');
            expect(extractor.required).toBe(false);
            expect(extractor.defaultValue).toBeNull();
        });

        it('bindValue should create bind parameter extractor', () => {
            const extractor = bindValue('query', { prefix: 'user.' });
            expect(extractor.type).toEqual(MethodParameterType.BIND);
            expect(extractor.name).toBe('query');
            expect(extractor.prefix).toBe('user.');
        });

        describe('Typed Converter Wrappers', () => {
            it('asNumber should wrap extractor with number converter', () => {
                const extractor = asNumber(queryValue('age', { required: true, defaultValue: '18' }));
                expect(extractor.convertType).toEqual({ source: String, target: Number });
                expect(extractor.name).toBe('age');
                expect(extractor.required).toBe(true);
                expect(extractor.defaultValue).toBe('18');
            });

            it('asBoolean should wrap extractor with boolean converter', () => {
                const extractor = asBoolean(stateValue('active'));
                expect(extractor.convertType).toEqual({ source: String, target: Boolean });
                expect(extractor.name).toBe('active');
            });

            it('asDate should wrap extractor with date converter', () => {
                const extractor = asDate(cookieValue('lastLogin'));
                expect(extractor.convertType).toEqual({ source: String, target: Date });
                expect(extractor.name).toBe('lastLogin');
            });

            it('asJson should wrap extractor with json converter', () => {
                const extractor = asJson(modelValue('profile'));
                expect(extractor.convertType).toEqual({ source: String, target: Object });
                expect(extractor.name).toBe('profile');
            });

            it('wrappers should override existing converter', () => {
                const inner = queryValue('age', { convertType: (v) => v });
                const wrapped = asNumber(inner);
                expect(wrapped.convertType).toEqual({ source: String, target: Number });
            });
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
                    profile: modelValue('profile'),
                    token: stateValue('token'),
                    sessionId: sessionValue('sessionId'),
                    color: matrixValue('color'),
                    userId: pathValue('userId'),
                })
                handleMixed(
                    page: string,
                    session: string,
                    profile: string,
                    token: string,
                    sessionId: string,
                    color: string,
                    userId: string
                ) {}
            }

            const params = getMethodParameter(TestController.prototype, 'handleMixed');
            expect(params).toHaveLength(7);
            expect(params![0].type).toEqual(MethodParameterType.QUERY);
            expect(params![1].type).toEqual(MethodParameterType.COOKIE);
            expect(params![2].type).toEqual(MethodParameterType.MODEL);
            expect(params![3].type).toEqual(MethodParameterType.STATE);
            expect(params![4].type).toEqual(MethodParameterType.SESSION);
            expect(params![5].type).toEqual(MethodParameterType.MATRIX);
            expect(params![6].type).toEqual(MethodParameterType.PATH);
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

        it('should preserve converter options', () => {
            const converter = (v: any) => Number(v);

            class TestController {
                @routeParams({
                    limit: queryValue('limit', { convertType: converter }),
                })
                handleQuery(limit: string) {}
            }

            const params = getMethodParameter(TestController.prototype, 'handleQuery');
            expect(params![0].convertType).toBe(converter);
        });

        it('should preserve named converter options', () => {
            class TestController {
                @routeParams({
                    limit: queryValue('limit', { convertType: 'number' }),
                })
                handleQuery(limit: string) {}
            }

            const params = getMethodParameter(TestController.prototype, 'handleQuery');
            expect(params![0].convertType).toBe('number');
        });

        it('should throw error if parameter name not found', () => {
            expect(() => {
                class TestController {
                    @routeParams({
                        wrongName: queryValue('page'),
                    })
                    handleQuery(page: string) {}
                }

                return TestController;
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
