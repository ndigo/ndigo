/**
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { createServer, Server } from 'node:http';
import { generateKeyPair, exportSPKI, exportJWK, importSPKI, SignJWT } from 'jose';
import { OIDCAdapter } from '../src/oidc-adapter';

/**
 * OIDC JWKS signature verification: serves a JWKS over a local HTTP server and
 * verifies an ID token signed by the matching private key — proving the
 * built-in `jwksUrl` validator (assessment's "no built-in JWKS fetch" gap).
 */

let server: Server;
let jwksUrl: string;
let privateKey: CryptoKey;

beforeAll(async () => {
    const { publicKey, privateKey: _privateKey } = await generateKeyPair('RS256', { extractable: true });
    privateKey = _privateKey;
    const spki = await exportSPKI(publicKey);
    const publicCryptoKey = await importSPKI(spki, 'RS256');
    const jwk = await exportJWK(publicCryptoKey);
    const jwks = JSON.stringify({ keys: [{ ...jwk, alg: 'RS256', use: 'sig' }] });

    server = createServer((_req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(jwks);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const addr = server.address() as { port: number };
    jwksUrl = `http://127.0.0.1:${addr.port}/jwks`;
});

afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
});

async function signToken(sub: string): Promise<string> {
    return new SignJWT({ sub, name: 'JWKS User', roles: ['user'] })
        .setProtectedHeader({ alg: 'RS256' })
        .setIssuer('https://auth.example.com')
        .setAudience('my-client')
        .setExpirationTime('1h')
        .sign(privateKey);
}

describe('OIDCAdapter jwksUrl', () => {
    test('a token signed by the JWKS key validates', async () => {
        const adapter = new OIDCAdapter({
            issuer: 'https://auth.example.com',
            clientId: 'my-client',
            redirectUri: 'https://myapp.com/callback',
            jwksUrl,
        });

        const token = await signToken('42');
        const principal = await adapter.validate(token);
        expect(principal?.id).toBe('42');
        expect(principal?.name).toBe('JWKS User');
        expect(principal?.hasRole('user')).toBe(true);
    });

    test('a token signed by a different key is rejected', async () => {
        const other = await generateKeyPair('RS256', { extractable: true });

        const adapter = new OIDCAdapter({
            issuer: 'https://auth.example.com',
            clientId: 'my-client',
            redirectUri: 'https://myapp.com/callback',
            jwksUrl,
        });

        const token = await new SignJWT({ sub: 'evil' })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer('https://auth.example.com')
            .setAudience('my-client')
            .setExpirationTime('1h')
            .sign(other.privateKey);

        expect(await adapter.validate(token)).toBeNull();
    });
});
