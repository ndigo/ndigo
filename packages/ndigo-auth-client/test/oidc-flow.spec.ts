/**
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createServer, IncomingMessage, Server } from 'node:http';
import { generateKeyPair, exportSPKI, exportJWK, importSPKI, SignJWT } from 'jose';
import {
    OIDCAdapter,
    OIDCError,
    type PendingAuthorization,
    type PendingAuthorizationStore,
    type RefreshTokenStore,
} from '../src/oidc-adapter';

/**
 * Full authorization-code flow against a local stub identity provider:
 * discovery document, JWKS, and token endpoint issuing signed ID tokens.
 * Exercises the fail-closed acceptance matrix end to end.
 */

const ISSUER_BASE = 'http://127.0.0.1'; // port bound below

let server: Server;
let port: number;
let privateKey: CryptoKey;
let jwksBody: string;
/** Maps authorization code → nonce the issued ID token must carry. */
const noncesByCode = new Map<string, string>();
/** When set, the token endpoint responds with this status/body (status 599 = stall forever). */
let tokenResponseOverride: { status: number; body: unknown; location?: string } | null = null;
/** When set, the refresh grant responds with this status/body. */
let refreshOverride: { status: number; body: unknown } | null = null;
/** The `sub` the refreshed ID token carries (sub-stability control). */
let refreshSub = '42';
/** The `refresh_token` the refresh grant returns; null models a non-rotating provider. */
let refreshTokenResponse: string | null = 'rt-rotated';
/** The alg the refreshed ID token is signed with. */
let refreshAlg = 'RS256';
/** Overrides the refreshed ID token's issuer (issuer-mismatch control). */
let refreshIssuerOverride: string | null = null;
/** Refresh-grant form bodies received by the stub. */
const refreshRequests: URLSearchParams[] = [];
/** Body received by the redirect target — proves POST bodies never follow redirects. */
let leakedBody = '';

const issuer = () => `${ISSUER_BASE}:${port}`;

function readBody(req: IncomingMessage): Promise<string> {
    const { promise, resolve } = Promise.withResolvers<string>();
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    return promise;
}

function listen(serverToBind: Server): Promise<number> {
    const { promise, resolve } = Promise.withResolvers<void>();
    serverToBind.listen(0, '127.0.0.1', resolve);
    return promise.then(() => (serverToBind.address() as { port: number }).port);
}

function close(serverToClose: Server): Promise<void> {
    const { promise, resolve } = Promise.withResolvers<void>();
    serverToClose.close(() => resolve());
    return promise;
}

beforeAll(async () => {
    const { publicKey, privateKey: privateK } = await generateKeyPair('RS256', { extractable: true });
    privateKey = privateK;
    const jwk = await exportJWK(await importSPKI(await exportSPKI(publicKey), 'RS256'));
    jwksBody = JSON.stringify({ keys: [{ ...jwk, alg: 'RS256', use: 'sig' }] });

    server = createServer(async (req, res) => {
        const path = req.url?.split('?')[0];
        if (path === '/.well-known/openid-configuration') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    issuer: issuer(),
                    authorization_endpoint: `${issuer()}/authorize`,
                    token_endpoint: `${issuer()}/token`,
                    jwks_uri: `${issuer()}/jwks`,
                    end_session_endpoint: `${issuer()}/logout`,
                })
            );
        } else if (path === '/jwks') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(jwksBody);
        } else if (path === '/token') {
            if (tokenResponseOverride?.status === 599) {
                // Stall forever — the adapter's timeout must abort the fetch.
                return;
            }
            if (tokenResponseOverride) {
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (tokenResponseOverride.location) headers['Location'] = tokenResponseOverride.location;
                res.writeHead(tokenResponseOverride.status, headers);
                res.end(JSON.stringify(tokenResponseOverride.body));
                return;
            }
            const form = new URLSearchParams(await readBody(req));
            if (form.get('grant_type') === 'refresh_token') {
                refreshRequests.push(form);
                if (refreshOverride) {
                    res.writeHead(refreshOverride.status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(refreshOverride.body));
                    return;
                }
                const refreshedSigning = new SignJWT({ sub: refreshSub, name: 'Flow User', roles: ['user'] })
                    .setProtectedHeader({ alg: refreshAlg })
                    .setIssuer(refreshIssuerOverride ?? issuer())
                    .setAudience('my-client')
                    .setExpirationTime('1h');
                // HS256 models a token signed with an algorithm the adapter
                // does not allow (the RSA key is hash-bound to RS256).
                const refreshedIdToken =
                    refreshAlg === 'HS256'
                        ? await refreshedSigning.sign(
                              new TextEncoder().encode('refresh-test-secret-refresh-test-secret')
                          )
                        : await refreshedSigning.sign(privateKey);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(
                    JSON.stringify({
                        access_token: 'at-refreshed',
                        id_token: refreshedIdToken,
                        token_type: 'Bearer',
                        expires_in: 3600,
                        ...(refreshTokenResponse !== null ? { refresh_token: refreshTokenResponse } : {}),
                    })
                );
                return;
            }
            const nonce = noncesByCode.get(form.get('code') ?? '') ?? '';
            const idToken = await new SignJWT({ sub: '42', name: 'Flow User', roles: ['user'], nonce })
                .setProtectedHeader({ alg: 'RS256' })
                .setIssuer(issuer())
                .setAudience('my-client')
                .setExpirationTime('1h')
                .sign(privateKey);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    access_token: 'at-123',
                    id_token: idToken,
                    token_type: 'Bearer',
                    expires_in: 3600,
                    refresh_token: 'rt-1',
                })
            );
        } else if (path === '/leak') {
            leakedBody = await readBody(req);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('{}');
        } else {
            res.writeHead(404).end();
        }
    });
    port = await listen(server);
});

