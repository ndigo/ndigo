/**
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { AuthServer } from '../src/server';
import { AuthRegistry } from '@ndigo/auth-core';
import { AuthAdapter, Principal } from '@ndigo/auth-core';

/** Builds a complete principal for adapter mocks. */
function principal(id: string, name: string, roles: string[], scopes: string[] = []): Principal {
    return {
        id,
        name,
        roles,
        scopes,
        hasRole: (role: string) => roles.includes(role),
        hasAnyRole: (...wanted: string[]) => wanted.some((role) => roles.includes(role)),
        hasScope: (scope: string) => scopes.includes(scope),
        hasAnyScope: (...wanted: string[]) => wanted.some((scope) => scopes.includes(scope)),
    };
}

function createMockAdapter(id: string, validateResult: Principal | null = principal('1', 'Test', [])): AuthAdapter {
    return {
        id,
        validate: async () => validateResult,
        authenticate: async () => ({ principal: null, token: null, expiresAt: null }),
        refresh: async () => ({ principal: null, token: null, expiresAt: null }),
        logout: async () => {},
    };
}

describe('AuthServer', () => {
    beforeEach(() => {
        AuthRegistry.clear();
    });

    describe('validate', () => {
        test('throws error when adapter not found', async () => {
            const server = new AuthServer();
            await expect(server.validate('nonexistent', 'token')).rejects.toThrow(
                "Authentication adapter 'nonexistent' not found"
            );
        });

        test('delegates to adapter and returns principal', async () => {
            const mockAdapter = createMockAdapter('jwt', principal('42', 'Alice', ['admin']));
            AuthRegistry.register(mockAdapter);

            const server = new AuthServer();
            const result = await server.validate('jwt', 'some-token');

            expect(result).toEqual({
                id: '42',
                name: 'Alice',
                roles: ['admin'],
                scopes: [],
                hasRole: expect.any(Function),
                hasAnyRole: expect.any(Function),
                hasScope: expect.any(Function),
                hasAnyScope: expect.any(Function),
            });
        });

        test('returns null when adapter returns null', async () => {
            const mockAdapter = createMockAdapter('jwt', null);
            AuthRegistry.register(mockAdapter);

            const server = new AuthServer();
            const result = await server.validate('jwt', 'invalid-token');

            expect(result).toBeNull();
        });
    });

    describe('validateAny', () => {
        test('returns null for an empty adapter list', async () => {
            const server = new AuthServer();
            const result = await server.validateAny('token', []);
            expect(result).toBeNull();
        });

        test('returns principal from first successful listed adapter', async () => {
            const adapter1 = createMockAdapter('jwt', null);
            const adapter2 = createMockAdapter('oidc', principal('99', 'Bob', []));
            AuthRegistry.register(adapter1);
            AuthRegistry.register(adapter2);

            const server = new AuthServer();
            const result = await server.validateAny('token', ['jwt', 'oidc']);

            expect(result).toEqual({
                id: '99',
                name: 'Bob',
                roles: [],
                scopes: [],
                hasRole: expect.any(Function),
                hasAnyRole: expect.any(Function),
                hasScope: expect.any(Function),
                hasAnyScope: expect.any(Function),
            });
        });

        test('does not try adapters outside the explicit list', async () => {
            const unlisted = createMockAdapter('unlisted', principal('1', 'U', []));
            const listed = createMockAdapter('listed', null);
            AuthRegistry.register(unlisted);
            AuthRegistry.register(listed);

            const server = new AuthServer();
            // The unlisted adapter would succeed — it must not be consulted.
            const result = await server.validateAny('token', ['listed']);

            expect(result).toBeNull();
        });

        test('throws for an adapter ID that is not registered', async () => {
            const server = new AuthServer();
            await expect(server.validateAny('token', ['never-registered'])).rejects.toThrow(
                "Authentication adapter 'never-registered' not found"
            );
        });

        test('skips listed adapters that throw errors', async () => {
            const failingAdapter: AuthAdapter = {
                id: 'failing',
                validate: async () => {
                    throw new Error('Adapter error');
                },
                authenticate: async () => ({ principal: null, token: null, expiresAt: null }),
                refresh: async () => ({ principal: null, token: null, expiresAt: null }),
                logout: async () => {},
            };
            const successAdapter = createMockAdapter('ok', principal('1', 'OK', []));
            AuthRegistry.register(failingAdapter);
            AuthRegistry.register(successAdapter);

            const server = new AuthServer();
            const result = await server.validateAny('token', ['failing', 'ok']);

            expect(result).toEqual({
                id: '1',
                name: 'OK',
                roles: [],
                scopes: [],
                hasRole: expect.any(Function),
                hasAnyRole: expect.any(Function),
                hasScope: expect.any(Function),
                hasAnyScope: expect.any(Function),
            });
        });

        test('returns null when all listed adapters fail', async () => {
            const adapter1 = createMockAdapter('jwt', null);
            const adapter2 = createMockAdapter('oidc', null);
            AuthRegistry.register(adapter1);
            AuthRegistry.register(adapter2);

            const server = new AuthServer();
            const result = await server.validateAny('token', ['jwt', 'oidc']);

            expect(result).toBeNull();
        });
    });
});
