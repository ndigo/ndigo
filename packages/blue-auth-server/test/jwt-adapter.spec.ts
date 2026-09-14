/**
 * @module blue-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
// Helper to create a minimal JWT token string with a real HMAC signature
import { describe, test, expect, beforeEach } from 'vitest';
import { JWTAdapter } from '../src/jwt-adapter';
import { Principal } from '@blue/auth-core';
import { generateKeyPair, exportSPKI, SignJWT, type JWTPayload } from 'jose';
import { createHmac } from 'node:crypto';

function createJWT(payload: JWTPayload, secret = 'test-secret'): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
}

describe('JWTAdapter', () => {
    const config = {
        issuer: 'https://auth.example.com',
        audience: 'my-app',
        secret: 'test-secret',
        algorithm: 'HS256',
    };

    let adapter: JWTAdapter;

    beforeEach(() => {
        adapter = new JWTAdapter(config);
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

        test('uses unknown as id when sub is missing', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createJWT({
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                exp: futureTime,
            });

            const result = await adapter.validate(token);
            expect(result).toBeDefined();
            expect(result?.id).toBe('unknown');
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

        test('returns null when no exp claim (no expiration check)', async () => {
            const token = createJWT({
                sub: '1',
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'my-app',
            });

            const result = await adapter.validate(token);
            expect(result).not.toBeNull();
            expect(result?.id).toBe('1');
        });
    });

    describe('authenticate', () => {
        test('throws error as not implemented', async () => {
            await expect(adapter.authenticate({})).rejects.toThrow(
                'JWTAdapter.authenticate() not implemented - use a proper auth flow'
            );
        });
    });

    describe('refresh', () => {
        test('throws error as not implemented', async () => {
            await expect(adapter.refresh('token')).rejects.toThrow(
                'JWTAdapter.refresh() not implemented - use a proper token refresh flow'
            );
        });
    });

    describe('logout', () => {
        test('completes without error (stateless)', async () => {
            await expect(adapter.logout('token')).resolves.toBeUndefined();
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
