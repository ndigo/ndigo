/**
 * HTTP surface through MockHTTP: the EJS shell and the management endpoints.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { bootApp, MockHTTP, type NdigoTestApp } from '@ndigo/test';
import { KanbanConfiguration } from '../src/kanban-configuration';

describe('ndigo-kanban HTTP surface', () => {
    let app: NdigoTestApp;
    let http: MockHTTP;

    beforeAll(() => {
        app = bootApp([ManagementAutoConfiguration, KanbanConfiguration]);
        http = new MockHTTP(app);
    });

    afterAll(() => {
        app.close();
    });

    test('GET / renders the shell that mounts the kanban Web Component', async () => {
        const res = await http.get('/').exec();
        expect(res.response.status).toBe(200);
        const html = res.text();
        expect(html).toContain('<kanban-board');
        expect(html).toContain('data-board="demo"');
        expect(html).toContain('/static/client.js');
        expect(html).toContain('/static/client.css');
    });

    test('GET /health reports the registry status (management)', async () => {
        const res = await http.get('/health').exec();
        expect(res.response.status).toBe(200);
        const body = res.json() as { status?: string; components?: Record<string, unknown> };
        expect(typeof body.status).toBe('string');
        expect(typeof body.components).toBe('object');
    });

    test('a socket-only board path is not served over plain HTTP', async () => {
        const res = await http.get('/ws/board/demo').exec();
        expect([404, 405]).toContain(res.response.status);
    });
});
