/**
 * Mode 6 — OIDC authorization code + PKCE against the issuer embedded in this
 * process (`oidc-provider` on its own loopback listener).
 *
 * The spec plays the browser: it discovers the provider, starts the flow at the
 * playground's `/oidc/start`, answers the provider's login/consent interactions,
 * and hands the resulting `code`/`state` back to `/oidc/callback`. So PKCE (S256
 * verifier), the `state` round-trip, the `nonce`, discovery, JWKS signature
 * verification and the local session issuance are all exercised for real —
 * nothing here is mocked, and the issuer is started and stopped by the harness.
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { freePort, recordOf, startPlaygroundServer, type ServerHarness } from './harness';
import { discover, runAuthorizationCodeFlow, type AuthorizationFlowResult } from './oidc-interaction';

describe('mode 6 — OIDC code + PKCE with the embedded issuer', () => {
    let harness: ServerHarness;

    beforeAll(async () => {
        harness = await startPlaygroundServer({ port: await freePort(), startIssuer: true });
    }, 60_000);

    afterAll(async () => {
        await harness.close();
    });

    /** Runs the browser-side flow from the app's `/oidc/start` up to the redirect. */
    function beginFlow(): Promise<AuthorizationFlowResult> {
        return runAuthorizationCodeFlow({
            startUrl: `${harness.baseUrl}/oidc/start`,
            issuerUrl: harness.config.oidc.issuerUrl,
            redirectUri: harness.config.oidc.redirectUri,
            accountId: harness.config.oidc.accountId,
        });
    }

    /** Calls the playground's callback with the given `Accept` header. */
    function callback(code: string, state: string, accept = 'application/json') {
        const url = new URL('/oidc/callback', harness.baseUrl);
        url.searchParams.set('code', code);
        url.searchParams.set('state', state);
        return fetch(url, { redirect: 'manual', headers: { accept } });
    }

    test('the embedded issuer serves discovery for the registered client', async () => {
        const endpoints = await discover(harness.config.oidc.issuerUrl);
        expect(endpoints.issuer).toBe(harness.config.oidc.issuerUrl);
        expect(endpoints.authorizationEndpoint).toBe(`${harness.config.oidc.issuerUrl}/auth`);
        expect(endpoints.tokenEndpoint).toBe(`${harness.config.oidc.issuerUrl}/token`);
        expect(endpoints.jwksUri).toBe(`${harness.config.oidc.issuerUrl}/jwks`);
    });

    test('GET /oidc/start redirects with state and an S256 PKCE challenge', async () => {
        const res = await fetch(`${harness.baseUrl}/oidc/start`, { redirect: 'manual' });
        expect(res.status).toBe(302);
        const location = res.headers.get('location');
        expect(location).not.toBeNull();
        const url = new URL(location as string);
        expect(url.origin).toBe(harness.config.oidc.issuerUrl);
        expect(url.searchParams.get('client_id')).toBe(harness.config.oidc.clientId);
        expect(url.searchParams.get('redirect_uri')).toBe(harness.config.oidc.redirectUri);
        expect(url.searchParams.get('response_type')).toBe('code');
        expect(url.searchParams.get('scope')).toBe('openid profile');
        expect(url.searchParams.get('code_challenge_method')).toBe('S256');
        expect(url.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/);
        expect(url.searchParams.get('state')).toBeTruthy();
        expect(url.searchParams.get('nonce')).toBeTruthy();
    });

    test('a completed flow issues a local opaque session that /auth/me resolves', async () => {
        const flow = await beginFlow();
        expect(flow.callbackUrl.startsWith(harness.config.oidc.redirectUri)).toBe(true);

        const res = await callback(flow.code, flow.state);
        expect(res.status).toBe(200);
        const body = recordOf(await res.json());
        expect(body).toMatchObject({
            mode: 'oidc',
            surface: 'http',
            provider: harness.config.oidc.issuerUrl,
            clientId: harness.config.oidc.clientId,
            pkce: 'S256',
            principal: {
                id: harness.config.oidc.accountId,
                name: 'OIDC Demo User',
                // The roles travelled inside the JWKS-verified ID token.
                roles: ['user', 'oidc'],
            },
        });

        const cookies = res.headers.getSetCookie().join('; ');
        expect(cookies).toContain(`${harness.config.cookieName}=`);
        expect(cookies).toContain('HttpOnly');
        expect(cookies).toContain('Secure');
        expect(recordOf(recordOf(body?.['session'])?.['cookie'])?.['secure']).toBe(true);

        // The federated identity lands in the same durable session model: the
        // cookie the callback set resolves at the app's own `/auth/me`.
        const sessionIdValue = recordOf(body?.['session'])?.['id'];
        expect(typeof sessionIdValue).toBe('string');
        const me = await fetch(`${harness.baseUrl}/auth/me`, {
            headers: { cookie: `${harness.config.cookieName}=${sessionIdValue as string}` },
        });
        expect(me.status).toBe(200);
        expect(await me.json()).toMatchObject({
            mode: 'cookie-session',
            principal: { id: harness.config.oidc.accountId, roles: ['user', 'oidc'] },
        });
    });

    test('the state is single-use: replaying a redeemed callback is 401', async () => {
        const flow = await beginFlow();
        expect((await callback(flow.code, flow.state)).status).toBe(200);
        const replay = await callback(flow.code, flow.state);
        expect(replay.status).toBe(401);
        expect(recordOf(await replay.json())).toMatchObject({
            type: 'urn:blue-auth-playground:oidc',
            code: 'oidc_state_invalid',
        });
    });

    test('an unknown state is refused with 401 oidc_state_invalid', async () => {
        const res = await callback('some-code', 'never-issued-state');
        expect(res.status).toBe(401);
        expect(recordOf(await res.json())).toMatchObject({ code: 'oidc_state_invalid' });
    });

    test('a callback without code and state is 400 oidc_missing_code', async () => {
        const res = await fetch(`${harness.baseUrl}/oidc/callback`, { redirect: 'manual' });
        expect(res.status).toBe(400);
        expect(recordOf(await res.json())).toMatchObject({ code: 'oidc_missing_code' });
    });

    test('a browser callback answers 303 back into the playground UI', async () => {
        const flow = await beginFlow();
        const res = await callback(flow.code, flow.state, 'text/html');
        expect(res.status).toBe(303);
        expect(res.headers.get('location')).toBe('/?mode=oidc');
    });

    test('an altered authorization code fails the token exchange', async () => {
        // The provider checks the code, the redirect_uri and the PKCE verifier:
        // a tampered code is refused, and the playground reports it as a failed
        // exchange rather than issuing a session.
        const flow = await beginFlow();
        const res = await callback(`${flow.code}-tampered`, flow.state);
        expect(res.status).toBe(401);
        expect(recordOf(await res.json())).toMatchObject({ code: 'oidc_exchange_failed' });
    });
});
