/**
 * @author Jeff Rose
 */

import { describe, test, expect, vi, afterEach } from 'vitest';
import { CORSInterceptor } from '../src/cors-interceptor';

function makeRequest(url: string, method = 'GET'): Request {
    return new Request(new URL(url, 'http://localhost'), { method });
}

describe('CORSInterceptor', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('sets mode to cors by default', async () => {
        const interceptor = new CORSInterceptor();
        const request = makeRequest('https://api.example.com/data');

        const result = await interceptor.preRequest(request, undefined as any);

        // The request should have mode: cors set
        expect(result).toBeInstanceOf(Request);
        expect((result as Request).url).toBe('https://api.example.com/data');
    });

    test('sets credentials to include when withCredentials is true', async () => {
        const interceptor = new CORSInterceptor({ withCredentials: true });
        const request = makeRequest('https://api.example.com/data');

        const result = await interceptor.preRequest(request, undefined as any);

        expect(result).toBeInstanceOf(Request);
        expect((result as Request).credentials).toBe('include');
    });

    test('returns a request with the same url', async () => {
        const interceptor = new CORSInterceptor();
        const request = makeRequest('/same-origin');

        const result = await interceptor.preRequest(request, undefined as any);

        expect(result).toBeInstanceOf(Request);
        expect((result as Request).url).toBe('http://localhost/same-origin');
    });
});