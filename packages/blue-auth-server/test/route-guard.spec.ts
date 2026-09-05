import { describe, test, expect, beforeEach } from 'vitest';
import { AuthServer } from '../src/server';
import { AuthRouteGuard } from '../src/route-guard';
import { AuthRegistry, AUTH_REQUIRED_KEY, AUTH_ROLES_KEY } from '@blue/auth-core';
import { RouteHandlerMethod } from '@blue/dispatcher';

function createMockAdapter(id: string, validateResult: any = null) {
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
        path: '/test',
        params: {},
        data: {},
        0: { name: 'test', raw: 'test', data: null },
        length: 1,
        getToken: () => token,
    };
}

/**
 * Helper to set up Symbol.metadata on a handler function.
 * The guard reads: handler.constructor[Symbol.metadata]
 * Since TC39 decorators don't auto-apply in tests, we set this manually.
 */
function setHandlerMetadata(handler: (...args: any[]) => any, metadata: Record<string, unknown>): void {
    (handler as any).constructor = { [Symbol.metadata]: metadata };
}

describe('AuthRouteGuard', () => {
    let authServer: AuthServer;
    let guard: AuthRouteGuard;
    beforeEach(() => {
        AuthRegistry.clear();
        authServer = new AuthServer();
        guard = new AuthRouteGuard(authServer, (route) => (route as any).getToken?.() ?? null, 'jwt');
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
            const handlerMethod: RouteHandlerMethod = {
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
            const handlerMethod: RouteHandlerMethod = {
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
            const handlerMethod: RouteHandlerMethod = {
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
            const handlerMethod: RouteHandlerMethod = {
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
            const handlerMethod: RouteHandlerMethod = {
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
            const handlerMethod: RouteHandlerMethod = {
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
            const handlerMethod: RouteHandlerMethod = {
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
            const handlerMethod: RouteHandlerMethod = {
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
            const handlerMethod: RouteHandlerMethod = {
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
            const handlerMethod: RouteHandlerMethod = {
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
            const mv = {} as any;
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
