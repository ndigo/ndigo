/**
 * @module ndigo-hello
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configuration, entry, MetadataConfigApplicationContext } from '@ndigo/context';
import { WebAutoConfiguration } from '@ndigo/platform-web';
import { DOMElementViewTarget } from '@ndigo/view-webcomponent';
import HelloController from './hello-controller';

@configuration
class HelloConfiguration {
    @entry()
    helloController() {
        return new HelloController();
    }

    /**
     * The render destination. Everything else (handler mapping, view
     * resolver chain, web-component engine) comes from WebAutoConfiguration.
     */
    @entry()
    viewTarget() {
        return new DOMElementViewTarget(document.getElementById('app'));
    }
}

const context = new MetadataConfigApplicationContext('hello');
context.register(WebAutoConfiguration);
context.register(HelloConfiguration);

export default context;
