/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { Route } from '@ndigo/router';
import { CSRFInterceptor } from '../src/csrf-interceptor';
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

describe('CSRFInterceptor', () => {
    test('issues a cookie on a safe GET with no existing token', () => {
        const headers: Record<string, string> = {};
        const interceptor = new CSRFInterceptor();
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
        expect(cookie).toMatch(/^__Host-ndigo-csrf=[A-Za-z0-9_-]+; SameSite=Lax; Secure; Path=\/$/);
    });

    test('Secure flag is overridable while defaulting on', () => {
        const headers: Record<string, string> = {};
        // A `__Host-` cookie must be Secure, so opting out uses a custom name
        // (the documented trade-off: no sibling-subdomain cookie tossing
        // protection — the deployment trusts its subdomains).
        const interceptor = new CSRFInterceptor({ cookieName: 'ndigo-csrf', cookieOptions: 'SameSite=None; Path=/' });
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
        expect(headers['Set-Cookie']).toMatch(/^ndigo-csrf=[A-Za-z0-9_-]+; SameSite=None; Path=\/$/);
    });

    test('tokenBytes outside 16–1024 is rejected at construction', () => {
        expect(() => new CSRFInterceptor({ tokenBytes: 8 })).toThrow(RangeError);
        expect(() => new CSRFInterceptor({ tokenBytes: 0 })).toThrow(RangeError);
        expect(() => new CSRFInterceptor({ tokenBytes: 4096 })).toThrow(RangeError);
        expect(() => new CSRFInterceptor({ tokenBytes: 1.5 })).toThrow(RangeError);
        expect(() => new CSRFInterceptor({ tokenBytes: 32 })).not.toThrow();
    });

    test('allows a mutating request with a matching header token', () => {
        const token = 'abc123def456';
        const interceptor = new CSRFInterceptor();
        const route = makeRoute('POST', { cookies: { '__Host-ndigo-csrf': token } }, { 'x-csrf-token': token });

        expect(interceptor.preHandle(route)).toBe(true);
    });

    test('allows a mutating request with a matching body-field token', () => {
        const token = 'token-body';
        const interceptor = new CSRFInterceptor();
        const route = makeRoute('POST', {
            cookies: { '__Host-ndigo-csrf': token },
            body: { csrf_token: token },
        });

        expect(interceptor.preHandle(route)).toBe(true);
    });

    test('rejects a mutating request without a token (403 written)', () => {
        let status = 0;
        let body = '';
        const mode = { rejected: false };
        const interceptor = new CSRFInterceptor();
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
        const route = makeRoute('DELETE', { cookies: { '__Host-ndigo-csrf': 'real-token' } }) as unknown as Route;
        (route.attributes as Record<string, unknown>)[NODE_RESPONSE_ATTRIBUTE] = response;

        mode.rejected = interceptor.preHandle(route) === false;
        expect(mode.rejected).toBe(true);
        expect(status).toBe(403);
        expect(JSON.parse(body)).toMatchObject({
            type: 'urn:ndigo:forbidden',
            status: 403,
            detail: 'Invalid CSRF token',
        });
    });

    test('rejects a mutating request with a mismatched token', () => {
        const interceptor = new CSRFInterceptor();
        const route = makeRoute(
            'PATCH',
            { cookies: { '__Host-ndigo-csrf': 'cookie-token' } },
            { 'x-csrf-token': 'different-token' }
        );

        expect(interceptor.preHandle(route)).toBe(false);
    });

    test('safe methods pass through even with a bad header', () => {
        const interceptor = new CSRFInterceptor();
        const route = makeRoute('GET', { cookies: {} }, { 'x-csrf-token': 'whatever' });

        expect(interceptor.preHandle(route)).toBe(true);
    });

    test('rejects a token of a different length (SEC-9 length guard, no throw)', () => {
        const interceptor = new CSRFInterceptor();
        // cookie-token is 12 chars; an 8-char submission must be rejected by
        // the explicit length guard before any constant-time compare.
        const route = makeRoute(
            'POST',
            { cookies: { '__Host-ndigo-csrf': 'cookie-token' } },
            { 'x-csrf-token': '12345678' }
        );

        expect(interceptor.preHandle(route)).toBe(false);
    });

    test('a spoofed non-__Host cookie is ignored (cookie tossing rejected, SE-8)', () => {
        const spoofed = 'spoofed-token';
        const interceptor = new CSRFInterceptor();
        // A sibling subdomain can set a `ndigo-csrf` cookie for the parent
        // domain and echo the same value in the body/header. The interceptor
        // reads only `__Host-ndigo-csrf`, so the tossed cookie is invisible and
        // the submission cannot match the freshly minted token.
        const route = makeRoute(
            'POST',
            { cookies: { 'ndigo-csrf': spoofed }, body: { csrf_token: spoofed } },
            { 'x-csrf-token': spoofed }
        );

        expect(interceptor.preHandle(route)).toBe(false);
    });
});