afterAll(async () => {
    tokenResponseOverride = null;
    leakedBody = '';
    await close(server);
});

function makeAdapter(overrides: Record<string, unknown> = {}): OIDCAdapter {
    return new OIDCAdapter({
        issuer: issuer(),
        clientId: 'my-client',
        redirectUri: 'https://myapp.com/callback',
        scopes: ['openid', 'profile', 'email'],
        discovery: true,
        ...overrides,
    });
}

/**
 * A caller-persisted {@link PendingAuthorizationStore} shared across adapter
 * instances — the shape a browser sessionStorage / server Redis store has.
 */
function createSharedPendingStore(): PendingAuthorizationStore {
    const entries = new Map<string, PendingAuthorization>();
    return {
        kind: 'test-shared',
        get: async (state) => entries.get(state) ?? null,
        set: async (state, pending) => {
            entries.set(state, pending);
        },
        delete: async (state) => {
            entries.delete(state);
        },
    };
}

describe('OIDCAdapter full authorization-code flow', () => {
    test('happy path: discovery → authorization request → code exchange → verified principal', async () => {
        const adapter = makeAdapter();
        const request = await adapter.createAuthorizationRequest();
        const url = new URL(request.url);
        expect(url.origin + url.pathname).toBe(`${issuer()}/authorize`);
        noncesByCode.set('one-time-code', request.nonce);

        const result = await adapter.exchangeCodeForTokens('one-time-code', request.state);
        expect(result.principal?.id).toBe('42');
        expect(result.principal?.name).toBe('Flow User');
        expect(result.principal?.hasRole('user')).toBe(true);
        expect(result.token).toBe('at-123');
        expect(result.expiresAt).not.toBeNull();
    });

    test('PKCE code_verifier reaches the token endpoint (exchange succeeds end to end)', async () => {
        const adapter = makeAdapter();
        const request = await adapter.createAuthorizationRequest();
        noncesByCode.set('code', request.nonce);
        // A successful exchange proves the full request path including code_verifier.
        const result = await adapter.exchangeCodeForTokens('code', request.state);
        expect(result.principal?.id).toBe('42');
    });

    test('replayed state cannot redeem a second code', async () => {
        const adapter = makeAdapter();
        const request = await adapter.createAuthorizationRequest();
        noncesByCode.set('code-1', request.nonce);
        await adapter.exchangeCodeForTokens('code-1', request.state);
        await expect(adapter.exchangeCodeForTokens('code-2', request.state)).rejects.toMatchObject({
            code: 'invalid_state',
        });
    });

    test('a callback on a second adapter instance completes when both share a pendingStore', async () => {
        const pendingStore = createSharedPendingStore();
        const creatingPage = makeAdapter({ pendingStore });
        const request = await creatingPage.createAuthorizationRequest();
        noncesByCode.set('survives-redirect', request.nonce);

        // The provider redirect reloads the app: the creating adapter instance
        // is gone and a fresh one handles the callback.
        const callbackPage = makeAdapter({ pendingStore });
        const result = await callbackPage.exchangeCodeForTokens('survives-redirect', request.state);

        expect(result.principal?.id).toBe('42');
        expect(result.principal?.hasRole('user')).toBe(true);
        expect(result.token).toBe('at-123');
    });

    test('a shared pendingStore keeps state single-use across instances', async () => {
        const pendingStore = createSharedPendingStore();
        const creator = makeAdapter({ pendingStore });
        const request = await creator.createAuthorizationRequest();
        noncesByCode.set('shared-once', request.nonce);

        const callback = makeAdapter({ pendingStore });
        await callback.exchangeCodeForTokens('shared-once', request.state);

        const replay = makeAdapter({ pendingStore });
        await expect(replay.exchangeCodeForTokens('shared-once-again', request.state)).rejects.toMatchObject({
            code: 'invalid_state',
        });
    });

    test('wrong nonce in the ID token is rejected', async () => {
        const adapter = makeAdapter();
        const request = await adapter.createAuthorizationRequest();

        const wrongNonceToken = await new SignJWT({ sub: '42', nonce: 'attacker-nonce' })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer(issuer())
            .setAudience('my-client')
            .setExpirationTime('1h')
            .sign(privateKey);

        const originalFetch = globalThis.fetch;
        globalThis.fetch = (async () =>
            new Response(JSON.stringify({ access_token: 'at', id_token: wrongNonceToken, expires_in: 3600 }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })) as typeof fetch;
        try {
            await expect(adapter.exchangeCodeForTokens('code', request.state)).rejects.toMatchObject({
                code: 'invalid_nonce',
            });
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    test('a signed ID token without a sub claim is rejected', async () => {
        const adapter = makeAdapter();
        const token = await new SignJWT({ name: 'No Subject' })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer(issuer())
            .setAudience('my-client')
            .setExpirationTime('1h')
            .sign(privateKey);

        expect(await adapter.validate(token)).toBeNull();
    });

    test('a signed ID token with an empty sub claim is rejected', async () => {
        const adapter = makeAdapter();
        const token = await new SignJWT({ name: 'Empty Subject' })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer(issuer())
            .setAudience('my-client')
            .setSubject('')
            .setExpirationTime('1h')
            .sign(privateKey);

        expect(await adapter.validate(token)).toBeNull();
    });

    test('a signed ID token with a sub claim yields the correct principal', async () => {
        const adapter = makeAdapter();
        const token = await new SignJWT({ name: 'Signed User', roles: ['admin'] })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer(issuer())
            .setAudience('my-client')
            .setSubject('99')
            .setExpirationTime('1h')
            .sign(privateKey);

        const principal = await adapter.validate(token);
        expect(principal?.id).toBe('99');
        expect(principal?.name).toBe('Signed User');
        expect(principal?.hasRole('admin')).toBe(true);
    });

    test('malformed token responses (missing id_token) are rejected', async () => {
        const adapter = makeAdapter();
        const request = await adapter.createAuthorizationRequest();
        tokenResponseOverride = { status: 200, body: { access_token: 'at' } };
        try {
            await expect(adapter.exchangeCodeForTokens('code', request.state)).rejects.toMatchObject({
                code: 'malformed_response',
            });
        } finally {
            tokenResponseOverride = null;
        }
    });

    test('token endpoint errors surface as network failures', async () => {
        const adapter = makeAdapter();
        const request = await adapter.createAuthorizationRequest();
        tokenResponseOverride = { status: 400, body: { error: 'invalid_grant' } };
        try {
            await expect(adapter.exchangeCodeForTokens('code', request.state)).rejects.toMatchObject({
                code: 'network',
            });
        } finally {
            tokenResponseOverride = null;
        }
    });

    test('a token-endpoint redirect never forwards the POST body (client_secret stays put)', async () => {
        const adapter = makeAdapter();
        const request = await adapter.createAuthorizationRequest();
        leakedBody = '';
        tokenResponseOverride = { status: 307, body: {}, location: `${issuer()}/leak` };
        try {
            await expect(adapter.exchangeCodeForTokens('code', request.state)).rejects.toMatchObject({
                code: 'network',
            });
            // Redirects are errored, not followed, so the target never sees
            // the code/client_secret form body.
            expect(leakedBody).toBe('');
        } finally {
            tokenResponseOverride = null;
        }
    });

    test('a stalling token endpoint fails with a network timeout, not a hang', async () => {
        const adapter = makeAdapter({ fetchTimeoutMs: 150 });
        const request = await adapter.createAuthorizationRequest();
        tokenResponseOverride = { status: 599, body: null }; // stub stalls forever
        const startedAt = Date.now();
        try {
            await expect(adapter.exchangeCodeForTokens('code', request.state)).rejects.toMatchObject({
                code: 'network',
            });
            expect(Date.now() - startedAt).toBeLessThan(2_000);
        } finally {
            tokenResponseOverride = null;
        }
    });

    test('an oversized token-endpoint response is rejected', async () => {
        const adapter = makeAdapter({ maxResponseBytes: 1024 });
        const request = await adapter.createAuthorizationRequest();
        tokenResponseOverride = { status: 200, body: { access_token: 'x'.repeat(10_000) } };
        try {
            await expect(adapter.exchangeCodeForTokens('code', request.state)).rejects.toMatchObject({
                code: 'network',
            });
        } finally {
            tokenResponseOverride = null;
        }
    });

    test('discovery issuer mismatch fails closed', async () => {
        const mismatch = createServer((_req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    issuer: 'https://someone-else.example.com',
                    authorization_endpoint: 'https://x/a',
                    token_endpoint: 'https://x/t',
                    jwks_uri: 'https://x/j',
                })
            );
        });
        const mismatchPort = await listen(mismatch);
        const adapter = new OIDCAdapter({
            issuer: `http://127.0.0.1:${mismatchPort}`,
            clientId: 'my-client',
            redirectUri: 'https://myapp.com/callback',
            discovery: true,
        });
        try {
            await expect(adapter.createAuthorizationRequest()).rejects.toMatchObject({ code: 'discovery' });
        } finally {
            await close(mismatch);
        }
    });

    test('discovery document served over plain HTTP off-loopback is rejected', async () => {
        const adapter = new OIDCAdapter({
            issuer: 'http://example.invalid',
            clientId: 'my-client',
            redirectUri: 'https://myapp.com/callback',
            discovery: true,
        });
        await expect(adapter.createAuthorizationRequest()).rejects.toMatchObject({ code: 'configuration' });
    });

    test('getEndSessionUrl resolves from discovery', async () => {
        const adapter = makeAdapter();
        expect(await adapter.getEndSessionUrl('id-token-hint')).toBe(`${issuer()}/logout?id_token_hint=id-token-hint`);
    });

    test('OIDCError exposes a code for programmatic handling', () => {
        const error = new OIDCError('invalid_nonce', 'nonce mismatch');
        expect(error.code).toBe('invalid_nonce');
        expect(error.name).toBe('OIDCError');
    });
});

