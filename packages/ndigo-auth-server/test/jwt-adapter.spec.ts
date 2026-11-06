/**
 */
// @vitest-environment node
// Helper to create a minimal JWT token string with a real HMAC signature
import { describe, test, expect, beforeEach } from 'vitest';
import { JWTAdapter, JWTTokenError } from '../src/jwt-adapter';
import { Principal } from '@ndigo/auth-core';
import { generateKeyPair, exportSPKI, SignJWT, type JWTPayload } from 'jose';
import { createHmac } from 'node:crypto';

/** 32+ byte HMAC secret (SE-2 rejects keys below 256 bits). */
const TEST_SECRET = 'test-secret-0123456789abcdefghijklmn';

function createJWT(payload: JWTPayload, secret = TEST_SECRET): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
}

describe('JWTAdapter', () => {
    const config = {
        issuer: 'https://auth.example.com',
        audience: 'my-app',
        secret: TEST_SECRET,
        algorithm: 'HS256',
    };

    let adapter: JWTAdapter;

    beforeEach(() => {
        adapter = new JWTAdapter(config);
    });

    test('construction fails loud for HMAC without a secret (SEC-2)', () => {
        expect(
            () => new JWTAdapter({ issuer: 'https://auth.example.com', audience: 'my-app', algorithm: 'HS256' })
        ).toThrow(/secret/);
    });

    test('construction rejects an HMAC secret below 32 bytes (SEC-2)', () => {
        const short = { ...config, secret: 'x'.repeat(31) };
        expect(() => new JWTAdapter(short)).toThrow(JWTTokenError);
        expect(() => new JWTAdapter(short)).toThrow(/at least 32 bytes/);
        // 32 bytes is the floor: a full-length key still constructs.
        expect(() => new JWTAdapter({ ...config, secret: 'x'.repeat(32) })).not.toThrow();
    });

    describe('validate', () => {
        test('returns null for malformed token (not 3 parts)', async () => {
            expect(await adapter.validate('not-a-jwt')).toBeNull();
            expect(await adapter.validate('only.two')).toBeNull();
            expect(await adapter.validate('a.b.c.d')).toBeNull();
        });

        test('returns null for invalid base64 payload', async () => {
            const token = 'header.!!!invalid!!!.signature';
            expect(await adapter.validate(token)).toBeNull();
        });

        test('returns null when issuer does not match', async () => {
            const token = createJWT({
                sub: '1',
                name: 'Test',
                iss: 'https://evil.com',
                aud: 'my-app',
            });
            expect(await adapter.validate(token)).toBeNull();
        });

        test('returns null when audience does not match', async () => {
            const token = createJWT({
                sub: '1',
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'wrong-app',
            });
            expect(await adapter.validate(token)).toBeNull();
        });

        test('returns null for expired token', async () => {
            const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
            const token = createJWT({
                sub: '1',
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                exp: pastTime,
            });
            expect(await adapter.validate(token)).toBeNull();
        });

        test('returns principal for valid token', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
            const token = createJWT({
                sub: '42',
                name: 'Alice',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                roles: ['admin', 'user'],
                exp: futureTime,
            });

            const result = (await adapter.validate(token)) as Principal;

            expect(result).not.toBeNull();
            expect(result.id).toBe('42');
            expect(result.name).toBe('Alice');
            expect(result.roles).toEqual(['admin', 'user']);
            expect(result.hasRole('admin')).toBe(true);
            expect(result.hasRole('moderator')).toBe(false);
            expect(result.hasAnyRole('moderator', 'admin')).toBe(true);
        });

        test('SEC-AUD2-SEC-4/6: non-string role claims are filtered so roles and predicates agree', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const cases: unknown[][] = [[['admin']], [1], [null], ['admin', 1, null, 'user'], [undefined], [true]];
            for (const roles of cases) {
                const token = createJWT({
                    sub: '42',
                    name: 'Alice',
                    iss: 'https://auth.example.com',
                    aud: 'my-app',
                    roles,
                    exp: futureTime,
                });
                // eslint-disable-next-line no-await-in-loop -- each case validates its own token in order
                const result = (await adapter.validate(token)) as Principal;
                expect(result).not.toBeNull();
                // The declared roles array holds only strings…
                for (const role of result.roles) {
                    expect(typeof role).toBe('string');
                }
                // …and every predicate answer is consistent with that array —
                // no role that is "declared" but fails `hasRole`, or vice versa.
                for (const probed of ['admin', 'user', '1', 'null', 'undefined', 'true']) {
                    expect(result.hasRole(probed)).toBe(result.roles.includes(probed));
                }
                const wanted = ['admin', 'user', 'moderator'];
                expect(result.hasAnyRole(...wanted)).toBe(result.roles.some((role) => wanted.includes(role)));
            }
        });

        test('SEC-AUD2-SEC-4: a nested array claim is dropped, not stringified into a matching role', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createJWT({
                sub: '42',
                name: 'Alice',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                roles: [['admin']],
                exp: futureTime,
            });
            const result = (await adapter.validate(token)) as Principal;
            // Before the fix `roles` was `String([['admin']])`'s element =>
            // `['admin']` while `hasRole('admin')` matched the raw `['admin']`
            // element, so the principal advertised a role it did not have.
            expect(result.roles).toEqual([]);
            expect(result.hasRole('admin')).toBe(false);
        });

        test('extracts email as name when name is missing', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createJWT({
                sub: '42',
                email: 'alice@example.com',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                exp: futureTime,
            });

            const result = await adapter.validate(token);
            expect(result).toBeDefined();
            expect(result?.name).toBe('alice@example.com');
        });

        test('returns null when sub is missing (SE-1)', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createJWT({
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                exp: futureTime,
            });

            expect(await adapter.validate(token)).toBeNull();
        });

        test('returns null when sub is an empty string (SE-1)', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createJWT({
                sub: '',
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                exp: futureTime,
            });

            expect(await adapter.validate(token)).toBeNull();
        });

        test('uses Unknown as name when name and email are missing', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createJWT({
                sub: '1',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                exp: futureTime,
            });

            const result = await adapter.validate(token);
            expect(result).toBeDefined();
            expect(result?.name).toBe('Unknown');
        });

        test('uses empty roles when roles claim is missing', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createJWT({
                sub: '1',
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                exp: futureTime,
            });

            const result = await adapter.validate(token);
            expect(result).toBeDefined();
            expect(result?.roles).toEqual([]);
        });

        test('returns null when the exp claim is missing (SE-1)', async () => {
            const token = createJWT({
                sub: '1',
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'my-app',
            });

            expect(await adapter.validate(token)).toBeNull();
        });

        test('clockToleranceSeconds admits recently expired tokens (SE-1)', async () => {
            const justExpired = Math.floor(Date.now() / 1000) - 5;
            const token = createJWT({
                sub: '1',
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                exp: justExpired,
            });

            expect(await adapter.validate(token)).toBeNull();
            const tolerant = new JWTAdapter({ ...config, clockToleranceSeconds: 30 });
            await expect(tolerant.validate(token)).resolves.toMatchObject({ id: '1' });
        });
    });

    describe('authenticate', () => {
        test('throws error as not implemented', async () => {
            await expect(adapter.authenticate({})).rejects.toThrow(
                'JWTAdapter.authenticate() not implemented - use a proper auth flow'
            );
        });
    });

    describe('id', () => {
        test('returns jwt', () => {
            expect(adapter.id).toBe('jwt');
        });
    });
});

