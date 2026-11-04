/**
 * Application composition: the board service (seeded demo board), the socket
 * broadcaster, the REST/socket/shell controllers, the static client-bundle
 * controller, and the EJS view resolver.
 *
 * @module ndigo-kanban
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { fileURLToPath } from 'node:url';
import { configuration, entry } from '@ndigo/context';
import { FileSystemResourceLoader, StaticController } from '@ndigo/platform-node';
import { EJSViewResolver } from '@ndigo/view-ejs';
import { BoardBroadcaster } from './board-broadcaster';
import { BoardController } from './board-controller';
import { BoardService, BOARD_SERVICE } from './board-service';
import { BoardSocketController } from './board-socket-controller';
import { ShellController } from './shell-controller';

/**
 * Ndigo Kanban configuration.
 */
@configuration
export class KanbanConfiguration {
    // One service for the whole process: it owns the entity stores, the write
    // queue and the event listeners. The broadcaster subscribes to it in its
    // constructor, so it must be built after the service.
    readonly #boards = new BoardService();

    /**
     * @returns The board service (persistence + concurrency + events).
     */
    @entry(BOARD_SERVICE)
    boardService() {
        return this.#boards;
    }

    /**
     * @returns The socket broadcaster, subscribed to the service's events.
     */
    @entry()
    boardBroadcaster() {
        return new BoardBroadcaster(this.#boards);
    }

    /**
     * @returns The REST controller.
     */
    @entry()
    boardController() {
        return new BoardController(this.#boards);
    }

    /**
     * @returns The board socket endpoint.
     */
    @entry()
    boardSocketController() {
        return new BoardSocketController(this.#boards);
    }

    /**
     * @returns The shell controller.
     */
    @entry()
    shellController() {
        return new ShellController();
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
