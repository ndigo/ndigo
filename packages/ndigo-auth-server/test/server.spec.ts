/**
 * @module ndigo-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { AuthServer } from '../src/server';
import { AuthRegistry } from '@ndigo/auth-core';
import { AuthAdapter, Principal } from '@ndigo/auth-core';

function createMockAdapter(
    id: string,
    validateResult: Principal | null = {
        id: '1',
        name: 'Test',
        roles: [],
        hasRole: () => false,
        hasAnyRole: () => false,
    }
): AuthAdapter {
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
            const mockAdapter = createMockAdapter('jwt', {
                id: '42',
                name: 'Alice',
                roles: ['admin'],
                hasRole: () => true,
                hasAnyRole: () => false,
            });
            AuthRegistry.register(mockAdapter);

            const server = new AuthServer();
            const result = await server.validate('jwt', 'some-token');

            expect(result).toEqual({
                id: '42',
                name: 'Alice',
                roles: ['admin'],
                hasRole: expect.any(Function),
                hasAnyRole: expect.any(Function),
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
            const adapter2 = createMockAdapter('oidc', {
                id: '99',
                name: 'Bob',
                roles: [],
                hasRole: () => false,
                hasAnyRole: () => false,
            });
            AuthRegistry.register(adapter1);
            AuthRegistry.register(adapter2);

            const server = new AuthServer();
            const result = await server.validateAny('token', ['jwt', 'oidc']);

            expect(result).toEqual({
                id: '99',
                name: 'Bob',
                roles: [],
                hasRole: expect.any(Function),
                hasAnyRole: expect.any(Function),
            });
        });

        test('does not try adapters outside the explicit list', async () => {
            const unlisted = createMockAdapter('unlisted', {
                id: '1',
                name: 'U',
                roles: [],
                hasRole: () => true,
                hasAnyRole: () => true,
            });
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
            const successAdapter = createMockAdapter('ok', {
                id: '1',
                name: 'OK',
                roles: [],
                hasRole: () => false,
                hasAnyRole: () => false,
            });
            AuthRegistry.register(failingAdapter);
            AuthRegistry.register(successAdapter);

            const server = new AuthServer();
            const result = await server.validateAny('token', ['failing', 'ok']);

            expect(result).toEqual({
                id: '1',
                name: 'OK',
                roles: [],
                hasRole: expect.any(Function),
                hasAnyRole: expect.any(Function),
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
