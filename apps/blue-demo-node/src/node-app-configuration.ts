import '@tsmetadata/polyfill';
import { configuration, entry } from '@blue/context';
import { GreetingController } from './greeting-controller';
import { AuthController } from './auth-controller';
import { NoteController } from './note-controller';

@configuration
export class NodeAppConfiguration {
    @entry greetingController() { return new GreetingController(); }
    @entry authController() { return new AuthController(); }
    @entry noteController() { return new NoteController(); }
}