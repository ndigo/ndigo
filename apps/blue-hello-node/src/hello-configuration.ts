import '@tsmetadata/polyfill';
import { configuration, entry } from '@blue/context';
import { HelloController } from './hello-controller';

@configuration
export class HelloConfiguration {
    @entry
    helloController() {
        return new HelloController();
    }
}