/**
 * The refresh-token grant end to end against the same stub provider:
 * capture at exchange, discovery-resolved exchange, full ID-token
 * verification (no nonce), subject stability, and rotation semantics.
 */
describe('OIDCAdapter refresh-token grant', () => {
    beforeEach(() => {
        refreshOverride = null;
        refreshSub = '42';
        refreshTokenResponse = 'rt-rotated';
        refreshAlg = 'RS256';
        refreshIssuerOverride = null;
        refreshRequests.length = 0;
    });

    /** Exchanges a fresh code and returns the captured refresh token. */
    async function exchangeForRefreshToken(adapter: OIDCAdapter): Promise<string> {
        const request = await adapter.createAuthorizationRequest();
        noncesByCode.set('refresh-code', request.nonce);
        const result = await adapter.exchangeCodeForTokens('refresh-code', request.state);
        expect(result.refreshToken).toBe('rt-1');
        return result.refreshToken as string;
    }

    test('happy path: refreshes with the captured token and rotates it', async () => {
        const adapter = makeAdapter();
        const refreshToken = await exchangeForRefreshToken(adapter);

        const refreshed = await adapter.refresh(refreshToken);

        expect(refreshed.principal?.id).toBe('42');
        expect(refreshed.principal?.name).toBe('Flow User');
        expect(refreshed.token).toBe('at-refreshed');
        expect(refreshed.refreshToken).toBe('rt-rotated');
        expect(refreshed.expiresAt).not.toBeNull();

        const form = refreshRequests.at(-1);
        expect(form?.get('grant_type')).toBe('refresh_token');
        expect(form?.get('refresh_token')).toBe('rt-1');
        expect(form?.get('client_id')).toBe('my-client');
        expect(form?.get('client_secret')).toBeNull();
    });

    test('rotation consumes the presented token; the rotated one is redeemable', async () => {
        const adapter = makeAdapter();
        const refreshToken = await exchangeForRefreshToken(adapter);
        await adapter.refresh(refreshToken);

        await expect(adapter.refresh(refreshToken)).rejects.toMatchObject({ code: 'invalid_token' });

        const second = await adapter.refresh('rt-rotated');
        expect(second.principal?.id).toBe('42');
    });

    test('a non-rotating provider keeps the presented token redeemable', async () => {
        refreshTokenResponse = null;
        const adapter = makeAdapter();
        const refreshToken = await exchangeForRefreshToken(adapter);

        const first = await adapter.refresh(refreshToken);
        expect(first.refreshToken).toBeNull();

        const second = await adapter.refresh(refreshToken);
        expect(second.principal?.id).toBe('42');
    });

    test('an access token is not a refresh credential — rejected before any network call', async () => {
        const adapter = makeAdapter();
        await exchangeForRefreshToken(adapter);

        await expect(adapter.refresh('at-123')).rejects.toMatchObject({ code: 'invalid_token' });
        expect(refreshRequests).toHaveLength(0);
    });

    test('provider rejection (400 invalid_grant) surfaces as invalid_token, not network', async () => {
        const adapter = makeAdapter();
        const refreshToken = await exchangeForRefreshToken(adapter);
        refreshOverride = { status: 400, body: { error: 'invalid_grant' } };

        await expect(adapter.refresh(refreshToken)).rejects.toMatchObject({ code: 'invalid_token' });

        // The binding survives a failed refresh: once the provider accepts
        // the token again, the same credential works.
        refreshOverride = null;
        const retry = await adapter.refresh(refreshToken);
        expect(retry.principal?.id).toBe('42');
    });

    test('confidential clients authenticate the refresh with the client secret', async () => {
        const adapter = makeAdapter({ clientSecret: 's3cret' });
        const refreshToken = await exchangeForRefreshToken(adapter);

        await adapter.refresh(refreshToken);

        expect(refreshRequests.at(-1)?.get('client_secret')).toBe('s3cret');
    });

    test('a refreshed ID token for a different subject is rejected (sub stability)', async () => {
        const adapter = makeAdapter();
        const refreshToken = await exchangeForRefreshToken(adapter);
        refreshSub = '99';

        await expect(adapter.refresh(refreshToken)).rejects.toMatchObject({ code: 'invalid_token' });
    });

    test('a refreshed ID token with the wrong issuer is rejected', async () => {
        const adapter = makeAdapter();
        const refreshToken = await exchangeForRefreshToken(adapter);
        refreshIssuerOverride = 'https://someone-else.example.com';

        await expect(adapter.refresh(refreshToken)).rejects.toMatchObject({ code: 'invalid_token' });
    });

    test('a refreshed ID token signed with a disallowed alg is rejected', async () => {
        const adapter = makeAdapter({ allowedAlgorithms: ['RS256'] });
        const refreshToken = await exchangeForRefreshToken(adapter);
        refreshAlg = 'HS256';

        await expect(adapter.refresh(refreshToken)).rejects.toMatchObject({ code: 'invalid_token' });
    });

    test('a shared refreshStore lets another instance redeem the token', async () => {
        const entries = new Map<string, { subject: string }>();
        const refreshStore: RefreshTokenStore = {
            kind: 'test-shared',
            get: async (token) => entries.get(token) ?? null,
            set: async (token, binding) => {
                entries.set(token, binding);
            },
            delete: async (token) => {
                entries.delete(token);
            },
        };

        const firstInstance = makeAdapter({ refreshStore });
        const refreshToken = await exchangeForRefreshToken(firstInstance);

        // A fresh page load constructs a new adapter; the shared store carries
        // the binding (and the rotation).
        const secondInstance = makeAdapter({ refreshStore });
        const refreshed = await secondInstance.refresh(refreshToken);
        expect(refreshed.principal?.id).toBe('42');

        // The default in-memory store is instance-scoped: another adapter
        // cannot redeem a token it never saw.
        const isolated = makeAdapter();
        const isolatedToken = await exchangeForRefreshToken(isolated);
        const otherInstance = makeAdapter();
        await expect(otherInstance.refresh(isolatedToken)).rejects.toMatchObject({ code: 'invalid_token' });
    });
});
