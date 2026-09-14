/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { bootApp, MockHTTP } from '@blue/test';
import { ManagementAutoConfiguration } from '@blue/management';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { initAuth } from '../src/auth-store';
import { DrizzleNote } from '../src/drizzle-note.entity';
import { getDrizzleDataSource } from '../src/drizzle-note-controller';

/**
 * Integration test for the real blue-api app through @blue/test.
 *
 * Boots the actual `NodeAppConfiguration` (all controllers) and dispatches
 * request through the real pipeline — the same config the running server uses.
 */

describe('blue-api through @blue/test', () => {
    let mockMVC: MockHTTP;
    let close: () => void;

    beforeAll(() => {
        initAuth();
        const app = bootApp([ManagementAutoConfiguration, NodeAppConfiguration]);
        mockMVC = new MockHTTP(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('GET /api/hello binds the name query parameter', async () => {
        const res = await mockMVC.get('/api/hello').query({ name: 'Alice' }).exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ message: 'Hello, Alice!' });
    });

    test('GET /api/hello without name defaults to World', async () => {
        const res = await mockMVC.get('/api/hello').exec();
        expect(res.json()).toEqual({ message: 'Hello, World!' });
    });

    test('GET /api/greet/:name binds a path segment', async () => {
        const res = await mockMVC.get('/api/greet/Alice').exec();
        expect(res.json()).toEqual({ greeting: 'Greetings, Alice!' });
    });

    test('POST /api/echo echoes the full JSON body', async () => {
        const res = await mockMVC.post('/api/echo').body({ hello: 'world', n: 42 }).exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ echo: { hello: 'world', n: 42 } });
    });

    test('unknown route yields 404 JSON', async () => {
        const res = await mockMVC.get('/no-such-route').exec();
        expect(res.response.status).toBe(404);
        const problem = res.json() as { status?: number; type?: string; title?: string; instance?: string };
        expect(problem.status).toBe(404);
        expect(problem.type).toBe('urn:blue:not-found');
        expect(problem.instance).toBe('/no-such-route');
    });

    test('POST /auth/login returns 401 on bad credentials', async () => {
        const res = await mockMVC.post('/auth/login').body({ username: 'bob', password: 'wrong' }).exec();
        // AD-10 / RFC 9110 §15.5.2: authentication failure is 401, not 400.
        expect(res.response.status).toBe(401);
        // Handler-returned errors wrap to an about:blank problem (no `type`).
        expect(res.json()).toMatchObject({
            title: 'Unauthorized',
            status: 401,
            detail: 'Invalid credentials',
        });
    });

    test('Drizzle-backed POST /drizzle/notes persists to SQL and lists it', async () => {
        const login = await mockMVC.post('/auth/login').body({ username: 'admin', password: 'demo' }).exec();
        const { token } = login.json() as { token?: string };
        expect(token).toBeDefined();

        const create = await mockMVC
            .post('/drizzle/notes')
            .headers({ authorization: `Bearer ${token}` })
            .body({ title: 'SQL Note', body: 'persisted via libSQL' })
            .exec();
        expect(create.response.status).toBe(200);
        const created = create.json() as { note?: { id?: number; title?: string; createdAt?: string } };
        expect(created.note?.id).toBeGreaterThan(0); // generated PK read back from SQL
        expect(created.note?.title).toBe('SQL Note');
        expect(created.note?.createdAt).toBeDefined(); // @prePersist filled it

        const list = await mockMVC
            .get('/drizzle/notes')
            .headers({ authorization: `Bearer ${token}` })
            .exec();
        const { notes } = list.json() as { notes?: Array<{ id: number; title: string }> };
        expect(notes?.some((n) => n.title === 'SQL Note')).toBe(true);
    });

    test('Drizzle-backed notes list + get-by-id read from SQL', async () => {
        // Acquire a valid demo token
        const login = await mockMVC.post('/auth/login').body({ username: 'admin', password: 'demo' }).exec();
        const { token } = login.json() as { token?: string };
        expect(token).toBeDefined();

        // Seed through the SAME data source the routes read from.
        const { DrizzleEntityManager } = await import('@blue/orm-drizzle');
        const seedDs = getDrizzleDataSource();
        await seedDs.init([DrizzleNote]);
        const seedEm = new DrizzleEntityManager(seedDs);
        const seeded = new DrizzleNote();
        seeded.title = 'Seeded SQL Note';
        seeded.body = 'from adapter';
        await seedEm.persist(seeded);

        // LIST via the framework route
        const list = await mockMVC
            .get('/drizzle/notes')
            .headers({ authorization: `Bearer ${token}` })
            .exec();
        expect(list.response.status).toBe(200);
        const { notes } = list.json() as { notes?: Array<{ id: number; title: string }> };
        expect(notes).toBeDefined();
        expect(notes?.some((n) => n.title === 'Seeded SQL Note')).toBe(true);

        // GET by-id via the framework route
        const byId = await mockMVC
            .get(`/drizzle/notes/${seeded.id}`)
            .headers({ authorization: `Bearer ${token}` })
            .exec();
        expect(byId.response.status).toBe(200);
        const { note } = byId.json() as { note?: { id: number; title: string } };
        expect(note?.id).toBe(seeded.id);
        expect(note?.title).toBe('Seeded SQL Note');

        // Missing id → not found
        const missing = await mockMVC
            .get('/drizzle/notes/999999')
            .headers({ authorization: `Bearer ${token}` })
            .exec();
        expect(missing.response.status).toBe(404);
    });

    test('Drizzle-backed notes require authentication', async () => {
        const res = await mockMVC.get('/drizzle/notes').exec();
        // Without an auth header the handler rejects; the key assertion is it
        // is not a 200 listing.
        expect([400, 401, 403]).toContain(res.response.status);
    });

    test('POST /drizzle/notes validates the body against the entity-derived schema', async () => {
        const login = await mockMVC.post('/auth/login').body({ username: 'admin', password: 'demo' }).exec();
        const { token } = login.json() as { token?: string };
        expect(token).toBeDefined();

        // Empty title violates the entity column's z.string().min(1) — the
        // derived insert schema (insertSchemaForEntity + validatedBody) must
        // reject it with a 422 validation-failed problem document (AD-10)
        // before any SQL write, carrying the structured issues (Phase 4A).
        const bad = await mockMVC
            .post('/drizzle/notes')
            .headers({ authorization: `Bearer ${token}` })
            .body({ title: '', body: 'no title' })
            .exec();
        expect(bad.response.status).toBe(422);
        const problem = bad.json() as {
            type?: string;
            status?: number;
            errors?: Array<{ path: Array<string | number>; message: string }>;
        };
        expect(problem.type).toBe('urn:blue:validation-failed');
        expect(problem.status).toBe(422);
        expect(problem.errors?.some((issue) => issue.path.join('.') === 'title')).toBe(true);
    });

    test('GET /api/report serves the report model as JSON by default', async () => {
        const res = await mockMVC.get('/api/report').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({
            rows: [
                { name: 'Ada', role: 'admin' },
                { name: 'Grace', role: 'user' },
            ],
        });
    });

    test('GET /api/report.csv serves the same model as CSV via negotiation', async () => {
        const res = await mockMVC.get('/api/report.csv').exec();
        expect(res.response.status).toBe(200);
        expect(res.text()).toBe('name,role\r\nAda,admin\r\nGrace,user');
    });

    test('GET /api/report honors the Accept header (CSV without extension)', async () => {
        const res = await mockMVC.get('/api/report').headers({ accept: 'text/csv' }).exec();
        expect(res.response.status).toBe(200);
        expect(res.text()).toBe('name,role\r\nAda,admin\r\nGrace,user');
    });

    test('GET /api/report honors the Accept header (JSON explicitly)', async () => {
        const res = await mockMVC.get('/api/report').headers({ accept: 'application/json' }).exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({
            rows: [
                { name: 'Ada', role: 'admin' },
                { name: 'Grace', role: 'user' },
            ],
        });
    });

    test('GET /health reports the registry status', async () => {
        const res = await mockMVC.get('/health').exec();
        expect(res.response.status).toBe(200);
        const body = res.json() as { status?: string; components?: Record<string, unknown> };
        expect(typeof body.status).toBe('string');
        expect(typeof body.components).toBe('object');
    });

    test('GET /metrics returns the aggregator snapshot', async () => {
        const res = await mockMVC.get('/metrics').exec();
        expect(res.response.status).toBe(200);
        const body = res.json() as { features?: Record<string, unknown> };
        expect(typeof body.features).toBe('object');
    });

    test('GET /api/greeting resolves the language from Accept-Language', async () => {
        const res = await mockMVC
            .get('/api/greeting')
            .query({ name: 'Ada' })
            .headers({ 'accept-language': 'de-DE,de;q=0.9' })
            .exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ message: 'Hallo, Ada!', language: 'de' });
    });

    test('GET /api/greeting falls back to English without the header', async () => {
        const res = await mockMVC.get('/api/greeting').query({ name: 'Ada' }).exec();
        expect(res.json()).toEqual({ message: 'Hello, Ada!', language: 'en' });
    });
});
