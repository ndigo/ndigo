/**
 * Config-server demo gate (AD-29 Wave 3): the self-served `/api/config.json`
 * document + `/api/config/remote` live-value endpoint, exercised through the
 * full `poll load → replace → refresh → rebind` loop against a wired
 * `configServer` source. The source's stub fetch serves the LIVE exported
 * `REMOTE_DOCUMENT` the `/api/config.json` endpoint exposes (TST-4), so a
 * mutation of that document drives the served document through the whole
 * loop — and `/api/config.json` itself is asserted, not assumed.
 *
 * Production stance: point NDIGO_CONFIG_SERVER_URL at a real config server;
 * the demo endpoints exist so the surface runs with zero external infra.
 * @module ndigo-api
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { ApplicationBuilder } from '@ndigo/boot';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { NodeAutoConfiguration } from '@ndigo/platform-node';
import { MockHTTP } from '@ndigo/test';
import type { NodeDispatcher } from '@ndigo/platform-node';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { ServerConfig } from '../src/server-config';
import { initAuth } from '../src/auth-store';
import { REMOTE_DOCUMENT } from '../src/config-server-demo-controller';

describe('ndigo-api config-server demo (AD-29 Wave 3)', () => {
    let context: Awaited<ReturnType<ApplicationBuilder['run']>>;
    let mockHTTP: MockHTTP;
    let app: ApplicationBuilder;

    beforeAll(async () => {
        initAuth();

        app = new ApplicationBuilder([
            NodeAutoConfiguration,
            ManagementAutoConfiguration,
            ServerConfig,
            NodeAppConfiguration,
        ]);
        app.profiles('dev');
        app.properties({ 'server.port': '3013', 'server.name': 'ndigo-api-demo' });
        app.configServer({
            url: 'https://config.demo/app.json',
            // Self-served loop (TST-4): the stub fetch serves the SAME mutable
            // document `/api/config.json` exposes, so mutating
            // REMOTE_DOCUMENT is a genuine change at the "config server".
            fetch: (async () => ({
                ok: true,
                status: 200,
                headers: { get: () => null },
                text: async () => JSON.stringify(REMOTE_DOCUMENT),
            })) as unknown as typeof fetch,
        });

        context = await app.run();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        mockHTTP = new MockHTTP({ dispatcher });
    });

    afterAll(() => {
        context.close();
    });

    test('boot applies the remote document to the environment', () => {
        expect(context.environment.getProperty('api.message')).toBe('hello from remote config');
    });

    test('GET /api/config.json serves the exported REMOTE_DOCUMENT', async () => {
        const res = await mockHTTP.get('/api/config.json').exec();

        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual(REMOTE_DOCUMENT);
    });

    test('/api/config/remote reflects the live resolved value', async () => {
        const res = await mockHTTP.get('/api/config/remote').exec();
        expect(res.response.status).toBe(200);
        expect((res.json() as { message?: string }).message).toBe('hello from remote config');
    });

    test('a remote change re-applied through the source reflects immediately', async () => {
        // What the poll scheduler does on change: fetch the new document,
        // apply (replace + refresh). Drive it through the wired source —
        // mutating the EXPORTED document the /api/config.json endpoint
        // serves, so this is a real change at the "config server", not a
        // test-local fixture alone (TST-4).
        REMOTE_DOCUMENT['api'] = { message: 'updated remotely' };
        const source = app.configServerSource;
        expect(source).not.toBeNull();
        if (!source) throw new Error('expected configServerSource to be wired');
        expect(await source.load()).toBe(true);

        // The environment, the live endpoint, and the served document all
        // agree on the new value.
        expect(context.environment.getProperty('api.message')).toBe('updated remotely');
        const res = await mockHTTP.get('/api/config/remote').exec();
        expect((res.json() as { message?: string }).message).toBe('updated remotely');
        const doc = await mockHTTP.get('/api/config.json').exec();
        expect((doc.json() as { api?: { message?: string } }).api?.message).toBe('updated remotely');
    });
});
