// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { bootApp, MockMVC } from '@blue/test';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { initAuth } from '../src/auth-store';

/**
 * Integration test for the real blue-api app through @blue/test.
 *
 * Boots the actual `NodeAppConfiguration` (all controllers) and dispatches
 * request through the real pipeline — the same config the running server uses.
 */

describe('blue-api through @blue/test', () => {
    let mockMVC: MockMVC;
    let close: () => void;

    beforeAll(() => {
        initAuth();
        const app = bootApp([NodeAppConfiguration]);
        mockMVC = new MockMVC(app);
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
        expect(res.json()).toEqual({ error: 'Not Found', path: '/no-such-route' });
    });

    test('POST /auth/login returns 400 on bad credentials', async () => {
        const res = await mockMVC.post('/auth/login').body({ username: 'bob', password: 'wrong' }).exec();
        expect(res.response.status).toBe(400);
        expect(res.json()).toEqual({ error: 'Invalid credentials' });
    });
});
