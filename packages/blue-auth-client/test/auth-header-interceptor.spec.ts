import { describe, test, expect, vi } from 'vitest';
import { DefaultSession, AnonymousPrincipal } from '@blue/auth-core';
import { HTTP } from '@blue/http';
import { AuthHeaderInterceptor } from '../src/auth-header-interceptor';

function makeRequest(url: string, method = 'GET'): Request {
    return new Request(new URL(url, 'http://localhost'), { method });
}

describe('AuthHeaderInterceptor', () => {
    test('does not add header when session is not authenticated', async () => {
        const session = new DefaultSession();
        const interceptor = new AuthHeaderInterceptor(session);
        const request = makeRequest('/api/data');

        const result = await interceptor.preRequest(request, new HTTP());

        expect(result).toBeUndefined();
    });

    test('injects Authorization header for authenticated session', async () => {
        const session = new DefaultSession();
        session.setPrincipal(new AnonymousPrincipal(), 'test-token');

        const interceptor = new AuthHeaderInterceptor(session);
        const request = makeRequest('/api/data');

        const result = await interceptor.preRequest(request, new HTTP());

        expect(result).toBeInstanceOf(Request);
        expect((result as Request).headers.get('Authorization')).toBe('Bearer test-token');
    });

    test('preserves existing headers when adding Authorization', async () => {
        const session = new DefaultSession();
        session.setPrincipal(new AnonymousPrincipal(), 'token-789');

        const interceptor = new AuthHeaderInterceptor(session);
        const request = new Request(new URL('http://localhost/api'), {
            method: 'GET',
            headers: { 'X-Custom': 'value' },
        });

        const result = await interceptor.preRequest(request, new HTTP());

        expect((result as Request).headers.get('Authorization')).toBe('Bearer token-789');
        expect((result as Request).headers.get('X-Custom')).toBe('value');
    });

    test('does not add header when session has no token (not authenticated)', async () => {
        const session = new DefaultSession();
        // Session starts unauthenticated — no token set
        expect(session.isAuthenticated).toBe(false);

        const interceptor = new AuthHeaderInterceptor(session);
        const request = makeRequest('/api/data');

        const result = await interceptor.preRequest(request, new HTTP());

        expect(result).toBeUndefined();
    });
});
