/**
 * @module ndigo-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { AuthServer } from '../src/server';
import { AuthRouteGuard } from '../src/route-guard';
import { AuthRegistry, Principal, AUTH_REQUIRED_KEY, AUTH_ROLES_KEY } from '@ndigo/auth-core';
import { type ModelAndView } from '@ndigo/dispatcher';
import { type Route } from '@ndigo/router';

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

function createMockRoute(token: string | null = null) {
    return {
        id: 'mock:test',
        path: '/test',
        params: {},
        data: {},
        raw: 'test',
        attributes: {},
        0: { name: 'test', raw: 'test', data: null },
        length: 1,
        getToken: () => token,
    } as unknown as Route;
}

/**
 * Token extractor for the guard under test: pulls the bearer token off the
 * mock routes, which carry a `getToken` helper that Route's type doesn't declare.
 */
function extractMockToken(route: Route): string | null {
    if (!('getToken' in route)) {
        return null;
    }
    const getToken = route.getToken;
    if (typeof getToken !== 'function') {
        return null;
    }
    // getToken is a function (checked above); Route lacks the member.
    return (getToken as () => string | null)();
}

/**
 * Helper to set up Symbol.metadata on a handler function.
 * The guard reads: handler.constructor[Symbol.metadata]
 * Since TC39 decorators don't auto-apply in tests, we set this manually.
 */
function setHandlerMetadata(handler: object, metadata: Record<string, unknown>): void {
    // `constructor` is not declared on TS's Function type; attach the carrier
    // object matching the runtime decorator shape the guard reads
    // (handler.constructor[Symbol.metadata]).
    const carrier = { constructor: { [Symbol.metadata]: metadata } };
    Object.assign(handler, carrier);
}

