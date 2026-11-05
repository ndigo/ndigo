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
import { ChatConfiguration } from '../src/chat-configuration';

describe('ndigo-chat HTTP surface', () => {
    let app: NdigoTestApp;
    let http: MockHTTP;

    beforeAll(() => {
        app = bootApp([ManagementAutoConfiguration, ChatConfiguration]);
        http = new MockHTTP(app);
    });

    afterAll(() => {
        app.close();
    });

    test('GET / renders the shell that mounts the chat Web Component', async () => {
        const res = await http.get('/').exec();
        expect(res.response.status).toBe(200);
        const html = res.text();
        expect(html).toContain('<chat-room');
        expect(html).toContain('data-rooms');
        expect(html).toContain('/static/client.js');
        expect(html).toContain('/static/client.css');
    });

    test('GET / embeds the room list and defaults for the picker', async () => {
        const res = await http.get('/').exec();
        const html = res.text();
        // `<%= %>` HTML-escapes the JSON, so the attribute carries entities.
        expect(html).toContain('&#34;lobby&#34;');
        expect(html).toContain('data-default-room="lobby"');
        expect(html).toContain('data-user="guest"');
    });

    test('GET /health reports the registry status (management)', async () => {
        const res = await http.get('/health').exec();
        expect(res.response.status).toBe(200);
        const body = res.json() as { status?: string; components?: Record<string, unknown> };
        expect(typeof body.status).toBe('string');
        expect(typeof body.components).toBe('object');
    });

    test('a socket-only room path is not served over plain HTTP', async () => {
        const res = await http.get('/ws/rooms/lobby').exec();
        expect([404, 405]).toContain(res.response.status);
    });
});
