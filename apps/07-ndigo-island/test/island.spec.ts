// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import type { AddressInfo } from 'node:net';
import { bootApp, MockHTTP } from '@ndigo/test';
import { ConfigurableApplicationContext, MetadataConfigApplicationContext } from '@ndigo/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@ndigo/platform-node';
import { parseModel, serializeModel } from '@ndigo/view';
import { IslandConfiguration } from '../src/island-configuration';
import { TodoModelStore } from '../src/todo-model-store';

/**
 * Hybrid island demo integration: the server renders a full shell document
 * containing the server-side island markup (`<todo-app data-ndigo-island
 * data-ndigo-model="…">`), serves the built client bundle that hydrates it,
 * and pushes source-of-truth model updates to islands over SSE (AD-09).
 */

describe('ndigo-island hybrid demo', () => {
    let mockHTTP: MockHTTP;
    let close: () => void;

    beforeAll(() => {
        const app = bootApp([IslandConfiguration]);
        // Same wiring as the app bootstrap: entry-resolved message source.
        (app.context as ConfigurableApplicationContext).setMessageSource(app.context.getValue('messageSource'));
        mockHTTP = new MockHTTP(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('GET / serves the shell with the server-rendered island', async () => {
        const res = await mockHTTP.get('/').exec();
        expect(res.response.status).toBe(200);
        const html = res.text();
        // The island markup + serialized model are present in the served doc.
        expect(html).toContain('<todo-app data-ndigo-island data-ndigo-locale="');
        expect(html).toContain('/static/client.js');
    });

    test('GET / server-renders a declarative shadow root for first paint (ADR-69 D-3)', async () => {
        const res = await mockHTTP.get('/').exec();
        const html = res.text();
        // The island carries DSD markup: real content parsed into a shadow
        // root before any script runs, replaced by the component on upgrade.
        expect(html).toContain('<template shadowrootmode="open">');
        expect(html).toContain('<li>✅ Server-rendered island</li>');
        expect(html).toContain('<li>⬜ Hydrated on the client</li>');
        expect(html).toContain('[hydrated on client] 2 item(s), filter: all');
        // The form cannot server-render portably, so the derived fallback
        // carries a skeleton the client render replaces.
        expect(html).toContain('[first paint] The add-item form (native controls) hydrates on the client.');
    });

    test('GET / renders the serialized model into data-ndigo-model', async () => {
        const res = await mockHTTP.get('/').exec();
        const html = res.text();
        const match = /data-ndigo-model="([^"]+)"/.exec(html);
        expect(match).not.toBeNull();

        const expected = {
            items: [
                { text: 'Server-rendered island', done: true },
                { text: 'Hydrated on the client', done: false },
            ],
            filter: 'all',
        };

        // The server emits the framework serializer's HTML-attribute-escaped
        // JSON (the same contract `hydrateIslands` parses); the DOM decodes
        // entities once before hydration JSON-parses the attribute value.
        expect(match?.[1]).toBe(serializeModel(expected));

        const attributeValue = (match?.[1] ?? '')
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
        expect(parseModel(attributeValue)).toEqual(expected);
    });

    test('GET /static/client.js serves the built client bundle', async () => {
        const res = await mockHTTP.get('/static/client.js').exec();
        expect(res.response.status).toBe(200);
        const body = res.text();
        // Bundle contains the hydrate logic + the todo-app component tag.
        expect(body).toContain('todo-app');
        expect(body.length).toBeGreaterThan(1000);
    });

    test('POST /items binds + validates the form body and updates the model (AD-71)', async () => {
        const res = await mockHTTP
            .post('/items')
            .headers({ 'content-type': 'application/x-www-form-urlencoded' })
            .rawBody('text=Write+the+guide')
            .exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ accepted: 'Write the guide' });

        // The mutation flows through the store, so the next shell render (and
        // every SSE subscriber) carries the new item.
        const shell = await mockHTTP.get('/').exec();
        expect(shell.text()).toContain('Write the guide');
    });

    test('POST /items rejects a blank value through the bound schema (422)', async () => {
        const res = await mockHTTP
            .post('/items')
            .headers({ 'content-type': 'application/x-www-form-urlencoded' })
            .rawBody('text=%20%20')
            .exec();
        expect(res.response.status).toBe(422);
    });

    test('GET / negotiates the shell language from Accept-Language', async () => {
        const res = await mockHTTP.get('/').headers({ 'accept-language': 'fr, en;q=0.8' }).exec();
        const html = res.text();

        expect(html).toContain('data-ndigo-locale="fr"');
        expect(html).toContain('Rendu par le <strong>serveur</strong>');
        expect(html).toContain('septembre 2026');
        expect(html).toContain('Langue du serveur : FR');
        expect(html).toMatch(/<html lang="fr">/);
    });

    test('GET / defaults to English without an Accept-Language header', async () => {
        const res = await mockHTTP.get('/').exec();
        const html = res.text();

        expect(html).toContain('data-ndigo-locale="en-US"');
        expect(html).toContain('Rendered by the <strong>server</strong>');
        expect(html).toContain('September 13, 2026');
        expect(html).toMatch(/<html lang="en-US">/);
    });
});

