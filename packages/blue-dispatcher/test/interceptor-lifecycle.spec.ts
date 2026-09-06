import { describe, it, expect, beforeEach } from 'vitest';
import { AbstractDispatcher } from '../src/dispatcher';
import { RouteHandlerInterceptor } from '../src/route-handler-interceptor';
import { ModelAndView } from '../src/model-and-view';
import { routeMapping } from '../src/route-mapping';
import {
    MetadataConfigApplicationContext,
    configuration,
    entry,
    ApplicationContextAwareProcessor,
} from '@blue/context';
import { TestErrorResolver, TestViewResolver } from './test-strategies';
import { RadixMetadataHandlerMapping } from '../src/route-handler-mapping';

describe('Interceptor Lifecycle Guarantees', () => {
    let dispatcher: AbstractDispatcher;
    let context: MetadataConfigApplicationContext;

    beforeEach(() => {
        context = new MetadataConfigApplicationContext('test');
        context.addProcessor(new ApplicationContextAwareProcessor(context));
        dispatcher = new AbstractDispatcher();
    });

    it('should call completeHandle in reverse order only for interceptors that passed preHandle', async () => {
        const sequence: string[] = [];

        const createInterceptor = (id: string, shouldPass: boolean = true): RouteHandlerInterceptor => ({
            preHandle: async () => {
                sequence.push(`pre:${id}`);
                return shouldPass;
            },
            postHandle: async () => {
                sequence.push(`post:${id}`);
            },
            completeHandle: async () => {
                sequence.push(`complete:${id}`);
            },
        });

        const i1 = createInterceptor('1');
        const i2 = createInterceptor('2', false); // Fails
        const i3 = createInterceptor('3');

        @routeMapping('/test')
        class TestController {
            @routeMapping('/lifecycle')
            handle() {
                sequence.push('handler');
                return new ModelAndView('test');
            }
        }

        @configuration
        class TestConfig {
            @entry controller() {
                return new TestController();
            }
            @entry viewResolver() {
                return new TestViewResolver();
            }
            @entry errorResolver() {
                return new TestErrorResolver();
            }
            @entry handlerMappings() {
                const mapping = new RadixMetadataHandlerMapping();
                mapping.interceptors.push(i1, i2, i3);
                return [mapping];
            }
        }

        context.register(TestConfig);
        dispatcher.initStrategies(context);

        const route = {
            path: '/test/lifecycle',
            params: {},
            data: {},
            0: { name: 'test', raw: 'test', data: null },
            1: { name: 'lifecycle', raw: 'lifecycle', data: null },
            length: 2,
        };

        await dispatcher.dispatch(route as any);

        // i1.pre passes, i2.pre fails.
        // i3.pre should not be called.
        // handler should not be called.
        // i1.complete should be called (reverse order).
        // i2.complete should NOT be called because its preHandle did not return true.
        expect(sequence).toEqual(['pre:1', 'pre:2', 'complete:1']);
    });

    it('should call completeHandle with error if handler throws', async () => {
        let capturedError: Error | null = null;

        const interceptor: RouteHandlerInterceptor = {
            preHandle: () => true,
            postHandle: () => {},
            completeHandle: (route, handler, error) => {
                capturedError = error;
            },
        };

        const testError = new Error('Handler Failed');

        @routeMapping('/test')
        class TestController {
            @routeMapping('/error')
            handle() {
                throw testError;
            }
        }

        @configuration
        class TestConfig {
            @entry controller() {
                return new TestController();
            }
            @entry viewResolver() {
                return new TestViewResolver();
            }
            @entry errorResolver() {
                return new TestErrorResolver();
            }
            @entry handlerMappings() {
                const mapping = new RadixMetadataHandlerMapping();
                mapping.interceptors.push(interceptor);
                return [mapping];
            }
        }

        context.register(TestConfig);
        dispatcher.initStrategies(context);

        const route = {
            path: '/test/error',
            params: {},
            data: {},
            0: { name: 'test', raw: 'test', data: null },
            1: { name: 'error', raw: 'error', data: null },
            length: 2,
        };

        await dispatcher.dispatch(route as any);

        expect(capturedError).toBe(testError);
    });
});
