import { describe, test, expect, beforeEach } from 'vitest';
import { AuthServer } from '../src/server';
import { AuthRegistry } from '@blue/auth-core';
import { AuthAdapter } from '@blue/auth-core';

function createMockAdapter(id: string, validateResult: any = { id: '1', name: 'Test', roles: [], hasRole: () => false, hasAnyRole: () => false }): AuthAdapter {
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
                "Authentication adapter 'nonexistent' not found",
            );
        });

        test('delegates to adapter and returns principal', async () => {
            const mockAdapter = createMockAdapter('jwt', { id: '42', name: 'Alice', roles: ['admin'], hasRole: () => true, hasAnyRole: () => false });
            AuthRegistry.register(mockAdapter);

            const server = new AuthServer();
            const result = await server.validate('jwt', 'some-token');

            expect(result).toEqual({ id: '42', name: 'Alice', roles: ['admin'], hasRole: expect.any(Function), hasAnyRole: expect.any(Function) });
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
        test('returns null when no adapters registered', async () => {
            const server = new AuthServer();
            const result = await server.validateAny('token');
            expect(result).toBeNull();
        });

        test('returns principal from first successful adapter', async () => {
            const adapter1 = createMockAdapter('jwt', null);
            const adapter2 = createMockAdapter('oidc', { id: '99', name: 'Bob', roles: [], hasRole: () => false, hasAnyRole: () => false });
            AuthRegistry.register(adapter1);
            AuthRegistry.register(adapter2);

            const server = new AuthServer();
            const result = await server.validateAny('token');

            expect(result).toEqual({ id: '99', name: 'Bob', roles: [], hasRole: expect.any(Function), hasAnyRole: expect.any(Function) });
        });

        test('skips adapters that throw errors', async () => {
            const failingAdapter: AuthAdapter = {
                id: 'failing',
                validate: async () => { throw new Error('Adapter error'); },
                authenticate: async () => ({ principal: null, token: null, expiresAt: null }),
                refresh: async () => ({ principal: null, token: null, expiresAt: null }),
                logout: async () => {},
            };
            const successAdapter = createMockAdapter('ok', { id: '1', name: 'OK', roles: [], hasRole: () => false, hasAnyRole: () => false });
            AuthRegistry.register(failingAdapter);
            AuthRegistry.register(successAdapter);

            const server = new AuthServer();
            const result = await server.validateAny('token');

            expect(result).toEqual({ id: '1', name: 'OK', roles: [], hasRole: expect.any(Function), hasAnyRole: expect.any(Function) });
        });

        test('returns null when all adapters fail', async () => {
            const adapter1 = createMockAdapter('jwt', null);
            const adapter2 = createMockAdapter('oidc', null);
            AuthRegistry.register(adapter1);
            AuthRegistry.register(adapter2);

            const server = new AuthServer();
            const result = await server.validateAny('token');

            expect(result).toBeNull();
        });
    });
});
