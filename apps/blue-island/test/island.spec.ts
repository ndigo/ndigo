// @vitest-environment node
import { resolve } from 'node:path';

// Must be set BEFORE importing the configuration: StaticController reads
// STATIC_DIR at module load time to build its resolver base.
process.env['STATIC_DIR'] = resolve('dist');

import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { bootApp, MockMVC } from '@blue/test';
import { IslandConfiguration } from '../src/island-configuration';

/**
 * Hybrid island demo integration: the server renders a full shell document
 * containing the server-side island markup (`<todo-app data-blue-island
 * data-blue-model="…">`), and serves the built client bundle that hydrates it.
 */

describe('blue-island hybrid demo', () => {
    let mockMVC: MockMVC;
    let close: () => void;

    beforeAll(() => {
        process.env['STATIC_DIR'] = resolve('dist');
        const app = bootApp([IslandConfiguration]);
        mockMVC = new MockMVC(app);
        close = app.close;
    });

    afterAll(() => {
        close();
        delete process.env['STATIC_DIR'];
    });

    test('GET / serves the shell with the server-rendered island', async () => {
        const res = await mockMVC.get('/').exec();
        expect(res.response.status).toBe(200);
        const html = res.text();
        // The island markup + serialized model are present in the served doc.
        expect(html).toContain('<todo-app data-blue-island data-blue-model=');
        expect(html).toContain('/static/client.js');
    });

    test('GET / renders the serialized model into data-blue-model', async () => {
        const res = await mockMVC.get('/').exec();
        const html = res.text();
        const match = /data-blue-model="([^"]+)"/.exec(html);
        expect(match).not.toBeNull();
        const decoded = decodeURIComponent(match![1]);
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
        const res = await mockMVC.get('/static/client.js').exec();
        expect(res.response.status).toBe(200);
        const body = res.text();
        // Bundle contains the hydrate logic + the todo-app component tag.
        expect(body).toContain('todo-app');
        expect(body.length).toBeGreaterThan(1000);
    });
});