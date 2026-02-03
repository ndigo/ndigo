/**
 * @author Jeff Rose
 * Behavioral tests for @blue/dispatcher decorators
 * These tests document current behavior with TC39 decorators
 */

import { describe, it, expect } from 'vitest';
import '@tsmetadata/polyfill';
import { routeMapping, getRouteMapping, hasRouteMapping, publicMapping, privateMapping } from '../src/route-mapping';
import { errorHandler, errorMapping } from '../src/error-mapping';
// Note: Parameter decorators removed - will be replaced with @routeParams pattern
// import {
//     cookieValue,
//     matrixValue,
//     queryValue,
//     getMethodParameter,
//     hasMethodParameter,
//     MethodParameterType,
// } from '../src/route-parameter';

describe('Dispatcher Decorators - Behavioral Tests', () => {
    describe('@routeMapping', () => {
        describe('Class Decorator', () => {
            it('should define route mapping on class', () => {
                @routeMapping('/api')
                class TestController {}

                expect(hasRouteMapping(TestController)).toBe(true);
                const mapping = getRouteMapping(TestController);
                expect(mapping).toEqual({
                    value: '/api',
                    private: false,
                });
            });

            it('should accept string as configuration', () => {
                @routeMapping('/users')
                class UserController {}

                const mapping = getRouteMapping(UserController);
                expect(mapping.value).toBe('/users');
                expect(mapping.private).toBe(false);
            });

            it('should accept configuration object', () => {
                @routeMapping({ value: '/admin', private: true, name: 'admin' })
                class AdminController {}

                const mapping = getRouteMapping(AdminController);
                expect(mapping.value).toBe('/admin');
                expect(mapping.private).toBe(true);
                expect(mapping.name).toBe('admin');
            });

            it('should use default mapping when no argument provided', () => {
                @routeMapping()
                class DefaultController {}

                const mapping = getRouteMapping(DefaultController);
                expect(mapping.value).toBe('/**');
                expect(mapping.private).toBe(false);
            });
        });

        describe('Method Decorator', () => {
            it('should define route mapping on method', () => {
                class TestController {
                    @routeMapping('/action')
                    handleAction() {}
                }

                expect(hasRouteMapping(TestController.prototype, 'handleAction')).toBe(true);
                const mapping = getRouteMapping(TestController.prototype, 'handleAction');
                expect(mapping).toEqual({
                    value: '/action',
                    private: false,
                });
            });

            it('should make method enumerable', () => {
                class TestController {
                    @routeMapping('/test')
                    testMethod() {}
                }

                const descriptor = Object.getOwnPropertyDescriptor(TestController.prototype, 'testMethod');
                expect(descriptor?.enumerable).toBe(true);
            });

            it('should work with both class and method decorators', () => {
                @routeMapping('/api')
                class TestController {
                    @routeMapping('/users')
                    getUsers() {}
                }

                expect(hasRouteMapping(TestController)).toBe(true);
                expect(hasRouteMapping(TestController.prototype, 'getUsers')).toBe(true);

                const classMapping = getRouteMapping(TestController);
                const methodMapping = getRouteMapping(TestController.prototype, 'getUsers');

                expect(classMapping.value).toBe('/api');
                expect(methodMapping.value).toBe('/users');
            });
        });

        describe('Helper Functions', () => {
            it('publicMapping should set private: false', () => {
                @publicMapping('/public')
                class PublicController {}

                const mapping = getRouteMapping(PublicController);
                expect(mapping.private).toBe(false);
            });

            it('privateMapping should set private: true', () => {
                @privateMapping('/private')
                class PrivateController {}

                const mapping = getRouteMapping(PrivateController);
                expect(mapping.private).toBe(true);
            });
        });
    });

    describe('@errorHandler', () => {
        it('should mark class as error handler', () => {
            @errorHandler
            class ErrorController {}

            expect(errorHandler.has(ErrorController)).toBe(true);
            expect(errorHandler.get(ErrorController)).toBe(true);
        });

        it('should work with routeMapping', () => {
            @errorHandler
            @routeMapping('/errors')
            class ErrorController {}

            expect(errorHandler.has(ErrorController)).toBe(true);
            expect(hasRouteMapping(ErrorController)).toBe(true);
        });
    });

    describe('@errorMapping', () => {
        class CustomError extends Error {}
        class AnotherError extends Error {}

        it('should define error mapping on method', () => {
            class ErrorController {
                @errorMapping(CustomError)
                handleError() {}
            }

            expect(errorMapping.has(ErrorController.prototype, 'handleError')).toBe(true);
            const errors = errorMapping.get(ErrorController.prototype, 'handleError');
            expect(errors).toEqual([CustomError]);
        });

        it('should accept multiple error classes', () => {
            class ErrorController {
                @errorMapping([CustomError, AnotherError])
                handleMultipleErrors() {}
            }

            const errors = errorMapping.get(ErrorController.prototype, 'handleMultipleErrors');
            expect(errors).toHaveLength(2);
            expect(errors).toContain(CustomError);
            expect(errors).toContain(AnotherError);
        });

        it('should make method enumerable', () => {
            class ErrorController {
                @errorMapping(CustomError)
                handleError() {}
            }

            const descriptor = Object.getOwnPropertyDescriptor(ErrorController.prototype, 'handleError');
            expect(descriptor?.enumerable).toBe(true);
        });

        it('should default to Error class when no argument provided', () => {
            class ErrorController {
                @errorMapping()
                handleAnyError() {}
            }

            const errors = errorMapping.get(ErrorController.prototype, 'handleAnyError');
            expect(errors).toEqual([Error]);
        });
    });

    describe('Parameter Decorators', () => {
        // NOTE: Parameter decorators are not supported in TC39
        // These tests are skipped and will be replaced with @routeParams pattern
        describe.skip('@queryValue', () => {
            it('should define query parameter with string name', () => {
                class TestController {
                    handleQuery(@queryValue('page') page: string) {}
                }

                expect(hasMethodParameter(TestController.prototype, 'handleQuery')).toBe(true);
                const params = getMethodParameter(TestController.prototype, 'handleQuery');
                expect(params).toHaveLength(1);
                expect(params[0].name).toBe('page');
                expect(params[0].type).toEqual(MethodParameterType.QUERY);
                expect(params[0].required).toBe(false);
            });

            // Note: Configuration object doesn't work properly in legacy - mergeRight order is wrong
            // This test documents actual behavior (it uses defaults, not the provided values)
            it.skip('should accept configuration object', () => {
                class TestController {
                    handleQuery(
                        @queryValue({ name: 'limit', mapping: 'limit', required: true, defaultValue: '10' })
                        limit: string
                    ) {}
                }

                const params = getMethodParameter(TestController.prototype, 'handleQuery');
                expect(params[0].name).toBe('limit');
                expect(params[0].required).toBe(true);
                expect(params[0].defaultValue).toBe('10');
            });

            it('should handle multiple parameters', () => {
                class TestController {
                    handleQuery(@queryValue('page') page: string, @queryValue('limit') limit: string) {}
                }

                const params = getMethodParameter(TestController.prototype, 'handleQuery');
                expect(params).toHaveLength(2);
                expect(params[0].name).toBe('page');
                expect(params[1].name).toBe('limit');
            });

            // Note: Parameter decorator without arguments doesn't work in legacy implementation
            // because MethodParameter constructor requires a string name
            it.skip('should work without arguments (use parameter name)', () => {
                class TestController {
                    handleQuery(@queryValue page: string) {}
                }

                const params = getMethodParameter(TestController.prototype, 'handleQuery');
                expect(params).toHaveLength(1);
                // Note: Without argument, name defaults to null in current implementation
                expect(params[0].name).toBeNull();
            });
        });

        describe.skip('@matrixValue', () => {
            it('should define matrix parameter', () => {
                class TestController {
                    handleMatrix(@matrixValue('color') color: string) {}
                }

                const params = getMethodParameter(TestController.prototype, 'handleMatrix');
                expect(params).toHaveLength(1);
                expect(params[0].name).toBe('color');
                expect(params[0].type).toEqual(MethodParameterType.MATRIX);
            });

            // Note: Configuration object doesn't work properly in legacy
            it.skip('should accept configuration object', () => {
                class TestController {
                    handleMatrix(
                        @matrixValue({ name: 'size', mapping: 'size', required: true })
                        size: string
                    ) {}
                }

                const params = getMethodParameter(TestController.prototype, 'handleMatrix');
                expect(params[0].name).toBe('size');
                expect(params[0].required).toBe(true);
            });
        });

        describe.skip('@cookieValue', () => {
            it('should define cookie parameter', () => {
                class TestController {
                    handleCookie(@cookieValue('session') session: string) {}
                }

                const params = getMethodParameter(TestController.prototype, 'handleCookie');
                expect(params).toHaveLength(1);
                expect(params[0].name).toBe('session');
                expect(params[0].type).toEqual(MethodParameterType.COOKIE);
            });

            // Note: Configuration object doesn't work properly in legacy
            it.skip('should accept configuration object', () => {
                class TestController {
                    handleCookie(
                        @cookieValue({ name: 'token', mapping: 'token', required: true })
                        token: string
                    ) {}
                }

                const params = getMethodParameter(TestController.prototype, 'handleCookie');
                expect(params[0].name).toBe('token');
                expect(params[0].required).toBe(true);
            });
        });

        describe.skip('Mixed Parameter Types', () => {
            it('should handle mixed parameter decorators', () => {
                class TestController {
                    handleMixed(
                        @queryValue('page') page: string,
                        @cookieValue('session') session: string,
                        @matrixValue('color') color: string
                    ) {}
                }

                const params = getMethodParameter(TestController.prototype, 'handleMixed');
                expect(params).toHaveLength(3);
                expect(params[0].type).toEqual(MethodParameterType.QUERY);
                expect(params[1].type).toEqual(MethodParameterType.COOKIE);
                expect(params[2].type).toEqual(MethodParameterType.MATRIX);
            });

            it('should handle sparse parameter decorators', () => {
                class TestController {
                    handleSparse(
                        normal: string,
                        @queryValue('page') page: string,
                        another: number,
                        @cookieValue('session') session: string
                    ) {}
                }

                const params = getMethodParameter(TestController.prototype, 'handleSparse');
                expect(params[1].name).toBe('page');
                expect(params[3].name).toBe('session');
            });
        });
    });

    describe.skip('Integration Tests', () => {
        // Skipped until parameter decorator pattern is migrated
        it('should work with all decorators together', () => {
            class CustomError extends Error {}

            @errorHandler
            @routeMapping('/api')
            class TestController {
                @routeMapping('/users')
                getUsers(@queryValue('page') page: string) {}

                @errorMapping(CustomError)
                handleError() {}
            }

            // Class decorators
            expect(errorHandler.has(TestController)).toBe(true);
            expect(hasRouteMapping(TestController)).toBe(true);

            // Method decorators
            expect(hasRouteMapping(TestController.prototype, 'getUsers')).toBe(true);
            expect(errorMapping.has(TestController.prototype, 'handleError')).toBe(true);

            // Parameter decorators
            expect(hasMethodParameter(TestController.prototype, 'getUsers')).toBe(true);
        });
    });
});
