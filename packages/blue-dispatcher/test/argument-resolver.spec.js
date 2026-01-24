import { BrowserDispatcher } from '../src/dispatcher';
import argumemtResolverContext from './assets/argument-resolver-context';

describe( 'ArgumentResolver', function(){
    const helloThereRequest = { path: '/hello/there', data: { name: 'John' }, 0: { name: 'hello' }, 1: { name: 'there', data: { name: 'Jim' } } };

    describe( 'instance', function(){
        let dispatcher;

        beforeEach( function(){
            dispatcher = new BrowserDispatcher();
            dispatcher.initStrategies( argumemtResolverContext );
        } );

        afterEach( function(){
            dispatcher = void 0;
        } );

        test( 'it should init resolve query arguments', function(){
            return dispatcher.dispatch( helloThereRequest );
        } );
    } );

} );
