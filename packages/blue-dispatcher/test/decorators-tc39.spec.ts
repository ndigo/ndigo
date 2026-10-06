/**
 * Behavioral tests for @blue/dispatcher decorators (TC39).
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect } from 'vitest';
import '@tsmetadata/polyfill';
import { routeMapping, getRouteMapping, hasRouteMapping, publicMapping, privateMapping } from '../src/route-mapping';
import { errorHandler, errorMapping } from '../src/error-mapping';

describe('Dispatcher Decorators - TC39 Behavioral Tests', () => {
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

            it('should make method enumerable', async () => {
                class TestController {
                    @routeMapping('/test')
                    testMethod() {}
                }

                // Need to instantiate to trigger initializer
                const instance = new TestController();
                await new Promise((resolve) => setTimeout(resolve, 0));

                const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), 'testMethod');
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

        it('should make method enumerable', async () => {
            class ErrorController {
                @errorMapping(CustomError)
                handleError() {}
            }

            // Need to instantiate to trigger initializer
            const instance = new ErrorController();
            await new Promise((resolve) => setTimeout(resolve, 0));

            const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), 'handleError');
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
});
