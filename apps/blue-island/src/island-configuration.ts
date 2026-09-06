import '@tsmetadata/polyfill';
import { configuration, entry } from '@blue/context';
import { resolve } from 'node:path';
import { StaticController } from '@blue/platform-node';
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
}
