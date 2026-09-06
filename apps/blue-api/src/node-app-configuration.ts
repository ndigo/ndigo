import '@tsmetadata/polyfill';
import { configuration, entry } from '@blue/context';
import { StaticController } from '@blue/platform-node';
import { GreetingController } from './greeting-controller';
import { AuthController } from './auth-controller';
import { NoteController } from './note-controller';
import { DrizzleNoteController } from './drizzle-note-controller';
import { ProductController } from './product-controller';

@configuration
export class NodeAppConfiguration {
    @entry greetingController() {
        return new GreetingController();
    }
    @entry authController() {
        return new AuthController();
    }
    @entry noteController() {
        return new NoteController();
    }
    @entry drizzleNoteController() {
        return new DrizzleNoteController();
    }
    @entry productController() {
        return new ProductController();
    }
    @entry staticController() {
        return new StaticController();
    }
}
