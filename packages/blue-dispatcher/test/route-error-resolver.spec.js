const { expect, use } = require( 'chai' );
const sinon_chai = require( 'sinon-chai' );
const chai_as_promised = require( 'chai-as-promised' );
import { BrowserDispatcher } from '../src/dispatcher';
import routeErrorResolverContext from './assets/route-error-resolver-context';
import { handleRouteSpy, renderSpy, errorModel } from './test-strategies';
import { SimpleMappingErrorResolver } from '../src/route-error-resolver';

use( chai_as_promised );
use( sinon_chai );

describe( 'MetadataErrorResolver', function(){
    const
        badRoute = { path: '/bad/bad' },
        badRangeRoute = { path: '/bad/range' },
        badReferenceRoute = { path: '/bad/reference' },
        badSyntaxRoute = { path: '/bad/syntax' };

    context( 'instance', function(){
        let dispatcher;

        beforeEach( function(){
            dispatcher = new BrowserDispatcher();
            dispatcher.initStrategies( routeErrorResolverContext );
        } );

        afterEach( function(){
            dispatcher = void 0;
        } );

        test( 'it should resolve errors', function(){
            const routes = Promise.all( [
                    dispatcher.dispatch( badRoute ),
                    dispatcher.dispatch( badRangeRoute ),
                    dispatcher.dispatch( badReferenceRoute ),
                    dispatcher.dispatch( badSyntaxRoute )
                ] )
                .then( function(){
                    expect( renderSpy ).to.have.been.calledWith( errorModel, badRoute );
                    expect( renderSpy ).to.have.been.calledWith( errorModel, badRangeRoute );
                    expect( renderSpy ).to.have.been.calledWith( errorModel, badReferenceRoute );
                    expect( renderSpy ).to.have.been.calledWith( errorModel, badSyntaxRoute );
                } );
            expect( routes ).to.eventually.be.fulfilled;
            return routes;
        } );
    } );

} );

describe( 'SimpleMappingErrorResolver', function(){
    class TestHandler {
        constructor(){
            this.handleRoute = handleRouteSpy;
        }
    }

    context( 'instance', function(){
        let errorResolver;

        beforeEach( function(){
            errorResolver = new SimpleMappingErrorResolver( 'defaultError' );
        } );

        afterEach( function(){
            errorResolver = void 0;
        } );

        test( 'it should resolve errors', function(){
            let mav;

            expect( errorResolver ).toHaveProperty( 'defaultErrorView' ).that.equals( 'defaultError' );

            errorResolver.mappedHandlerClasses = [ TestHandler ];
            errorResolver.errorMappings.set( 'SyntaxError', 'syntaxError' );
            errorResolver.errorMappings.set( 'ReferenceError', 'referenceError' );

            mav = errorResolver.resolveError( { path: '/bad/syntax' }, new TestHandler(), SyntaxError );
            expect( mav ).toHaveProperty( 'viewName' ).that.equals( 'syntaxError' );

            mav = errorResolver.resolveError( { path: '/bad/syntax' }, new TestHandler(), ReferenceError );
            expect( mav ).toHaveProperty( 'viewName' ).that.equals( 'referenceError' );

            mav = errorResolver.resolveError( { path: '/foo' }, new TestHandler(), Error );
            expect( mav ).toHaveProperty( 'viewName' ).that.equals( 'defaultError' );
        } );
    } );

} );
