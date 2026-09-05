/**
 * @author Jeff Rose
 */

import { describe, test, expect, vi, afterEach } from 'vitest';
import { FetchCredentialsInterceptor } from '../src/fetch-credentials';

function makeRequest(url: string, method = 'GET'): Request {
    return new Request(new URL(url, 'http://localhost'), { method });
}

describe('FetchCredentialsInterceptor', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('defaults credentials to omit', async () => {
        const interceptor = new FetchCredentialsInterceptor();
        const request = makeRequest('https://api.example.com/data');

        const result = await interceptor.preRequest(request, undefined as never);

        expect(result).toBeInstanceOf(Request);
        expect((result as Request).credentials).toBe('omit');
    });

    test('sets credentials to include when configured', async () => {
        const interceptor = new FetchCredentialsInterceptor({ credentials: 'include' });
        const request = makeRequest('https://api.example.com/data');

        const result = await interceptor.preRequest(request, undefined as never);

        expect(result).toBeInstanceOf(Request);
        expect((result as Request).credentials).toBe('include');
    });

    test('preserves headers and body through the round-trip', async () => {
        const interceptor = new FetchCredentialsInterceptor({ credentials: 'include' });
        const request = makeRequest('https://api.example.com/data');
        request.headers.set('X-Custom', 'value');

        const result = (await interceptor.preRequest(request, undefined as never)) as Request;

        expect(result.headers.get('X-Custom')).toBe('value');
        expect(result.url).toBe('https://api.example.com/data');
    });

    test('keeps the request url for same-origin calls', async () => {
        const interceptor = new FetchCredentialsInterceptor();
        const request = makeRequest('/same-origin');

        const result = await interceptor.preRequest(request, undefined as never);

        expect(result).toBeInstanceOf(Request);
        expect((result as Request).url).toBe('http://localhost/same-origin');
    });
});
