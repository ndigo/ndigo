/**
 * MockHTTP interceptor-denial parity (IN-1): a denial recorded by a guard's
 * `preHandle` is finalized exactly like the live `NodeHTTPServerAdapter` —
 * a bare `denialOf(403)`, an `AuthRouteGuard`-shaped `401`, and a redirect
 * denial all produce the same wire response through the mock.
 *
 * @module ndigo-test
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import {
    HANDLER_MAPPING,
    denialOf,
    requestMapping,
    getMapping,
    type InterceptorDenial,
    type RadixMetadataHandlerMapping,
    type RouteHandlerInterceptor,
} from '@ndigo/dispatcher';
import { bootApp, MockHTTP, type NdigoTestApp } from '../src/index';

/**
 * Self-tests for `@ndigo/test`: interceptor denials must not surface as the
 * default empty 200 through the in-process MockHTTP client.
 */

@requestMapping('/secure')
class SecureController {
    @getMapping('/resource')
    resource() {
        return { secret: 'shhh' };
    }
}

/** A guard whose only behavior is the interceptor denial outcome under test. */
function denyingGuard(outcome: () => InterceptorDenial): RouteHandlerInterceptor {
    return {
        preHandle: () => outcome(),
        postHandle: () => undefined,
        completeHandle: () => undefined,
    };
}

/** Boots the guarded controller app and wires the denying guard into the mapping. */
function bootGuarded(outcome: () => InterceptorDenial): { app: NdigoTestApp; mockHTTP: MockHTTP } {
    const app = bootApp([SecureController]);
    const mapping = app.context.getValue<RadixMetadataHandlerMapping>(HANDLER_MAPPING);
    mapping.interceptors.push(denyingGuard(outcome));
    return { app, mockHTTP: new MockHTTP(app) };
}

describe('MockHTTP interceptor-denial parity (IN-1)', () => {
    test('a bare denialOf(403) finalizes as the live 403 problem document', async () => {
        const { app, mockHTTP } = bootGuarded(() => denialOf(403));
        try {
            const res = await mockHTTP.get('/secure/resource').exec();
            expect(res.response.status).toBe(403);
            expect(res.response.headers['content-type']).toContain('application/problem+json');
            expect(res.json()).toMatchObject({
                type: 'urn:ndigo:forbidden',
                title: 'Forbidden',
                status: 403,
            });
        } finally {
            app.close();
        }
    });

    test('an AuthRouteGuard-shaped 401 finalizes as 401 + WWW-Authenticate: Bearer', async () => {
        const { app, mockHTTP } = bootGuarded(() => denialOf(401, { body: { error: 'Unauthorized' } }));
        try {
            const res = await mockHTTP.get('/secure/resource').exec();
            expect(res.response.status).toBe(401);
            expect(res.response.headers['www-authenticate']).toBe('Bearer');
            expect(res.json()).toMatchObject({
                type: 'urn:ndigo:unauthorized',
                title: 'Unauthorized',
                status: 401,
            });
        } finally {
            app.close();
        }
    });

    test('a redirect denial finalizes as 302 with Location and no body', async () => {
        const { app, mockHTTP } = bootGuarded(() => denialOf(302, { redirect: '/login' }));
        try {
            const res = await mockHTTP.get('/secure/resource').exec();
            expect(res.response.status).toBe(302);
            expect(res.response.headers['location']).toBe('/login');
            expect(res.text()).toBe('');
        } finally {
            app.close();
        }
    });
});
