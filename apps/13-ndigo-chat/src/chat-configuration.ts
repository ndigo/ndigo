/**
 * Application composition: the room/STOMP/shell controllers, the shared room
 * store, the static client-bundle controller, and the EJS view resolver.
 * @module ndigo-chat
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { fileURLToPath } from 'node:url';
import { configuration, entry } from '@ndigo/context';
import { FileSystemResourceLoader, StaticController } from '@ndigo/platform-node';
import { EJSViewResolver } from '@ndigo/view-ejs';
import { ChatController } from './chat-controller';
import { RoomController } from './room-controller';
import { RoomService } from './room-service';
import { StompChatController } from './stomp-chat-controller';

/**
 * Ndigo Chat configuration.
 */
@configuration
export class ChatConfiguration {
    // One store shared by every room connection: the history and presence a
    // newcomer is handed come from here, not from any single session.
    readonly #rooms = new RoomService();

    /**
     * @returns The room socket controller (history/presence + fan-out).
     */
    @entry()
    roomController() {
        return new RoomController(this.#rooms);
    }

    /**
     * @returns The STOMP interop endpoint.
     */
    @entry()
    stompChatController() {
        return new StompChatController();
    }

    /**
     * @returns The shell controller.
     */
    @entry()
    chatController() {
        return new ChatController();
    }

    /**
     * Serves the Vite-built client bundle (`dist/`) under `/static/`, resolved
     * from this file so the server works from any working directory.
     *
     * @returns The static controller.
     */
    @entry()
    staticController() {
        return new StaticController(fileURLToPath(new URL('../dist/', import.meta.url)));
    }

    /**
     * Resolves the shell view name to the EJS template in `views/`.
     *
     * @returns The EJS view resolver.
     */
    @entry()
    viewResolver() {
        return new EJSViewResolver({
            loader: new FileSystemResourceLoader(),
            prefix: fileURLToPath(new URL('../views/', import.meta.url)),
            suffix: '.ejs',
        });
    }
}
