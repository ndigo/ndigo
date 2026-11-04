/**
 * @module ndigo-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { AuthServer } from '../src/server';
import { AuthMatrixGuard } from '../src/route-matrix-guard';
import { AuthRegistry, Principal, AUTH_REQUIRED_KEY, AUTH_ROLES_KEY } from '@ndigo/auth-core';
import { type ModelAndView } from '@ndigo/dispatcher';
import { type Route } from '@ndigo/router';

type Sink = (route: Route, principal: Principal, token: string) => void;

function createMockAdapter(id: string, validateResult: Principal | null = null) {
    return {
        id,
        validate: async () => validateResult,
        authenticate: async () => ({ principal: null, token: null, expiresAt: null }),
        refresh: async () => ({ principal: null, token: null, expiresAt: null }),
        logout: async () => {},
    };
}

function createMockPrincipal(id = '1', name = 'Test', roles: string[] = ['user']) {
    return {
        id,
        name,
        roles,
        hasRole: (role: string) => roles.includes(role),
        hasAnyRole: (...r: string[]) => r.some((role) => roles.includes(role)),
    };
}

function createMockRoute(): Route {
    return {
        id: 'mock:test',
        path: '/test',
        params: {},
        data: {},
        raw: 'test',
        attributes: {},
        0: { name: 'test', raw: 'test', data: null },
        length: 1,
    } as unknown as Route;
}

/**
 * Records the metadata a handler carries on `constructor[Symbol.metadata]`, the
 * runtime TC39 decorator shape {@link AuthMatrixGuard} reads. TC39 decorators do
 * not auto-apply in tests, so this sets it by hand.
 */
function setHandlerMetadata(handler: object, metadata: Record<string, unknown>): void {
    const carrier = { constructor: { [Symbol.metadata]: metadata } };
    Object.assign(handler, carrier);
}

/** Builds the `{ handler, method, path }` wrapper the guard reads metadata from. */
function handlerWith(classMeta: Record<string, unknown>): object {
    function handlerFn() {
        return {};
    }
    setHandlerMetadata(handlerFn, classMeta);
    // The guard reads metadata off `methodHandler.handler.constructor[Symbol.metadata]`,
    // so the decorated function must sit under `.handler`.
    return { handler: handlerFn, method: 'get', path: '/test' };
}

