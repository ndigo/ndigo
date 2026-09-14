/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { Route } from '@blue/router';
import { CsrfInterceptor } from '../src/csrf-interceptor';
import { NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE, NodeRequest } from '../src/node-request';

function makeRoute(
    method: string | undefined,
    request: Partial<NodeRequest>,
    headers: Record<string, string> = {}
): Route {
    const nodeRequest: NodeRequest = {
        headers,
        body: request.body ?? {},
        cookies: request.cookies ?? {},
        session: request.session ?? {},
    };
    const response = {
        headersSent: false,
        setHeader: () => undefined,
        writeHead: () => undefined,
        end: () => undefined,
        headers: {},
    };
    return {
        path: '/test',
        method,
        attributes: {
            [NODE_REQUEST_ATTRIBUTE]: nodeRequest,
            [NODE_RESPONSE_ATTRIBUTE]: response,
        },
    } as unknown as Route;
}

describe('CsrfInterceptor', () => {
    test('issues a cookie on a safe GET with no existing token', () => {
        const headers: Record<string, string> = {};
        const interceptor = new CsrfInterceptor();
        const response = {
            headersSent: false,
            setHeader: (name: string, value: string) => {
                headers[name] = value;
            },
            writeHead: () => undefined,
            end: () => undefined,
        };
        const route = makeRoute('GET', {}) as unknown as Route;
        (route.attributes as Record<string, unknown>)[NODE_RESPONSE_ATTRIBUTE] = response;

        expect(interceptor.preHandle(route)).toBe(true);
        const cookie = headers['Set-Cookie'];
        expect(cookie).toMatch(/^blue-csrf=[A-Za-z0-9_-]+; SameSite=Lax; Secure; Path=\/$/);
    });

    test('Secure flag is overridable while defaulting on', () => {
        const headers: Record<string, string> = {};
        const interceptor = new CsrfInterceptor({ cookieOptions: 'SameSite=None; Path=/' });
        const response = {
            headersSent: false,
            setHeader: (name: string, value: string) => {
                headers[name] = value;
            },
            writeHead: () => undefined,
            end: () => undefined,
        };
        const route = makeRoute('GET', {}) as unknown as Route;
        (route.attributes as Record<string, unknown>)[NODE_RESPONSE_ATTRIBUTE] = response;

        expect(interceptor.preHandle(route)).toBe(true);
        expect(headers['Set-Cookie']).toMatch(/^blue-csrf=[A-Za-z0-9_-]+; SameSite=None; Path=\/$/);
    });

    test('tokenBytes outside 16–1024 is rejected at construction', () => {
        expect(() => new CsrfInterceptor({ tokenBytes: 8 })).toThrow(RangeError);
        expect(() => new CsrfInterceptor({ tokenBytes: 0 })).toThrow(RangeError);
        expect(() => new CsrfInterceptor({ tokenBytes: 4096 })).toThrow(RangeError);
        expect(() => new CsrfInterceptor({ tokenBytes: 1.5 })).toThrow(RangeError);
        expect(() => new CsrfInterceptor({ tokenBytes: 32 })).not.toThrow();
    });

    test('allows a mutating request with a matching header token', () => {
        const token = 'abc123def456';
        const interceptor = new CsrfInterceptor();
        const route = makeRoute('POST', { cookies: { 'blue-csrf': token } }, { 'x-csrf-token': token });

        expect(interceptor.preHandle(route)).toBe(true);
    });

    test('allows a mutating request with a matching body-field token', () => {
        const token = 'token-body';
        const interceptor = new CsrfInterceptor();
        const route = makeRoute('POST', {
            cookies: { 'blue-csrf': token },
            body: { csrf_token: token },
        });

        expect(interceptor.preHandle(route)).toBe(true);
    });

    test('rejects a mutating request without a token (403 written)', () => {
        let status = 0;
        let body = '';
        const mode = { rejected: false };
        const interceptor = new CsrfInterceptor();
        const response = {
            headersSent: false,
            setHeader: () => undefined,
            writeHead: (s: number) => {
                status = s;
            },
            end: (b: string) => {
                body = b;
            },
        };
        const route = makeRoute('DELETE', { cookies: { 'blue-csrf': 'real-token' } }) as unknown as Route;
        (route.attributes as Record<string, unknown>)[NODE_RESPONSE_ATTRIBUTE] = response;

        mode.rejected = interceptor.preHandle(route) === false;
        expect(mode.rejected).toBe(true);
        expect(status).toBe(403);
        expect(JSON.parse(body)).toMatchObject({
            type: 'urn:blue:forbidden',
            status: 403,
            detail: 'Invalid CSRF token',
        });
    });

    test('rejects a mutating request with a mismatched token', () => {
        const interceptor = new CsrfInterceptor();
        const route = makeRoute(
            'PATCH',
            { cookies: { 'blue-csrf': 'cookie-token' } },
            { 'x-csrf-token': 'different-token' }
        );

        expect(interceptor.preHandle(route)).toBe(false);
    });

    test('safe methods pass through even with a bad header', () => {
        const interceptor = new CsrfInterceptor();
        const route = makeRoute('GET', { cookies: {} }, { 'x-csrf-token': 'whatever' });

        expect(interceptor.preHandle(route)).toBe(true);
    });
});
