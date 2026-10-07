/**
 * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getMapping, ModelAndView, parameters, requestMapping, routeValue } from '@blue/dispatcher';
import { ServerSentEventView } from '@blue/platform-node';
import { IslandView } from '@blue/view';
import type { Route } from '@blue/router';
import { TodoModel, TodoModelStore } from './todo-model-store';

/**
 * Escapes HTML-significant characters for the server-rendered island fallback.
 *
 * The fallback is built from the (server-controlled) model, but item text and
 * the filter are authored data in any real todo app, so they are escaped
 * rather than trusted — only the surrounding markup is trusted.
 */
function escapeHtmlText(value: string): string {
    const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
    return value.replace(/[&<>"]/g, (character) => entities[character]);
}

/**
 * Server-renders the island's first-paint fallback from the todo model: the
 * same item list + filter line the client component paints. Passed to
 * `IslandView` as its trusted `shadowHtml` option, the browser parses it into
 * a real declarative shadow root, so the page shows real content before any
 * script runs (ADR-69 D-3); hydration then replaces it in place.
 */
function renderTodoFallback(model: TodoModel): string {
    const items = model.items
        .map((item) => `<li>${item.done ? '✅' : '⬜'} ${escapeHtmlText(item.text)}</li>`)
        .join('');
    const hint = `[hydrated on client] ${model.items.length} item(s), filter: ${escapeHtmlText(model.filter)}`;
    return `<ul>${items}</ul><p style="font-size:0.85rem;color:#666">${hint}</p>`;
}

/**
 * Renders the island marker through `IslandView` into a string.
 *
 * Deferred to the shell's render phase on purpose: the dispatcher records the
 * negotiated language on the route only in its render phase (after the handler
 * returns), so rendering here keeps the marker's `data-blue-locale` identical
 * to the shell's own locale without re-implementing language negotiation in
 * the application.
 */
async function renderIslandMarkup(island: IslandView, model: TodoModel, route: Route): Promise<string> {
    let html = '';
    await island.render(model, route, {
        prepare(): void {},
        commit(output): void {
            html = output as string;
        },
        clear(): void {},
    });
    return html;
}

/**
 * Serves the hybrid shell (the server-rendered island + client bundle) and
 * the reactive half of the demo (AD-09): `GET /events` pushes source-of-truth
 * model updates to the client as Server-Sent Events, which the hydrated
 * island consumes into its local reactive state (`@blue/signals`).
 */
@requestMapping('/')
export class IslandController {
    readonly #modelStore: TodoModelStore;

    constructor(modelStore: TodoModelStore) {
        this.#modelStore = modelStore;
    }

    /**
     * Renders the whole-page shell. The island itself is built through
     * `IslandView` with a server-rendered `shadowHtml` fallback derived from
     * the model, so the served document carries a declarative shadow root
     * (`<template shadowrootmode="open">`) that paints real content before any
     * script runs; the shell interpolates the island markup raw. Hydration
     * upgrades the element in place (ADR-69 D-3).
     *
     * The island markup is produced lazily during the shell's render
     * ({@link renderIslandMarkup}) — see that function for why.
     */
    @getMapping('/')
    @parameters({ route: routeValue() })
    index(route: Route) {
        const model = this.#modelStore.get();
        const island = new IslandView('todo-app', { shadowHtml: renderTodoFallback(model) });

        // Whole-page document mode: the shell is an EJS template resolved by
        // name through the EJSViewResolver — servlet/JSP-style, no inline HTML.
        return new ModelAndView('shell', {
            renderIslandHtml: () => renderIslandMarkup(island, model, route),
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
            // Snapshot-on-connect (APP-N3): a client that connects after the
            // 3-second boot ticker has completed must still hydrate — the
            // current model is sent as the first event of the stream.
            yield { event: 'model', data: { model: modelStore.get() } };

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
