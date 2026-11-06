/**
 */
import '@tsmetadata/polyfill';
import { configuration, entry } from '@ndigo/context';
import { HelloController } from './hello-controller';

@configuration
export class HelloConfiguration {
    @entry()
    helloController() {
        return new HelloController();
    }
}
