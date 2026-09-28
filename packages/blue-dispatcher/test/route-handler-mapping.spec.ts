/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import { ContextToken } from '@blue/factory';
import {
    NamePathHandlerMapping,
    SimplePathHandlerMapping,
    RadixMetadataHandlerMapping,
} from '../src/route-handler-mapping';
import { GenericApplicationContext } from '@blue/context';
import { type Route } from '@blue/router';
import { TestController } from './test-strategies';
import { routeMapping } from '../src/route-mapping';

describe('RouteHandlerMapping', () => {
    let applicationContext: GenericApplicationContext;
    let fooController: TestController;
    let barController: TestController;

    beforeEach(() => {
        fooController = new TestController();
        fooController.id = 1;
        barController = new TestController();
        barController.id = 2;

        applicationContext = new GenericApplicationContext('test');
        applicationContext.setValue('fooController', fooController);
        applicationContext.setValue('barController', barController);
    });

    afterEach(() => {
        applicationContext.destroy();
        fooController = undefined;
        barController = undefined;
        applicationContext = undefined;
    });

    describe('NamePathHandlerMapping', () => {
        test('it should map individual routes', () => {
            applicationContext.setValue('/foo', fooController);
            applicationContext.setValue('/bar', barController);

            let chain;
            const handlerMapping = new NamePathHandlerMapping();
            handlerMapping.setApplicationContext(applicationContext);

            chain = handlerMapping.getHandler({ path: '/foo' });
            expect(chain.handler.id).toBe(fooController.id);
            chain = handlerMapping.getHandler({ path: '/bar' });
            expect(chain.handler.id).toBe(barController.id);
        });

        test('it should map multiple routes', () => {
            applicationContext.setValue('/foo /bar', fooController);

            let chain;
            const handlerMapping = new NamePathHandlerMapping();
            handlerMapping.setApplicationContext(applicationContext);

            chain = handlerMapping.getHandler({ path: '/foo' });
            expect(chain.handler.id).toBe(fooController.id);
            chain = handlerMapping.getHandler({ path: '/bar' });
            expect(chain.handler.id).toBe(fooController.id);
        });
    });

    describe('SimplePathHandlerMapping', () => {
        test('it should map', () => {
            const handlerMapping = new SimplePathHandlerMapping();
            let chain;
            handlerMapping.setMappings({
                '/foo': 'fooController',
                '/bar': 'barController',
            });
            handlerMapping.setApplicationContext(applicationContext);

            chain = handlerMapping.getHandler({ path: '/foo' });
            expect(chain.handler.id).toBe(fooController.id);

            chain = handlerMapping.getHandler({ path: '/bar' });
            expect(chain.handler.id).toBe(barController.id);
        });

        test('it should resolve token handlers (AD-34 D1)', () => {
            const fooToken = new ContextToken<TestController>('fooControllerToken');
            applicationContext.setValue(fooToken, fooController);

            const handlerMapping = new SimplePathHandlerMapping();
            handlerMapping.setMappings({ '/tok': fooToken });
            handlerMapping.setApplicationContext(applicationContext);

            const chain = handlerMapping.getHandler({ path: '/tok' });
            expect(chain.handler.id).toBe(fooController.id);
        });
    });

    describe('RadixMetadataHandlerMapping', () => {
        test('static routes resolve through the radix index', () => {
            @routeMapping('/hello')
            class StaticController {
                @routeMapping('/world')
                handle() {
                    return 'ok';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('staticController', new StaticController());

            const handlerMapping = new RadixMetadataHandlerMapping();
            handlerMapping.setApplicationContext(ctx);
            handlerMapping.init();

            const chain = handlerMapping.getHandler({ path: '/hello/world' } as unknown as Route);
            expect(chain).not.toBeNull();
            expect(chain?.handler).toBeDefined();
        });

        test('wildcard routes match through the radix index', () => {
            @routeMapping('/api')
            class WildcardController {
                @routeMapping('/*')
                handle() {
                    return 'ok';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('wildcardController', new WildcardController());

            const handlerMapping = new RadixMetadataHandlerMapping();
            handlerMapping.setApplicationContext(ctx);
            handlerMapping.init();

            const chain = handlerMapping.getHandler({ path: '/api/anything' } as unknown as Route);
            expect(chain).not.toBeNull();
            expect(chain?.handler).toBeDefined();
        });

        test('init is idempotent across DI auto-init and lifecycle start', () => {
            @routeMapping('/repeated')
            class RepeatedController {
                @routeMapping('/run')
                handle() {
                    return 'ok';
                }
            }

            const ctx = new GenericApplicationContext('idem');
            ctx.setValue('repeatedController', new RepeatedController());

            const handlerMapping = new RadixMetadataHandlerMapping();
            handlerMapping.setApplicationContext(ctx);
            // First init (the DI container auto-initializes Initializable
            // beans at registration).
            handlerMapping.init();
            // Second init (the lifecycle processor re-runs on refresh).
            handlerMapping.start();

            // Exactly one registration — no ambiguous-route duplicates.
            const handler = handlerMapping.getHandler({ path: '/repeated/run' } as unknown as Route);
            expect(handler).not.toBeNull();
            expect(handlerMapping.getHandlerMethods().size).toBe(1);
            expect(handlerMapping.isRunning).toBe(true);
            expect(handlerMapping.isAutoStartup).toBe(true);
            expect(handlerMapping.phase).toBeLessThan(0);
        });
    });
});
