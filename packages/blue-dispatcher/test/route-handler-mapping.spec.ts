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
import RouteHandlerExecutionChain from '../src/route-handler-execution-chain';
import { routeMapping } from '../src/route-mapping';
import { parameters, pathVariable } from '../src/parameters';

/** Resolve a matched route's handler as the TestController these tests register. */
const controllerOf = (chain: RouteHandlerExecutionChain | null): TestController =>
    (chain as NonNullable<typeof chain>).handler as TestController;

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
        (fooController as TestController | undefined) = undefined;
        (barController as TestController | undefined) = undefined;
        (applicationContext as GenericApplicationContext | undefined) = undefined;
    });

    describe('NamePathHandlerMapping', () => {
        test('it should map individual routes', () => {
            applicationContext.setValue('/foo', fooController);
            applicationContext.setValue('/bar', barController);

            let chain;
            const handlerMapping = new NamePathHandlerMapping();
            handlerMapping.setApplicationContext(applicationContext);

            chain = handlerMapping.getHandler({ path: '/foo' } as unknown as Route);
            expect(controllerOf(chain).id).toBe(fooController.id);
            chain = handlerMapping.getHandler({ path: '/bar' } as unknown as Route);
            expect(controllerOf(chain).id).toBe(barController.id);
        });

        test('it should map multiple routes', () => {
            applicationContext.setValue('/foo /bar', fooController);

            let chain;
            const handlerMapping = new NamePathHandlerMapping();
            handlerMapping.setApplicationContext(applicationContext);

            chain = handlerMapping.getHandler({ path: '/foo' } as unknown as Route);
            expect(controllerOf(chain).id).toBe(fooController.id);
            chain = handlerMapping.getHandler({ path: '/bar' } as unknown as Route);
            expect(controllerOf(chain).id).toBe(fooController.id);
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

            chain = handlerMapping.getHandler({ path: '/foo' } as unknown as Route);
            expect(controllerOf(chain).id).toBe(fooController.id);

            chain = handlerMapping.getHandler({ path: '/bar' } as unknown as Route);
            expect(controllerOf(chain).id).toBe(barController.id);
        });

        test('it should resolve token handlers (AD-34 D1)', () => {
            const fooToken = new ContextToken<TestController>('fooControllerToken');
            applicationContext.setValue(fooToken, fooController);

            const handlerMapping = new SimplePathHandlerMapping();
            handlerMapping.setMappings({ '/tok': fooToken });
            handlerMapping.setApplicationContext(applicationContext);

            const chain = handlerMapping.getHandler({ path: '/tok' } as unknown as Route);
            expect(controllerOf(chain).id).toBe(fooController.id);
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

        test('exposes handler methods by their mapping name (HT-8)', () => {
            @routeMapping('/hello')
            class NamedController {
                @routeMapping('/world')
                handle() {
                    return 'ok';
                }
            }

            const ctx = new GenericApplicationContext('named');
            ctx.setValue('namedController', new NamedController());

            const handlerMapping = new RadixMetadataHandlerMapping();
            handlerMapping.setApplicationContext(ctx);
            handlerMapping.init();

            const methods = handlerMapping.getHandlerMethodsForMappingName('/hello/world');
            expect(methods).toHaveLength(1);
            expect(methods[0]?.method).toBe('handle');
        });

        test('honors a custom naming strategy (HT-8)', () => {
            @routeMapping('/custom')
            class CustomNamedController {
                @routeMapping('/named')
                handle() {
                    return 'ok';
                }
            }

            const ctx = new GenericApplicationContext('custom-named');
            ctx.setValue('customNamedController', new CustomNamedController());

            const handlerMapping = new RadixMetadataHandlerMapping();
            handlerMapping.namingStrategy = { getName: () => 'custom-name' };
            handlerMapping.setApplicationContext(ctx);
            handlerMapping.init();

            expect(handlerMapping.getHandlerMethodsForMappingName('custom-name')).toHaveLength(1);
            expect(handlerMapping.getHandlerMethodsForMappingName('/custom/named')).toHaveLength(0);
        });

        test('unregistering a mapping removes it from the name lookup (HT-8)', () => {
            @routeMapping('/gone')
            class GoneController {
                @routeMapping('/now')
                handle() {
                    return 'ok';
                }
            }

            const ctx = new GenericApplicationContext('gone');
            ctx.setValue('goneController', new GoneController());

            const handlerMapping = new RadixMetadataHandlerMapping();
            handlerMapping.setApplicationContext(ctx);
            handlerMapping.init();

            const mapping = [...handlerMapping.getHandlerMethods().keys()][0];
            expect(handlerMapping.getHandlerMethodsForMappingName('/gone/now')).toHaveLength(1);
            handlerMapping.unregisterMapping(mapping);
            expect(handlerMapping.getHandlerMethodsForMappingName('/gone/now')).toHaveLength(0);
        });

        test('enumerates mapping entries with pattern, method, handler and parameters', () => {
            @routeMapping('/inspect')
            class InspectController {
                @routeMapping({ value: '/items/{id}', method: 'GET', private: false })
                @parameters({ id: pathVariable('id') })
                item(id: string) {
                    return id;
                }
            }

            const ctx = new GenericApplicationContext('inspect');
            ctx.setValue('inspectController', new InspectController());

            const handlerMapping = new RadixMetadataHandlerMapping();
            handlerMapping.setApplicationContext(ctx);
            handlerMapping.init();

            const entries = handlerMapping.getMappingEntries();
            expect(entries).toHaveLength(1);

            const [entry] = entries;
            expect([...entry.mapping.patternsCondition.patterns]).toContain('/inspect/items/{id}');
            expect(entry.mapping.methodCondition.method).toBe('GET');
            expect(entry.mappingName).toBe('/inspect/items/{id}');
            expect(entry.handlerMethod.handler).toBeInstanceOf(InspectController);
            expect(entry.handlerMethod.method).toBe('item');
            expect(entry.handlerMethod.parameters.map((parameter) => parameter.type.type)).toEqual(['path:variable']);
        });
    });
});
