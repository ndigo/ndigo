import { getMapping, ModelAndView } from '@blue/dispatcher';
import { ServerSentEventView } from '@blue/platform-node';
import { StringTemplateView } from '@blue/view';
import { TodoModel, TodoModelStore } from './todo-model-store';

// The server-rendered island markup — the Web Component tag with the
// serialized model. `hydrateIslands()` on the client upgrades it to a live
// element with `.model` restored.
const SHELL = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Blue Island — hybrid demo</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; }
        todo-app { display: block; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
    </style>
</head>
<body>
    <h1>Blue Island</h1>
    <p>Rendered by the <strong>server</strong>; the component below is a
       Web Component island hydrated on the <strong>client</strong>. Model
       updates are pushed from the server over SSE (AD-9).</p>
    <todo-app data-blue-island data-blue-model="{{islandModel}}"></todo-app>
    <script type="module" src="/static/client.js"></script>
</body>
</html>`;

/**
 * Serves the hybrid shell (the server-rendered island + client bundle) and
 * the reactive half of the demo (AD-9): `GET /events` pushes source-of-truth
 * model updates to the client as Server-Sent Events, which the hydrated
 * island consumes into its local reactive state (`@blue/signals`).
 */
@getMapping('/')
export class IslandController {
    readonly #modelStore: TodoModelStore;

    constructor(modelStore: TodoModelStore) {
        this.#modelStore = modelStore;
    }

    @getMapping('/')
    index() {
        const serialized = encodeURIComponent(JSON.stringify(this.#modelStore.get()));
        const view = new StringTemplateView();
        view.template = SHELL.replace('{{islandModel}}', serialized);
        return new ModelAndView(view, { islandModel: serialized });
    }

    /**
     * The push endpoint: one SSE event per model update, as it happens. The
     * view is a per-connection, imperative view — returned directly.
     */
    @getMapping('/events')
    events(): ServerSentEventView {
        const modelStore = this.#modelStore;

        async function* pushUpdates(): AsyncGenerator<{ event: string; data: { model: TodoModel } }> {
            const queue: TodoModel[] = [];
            let release: (() => void) | undefined;

            const notify = async (): Promise<void> => {
                queue.push(modelStore.get());
                release?.();
                release = undefined;
            };
            const unsubscribe = modelStore.subscribe(notify);
            try {
                while (true) {
                    if (queue.length === 0) {
                        // oxlint-disable-next-line no-await-in-loop -- a push channel is inherently sequential
                        await new Promise<void>((resolve) => {
                            release = resolve;
                        });
                    }
                    const model = queue.shift();
                    if (model === undefined) {
                        continue;
                    }
                    yield { event: 'model', data: { model } };
                }
            } finally {
                // The client disconnected (ServerSentEventView closes the iterator);
                // stop queueing updates for it.
                unsubscribe();
            }
        }

        return new ServerSentEventView(pushUpdates());
    }
}
