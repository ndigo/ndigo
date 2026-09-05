import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import {
    NamePathHandlerMapping,
    SimplePathHandlerMapping,
    LinearMetadataHandlerMapping,
} from '../src/route-handler-mapping';
import { GenericApplicationContext } from '@blue/context';
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
        fooController = barController = applicationContext = undefined as any;
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
    });

    describe('LinearMetadataHandlerMapping', () => {
        test('static routes are indexed in #pathLookup fast path', () => {
            @routeMapping('/hello')
            class StaticController {
                @routeMapping('/world')
                handle() {
                    return 'ok';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('staticController', new StaticController());

            const handlerMapping = new LinearMetadataHandlerMapping();
            handlerMapping.setApplicationContext(ctx);
            handlerMapping.init();

            const spy = vi.spyOn(handlerMapping.mappingRegistry, 'getMappingsByPath');
            handlerMapping.getHandler({ path: '/hello/world' } as any);

            expect(spy).toHaveBeenCalledWith('/hello/world');
            const result = handlerMapping.mappingRegistry.getMappingsByPath('/hello/world');
            expect(result).not.toBeNull();
            expect(result.length).toBeGreaterThan(0);
        });

        test('wildcard routes are NOT indexed in #pathLookup', () => {
            @routeMapping('/api')
            class WildcardController {
                @routeMapping('/*')
                handle() {
                    return 'ok';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('wildcardController', new WildcardController());

            const handlerMapping = new LinearMetadataHandlerMapping();
            handlerMapping.setApplicationContext(ctx);
            handlerMapping.init();

            const result = handlerMapping.mappingRegistry.getMappingsByPath('/api/anything');
            expect(!result || result.length === 0).toBe(true);
        });
    });
});
