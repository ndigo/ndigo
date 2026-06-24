import { describe, test, expect, beforeEach } from 'vitest';
import { OIDCAdapter } from '../src/oidc-adapter';
import { Principal } from '@blue/auth-core';

// Helper to create a minimal JWT-like token string
function createOIDCToken(payload: Record<string, any>): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = Buffer.from('fakesignature').toString('base64url');
    return `${header}.${body}.${signature}`;
}

describe('OIDCAdapter', () => {
    const config = {
        issuer: 'https://auth.example.com',
        clientId: 'my-client',
        redirectUri: 'https://myapp.com/callback',
        scopes: ['openid', 'profile', 'email'],
    };

    let adapter: OIDCAdapter;

    beforeEach(() => {
        adapter = new OIDCAdapter(config);
    });

    describe('id', () => {
        test('returns oidc', () => {
            expect(adapter.id).toBe('oidc');
        });
    });

    describe('getAuthorizationUrl', () => {
        test('returns well-formed authorization URL with query params', () => {
            const url = adapter.getAuthorizationUrl();
            expect(url).toMatch(/^https:\/\/auth\.example\.com\/authorize\?/);
        });

        test('includes required query parameters', () => {
            const url = adapter.getAuthorizationUrl();
            const parsed = new URL(url);
            expect(parsed.searchParams.get('response_type')).toBe('code');
            expect(parsed.searchParams.get('client_id')).toBe('my-client');
            expect(parsed.searchParams.get('redirect_uri')).toBe('https://myapp.com/callback');
            expect(parsed.searchParams.get('scope')).toBe('openid profile email');
        });

        test('includes custom scopes', () => {
            const customAdapter = new OIDCAdapter({
                ...config,
                scopes: ['openid', 'profile'],
            });
            const url = customAdapter.getAuthorizationUrl();
            const parsed = new URL(url);
            expect(parsed.searchParams.get('scope')).toBe('openid profile');
        });

        test('includes state parameter when provided', () => {
            const url = adapter.getAuthorizationUrl('csrf-token-123');
            const parsed = new URL(url);
            expect(parsed.searchParams.get('state')).toBe('csrf-token-123');
        });

        test('includes empty state when not provided', () => {
            const url = adapter.getAuthorizationUrl();
            const parsed = new URL(url);
            expect(parsed.searchParams.get('state')).toBe('');
        });
    });

    describe('validate', () => {
        test('returns null for malformed token', async () => {
            expect(await adapter.validate('not-a-jwt')).toBeNull();
            expect(await adapter.validate('only.two')).toBeNull();
        });

        test('returns null for invalid base64 payload', async () => {
            const token = 'header.!!!invalid!!!.signature';
            expect(await adapter.validate(token)).toBeNull();
        });

        test('returns null when issuer does not match', async () => {
            const token = createOIDCToken({
                sub: '1',
                name: 'Test',
                iss: 'https://evil.com',
            });
            expect(await adapter.validate(token)).toBeNull();
        });

        test('returns null for expired token', async () => {
            const pastTime = Math.floor(Date.now() / 1000) - 3600;
            const token = createOIDCToken({
                sub: '1',
                name: 'Test',
                iss: 'https://auth.example.com',
                exp: pastTime,
            });
            expect(await adapter.validate(token)).toBeNull();
        });

        test('returns null when audience does not match', async () => {
            const adapterWithAudience = new OIDCAdapter({
                ...config,
                audience: 'my-app',
            });

            const token = createOIDCToken({
                sub: '1',
                name: 'Test',
                iss: 'https://auth.example.com',
                aud: 'wrong-app',
            });
            expect(await adapterWithAudience.validate(token)).toBeNull();
        });

        test('returns principal for valid token', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createOIDCToken({
                sub: '42',
                name: 'Alice',
                iss: 'https://auth.example.com',
                roles: ['admin', 'user'],
                exp: futureTime,
            });

            const result = await adapter.validate(token) as Principal;

            expect(result).not.toBeNull();
            expect(result!.id).toBe('42');
            expect(result!.name).toBe('Alice');
            expect(result!.roles).toEqual(['admin', 'user']);
            expect(result!.hasRole('admin')).toBe(true);
        });

        test('extracts preferred_username when name is missing', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createOIDCToken({
                sub: '42',
                preferred_username: 'alice',
                iss: 'https://auth.example.com',
                exp: futureTime,
            });

            const result = await adapter.validate(token) as Principal;
            expect(result!.name).toBe('alice');
        });

        test('uses unknown as id when sub is missing', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createOIDCToken({
                name: 'Test',
                iss: 'https://auth.example.com',
                exp: futureTime,
            });

            const result = await adapter.validate(token) as Principal;
            expect(result!.id).toBe('unknown');
        });

        test('uses Unknown as name when name and preferred_username are missing', async () => {
            const futureTime = Math.floor(Date.now() / 1000) + 3600;
            const token = createOIDCToken({
                sub: '1',
                iss: 'https://auth.example.com',
                exp: futureTime,
            });

            const result = await adapter.validate(token) as Principal;
            expect(result!.name).toBe('Unknown');
        });
    });

    describe('exchangeCodeForTokens', () => {
        test('throws error when fetch fails', async () => {
            global.fetch = async () => ({
                ok: false,
                statusText: 'Bad Request',
                json: async () => ({}),
            }) as any;

            await expect(adapter.exchangeCodeForTokens('auth-code')).rejects.toThrow(
                'Token exchange failed: Bad Request',
            );
        });

        test('throws error when token exchange fails with network error', async () => {
            global.fetch = async () => {
                throw new Error('Network error');
            };

            await expect(adapter.exchangeCodeForTokens('auth-code')).rejects.toThrow('Network error');
        });
    });

    describe('authenticate', () => {
        test('throws error as not implemented', async () => {
            await expect(adapter.authenticate({})).rejects.toThrow(
                'OIDCAdapter.authenticate() not implemented - use getAuthorizationUrl() and exchangeCodeForTokens()',
            );
        });
    });

    describe('refresh', () => {
        test('throws error as not implemented', async () => {
            await expect(adapter.refresh('token')).rejects.toThrow(
                'OIDCAdapter.refresh() not implemented - use a proper refresh flow',
            );
        });
    });

    describe('logout', () => {
        test('completes without error', async () => {
            await expect(adapter.logout('token')).resolves.toBeUndefined();
        });
    });
});
