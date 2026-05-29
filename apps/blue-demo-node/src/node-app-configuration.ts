/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { configuration, entry } from '@blue/context';
import { GreetingController } from './greeting-controller';

/**
 * Application-level configuration for the Node.js demo.
 * Registers the demo controller with the application context.
 */
@configuration
export class NodeAppConfiguration {
    /**
     * Registers the greeting controller.
     */
    @entry
    greetingController() {
        return new GreetingController();
    }
}