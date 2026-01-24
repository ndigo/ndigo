import { NamePathHandlerMapping, SimplePathHandlerMapping } from '../src/route-handler-mapping';

import { GenericApplicationContext } from '@blue/context';
import { TestController } from './test-strategies';

describe( 'RouteHandlerMapping', function(){
    let applicationContext, fooController, barController;

    beforeEach( function(){
        fooController = new TestController();
        fooController.id = 1;
        barController = new TestController();
        barController.id = 2;

        applicationContext = new GenericApplicationContext( 'test' );
        applicationContext.setValue( 'fooController', fooController );
        applicationContext.setValue( 'barController', barController );
    } );

    afterEach( function(){
        applicationContext.destroy();
        fooController = barController = applicationContext = undefined;
    } );

    context( 'NamePathHandlerMapping', function(){
        test( 'it should map individual routes', function(){
            applicationContext.setValue( '/foo', fooController );
            applicationContext.setValue( '/bar', barController );

            let chain;
            const handlerMapping = new NamePathHandlerMapping();
            handlerMapping.setApplicationContext( applicationContext );

            chain = handlerMapping.getHandler( { path: '/foo' } );
            expect( chain.handler.id ).toBe( fooController.id );
            chain = handlerMapping.getHandler( { path: '/bar' } );
            expect( chain.handler.id ).toBe( barController.id );
        } );

        test( 'it should map multiple routes', function(){
            applicationContext.setValue( '/foo /bar', fooController );

            let chain;
            const handlerMapping = new NamePathHandlerMapping();
            handlerMapping.setApplicationContext( applicationContext );

            chain = handlerMapping.getHandler( { path: '/foo' } );
            expect( chain.handler.id ).toBe( fooController.id );
            chain = handlerMapping.getHandler( { path: '/bar' } );
            expect( chain.handler.id ).toBe( fooController.id );
        } );
    } );

    context( 'SimplePathHandlerMapping', function(){
        test( 'it should map', function(){
            const handlerMapping = new SimplePathHandlerMapping();
            let chain;
            handlerMapping.setMappings( {
                '/foo': 'fooController',
                '/bar': 'barController'
            } );
            handlerMapping.setApplicationContext( applicationContext );

            chain = handlerMapping.getHandler( { path: '/foo' } );
            expect( chain.handler.id ).toBe( fooController.id );

            chain = handlerMapping.getHandler( { path: '/bar' } );
            expect( chain.handler.id ).toBe( barController.id );
        } );
    } );
} );