describe('AuthRouteGuard', () => {
    let authServer: AuthServer;
    let guard: AuthRouteGuard;
    beforeEach(() => {
        AuthRegistry.clear();
        authServer = new AuthServer();
        guard = new AuthRouteGuard(authServer, extractMockToken, 'jwt');
    });

    describe('preHandle - no auth required', () => {
        test('returns true when handler has no auth metadata', async () => {
            const route = createMockRoute('token');
            const result = await guard.preHandle(route, undefined);
            expect(result).toBe(true);
        });

        test('returns true when handler is a plain object without metadata', async () => {
            const route = createMockRoute('token');
            const handler = { method: 'get' };
            const result = await guard.preHandle(route, handler);
            expect(result).toBe(true);
        });
    });

    describe('preHandle - class-level @authenticated', () => {
        test('returns true when token is valid', async () => {
            const mockAdapter = createMockAdapter('jwt', createMockPrincipal());
            AuthRegistry.register(mockAdapter);

            function handlerFn() {
                return {};
            }
            setHandlerMetadata(handlerFn, { [AUTH_REQUIRED_KEY]: true });

            const route = createMockRoute('valid-token');
            const handlerMethod: object = {
                handler: handlerFn,
                method: 'get',
                path: '/test',
            };

            const result = await guard.preHandle(route, handlerMethod);
            expect(result).toBe(true);
        });

        test('returns false when no token provided', async () => {
            const mockAdapter = createMockAdapter('jwt', createMockPrincipal());
            AuthRegistry.register(mockAdapter);

            function handlerFn() {
                return {};
            }
            setHandlerMetadata(handlerFn, { [AUTH_REQUIRED_KEY]: true });

            const route = createMockRoute(null);
            const handlerMethod: object = {
                handler: handlerFn,
                method: 'get',
                path: '/test',
            };

            const result = await guard.preHandle(route, handlerMethod);
            expect(result).toMatchObject({ statusCode: 401 });
        });

        test('returns false when token is invalid', async () => {
            const mockAdapter = createMockAdapter('jwt', null);
            AuthRegistry.register(mockAdapter);

            function handlerFn() {
                return {};
            }
            setHandlerMetadata(handlerFn, { [AUTH_REQUIRED_KEY]: true });

            const route = createMockRoute('invalid-token');
            const handlerMethod: object = {
                handler: handlerFn,
                method: 'get',
                path: '/test',
            };

            const result = await guard.preHandle(route, handlerMethod);
            expect(result).toMatchObject({ statusCode: 401 });
        });
    });

    describe('preHandle - method-level @authenticated', () => {
        test('returns true when method has auth and token is valid', async () => {
            const mockAdapter = createMockAdapter('jwt', createMockPrincipal());
            AuthRegistry.register(mockAdapter);

            function handlerFn() {
                return {};
            }
            setHandlerMetadata(handlerFn, {
                [`${AUTH_REQUIRED_KEY}:handle`]: true,
            });

            const route = createMockRoute('valid-token');
            const handlerMethod: object = {
                handler: handlerFn,
                method: 'handle',
                path: '/test',
            };

            const result = await guard.preHandle(route, handlerMethod);
            expect(result).toBe(true);
        });

        test('returns true when handler has no auth metadata (no decorator)', async () => {
            const mockAdapter = createMockAdapter('jwt', createMockPrincipal());
            AuthRegistry.register(mockAdapter);

            function handlerFn() {
                return {};
            }
            // No metadata set at all
            setHandlerMetadata(handlerFn, {});

            const route = createMockRoute(null);
            const handlerMethod: object = {
                handler: handlerFn,
                method: 'get',
                path: '/test',
            };

            const result = await guard.preHandle(route, handlerMethod);
            expect(result).toBe(true);
        });
    });

    describe('preHandle - role authorization', () => {
        test('returns true when principal has required role', async () => {
            const mockAdapter = createMockAdapter('jwt', createMockPrincipal('1', 'Admin', ['admin', 'user']));
            AuthRegistry.register(mockAdapter);

            function handlerFn() {
                return {};
            }
            setHandlerMetadata(handlerFn, {
                [`${AUTH_ROLES_KEY}:adminAction`]: ['admin'],
            });

            const route = createMockRoute('token');
            const handlerMethod: object = {
                handler: handlerFn,
                method: 'adminAction',
                path: '/test',
            };

            const result = await guard.preHandle(route, handlerMethod);
            expect(result).toBe(true);
        });

        test('returns false when principal lacks required role', async () => {
            const mockAdapter = createMockAdapter('jwt', createMockPrincipal('1', 'User', ['user']));
            AuthRegistry.register(mockAdapter);

            function handlerFn() {
                return {};
            }
            setHandlerMetadata(handlerFn, {
                [`${AUTH_ROLES_KEY}:adminAction`]: ['admin'],
            });

            const route = createMockRoute('token');
            const handlerMethod: object = {
                handler: handlerFn,
                method: 'adminAction',
                path: '/test',
            };

            const result = await guard.preHandle(route, handlerMethod);
            expect(result).toMatchObject({ statusCode: 403 });
        });

        test('returns true when class and method both require roles and principal has all', async () => {
            const mockAdapter = createMockAdapter('jwt', createMockPrincipal('1', 'Admin', ['admin', 'editor']));
            AuthRegistry.register(mockAdapter);

            function handlerFn() {
                return {};
            }
            setHandlerMetadata(handlerFn, {
                [AUTH_ROLES_KEY]: ['admin'],
                [`${AUTH_ROLES_KEY}:editContent`]: ['editor'],
            });

            const route = createMockRoute('token');
            const handlerMethod: object = {
                handler: handlerFn,
                method: 'editContent',
                path: '/test',
            };

            const result = await guard.preHandle(route, handlerMethod);
            expect(result).toBe(true);
        });

        test('returns false when principal missing class-level role', async () => {
            const mockAdapter = createMockAdapter('jwt', createMockPrincipal('1', 'User', ['user']));
            AuthRegistry.register(mockAdapter);

            function handlerFn() {
                return {};
            }
            setHandlerMetadata(handlerFn, {
                [AUTH_ROLES_KEY]: ['admin'],
            });

            const route = createMockRoute('token');
            const handlerMethod: object = {
                handler: handlerFn,
                method: 'get',
                path: '/test',
            };

            const result = await guard.preHandle(route, handlerMethod);
            expect(result).toMatchObject({ statusCode: 403 });
        });
    });

    describe('preHandle - no adapters registered', () => {
        test('returns false when auth required but no adapters are registered', async () => {
            function handlerFn() {
                return {};
            }
            setHandlerMetadata(handlerFn, { [AUTH_REQUIRED_KEY]: true });

            const route = createMockRoute('token');
            const handlerMethod: object = {
                handler: handlerFn,
                method: 'get',
                path: '/test',
            };

            // validate() with an explicit adapter returns 401 when the
            // adapter is not registered — fail-closed, never tried-any.
            const result = await guard.preHandle(route, handlerMethod);
            expect(result).toMatchObject({ statusCode: 401 });
        });
    });

    describe('postHandle / completeHandle', () => {
        test('postHandle is a no-op', async () => {
            const route = createMockRoute();
            const mv = {} as ModelAndView;
            await guard.postHandle(route, undefined, mv);
            // Should complete without error
        });

        test('completeHandle is a no-op', async () => {
            const route = createMockRoute();
            await guard.completeHandle(route, undefined, null);
            // Should complete without error
        });
    });
});
