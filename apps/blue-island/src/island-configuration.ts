/**
 * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { configuration, entry } from '@blue/context';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StaticController, FileSystemResourceLoader } from '@blue/platform-node';
import { EJSViewResolver } from '@blue/view-ejs';
import { IslandController } from './island-controller';
import { TodoModelStore } from './todo-model-store';

/**
 * Blue Island configuration: the server-rendered island controller plus the
 * static client-bundle server (reuses the shared `StaticResourceResolver`).
 */
@configuration
export class IslandConfiguration {
    // The composition root: one store instance shared by the shell (initial
    // snapshot) and the SSE push endpoint.
    readonly #modelStore = new TodoModelStore({
        items: [
            { text: 'Server-rendered island', done: true },
            { text: 'Hydrated on the client', done: false },
        ],
        filter: 'all',
    });

    @entry
    islandController() {
        return new IslandController(this.#modelStore);
    }

    @entry
    staticController() {
        // Serve the Vite-built client bundle (dist/) — explicit base, no env.
        return new StaticController(resolve('dist'));
    }

    @entry
    modelStore() {
        return this.#modelStore;
    }

    /**
     * Resolves view names to EJS templates in the app's views/ directory —
     * whole-page document rendering (servlet/JSP-style). Reads templates
     * through the framework `ResourceLoader` seam, so this demo exercises
     * the full source → engine → producer pipeline.
     */
    @entry
    viewResolver() {
        return new EJSViewResolver({
            loader: new FileSystemResourceLoader(),
            prefix: fileURLToPath(new URL('../views/', import.meta.url)),
            suffix: '.ejs',
        });
    }
}
