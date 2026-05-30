import {
    ApplicationContextAwareProcessor,
    configuration,
    MetadataConfigApplicationContext,
    entry,
} from '@blue/context';
import {
    TestController,
    TestControllerHandlerAdapter,
    TestHandlerInterceptor,
    TestLanguageResolver,
    TestThemeResolver,
    TestViewResolver,
} from '../test-strategies';

import {
    SimplePathHandlerMapping,
    LinearMetadataHandlerMapping,
    NamePathHandlerMapping,
} from '../../src/route-handler-mapping';
import { routeMapping } from '../../src/route-mapping';
import { ModelAndView } from '../../src/model-and-view';
import { MetadataHandlerAdapter } from '../../src/route-handler-adapter';
import { Route } from '@blue/router';

@routeMapping('/hello')
class HelloController {
    @routeMapping('/world')
    handleWorld(route: Route) {
        return new ModelAndView('test');
    }
}

/**
 * ? Is this a pattern we could use to run legacy controllers? -JBR
const
    AsLegacyController = ( controllerContext ) => {
        this.index = function(){

        };
    },
    LegacyController = AsLegacyController.call( {} );

Reflect.defineMetadata( 'route:mapping', true, LegacyController );
Reflect.defineMetadata( 'route:mapping', true, LegacyController, 'index' );
*/

@configuration
class TestConfiguration {
    @entry
    ['/foo /bar']() {
        return new TestController();
    }

    @entry
    helloController() {
        return new HelloController();
    }

    @entry
    quxController() {
        return new TestController();
    }

    @entry
    handlerAdapters() {
        return [new MetadataHandlerAdapter(), new TestControllerHandlerAdapter()];
    }

    @entry
    handlerMappings() {
        const simplePathHandlerMapping = new SimplePathHandlerMapping();
        simplePathHandlerMapping.interceptors.push(new TestHandlerInterceptor());
        simplePathHandlerMapping.setMappings({
            '/baz': 'bazController',
            '/qux': 'quxController',
        });
        return [new NamePathHandlerMapping(), simplePathHandlerMapping, new LinearMetadataHandlerMapping()];
    }

    @entry
    languageResolver() {
        return new TestLanguageResolver();
    }

    @entry
    themeResolver() {
        return new TestThemeResolver();
    }

    @entry
    viewResolver() {
        return new TestViewResolver();
    }
}

const context = new MetadataConfigApplicationContext('test'),
    processor = new ApplicationContextAwareProcessor(context);

// Example of programmatically setting up context
context.setValue('bazController', TestController);

context.addProcessor(processor);
context.register(TestConfiguration);

export default context;
