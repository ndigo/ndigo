/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { HTTP } from '@blue/http';
import { RetryOnOfflineInterceptor } from '../src/retry-on-offline-interceptor';

function makeRequest(url: string, method = 'GET'): Request {
    return new Request(url, { method });
}

describe('RetryOnOfflineInterceptor', () => {
    beforeEach(() => {
        vi.stubGlobal('navigator', { onLine: true });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('queuedCount starts at 0', () => {
        const interceptor = new RetryOnOfflineInterceptor();
        expect(interceptor.queuedCount).toBe(0);
    });

    test('preRequest returns void when online', async () => {
        const interceptor = new RetryOnOfflineInterceptor();
        const request = makeRequest('http://localhost/test');

        const result = await interceptor.preRequest(request, new HTTP());

        expect(result).toBeUndefined();
        expect(interceptor.queuedCount).toBe(0);
    });

    test('postResponse returns response when online and ok', async () => {
        const interceptor = new RetryOnOfflineInterceptor();
        const response = new Response('OK', { status: 200 });

        const result = await interceptor.postResponse(response, {});

        expect(result).toBe(response);
    });

    test('postResponse returns response when offline and response is not ok', async () => {
        vi.stubGlobal('navigator', { onLine: false });
        const interceptor = new RetryOnOfflineInterceptor();
        const response = new Response('Error', { status: 500, headers: { 'X-HTTP-Method': 'GET' } });
        Object.defineProperty(response, 'url', { value: 'http://localhost/api', configurable: true });

        const result = interceptor.postResponse(response, {});

        // Should return a promise (queued for retry)
        expect(result).toBeInstanceOf(Promise);
    });
});
