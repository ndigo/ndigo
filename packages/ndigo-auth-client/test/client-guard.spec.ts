/**
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { ClientAuthGuard, extractAuthMetadata } from '../src/client-guard';
import { AuthClient } from '../src/client';
import { AuthRegistry, Principal } from '@ndigo/auth-core';
import { AUTH_REQUIRED_KEY, AUTH_ROLES_KEY } from '@ndigo/auth-core';

function createMockPrincipal(id = '1', name = 'Test', roles: string[] = ['user']) {
    return {
        id,
        name,
        roles,
        hasRole: (role: string) => roles.includes(role),
        hasAnyRole: (...r: string[]) => r.some((role) => roles.includes(role)),
    };
}

/**
 * Helper to set up Symbol.metadata on a handler function.
 * The guard reads: handler.constructor[Symbol.metadata]
 */
function setHandlerMetadata(handler: { constructor: object }, metadata: Record<string, unknown>): void {
    handler.constructor = { [Symbol.metadata]: metadata };
}

describe('extractAuthMetadata', () => {
    test('returns no auth for undefined handler', () => {
        const metadata = extractAuthMetadata(undefined);
        expect(metadata.requiresAuth).toBe(false);
        expect(metadata.requiredRoles).toEqual([]);
    });

    test('returns no auth for plain object without metadata', () => {
        const metadata = extractAuthMetadata({ method: 'get' });
        expect(metadata.requiresAuth).toBe(false);
        expect(metadata.requiredRoles).toEqual([]);
    });

    test('detects class-level auth metadata', () => {
        const metadata = { [AUTH_REQUIRED_KEY]: true };
        const handler = { constructor: { [Symbol.metadata]: metadata }, method: 'get' };
        const result = extractAuthMetadata(handler);

        expect(result.requiresAuth).toBe(true);
        expect(result.requiredRoles).toEqual([]);
    });

    test('detects method-level auth metadata', () => {
        const metadata = { [`${AUTH_REQUIRED_KEY}:handle`]: true };
        const handler = { constructor: { [Symbol.metadata]: metadata }, method: 'handle' };
        const result = extractAuthMetadata(handler);

        expect(result.requiresAuth).toBe(true);
    });

    test('detects class-level roles', () => {
        const metadata = { [AUTH_ROLES_KEY]: ['admin'] };
        const handler = { constructor: { [Symbol.metadata]: metadata }, method: 'get' };
        const result = extractAuthMetadata(handler);

        expect(result.requiresAuth).toBe(false);
        expect(result.requiredRoles).toEqual(['admin']);
    });

    test('combines class and method roles', () => {
        const metadata = {
            [AUTH_ROLES_KEY]: ['admin'],
            [`${AUTH_ROLES_KEY}:edit`]: ['editor'],
        };
        const handler = { constructor: { [Symbol.metadata]: metadata }, method: 'edit' };
        const result = extractAuthMetadata(handler);

        expect(result.requiredRoles).toEqual(['admin', 'editor']);
    });

    test('only includes roles for matching method name', () => {
        const metadata = { [`${AUTH_ROLES_KEY}:admin`]: ['admin'] };
        const handler = { constructor: { [Symbol.metadata]: metadata }, method: 'get' };
        const result = extractAuthMetadata(handler);

        expect(result.requiredRoles).toEqual([]);
    });
});

describe('ClientAuthGuard', () => {
    let authClient: AuthClient;
    let guard: ClientAuthGuard;

    function authenticateClient(principal: Principal | null) {
        const mockAdapter = {
            id: 'jwt',
            validate: async () => null,
            authenticate: async () => ({
                principal,
                token: 'test-token',
                expiresAt: Date.now() + 3600000,
            }),
            refresh: async () => ({ principal: null, token: null, expiresAt: null }),
            logout: async () => {},
        };
        AuthRegistry.register(mockAdapter);
        return authClient.authenticate('jwt', {});
    }

    beforeEach(() => {
        AuthRegistry.clear();
        authClient = new AuthClient();
        guard = new ClientAuthGuard(authClient, '/login', '/forbidden');
    });

    describe('preNavigate - no auth required', () => {
        test('returns null for handler without auth metadata', async () => {
            const result = await guard.preNavigate(undefined);
            expect(result).toBeNull();
        });

        test('returns null for plain handler object', async () => {
            const result = await guard.preNavigate({ method: 'get' });
            expect(result).toBeNull();
        });
    });

    describe('preNavigate - unauthenticated access', () => {
        test('returns login redirect when auth required but user is not authenticated', async () => {
            const metadata = { [AUTH_REQUIRED_KEY]: true };
            function handlerFn() {}
            setHandlerMetadata(handlerFn, metadata);

            const result = await guard.preNavigate(handlerFn);

            expect(result).toBe('/login');
        });
    });

    describe('preNavigate - authorized access', () => {
        test('returns null when user is authenticated and no roles required', async () => {
            const metadata = { [AUTH_REQUIRED_KEY]: true };
            function handlerFn() {}
            setHandlerMetadata(handlerFn, metadata);

            await authenticateClient(createMockPrincipal());

            const result = await guard.preNavigate(handlerFn);

            expect(result).toBeNull();
        });
    });

    describe('preNavigate - role-based access', () => {
        test('returns null when user has required role', async () => {
            const metadata = { [AUTH_ROLES_KEY]: ['admin'] };
            function handlerFn() {}
            setHandlerMetadata(handlerFn, metadata);

            await authenticateClient(createMockPrincipal('1', 'Admin', ['admin', 'user']));

            const result = await guard.preNavigate(handlerFn);

            expect(result).toBeNull();
        });

        test('returns forbidden redirect when user lacks required role', async () => {
            const metadata = { [AUTH_ROLES_KEY]: ['admin'] };
            function handlerFn() {}
            setHandlerMetadata(handlerFn, metadata);

            await authenticateClient(createMockPrincipal('1', 'User', ['user']));

            const result = await guard.preNavigate(handlerFn);

            expect(result).toBe('/forbidden');
        });

        test('returns login redirect when unauthenticated and roles required', async () => {
            const metadata = { [AUTH_ROLES_KEY]: ['admin'] };
            function handlerFn() {}
            setHandlerMetadata(handlerFn, metadata);

            const result = await guard.preNavigate(handlerFn);

            expect(result).toBe('/login');
        });

        test('allows when user has all required roles', async () => {
            const metadata = {
                [AUTH_ROLES_KEY]: ['admin'],
                [`${AUTH_ROLES_KEY}:edit`]: ['editor'],
            };
            function handlerFn() {}
            setHandlerMetadata(handlerFn, metadata);

            await authenticateClient(createMockPrincipal('1', 'AdminEditor', ['admin', 'editor']));

            const result = await guard.preNavigate(handlerFn);

            expect(result).toBeNull();
        });
    });

    describe('setRedirects', () => {
        test('updates login redirect', async () => {
            const metadata = { [AUTH_REQUIRED_KEY]: true };
            function handlerFn() {}
            setHandlerMetadata(handlerFn, metadata);

            guard.setRedirects('/signin', '/access-denied');

            const result = await guard.preNavigate(handlerFn);

            expect(result).toBe('/signin');
        });

        test('updates forbidden redirect', async () => {
            const metadata = { [AUTH_ROLES_KEY]: ['admin'] };
            function handlerFn() {}
            setHandlerMetadata(handlerFn, metadata);

            guard.setRedirects('/login', '/access-denied');

            await authenticateClient(createMockPrincipal('1', 'User', ['user']));

            const result = await guard.preNavigate(handlerFn);

            expect(result).toBe('/access-denied');
        });
    });
});
