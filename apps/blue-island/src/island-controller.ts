/**
 * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getMapping, ModelAndView, requestMapping } from '@blue/dispatcher';
import { ServerSentEventView } from '@blue/platform-node';
import { TodoModel, TodoModelStore } from './todo-model-store';

/**
 * Serves the hybrid shell (the server-rendered island + client bundle) and
 * the reactive half of the demo (AD-9): `GET /events` pushes source-of-truth
 * model updates to the client as Server-Sent Events, which the hydrated
 * island consumes into its local reactive state (`@blue/signals`).
 */
@requestMapping('/')
export class IslandController {
    readonly #modelStore: TodoModelStore;

    constructor(modelStore: TodoModelStore) {
        this.#modelStore = modelStore;
    }

    @getMapping('/')
    index() {
        // Whole-page document mode: the shell is an EJS template resolved by
        // name through the EJSViewResolver — servlet/JSP-style, no inline HTML.
        return new ModelAndView('shell', {
            islandModel: encodeURIComponent(JSON.stringify(this.#modelStore.get())),
            // Fixed sample timestamp so the localized date rendering stays
            // deterministic across runs (locale helpers format it).
            today: new Date('2026-09-13T12:00:00Z'),
        });
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