describe('GET /events pushes model updates over SSE (AD-09)', () => {
    let adapter: NodeHTTPServerAdapter;
    let base: string;
    let store: TodoModelStore;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('island-events');
        context.register(NodeAutoConfiguration);
        context.register(IslandConfiguration);
        context.refresh(); // auto-initializes the handler mapping + dispatcher
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        store = context.getValue<TodoModelStore>('modelStore');
        adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        base = `http://127.0.0.1:${(adapter.server as { address(): AddressInfo }).address().port}`;
    });

    afterAll(async () => {
        await adapter?.close();
    });

    /** Opens an SSE stream and reads frames until `count` complete frames arrive. */
    async function readFrames(
        reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>,
        decoder: TextDecoder,
        count: number
    ): Promise<string> {
        let text = '';
        const frameCount = (): number => text.split('\n\n').filter((frame) => frame.length > 0).length;

        while (frameCount() < count) {
            // oxlint-disable-next-line no-await-in-loop -- SSE frames arrive over one stream; reads must be consumed in arrival order.
            const { done, value } = await reader.read();
            if (done) break;
            text += decoder.decode(value);
        }

        return text;
    }

    test('connects with the current snapshot as the first event (APP-N3)', async () => {
        const res = await fetch(`${base}/events`);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toBe('text/event-stream; charset=utf-8');

        const body = res.body;
        if (body === null) {
            throw new Error('expected an SSE response body');
        }
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let text = '';
        while (!text.includes('\n\n')) {
            // oxlint-disable-next-line no-await-in-loop -- SSE frames arrive over one stream; reads must be consumed in arrival order.
            const { done, value } = await reader.read();
            if (done) break;
            text += decoder.decode(value);
        }
        await reader.cancel();

        // No store update was triggered: the snapshot frame alone carries the
        // server-rendered model, so late subscribers hydrate.
        expect(text).toContain('event: model\n');
        expect(text).toContain('data: {"model":{');
        expect(text).toContain('"text":"Server-rendered island"');
    });

    test('the snapshot frame is followed by the pending update frame', async () => {
        const res = await fetch(`${base}/events`);
        const body = res.body;
        if (body === null) {
            throw new Error('expected an SSE response body');
        }
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let text = '';

        store.update((model) => {
            model.items.push({ text: 'pushed from test', done: false });
        });
        text = await readFrames(reader, decoder, 2);
        await reader.cancel();

        const frames = text.split('\n\n').filter((frame) => frame.length > 0);
        expect(frames).toHaveLength(2);
        expect(frames[0]).toContain('"text":"Server-rendered island"');
        expect(frames[1]).toContain('event: model\n');
        expect(frames[1]).toContain('data: {"model":{');
        expect(frames[1]).toContain('"text":"pushed from test"');
    });

    test('coalesces rapid store updates: the newest snapshot wins and the queue stays bounded (APP-D)', async () => {
        const res = await fetch(`${base}/events`);
        const body = res.body;
        if (body === null) {
            throw new Error('expected an SSE response body');
        }
        const reader = body.getReader();
        const decoder = new TextDecoder();

        // Two updates land in the same tick, before the client reads the next
        // frame: they coalesce into one pending snapshot (the newest).
        store.update((model) => {
            model.items.push({ text: 'first', done: false });
        });
        store.update((model) => {
            model.items.push({ text: 'second', done: false });
        });

        const text = await readFrames(reader, decoder, 2);

        const frames = text.split('\n\n').filter((frame) => frame.length > 0);
        expect(frames).toHaveLength(2);
        expect(frames[0]).toContain('"text":"Server-rendered island"');
        // One coalesced frame carries both appends — the latest model.
        expect(frames[1]).toContain('"first"');
        expect(frames[1]).toContain('"second"');

        // Bounded: no further frame is pending for the burst.
        const pending = await Promise.race([
            reader.read().then((result) => (result.done ? 'done' : 'frame')),
            new Promise((resolve) => setTimeout(() => resolve('parked'), 50)),
        ]);
        expect(pending).toBe('parked');
        await reader.cancel();
    });

    test('a client connecting after the boot ticker completes still hydrates (APP-N3)', async () => {
        store.startTicker();
        // The ticker pushes exactly three updates, one per second.
        await new Promise((resolve) => setTimeout(resolve, 3600));
        store.stopTicker();

        const res = await fetch(`${base}/events`);
        const body = res.body;
        if (body === null) {
            throw new Error('expected an SSE response body');
        }
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let text = '';
        while (!text.includes('\n\n')) {
            // oxlint-disable-next-line no-await-in-loop -- SSE frames arrive over one stream; reads must be consumed in arrival order.
            const { done, value } = await reader.read();
            if (done) break;
            text += decoder.decode(value);
        }
        await reader.cancel();

        expect(text).toContain('"text":"Model update pushed from the server (3)"');
    });

    test('a posted form item reaches connected clients over SSE (AD-71)', async () => {
        const res = await fetch(`${base}/events`);
        const body = res.body;
        if (body === null) {
            throw new Error('expected an SSE response body');
        }
        const reader = body.getReader();
        const decoder = new TextDecoder();

        // The browser-shaped submission the island's form produces: standard
        // urlencoded name/value pairs.
        const posted = await fetch(`${base}/items`, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: 'text=from+the+form',
        });
        expect(posted.status).toBe(200);

        const text = await readFrames(reader, decoder, 2);
        await reader.cancel();

        const frames = text.split('\n\n').filter((frame) => frame.length > 0);
        expect(frames[1]).toContain('event: model\n');
        expect(frames[1]).toContain('"text":"from the form"');
    });
});
