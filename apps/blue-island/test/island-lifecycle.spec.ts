/**
 * WC-F / WC-G — the island's subscription lifecycle: disposers released on
 * disconnect, a single active subscription across a reconnect, and SSE
 * resubscription after the stream ends.
 * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { describe, test, expect, vi } from 'vitest';
import { installFormAssociatedShims } from './jsdom-form-associated-shim';
// Side-effect import: registers `todo-app` (`@TagMapping`) and its bootstrap.
import '../client/main';

// jsdom lacks the form-participation half of `ElementInternals` (AD-71).
installFormAssociatedShims();

type TodoModel = { items: { text: string; done: boolean }[]; filter: string };
type IslandElement = HTMLElement & { model: TodoModel };

/** One SSE `model` frame carrying a full model snapshot. */
const sseFrame = (model: TodoModel): string => `event: model\ndata: ${JSON.stringify({ model })}\n\n`;

/** A `text/event-stream` response that emits `frames` then ends. */
function endingSseResponse(frames: string[]): Response {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const frame of frames) {
                controller.enqueue(encoder.encode(frame));
            }
            controller.close();
        },
    });
    return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
}

/** A `text/event-stream` response that emits `frames` and stays open. */
function openSseResponse(frames: string[]): Response {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const frame of frames) {
                controller.enqueue(encoder.encode(frame));
            }
        },
    });
    return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
}

/** Constructs and connects an island with the given initial model. */
function mountIsland(model: TodoModel): IslandElement {
    const island = document.createElement('todo-app') as IslandElement;
    island.model = model;
    document.body.append(island);
    return island;
}

describe('TodoIsland subscription lifecycle', () => {
    test('disconnect releases the subscription; reconnect leaves exactly one active stream (WC-F)', async () => {
        vi.useFakeTimers();
        try {
            // Every stream ends immediately, so each live subscription would
            // resubscribe on its own backoff. Counting fetches therefore counts
            // live subscription loops: one per connect, none after dispose.
            const fetchMock = vi.fn(() => Promise.resolve(endingSseResponse([])));
            globalThis.fetch = fetchMock as unknown as typeof fetch;

            const island = mountIsland({ items: [], filter: 'all' });
            await vi.advanceTimersByTimeAsync(0);
            expect(fetchMock).toHaveBeenCalledTimes(1);

            // Disconnect disposes the stream: no resubscription afterwards.
            island.remove();
            await vi.advanceTimersByTimeAsync(5_000);
            expect(fetchMock).toHaveBeenCalledTimes(1);

            // Reconnect creates exactly one new subscription (never stacked).
            document.body.append(island);
            await vi.advanceTimersByTimeAsync(0);
            expect(fetchMock).toHaveBeenCalledTimes(2);

            // The single live loop resubscribes once per backoff window.
            await vi.advanceTimersByTimeAsync(2_000);
            expect(fetchMock).toHaveBeenCalledTimes(3);

            island.remove();
            await vi.advanceTimersByTimeAsync(2_000);
            expect(fetchMock).toHaveBeenCalledTimes(3);
        } finally {
            vi.useRealTimers();
        }
    });

    test('resubscribes after the stream ends and shows the live state (WC-G)', async () => {
        vi.useFakeTimers();
        try {
            let attempt = 0;
            const fetchMock = vi.fn(() => {
                attempt += 1;
                // First stream: one snapshot, then it ends (server restart).
                // Second stream: resubscribed and stays open with fresh state.
                return Promise.resolve(
                    attempt === 1
                        ? endingSseResponse([
                              sseFrame({ items: [{ text: 'before restart', done: false }], filter: 'all' }),
                          ])
                        : openSseResponse([
                              sseFrame({ items: [{ text: 'after restart', done: false }], filter: 'all' }),
                          ])
                );
            });
            globalThis.fetch = fetchMock as unknown as typeof fetch;

            const island = mountIsland({ items: [], filter: 'all' });
            await vi.advanceTimersByTimeAsync(0);
            expect(fetchMock).toHaveBeenCalledTimes(1);

            // The stream ended → bounded backoff → resubscribe.
            await vi.advanceTimersByTimeAsync(1_000);
            expect(fetchMock).toHaveBeenCalledTimes(2);
            await vi.advanceTimersByTimeAsync(0);

            const shadow = island.shadowRoot?.textContent ?? '';
            expect(shadow).toContain('after restart');
            expect(shadow).toContain('[SSE] listening for server model updates');

            island.remove();
        } finally {
            vi.useRealTimers();
        }
    });
});
