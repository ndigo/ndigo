/**
 * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { resolve } from 'node:path';

// Must be set BEFORE importing the configuration: StaticController reads
// STATIC_DIR at module load time to build its resolver base.
process.env['STATIC_DIR'] = resolve('dist');

import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import type { AddressInfo } from 'node:net';
import { bootApp, MockHTTP } from '@blue/test';
import { MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@blue/platform-node';
import { IslandConfiguration } from '../src/island-configuration';
import { TodoModelStore } from '../src/todo-model-store';

/**
 * Hybrid island demo integration: the server renders a full shell document
 * containing the server-side island markup (`<todo-app data-blue-island
 * data-blue-model="…">`), serves the built client bundle that hydrates it,
 * and pushes source-of-truth model updates to islands over SSE (AD-09).
 */

describe('blue-island hybrid demo', () => {
    let mockHTTP: MockHTTP;
    let close: () => void;

    beforeAll(() => {
        process.env['STATIC_DIR'] = resolve('dist');
        const app = bootApp([IslandConfiguration]);
        // Same wiring as the app bootstrap: entry-resolved message source.
        app.context.setMessageSource(app.context.getValue('messageSource'));
        mockHTTP = new MockHTTP(app);
        close = app.close;
    });

    afterAll(() => {
        close();
        delete process.env['STATIC_DIR'];
    });

    test('GET / serves the shell with the server-rendered island', async () => {
        const res = await mockHTTP.get('/').exec();
        expect(res.response.status).toBe(200);
        const html = res.text();
        // The island markup + serialized model are present in the served doc.
        expect(html).toContain('<todo-app data-blue-island data-blue-locale="');
        expect(html).toContain('/static/client.js');
    });

    test('GET / renders the serialized model into data-blue-model', async () => {
        const res = await mockHTTP.get('/').exec();
        const html = res.text();
        const match = /data-blue-model="([^"]+)"/.exec(html);
        expect(match).not.toBeNull();
        const decoded = match ? decodeURIComponent(match[1]) : '';
        const model = JSON.parse(decoded);
        expect(model).toEqual({
            items: [
                { text: 'Server-rendered island', done: true },
                { text: 'Hydrated on the client', done: false },
            ],
            filter: 'all',
        });
    });

    test('GET /static/client.js serves the built client bundle', async () => {
        const res = await mockHTTP.get('/static/client.js').exec();
        expect(res.response.status).toBe(200);
        const body = res.text();
        // Bundle contains the hydrate logic + the todo-app component tag.
        expect(body).toContain('todo-app');
        expect(body.length).toBeGreaterThan(1000);
    });

    test('GET / negotiates the shell language from Accept-Language', async () => {
        const res = await mockHTTP.get('/').headers({ 'accept-language': 'fr, en;q=0.8' }).exec();
        const html = res.text();

        expect(html).toContain('data-blue-locale="fr"');
        expect(html).toContain('Rendu par le <strong>serveur</strong>');
        expect(html).toContain('septembre 2026');
        expect(html).toContain('Langue du serveur : FR');
        expect(html).toMatch(/<html lang="fr">/);
    });

    test('GET / defaults to English without an Accept-Language header', async () => {
        const res = await mockHTTP.get('/').exec();
        const html = res.text();

        expect(html).toContain('data-blue-locale="en-US"');
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

    test('streams one frameless model event per store update', async () => {
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

        // Trigger a push and read until the event frame completes.
        store.update((model) => {
            model.items.push({ text: 'pushed from test', done: false });
        });
        while (!text.includes('\n\n')) {
            // oxlint-disable-next-line no-await-in-loop -- SSE frames arrive over one stream; reads must be consumed in arrival order.
            const { done, value } = await reader.read();
            if (done) break;
            text += decoder.decode(value);
        }
        await reader.cancel();

        expect(text).toContain('event: model\n');
        expect(text).toContain('data: {"model":{');
        expect(text).toContain('"text":"pushed from test"');
    });

    test('each store update reaches the connected client in order', async () => {
        const res = await fetch(`${base}/events`);
        const body = res.body;
        if (body === null) {
            throw new Error('expected an SSE response body');
        }
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let text = '';

        store.update((model) => {
            model.items.push({ text: 'first', done: false });
        });
        while (!text.includes('\n\n')) {
            // oxlint-disable-next-line no-await-in-loop -- SSE frames arrive over one stream; reads must be consumed in arrival order.
            const { done, value } = await reader.read();
            if (done) break;
            text += decoder.decode(value);
        }
        store.update((model) => {
            model.items.push({ text: 'second', done: false });
        });
        const frameCount = (): number => text.split('\n\n').filter((frame) => frame.length > 0).length;
        while (frameCount() < 2) {
            // oxlint-disable-next-line no-await-in-loop -- SSE frames arrive over one stream; reads must be consumed in arrival order.
            const { done, value } = await reader.read();
            if (done) break;
            text += decoder.decode(value);
        }
        await reader.cancel();

        const frames = text.split('\n\n').filter((frame) => frame.length > 0);
        expect(frames).toHaveLength(2);
        expect(frames[0]).toContain('"first"');
        expect(frames[1]).toContain('"second"');
    });
});
