import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { NamePathHandlerMapping, SimplePathHandlerMapping } from '../src/route-handler-mapping';
import { GenericApplicationContext } from '@blue/context';
import { TestController } from './test-strategies';

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
});