describe('AuthMatrixGuard', () => {
    let authServer: AuthServer;
    let guard: AuthMatrixGuard;
    /** Captured by the `onAuthenticated` sink so tests can assert what won. */
    let captured: { route: Route; principal: Principal; token: string } | null;

    beforeEach(() => {
        AuthRegistry.clear();
        captured = null;
        authServer = new AuthServer();
    });

    /** A two-scheme guard (session cookie first, Bearer second) over the given principals. */
    function matrixGuard(
        sessionPrincipal: Principal | null,
        jwtPrincipal: Principal | null,
        options: { onAuthenticated?: Sink } = {}
    ) {
        AuthRegistry.register(createMockAdapter('session', sessionPrincipal));
        AuthRegistry.register(createMockAdapter('jwt', jwtPrincipal));
        return new AuthMatrixGuard(authServer, {
            schemes: [
                { adapterId: 'session', extract: () => 'cookie-value' },
                { adapterId: 'jwt', extract: () => 'bearer-value' },
            ],
            onAuthenticated:
                options.onAuthenticated ??
                ((route, principal, token) => {
                    captured = { route, principal, token };
                }),
        });
    }

    describe('preHandle - no auth required', () => {
        beforeEach(() => {
            guard = matrixGuard(createMockPrincipal(), createMockPrincipal());
        });

        test('returns true when the handler has no auth metadata', async () => {
            const result = await guard.preHandle(createMockRoute(), undefined);
            expect(result).toBe(true);
        });

        test('returns true when the handler is a plain object without metadata', async () => {
            const result = await guard.preHandle(createMockRoute(), { method: 'get' });
            expect(result).toBe(true);
        });
    });

    describe('preHandle - multi-scheme selection', () => {
        test('prefers the first scheme (session cookie) when both carry a credential', async () => {
            guard = matrixGuard(createMockPrincipal(), createMockPrincipal());
            const handlerMethod = handlerWith({ [AUTH_REQUIRED_KEY]: true });

            const result = await guard.preHandle(createMockRoute(), handlerMethod);

            expect(result).toBe(true);
            expect(captured?.token).toBe('cookie-value');
        });

        test('falls back to the second scheme (Bearer) when no session cookie is present', async () => {
            guard = new AuthMatrixGuard(authServer, {
                schemes: [
                    { adapterId: 'session', extract: () => null },
                    { adapterId: 'jwt', extract: () => 'bearer-value' },
                ],
                onAuthenticated: (_route, principal, token) => {
                    captured = { route: createMockRoute(), principal, token };
                },
            });
            // Session rejects the Bearer credential; the jwt adapter accepts it.
            AuthRegistry.register(createMockAdapter('session', null));
            AuthRegistry.register(createMockAdapter('jwt', createMockPrincipal()));
            const handlerMethod = handlerWith({ [AUTH_REQUIRED_KEY]: true });

            const result = await guard.preHandle(createMockRoute(), handlerMethod);

            expect(result).toBe(true);
            expect(captured?.token).toBe('bearer-value');
        });

        test('skips an empty-string credential and uses the next scheme', async () => {
            guard = new AuthMatrixGuard(authServer, {
                schemes: [
                    { adapterId: 'session', extract: () => '' },
                    { adapterId: 'jwt', extract: () => 'bearer-value' },
                ],
                onAuthenticated: (_route, _principal, token) => {
                    captured = { route: createMockRoute(), principal: createMockPrincipal(), token };
                },
            });
            // Session rejects the Bearer credential; the jwt adapter accepts it.
            AuthRegistry.register(createMockAdapter('session', null));
            AuthRegistry.register(createMockAdapter('jwt', createMockPrincipal()));
            const handlerMethod = handlerWith({ [AUTH_REQUIRED_KEY]: true });

            const result = await guard.preHandle(createMockRoute(), handlerMethod);

            expect(result).toBe(true);
            expect(captured?.token).toBe('bearer-value');
        });
    });

    describe('preHandle - denials', () => {
        test('denies 401 when no scheme carries a credential', async () => {
            guard = new AuthMatrixGuard(authServer, {
                schemes: [
                    { adapterId: 'session', extract: () => null },
                    { adapterId: 'jwt', extract: () => null },
                ],
            });
            const handlerMethod = handlerWith({ [AUTH_REQUIRED_KEY]: true });

            const result = await guard.preHandle(createMockRoute(), handlerMethod);

            expect(result).toMatchObject({ statusCode: 401 });
        });

        test('denies 401 when the winning scheme resolves to no principal (invalid token)', async () => {
            guard = new AuthMatrixGuard(authServer, {
                schemes: [
                    { adapterId: 'session', extract: () => 'cookie-value' },
                    { adapterId: 'jwt', extract: () => 'bearer-value' },
                ],
            });
            // Both adapters reject the credential -> validateAny resolves to no principal.
            AuthRegistry.register(createMockAdapter('session', null));
            AuthRegistry.register(createMockAdapter('jwt', null));
            const handlerMethod = handlerWith({ [AUTH_REQUIRED_KEY]: true });

            const result = await guard.preHandle(createMockRoute(), handlerMethod);

            expect(result).toMatchObject({ statusCode: 401 });
        });

        test('denies 403 when the principal lacks a required role', async () => {
            guard = new AuthMatrixGuard(authServer, {
                schemes: [
                    { adapterId: 'session', extract: () => 'cookie-value' },
                    { adapterId: 'jwt', extract: () => 'bearer-value' },
                ],
            });
            AuthRegistry.register(createMockAdapter('session', createMockPrincipal('1', 'Test', ['user'])));
            const handlerMethod = handlerWith({ [AUTH_REQUIRED_KEY]: true, [AUTH_ROLES_KEY]: ['admin'] });

            const result = await guard.preHandle(createMockRoute(), handlerMethod);

            expect(result).toMatchObject({ statusCode: 403 });
        });

        test('fails closed: an unregistered adapter id denies 401 rather than throwing open', async () => {
            // No adapters registered at all -> validateAny rejects on the unknown id.
            guard = new AuthMatrixGuard(authServer, {
                schemes: [{ adapterId: 'ghost', extract: () => 'cookie-value' }],
            });
            const handlerMethod = handlerWith({ [AUTH_REQUIRED_KEY]: true });

            await expect(guard.preHandle(createMockRoute(), handlerMethod)).resolves.toMatchObject({
                statusCode: 401,
            });
        });
    });

    describe('preHandle - role authorization over a scheme', () => {
        test('proceeds when the principal holds every required role', async () => {
            guard = matrixGuard(createMockPrincipal('1', 'Admin', ['admin', 'user']), createMockPrincipal());
            const handlerMethod = handlerWith({ [AUTH_REQUIRED_KEY]: true, [AUTH_ROLES_KEY]: ['admin'] });

            const result = await guard.preHandle(createMockRoute(), handlerMethod);

            expect(result).toBe(true);
            expect(captured?.principal.hasRole('admin')).toBe(true);
        });
    });

    describe('onAuthenticated sink', () => {
        test('is called with the winning token and resolved principal on success', async () => {
            guard = matrixGuard(createMockPrincipal('7', 'Alice', ['user']), createMockPrincipal());
            const handlerMethod = handlerWith({ [AUTH_REQUIRED_KEY]: true });

            await guard.preHandle(createMockRoute(), handlerMethod);

            expect(captured).not.toBeNull();
            expect(captured?.token).toBe('cookie-value');
            expect(captured?.principal.id).toBe('7');
        });

        test('is not called when the request is denied', async () => {
            guard = new AuthMatrixGuard(authServer, {
                schemes: [
                    { adapterId: 'session', extract: () => null },
                    { adapterId: 'jwt', extract: () => null },
                ],
                onAuthenticated: (() => {
                    captured = { route: createMockRoute(), principal: createMockPrincipal(), token: '' };
                }) as Sink,
            });
            const handlerMethod = handlerWith({ [AUTH_REQUIRED_KEY]: true });

            await guard.preHandle(createMockRoute(), handlerMethod);

            expect(captured).toBeNull();
        });
    });

    describe('postHandle / completeHandle', () => {
        beforeEach(() => {
            guard = matrixGuard(createMockPrincipal(), createMockPrincipal());
        });

        test('postHandle is a no-op', async () => {
            await expect(guard.postHandle(createMockRoute(), undefined, {} as ModelAndView)).resolves.toBeUndefined();
        });

        test('completeHandle is a no-op', async () => {
            await expect(guard.completeHandle(createMockRoute(), undefined, null)).resolves.toBeUndefined();
        });
    });
});
