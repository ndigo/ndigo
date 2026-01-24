import { expect } from 'chai';
import { ApplicationContextAwareProcessor, configuration, MetadataConfigApplicationContext, entry } from '@blue/context';
import { TestErrorResolver, TestViewResolver } from '../test-strategies';

import { routeMapping } from '../../src/route-mapping';
import { ModelAndView } from '../../src/model-and-view';
import { queryValue, matrixValue } from '../../src/route-parameter';

@routeMapping( '/hello' )
class HelloController {
    // /hello/there;name=Jack?name=John
    @routeMapping( '/there' )
    handleThere( @queryValue( 'name' ) n1, @matrixValue( 'name' ) n2 ){
        expect( n1 ).toBe( 'John' );
        expect( n2 ).toBe( 'Jack' );
        return new ModelAndView( 'test' );
    }
}

@configuration
class TestConfiguration {

    @entry
    errorResolvers(){
        return [ new TestErrorResolver() ];
    }

    @entry
    helloController(){
        return new HelloController();
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
