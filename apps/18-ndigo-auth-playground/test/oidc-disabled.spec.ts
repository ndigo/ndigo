/**
 * Mode 6, switched off: `OIDC_ENABLED=false` must answer `503 oidc_disabled`
 * rather than throw or hang, so a deployment that does not run the embedded
 * issuer still gets a labelled failure from every OIDC route.
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { bootMockPlayground, recordOf, type MockHarness } from './harness';

describe('mode 6 — the embedded issuer disabled', () => {
    let harness: MockHarness;

    beforeAll(async () => {
        harness = await bootMockPlayground({ oidcEnabled: false });
    });

    afterAll(() => {
        harness.close();
    });

    test('GET /oidc/start is 503 oidc_disabled', async () => {
        const res = await harness.http.get('/oidc/start').exec();
        expect(res.response.status).toBe(503);
        expect(recordOf(res.json())).toMatchObject({
            type: 'urn:ndigo-auth-playground:oidc',
            code: 'oidc_disabled',
        });
    });

    test('GET /oidc/callback is 503 oidc_disabled, whatever it carries', async () => {
        const res = await harness.http.get('/oidc/callback').query({ code: 'x', state: 'y' }).exec();
        expect(res.response.status).toBe(503);
        expect(recordOf(res.json())).toMatchObject({ code: 'oidc_disabled' });
    });

    test('GET /oidc/refresh is 503 oidc_disabled', async () => {
        const res = await harness.http.get('/oidc/refresh').exec();
        expect(res.response.status).toBe(503);
        expect(recordOf(res.json())).toMatchObject({ code: 'oidc_disabled' });
    });

    test('the rest of the playground is unaffected', async () => {
        const res = await harness.http
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'admin', password: 'demo' })
            .exec();
        expect(res.response.status).toBe(200);
    });
});
