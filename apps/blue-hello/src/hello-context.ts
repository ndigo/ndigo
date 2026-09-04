/**
 * @author Jeff Rose
 */

import {
    ApplicationContextAwareProcessor,
    configuration,
    MetadataConfigApplicationContext,
    entry,
} from '@blue/context';
import { LinearMetadataHandlerMapping } from '@blue/dispatcher';
import { NameViewResolver } from '@blue/view';
import { DOMElementViewTarget, WebComponentViewEngine } from '@blue/view-webcomponent';
import HelloController from './hello-controller';

@configuration
class HelloConfiguration {
    @entry
    helloController() {
        return new HelloController();
    }

    @entry
    handlerMapping() {
        return new LinearMetadataHandlerMapping();
    }

    @entry
    viewResolver() {
        return new NameViewResolver();
    }

    @entry
    viewTarget() {
        return new DOMElementViewTarget(document.getElementById('app'));
    }

    @entry
    webComponentViewEngine() {
        return new WebComponentViewEngine();
    }
}

const context = new MetadataConfigApplicationContext('hello');
const processor = new ApplicationContextAwareProcessor(context);

context.addProcessor(processor);
context.register(HelloConfiguration);

export default context;
