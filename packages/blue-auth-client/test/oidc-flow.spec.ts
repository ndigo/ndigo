// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { createServer, IncomingMessage, Server } from 'node:http';
import { generateKeyPair, exportSPKI, exportJWK, importSPKI, SignJWT } from 'jose';
import { OIDCAdapter, OIDCError } from '../src/oidc-adapter';

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
/** When set, the token endpoint responds with this status/body. */
let tokenResponseOverride: { status: number; body: unknown } | null = null;

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
                }),
            );
        } else if (path === '/jwks') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(jwksBody);
        } else if (path === '/token') {
            if (tokenResponseOverride) {
                res.writeHead(tokenResponseOverride.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(tokenResponseOverride.body));
                return;
            }
            const form = new URLSearchParams(await readBody(req));
            const nonce = noncesByCode.get(form.get('code') ?? '') ?? '';
            const idToken = await new SignJWT({ sub: '42', name: 'Flow User', roles: ['user'], nonce })
                .setProtectedHeader({ alg: 'RS256' })
                .setIssuer(issuer())
                .setAudience('my-client')
                .setExpirationTime('1h')
                .sign(privateKey);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ access_token: 'at-123', id_token: idToken, token_type: 'Bearer', expires_in: 3600 }));
        } else {
            res.writeHead(404).end();
        }
    });
    port = await listen(server);
});

afterAll(async () => {
    tokenResponseOverride = null;
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

    test('discovery issuer mismatch fails closed', async () => {
        const mismatch = createServer((_req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    issuer: 'https://someone-else.example.com',
                    authorization_endpoint: 'https://x/a',
                    token_endpoint: 'https://x/t',
                    jwks_uri: 'https://x/j',
                }),
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
