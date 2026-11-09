/**
 */
import {
    dataBinderValue,
    getMapping,
    ModelAndView,
    parameters,
    postMapping,
    requestMapping,
    routeValue,
    validatedBy,
} from '@ndigo/dispatcher';
import { ServerSentEventView } from '@ndigo/platform-node';
import { IslandView } from '@ndigo/view';
import type { Route } from '@ndigo/router';
import { z } from 'zod';
import { TodoModel, TodoModelStore } from './todo-model-store';

/**
 * The add-item form's server contract (AD-71 reference integration): the
 * bound form body arrives as strings, so the schema is the single validation
 * source (trim → non-empty → bounded).
 */
const AddItemSchema = z.object({ text: z.string().trim().min(1).max(200) });

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
 * same item list + filter line the client component paints, plus a skeleton
 * line for the adopted library's form. Passed to `IslandView` as its trusted
 * `shadowHtml` option, the browser parses it into a real declarative shadow
 * root, so the page shows real content before any script runs (ADR-69 D-3);
 * hydration then replaces it in place. Third-party components cannot
 * server-render portably yet, so the derived fallback is the documented
 * pattern (AD-71 D-4).
 */
function renderTodoFallback(model: TodoModel): string {
    const items = model.items
        .map((item) => `<li>${item.done ? '✅' : '⬜'} ${escapeHtmlText(item.text)}</li>`)
        .join('');
    const hint = `[hydrated on client] ${model.items.length} item(s), filter: ${escapeHtmlText(model.filter)}`;
    const formSkeleton = '[first paint] The add-item form (native controls) hydrates on the client.';
    return `<ul>${items}</ul><p style="font-size:0.85rem;color:#666">${hint}</p><p style="color:#666">${formSkeleton}</p>`;
}

/**
 * Renders the island marker through `IslandView` into a string.
 *
 * Deferred to the shell's render phase on purpose: the dispatcher records the
 * negotiated language on the route only in its render phase (after the handler
 * returns), so rendering here keeps the marker's `data-ndigo-locale` identical
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
 * The SSE push stream for one client connection (AD-09): the current snapshot
 * first (APP-N3 snapshot-on-connect), then one event per *coalesced* model
 * change.
 *
 * Each event carries the whole model, so an update that arrives while a
 * previous one is still pending supersedes it: the queue is a single slot
 * holding the newest snapshot (bound 1). A slow consumer therefore never
 * accumulates full-model frames — it sees the latest state, not a backlog
 * (APP-D). Updates that land mid-yield coalesce into the next emission.
 *
 * Extracted from {@link IslandController.events} so the coalescing/bounding
 * contract is directly testable without a socket.
 *
 * @param modelStore - The shared source-of-truth store to follow.
 * @returns An async generator of validated `model` frames for one connection.
 */
export async function* modelUpdateStream(
    modelStore: TodoModelStore
): AsyncGenerator<{ event: string; data: { model: TodoModel } }> {
    // The coalescing slot: only the newest pending snapshot is retained.
    let pending: TodoModel | undefined;
    let release: (() => void) | undefined;

    const notify = async (): Promise<void> => {
        pending = modelStore.get();
        release?.();
        release = undefined;
    };
    // Subscribe before the first yield: an update between the snapshot frame
    // being written and the consumer asking for the next one must still be
    // delivered (into the coalescing slot), not lost.
    const unsubscribe = modelStore.subscribe(notify);
    try {
        // Snapshot-on-connect (APP-N3): a client that connects after the
        // 3-second boot ticker has completed must still hydrate — the current
        // model is sent as the first event of the stream.
        yield { event: 'model', data: { model: modelStore.get() } };

        for (;;) {
            while (pending === undefined) {
                const gate = Promise.withResolvers<void>();
                release = gate.resolve;
                // oxlint-disable-next-line no-await-in-loop -- a push channel is inherently sequential
                await gate.promise;
            }
            const model = pending;
            pending = undefined;
            yield { event: 'model', data: { model } };
        }
    } finally {
        // The client disconnected (ServerSentEventView closes the iterator);
        // stop coalescing updates for it.
        unsubscribe();
    }
}

/**
 * Serves the hybrid shell (the server-rendered island + client bundle) and
 * the reactive half of the demo (AD-09): `GET /events` pushes source-of-truth
 * model updates to the client as Server-Sent Events, which the hydrated
 * island consumes into its local reactive state (`@ndigo/signals`).
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
     * Accepts the island's add-item form: native inputs submit ordinary
     * `application/x-www-form-urlencoded` name/value pairs — bound and
     * validated through the standard path (`dataBinderValue` + Zod, guides
     * 06/07), with no component-specific handling.
     *
     * The mutation goes through the model store, so every connected client
     * (including the submitting one) receives the update over SSE.
     */
    @postMapping('/items')
    @parameters({ item: validatedBy(AddItemSchema, dataBinderValue('body')) })
    addItem(item: { text: string }) {
        const text = item.text;
        this.#modelStore.update((model) => {
            model.items.push({ text, done: false });
        });
        return { accepted: text };
    }

    /**
     * The push endpoint: the coalesced model update stream, one SSE event per
     * emission (APP-D) — see {@link modelUpdateStream}. The view is a
     * per-connection, imperative view — returned directly.
     */
    @getMapping('/events')
    events(): ServerSentEventView {
        return new ServerSentEventView(modelUpdateStream(this.#modelStore));
    }
}
