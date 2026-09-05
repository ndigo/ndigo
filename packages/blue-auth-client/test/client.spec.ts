import { describe, test, expect, beforeEach } from 'vitest';
import { AuthClient } from '../src/client';
import { AuthRegistry, AuthAdapter, Principal } from '@blue/auth-core';

function createMockAdapter(id: string, authResult: any = null, validateResult: any = null, refreshResult: any = null): AuthAdapter {
    return {
        id,
        validate: async () => validateResult,
        authenticate: async () => authResult,
        refresh: async () => refreshResult,
        logout: async () => {},
    };
}

function createMockPrincipal(id = '1', name = 'Test', roles: string[] = ['user']): Principal {
    return {
        id,
        name,
        roles,
        hasRole: (role: string) => roles.includes(role),
        hasAnyRole: (...r: string[]) => r.some((role) => roles.includes(role)),
    };
}

describe('AuthClient', () => {
    let client: AuthClient;

    beforeEach(() => {
        AuthRegistry.clear();
        client = new AuthClient();
    });

    describe('initial state', () => {
        test('starts unauthenticated', () => {
            expect(client.isAuthenticated).toBe(false);
        });

        test('starts with null principal', () => {
            expect(client.principal).toBeNull();
        });

        test('starts with null token', () => {
            expect(client.state.token).toBeNull();
        });

        test('starts with null expiresAt', () => {
            expect(client.state.expiresAt).toBeNull();
        });

        test('state returns full state object', () => {
            const state = client.state;
            expect(state.isAuthenticated).toBe(false);
            expect(state.principal).toBeNull();
            expect(state.token).toBeNull();
            expect(state.expiresAt).toBeNull();
        });
    });

    describe('authenticate', () => {
        test('throws error when adapter not found', async () => {
            await expect(client.authenticate('nonexistent', {})).rejects.toThrow(
                "Authentication adapter 'nonexistent' not found",
            );
        });

        test('updates state on successful authentication', async () => {
            const principal = createMockPrincipal('42', 'Alice', ['admin']);
            const mockAdapter = createMockAdapter('jwt', {
                principal,
                token: 'access-token',
                expiresAt: Date.now() + 3600000,
            });
            AuthRegistry.register(mockAdapter);

            const result = await client.authenticate('jwt', { username: 'alice', password: 'secret' });

            expect(result.principal).toBe(principal);
            expect(result.token).toBe('access-token');
            expect(client.isAuthenticated).toBe(true);
            expect(client.principal).toBe(principal);
            expect(client.state.token).toBe('access-token');
            // The mock's expiresAt was captured before the async round-trip;
            // allow the millisecond to tick between capture and assertion.
            expect(client.state.expiresAt).toBeGreaterThanOrEqual(Date.now() + 3600000 - 1000);
        });

        test('sets unauthenticated state when principal is null', async () => {
            const mockAdapter = createMockAdapter('jwt', {
                principal: null,
                token: null,
                expiresAt: null,
            });
            AuthRegistry.register(mockAdapter);

            const result = await client.authenticate('jwt', { username: 'wrong', password: 'wrong' });

            expect(result.principal).toBeNull();
            expect(client.isAuthenticated).toBe(false);
            expect(client.principal).toBeNull();
        });

        test('returns the auth result', async () => {
            const principal = createMockPrincipal();
            const mockAdapter = createMockAdapter('jwt', {
                principal,
                token: 'tok',
                expiresAt: 12345,
            });
            AuthRegistry.register(mockAdapter);

            const result = await client.authenticate('jwt', {});
            expect(result).toEqual({ principal, token: 'tok', expiresAt: 12345 });
        });
    });

    describe('validate', () => {
        test('returns null when no token stored', async () => {
            const result = await client.validate('jwt');
            expect(result).toBeNull();
        });

        test('throws error when adapter not found (after setting token via init)', async () => {
            // First set a token using init
            const principal = createMockPrincipal();
            const mockAdapter = createMockAdapter('jwt', null, principal);
            AuthRegistry.register(mockAdapter);
            await client.init('jwt', 'stored-token');

            // Now clear the adapter and try validate with a different (nonexistent) adapter
            AuthRegistry.clear();
            await expect(client.validate('nonexistent')).rejects.toThrow(
                "Authentication adapter 'nonexistent' not found",
            );
        });

        test('updates state when validation succeeds', async () => {
            const principal = createMockPrincipal('99', 'Bob');
            const mockAdapter = createMockAdapter('jwt', null, principal);
            AuthRegistry.register(mockAdapter);

            // Use init to set the token
            await client.init('jwt', 'valid-token');

            const result = await client.validate('jwt');

            expect(result).toBe(principal);
            expect(client.isAuthenticated).toBe(true);
            expect(client.principal).toBe(principal);
        });

        test('logs out when validation fails', async () => {
            // First authenticate to set state
            const principal = createMockPrincipal();
            const authAdapter = createMockAdapter('jwt', {
                principal,
                token: 'valid-token',
                expiresAt: null,
            });
            AuthRegistry.register(authAdapter);
            await client.authenticate('jwt', {});

            expect(client.isAuthenticated).toBe(true);

            // Now validate with an adapter that returns null (token expired/invalid)
            const staleAdapter = createMockAdapter('jwt', null, null);
            AuthRegistry.clear();
            AuthRegistry.register(staleAdapter);

            const result = await client.validate('jwt');

            expect(result).toBeNull();
            expect(client.isAuthenticated).toBe(false);
            expect(client.principal).toBeNull();
        });
    });

    describe('refresh', () => {
        test('throws error when no token to refresh', async () => {
            await expect(client.refresh('jwt')).rejects.toThrow('No token to refresh');
        });

        test('throws error when adapter not found (after setting token via authenticate)', async () => {
            const principal = createMockPrincipal();
            const mockAdapter = createMockAdapter('jwt', {
                principal,
                token: 'stored-token',
                expiresAt: null,
            });
            AuthRegistry.register(mockAdapter);
            await client.authenticate('jwt', {});

            AuthRegistry.clear();
            await expect(client.refresh('nonexistent')).rejects.toThrow(
                "Authentication adapter 'nonexistent' not found",
            );
        });

        test('updates state with refreshed result', async () => {
            const newPrincipal = createMockPrincipal('1', 'Refreshed');
            const mockAdapter = createMockAdapter('jwt', {
                principal: createMockPrincipal('1', 'Initial'),
                token: 'initial-token',
                expiresAt: Date.now() + 3600000,
            }, null, {
                principal: newPrincipal,
                token: 'new-token',
                expiresAt: Date.now() + 7200000,
            });
            AuthRegistry.register(mockAdapter);

            // Use authenticate to set the initial token
            await client.authenticate('jwt', {});

            const result = await client.refresh('jwt');

            expect(result.principal).toBe(newPrincipal);
            expect(client.state.token).toBe('new-token');
            expect(client.principal).toBe(newPrincipal);
        });
    });

    describe('logout', () => {
        test('calls adapter logout when token exists', async () => {
            let logoutCalled = false;
            let capturedToken = '';
            const mockAdapter: AuthAdapter = {
                id: 'jwt',
                validate: async () => null,
                authenticate: async () => ({
                    principal: createMockPrincipal(),
                    token: 'my-token',
                    expiresAt: null,
                }),
                refresh: async () => ({ principal: null, token: null, expiresAt: null }),
                logout: async (token: string) => {
                    logoutCalled = true;
                    capturedToken = token;
                },
            };
            AuthRegistry.register(mockAdapter);

            // Use authenticate to set the token
            await client.authenticate('jwt', {});
            await client.logout('jwt');

            expect(logoutCalled).toBe(true);
            expect(capturedToken).toBe('my-token');
            expect(client.isAuthenticated).toBe(false);
            expect(client.principal).toBeNull();
        });

        test('clears state even when adapter is not registered', async () => {
            // First authenticate to set state
            const principal = createMockPrincipal();
            const mockAdapter = createMockAdapter('jwt', {
                principal,
                token: 'my-token',
                expiresAt: null,
            });
            AuthRegistry.register(mockAdapter);
            await client.authenticate('jwt', {});

            // Clear adapters and logout
            AuthRegistry.clear();
            await client.logout('jwt');

            expect(client.isAuthenticated).toBe(false);
            expect(client.principal).toBeNull();
        });

        test('does not call adapter logout when no token', async () => {
            let logoutCalled = false;
            const mockAdapter: AuthAdapter = {
                id: 'jwt',
                validate: async () => null,
                authenticate: async () => ({ principal: null, token: null, expiresAt: null }),
                refresh: async () => ({ principal: null, token: null, expiresAt: null }),
                logout: async () => { logoutCalled = true; },
            };
            AuthRegistry.register(mockAdapter);

            await client.logout('jwt');

            expect(logoutCalled).toBe(false);
        });
    });

    describe('init', () => {
        test('sets token and validates', async () => {
            const principal = createMockPrincipal('1', 'InitUser');
            const mockAdapter = createMockAdapter('jwt', null, principal);
            AuthRegistry.register(mockAdapter);

            await client.init('jwt', 'stored-token');

            expect(client.isAuthenticated).toBe(true);
            expect(client.principal).toBe(principal);
            expect(client.state.token).toBe('stored-token');
        });

        test('leaves unauthenticated when validation fails', async () => {
            const mockAdapter = createMockAdapter('jwt', null, null);
            AuthRegistry.register(mockAdapter);

            await client.init('jwt', 'bad-token');

            expect(client.isAuthenticated).toBe(false);
            expect(client.principal).toBeNull();
        });
    });
});
