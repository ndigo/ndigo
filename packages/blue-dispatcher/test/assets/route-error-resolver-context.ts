import { ApplicationContextAwareProcessor, configuration, MetadataConfigApplicationContext, entry } from '@blue/context';
import { TestViewResolver } from '../test-strategies';

import { MetadataErrorResolver } from '../../src/route-error-resolver';
import { routeMapping } from '../../src/route-mapping';
import { ModelAndView } from '../../src/model-and-view';
import { errorMapping, errorHandler } from '../../src/error-mapping';

@routeMapping( '/bad' )
class BadController {
    @routeMapping( '/bad' )
    handleBad( route ){
        console.log( 'BadController::Handling Route' );//, route );
        throw new Error( 'Bad' );
    }

    @routeMapping( '/reference' )
    handleReference( route ){
        console.log( 'BadController::Handling Route' );//, route );
        throw new ReferenceError( 'Bad Reference' );
    }

    @routeMapping( '/syntax' )
    handleSyntax( route ){
        console.log( 'BadController::Handling Route' );//, route );
        throw new SyntaxError( 'Bad Syntax' );
    }

    @routeMapping( '/range' )
    handleRange( route ){
        console.log( 'BadController::Handling Route' );//, route );
        throw new RangeError( 'Bad Range' );
    }

    @errorMapping( RangeError )
    handleRangeError( route, error, handlerMethod ){
        console.log( 'BadController::Handling RangeError' );//, route, error, handlerMethod );
        return new ModelAndView( 'error' );
    }
}

@errorHandler
class GlobalErrorHandler {

    @errorMapping( Error )
    handleError( route, error, handlerMethod ){
        console.log( 'GlobalErrorHandler::Handling Error' );//, route, error, handlerMethod );
        return new ModelAndView( 'error' );
    }

    @errorMapping( TypeError )
    handleTypeError( route, error, handlerMethod ){
        console.log( 'GlobalErrorHandler::Handling TypeError' );//, route, error, handlerMethod );
        return new ModelAndView( 'error' );
    }

    @errorMapping( [ ReferenceError, SyntaxError ] )
    handleOtherErrors( route, error, handlerMethod ){
        console.log( 'GlobalErrorHandler::Handling other errors' );//, route, error, handlerMethod );
        return new ModelAndView( 'error' );
    }
}

@configuration
class TestConfiguration {

    @entry
    badController(){
        return new BadController();
    }

    @entry
    errorResolvers(){
        const metadataErrorResolver = new MetadataErrorResolver();
        return [ metadataErrorResolver ];
    }

    @entry
    globalErrorResolver(){
        return new GlobalErrorHandler();
    }

    @entry
    viewResolver(){
        return new TestViewResolver();
    }
}

const
    context = new MetadataConfigApplicationContext( 'test' ),
    processor = new ApplicationContextAwareProcessor( context );

context.addProcessor( processor );
context.register( TestConfiguration );

export default context;