describe('JWTAdapter asymmetric algorithms (jose)', () => {
    test('RS256 verifies a token signed with the matching private key', async () => {
        const { publicKey, privateKey } = await generateKeyPair('RS256', { extractable: true });
        const spki = await exportSPKI(publicKey);

        const adapter = new JWTAdapter({
            issuer: 'https://auth.example.com',
            audience: 'my-app',
            publicKey: spki,
            algorithm: 'RS256',
        });

        const token = await new SignJWT({ sub: '43', name: 'RSA User', roles: ['user'] })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer('https://auth.example.com')
            .setAudience('my-app')
            .setExpirationTime('1h')
            .sign(privateKey);

        const principal = await adapter.validate(token);
        expect(principal?.id).toBe('43');
        expect(principal?.name).toBe('RSA User');
        expect(principal?.hasRole('user')).toBe(true);
    });

    test('RS256 rejects a token signed with a different private key', async () => {
        const { publicKey } = await generateKeyPair('RS256', { extractable: true });
        const spki = await exportSPKI(publicKey);
        const { privateKey: otherPrivate } = await generateKeyPair('RS256', { extractable: true });

        const adapter = new JWTAdapter({
            issuer: 'https://auth.example.com',
            audience: 'my-app',
            publicKey: spki,
            algorithm: 'RS256',
        });

        const token = await new SignJWT({ sub: '43', name: 'RSA User' })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuer('https://auth.example.com')
            .setAudience('my-app')
            .setExpirationTime('1h')
            .sign(otherPrivate);

        expect(await adapter.validate(token)).toBeNull();
    });

    test('ES256 verifies a token via the PEM public key', async () => {
        const { publicKey, privateKey } = await generateKeyPair('ES256', { extractable: true });
        const spki = await exportSPKI(publicKey);

        const adapter = new JWTAdapter({
            issuer: 'https://auth.example.com',
            audience: 'my-app',
            publicKey: spki,
            algorithm: 'ES256',
        });

        const token = await new SignJWT({ sub: '7', name: 'EC User' })
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuer('https://auth.example.com')
            .setAudience('my-app')
            .setExpirationTime('1h')
            .sign(privateKey);

        const principal = await adapter.validate(token);
        expect(principal?.id).toBe('7');
        expect(principal?.name).toBe('EC User');
    });

    test('missing public key rejects with a clear error (no claim-only fallback)', async () => {
        const adapter = new JWTAdapter({
            issuer: 'https://auth.example.com',
            audience: 'my-app',
            algorithm: 'RS256',
        });
        expect(await adapter.validate('a.b.c')).toBeNull();
    });
});
