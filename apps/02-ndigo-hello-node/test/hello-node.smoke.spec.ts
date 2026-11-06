// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { bootApp, MockHTTP } from '@ndigo/test';
import type { NdigoTestApp } from '@ndigo/test';
import { HelloConfiguration } from '../src/hello-configuration';

/**
 * Smoke test (APP-N10): the node entry app boots through the real
 * `ApplicationBuilder`-compatible path and serves its documented endpoints.
 */
describe('ndigo-hello-node smoke', () => {
    let app: NdigoTestApp;
    let mockHTTP: MockHTTP;

    beforeAll(() => {
        app = bootApp([HelloConfiguration]);
        mockHTTP = new MockHTTP(app);
    });

    afterAll(() => {
        app.close();
    });

    test('GET / returns the default greeting', async () => {
        const res = await mockHTTP.get('/').exec();

        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ message: 'Hello, Node!' });
    });

    test('GET /hello?name=Ndigo binds the query parameter', async () => {
        const res = await mockHTTP.get('/hello').query({ name: 'Ndigo' }).exec();

        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ message: 'Hello, Ndigo!' });
    });
});
