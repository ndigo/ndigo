/**
 * `@ndigo/test` `MockHTTP` lane for the redis-fanout demo: the real application
 * context boots with **no Redis configured**, and the HTTP surface is driven
 * through the whole pipeline — interceptors, argument binding, the handler.
 *
 * This lane is the single-node contract: the same routes must behave
 * identically whether or not a fan-out exists, and the mode must be visible in
 * what they report.
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { SOCKET_SESSION_REGISTRY } from '@ndigo/platform-node';
import { bootNodeApp, MockHTTP } from '@ndigo/test';
import type { NdigoTestApp } from '@ndigo/test';
import { BACKEND_HEALTH_COMPONENT } from '../src/backend-health-indicator';
import { FANOUT_BACKEND } from '../src/fanout-backend';
import { RedisFanoutConfiguration } from '../src/redis-fanout-configuration';
import { BoardPostDoc, CacheDoc, HealthDoc } from './wire-schemas';

/** The instance id this lane's process reports. */
const INSTANCE = 'node-http-spec';

describe('redis-fanout HTTP surface (no Redis: memory mode)', () => {
    let app: NdigoTestApp;
    let http: MockHTTP;
    /** The variables this lane overrides, captured for exact restoration. */
    const savedEnv: Record<string, string | undefined> = {
        NDIGO_REDIS_URL: process.env['NDIGO_REDIS_URL'],
        NDIGO_INSTANCE_ID: process.env['NDIGO_INSTANCE_ID'],
    };

    beforeAll(() => {
        // The lane's whole point: the app must be single-node when the variable
        // is absent, so make the absence explicit rather than inherited.
        delete process.env['NDIGO_REDIS_URL'];
        process.env['NDIGO_INSTANCE_ID'] = INSTANCE;
        app = bootNodeApp([ManagementAutoConfiguration, RedisFanoutConfiguration]);
        http = new MockHTTP(app);
    });

    afterAll(() => {
        app.close();
        for (const [name, value] of Object.entries(savedEnv)) {
            if (value === undefined) {
                delete process.env[name];
            } else {
                process.env[name] = value;
            }
        }
    });

    test('GET /health reports the memory backend as UP (the boot probe)', async () => {
        const res = await http.get('/health').exec();

        expect(res.response.status).toBe(200);
        const health = HealthDoc.parse(res.json());
        expect(health.status).toBe('UP');
        const backend = health.components[BACKEND_HEALTH_COMPONENT];
        expect(backend?.status).toBe('UP');
        expect(backend?.details).toMatchObject({ mode: 'memory', connected: true, instanceId: INSTANCE });
    });

    test('the server adopts the backend registry as its socket registry entry', () => {
        const backend = app.context.getValue(FANOUT_BACKEND);

        expect(app.context.getValue(SOCKET_SESSION_REGISTRY)).toBe(backend.registry);
        expect(backend.mode).toBe('memory');
    });

    test('GET /cache/:key creates the entry, counts reads, and names the producer', async () => {
        const first = CacheDoc.parse((await http.get('/cache/alpha').exec()).json());

        expect(first).toMatchObject({
            key: 'alpha',
            hits: 1,
            producer: INSTANCE,
            servedBy: INSTANCE,
            mode: 'memory',
            cache: 'fanout-values',
            ttlMs: 60_000,
        });
        expect(first.value.startsWith('value-for-alpha-')).toBe(true);

        const second = CacheDoc.parse((await http.get('/cache/alpha').exec()).json());

        // The counter lives in the cached entry, not in the controller: it is
        // shared state (and shared across nodes once Redis is configured).
        expect(second).toMatchObject({ value: first.value, hits: 2, producer: INSTANCE });
    });

    test('?value= seeds the first write and is ignored on later reads', async () => {
        const seeded = CacheDoc.parse((await http.get('/cache/seeded').query({ value: 'hello' }).exec()).json());
        expect(seeded).toMatchObject({ value: 'hello', hits: 1 });

        const again = CacheDoc.parse((await http.get('/cache/seeded').query({ value: 'clobbered' }).exec()).json());
        expect(again).toMatchObject({ value: 'hello', hits: 2 });
    });

    test('POST /board publishes without a socket and reports no local clients', async () => {
        const res = await http.post('/board').body({ text: 'posted by curl' }).exec();

        expect(res.response.status).toBe(202);
        const doc = BoardPostDoc.parse(res.json());
        expect(doc.posted).toMatchObject({ text: 'posted by curl', from: INSTANCE });
        expect(doc).toMatchObject({ localClients: 0, instanceId: INSTANCE, mode: 'memory' });
    });

    test('POST /board accepts ?text= as well as a JSON body', async () => {
        const res = await http.post('/board').query({ text: 'from the query string' }).exec();

        expect(res.response.status).toBe(202);
        expect(BoardPostDoc.parse(res.json()).posted.text).toBe('from the query string');
    });

    test('POST /board rejects an empty or oversized text with a 400 problem', async () => {
        const empty = await http.post('/board').body({ text: '' }).exec();
        expect(empty.response.status).toBe(400);
        expect(empty.json()).toMatchObject({ status: 400, title: 'Bad Request' });

        const long = await http
            .post('/board')
            .body({ text: 'x'.repeat(4_097) })
            .exec();
        expect(long.response.status).toBe(400);
    });
});
