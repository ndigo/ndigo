/**
 * @module blue-hello-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { configuration, entry } from '@blue/context';
import { HelloController } from './hello-controller';

@configuration
export class HelloConfiguration {
    @entry()
    helloController() {
        return new HelloController();
    }
}
