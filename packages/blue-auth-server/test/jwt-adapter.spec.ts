import { describe, test, expect, beforeEach } from 'vitest';
import { JWTAdapter } from '../src/jwt-adapter';
import { Principal } from '@blue/auth-core';

// Helper to create a minimal JWT token string
function createJWT(payload: Record<string, any>, _secret = 'secret'): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    // Signature is not verified in the simplified adapter
    const signature = Buffer.from('fakesignature').toString('base64url');
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

            const result = await adapter.validate(token) as Principal;

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

            const result = await adapter.validate(token) as Principal;
            expect(result!.name).toBe('alice@example.com');
        });

        test('uses unknown as id when sub is missing', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createJWT({
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                exp: futureTime,
            });

            const result = await adapter.validate(token) as Principal;
            expect(result!.id).toBe('unknown');
        });

        test('uses Unknown as name when name and email are missing', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createJWT({
                sub: '1',
                iss: 'https://auth.example.com',
                aud: 'my-app',
                exp: futureTime,
            });

            const result = await adapter.validate(token) as Principal;
            expect(result!.name).toBe('Unknown');
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

            const result = await adapter.validate(token) as Principal;
            expect(result!.roles).toEqual([]);
        });

        test('returns null when no exp claim (no expiration check)', async () => {
            const token = createJWT({
                sub: '1',
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'my-app',
            });

            const result = await adapter.validate(token) as Principal;
            expect(result).not.toBeNull();
            expect(result!.id).toBe('1');
        });
    });

    describe('authenticate', () => {
        test('throws error as not implemented', async () => {
            await expect(adapter.authenticate({})).rejects.toThrow(
                'JWTAdapter.authenticate() not implemented - use a proper auth flow',
            );
        });
    });

    describe('refresh', () => {
        test('throws error as not implemented', async () => {
            await expect(adapter.refresh('token')).rejects.toThrow(
                'JWTAdapter.refresh() not implemented - use a proper token refresh flow',
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
