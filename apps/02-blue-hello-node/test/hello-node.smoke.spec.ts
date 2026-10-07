/**
 * @module blue-hello-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { bootApp, MockHTTP } from '@blue/test';
import type { BlueTestApp } from '@blue/test';
import { HelloConfiguration } from '../src/hello-configuration';

/**
 * Smoke test (APP-N10): the node entry app boots through the real
 * `ApplicationBuilder`-compatible path and serves its documented endpoints.
 */
describe('blue-hello-node smoke', () => {
    let app: BlueTestApp;
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

    test('GET /hello?name=Blue binds the query parameter', async () => {
        const res = await mockHTTP.get('/hello').query({ name: 'Blue' }).exec();

        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ message: 'Hello, Blue!' });
    });
});
