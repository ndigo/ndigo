import { describe, it, expect } from 'vitest';
import { AbstractDispatcher } from '../src/dispatcher';
import { RouteHandlerInterceptor } from '../src/route-handler-interceptor';
import { ModelAndView } from '../src/model-and-view';
import { routeMapping } from '../src/route-mapping';
import { Route } from '@ndigo/router';
import {
    MetadataConfigApplicationContext,
    configuration,
    entry,
    ApplicationContextAwareProcessor,
} from '@ndigo/context';
import { TestErrorResolver, TestViewResolver } from './test-strategies';
import { RadixMetadataHandlerMapping } from '../src/route-handler-mapping';

describe('Asynchronous Interceptors', () => {
    it('should support async preHandle interceptors', async () => {
        let interceptorCalled = false;
        const asyncInterceptor: RouteHandlerInterceptor = {
            preHandle: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                interceptorCalled = true;
                return true;
            },
            postHandle: () => {},
            completeHandle: () => {},
        };

        @routeMapping('/test')
        class TestController {
            @routeMapping('/async')
            handle() {
                return new ModelAndView('test');
            }
        }

        @configuration
        class TestConfig {
            @entry()
            controller() {
                return new TestController();
            }
            @entry()
            viewResolver() {
                return new TestViewResolver();
            }
            @entry()
            errorResolver() {
                return new TestErrorResolver();
            }
            @entry()
            handlerMappings() {
                const mapping = new RadixMetadataHandlerMapping();
                mapping.interceptors.push(asyncInterceptor);
                return [mapping];
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.addProcessor(new ApplicationContextAwareProcessor(context));
        context.register(TestConfig);

        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(context);

        const route = {
            path: '/test/async',
            params: {},
            data: {},
            0: { name: 'test', raw: 'test', data: null },
            1: { name: 'async', raw: 'async', data: null },
            length: 2,
        };

        await dispatcher.dispatch(route as unknown as Route);
        expect(interceptorCalled).toBe(true);
    });

    it('should short-circuit if async preHandle returns false', async () => {
        let handlerCalled = false;
        const asyncInterceptor: RouteHandlerInterceptor = {
            preHandle: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                return false;
            },
            postHandle: () => {},
            completeHandle: () => {},
        };

        @routeMapping('/test')
        class TestController {
            @routeMapping('/blocked')
            handle() {
                handlerCalled = true;
                return new ModelAndView('test');
            }
        }

        @configuration
        class TestConfig {
            @entry()
            controller() {
                return new TestController();
            }
            @entry()
            viewResolver() {
                return new TestViewResolver();
            }
            @entry()
            errorResolver() {
                return new TestErrorResolver();
            }
            @entry()
            handlerMappings() {
                const mapping = new RadixMetadataHandlerMapping();
                mapping.interceptors.push(asyncInterceptor);
                return [mapping];
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.addProcessor(new ApplicationContextAwareProcessor(context));
        context.register(TestConfig);

        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(context);

        const route = {
            path: '/test/blocked',
            params: {},
            data: {},
            0: { name: 'test', raw: 'test', data: null },
            1: { name: 'blocked', raw: 'blocked', data: null },
            length: 2,
        };

        await dispatcher.dispatch(route as unknown as Route);
        expect(handlerCalled).toBe(false);
    });

    it('should support async postHandle and completeHandle interceptors', async () => {
        let postHandleCalled = false;
        let completeHandleCalled = false;
        const asyncInterceptor: RouteHandlerInterceptor = {
            preHandle: () => true,
            postHandle: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                postHandleCalled = true;
            },
            completeHandle: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                completeHandleCalled = true;
            },
        };

        @routeMapping('/test')
        class TestController {
            @routeMapping('/full')
            handle() {
                return new ModelAndView('test');
            }
        }

        @configuration
        class TestConfig {
            @entry()
            controller() {
                return new TestController();
            }
            @entry()
            viewResolver() {
                return new TestViewResolver();
            }
            @entry()
            errorResolver() {
                return new TestErrorResolver();
            }
            @entry()
            handlerMappings() {
                const mapping = new RadixMetadataHandlerMapping();
                mapping.interceptors.push(asyncInterceptor);
                return [mapping];
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.addProcessor(new ApplicationContextAwareProcessor(context));
        context.register(TestConfig);

        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(context);

        const route = {
            path: '/test/full',
            params: {},
            data: {},
            0: { name: 'test', raw: 'test', data: null },
            1: { name: 'full', raw: 'full', data: null },
            length: 2,
        };

        await dispatcher.dispatch(route as unknown as Route);
        expect(postHandleCalled).toBe(true);
        expect(completeHandleCalled).toBe(true);
    });
});
