/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { CacheInterceptor } from '../../src/interceptors/cache-interceptor';
import { http, HttpResponse } from 'msw';

describe('CacheInterceptor', () => {
    beforeAll(() => server.listen());
    afterAll(() => server.close());
    afterEach(() => server.resetHandlers());

    test('should cache GET requests and serve from cache on subsequent requests', async () => {
        const interceptor = new CacheInterceptor();
        const httpClient = new HTTP([interceptor]);

        let callCount = 0;
        server.use(
            http.get('*/test', () => {
                callCount++;
                return HttpResponse.json({ message: 'cached response' });
            })
        );

        // First request - should hit network
        const response1 = await httpClient.get('http://localhost/test');
        expect(callCount).toBe(1);

        // Second request - should serve from cache
        const response2 = await httpClient.get('http://localhost/test');
        expect(callCount).toBe(1);

        expect(await response2.json()).toEqual({ message: 'cached response' });
    });

    test('should not cache POST requests', async () => {
        const interceptor = new CacheInterceptor();
        const httpClient = new HTTP([interceptor]);

        let callCount = 0;
        server.use(
            http.post('*/test', () => {
                callCount++;
                return HttpResponse.json({ message: 'post response' });
            })
        );

        // POST request - should always hit network
        await httpClient.post('http://localhost/test', { body: 'test' });
        expect(callCount).toBe(1);

        // Second POST request - should also hit network
        await httpClient.post('http://localhost/test', { body: 'test' });
        expect(callCount).toBe(2);
    });

    test('should expire cache entries after TTL', async () => {
        const interceptor = new CacheInterceptor({ defaultTtl: 10 });
        const httpClient = new HTTP([interceptor]);

        let callCount = 0;
        server.use(
            http.get('*/test', () => {
                callCount++;
                return HttpResponse.json({ message: 'ttl expired response' });
            })
        );

        // First request - should hit network
        await httpClient.get('http://localhost/test');
        expect(callCount).toBe(1);

        // Wait for TTL to expire
        await new Promise((resolve) => setTimeout(resolve, 20));

        // Second request - should hit network again
        await httpClient.get('http://localhost/test');
        expect(callCount).toBe(2);
    });

    test('should bypass cache when Cache-Control: no-cache header is present', async () => {
        const interceptor = new CacheInterceptor();
        const httpClient = new HTTP([interceptor]);

        let callCount = 0;
        server.use(
            http.get('*/test', () => {
                callCount++;
                return HttpResponse.json({ message: 'bypass cache response' });
            })
        );

        // Request with cache busting header
        await httpClient.get('http://localhost/test', {
            headers: { 'Cache-Control': 'no-cache' },
        });
        expect(callCount).toBe(1);

        // Second request with same header
        await httpClient.get('http://localhost/test', {
            headers: { 'Cache-Control': 'no-cache' },
        });
        expect(callCount).toBe(2);
    });

    test('should enforce max cache size with LRU eviction', async () => {
        const interceptor = new CacheInterceptor({ maxCacheSize: 2 });
        const httpClient = new HTTP([interceptor]);

        let callCount = 0;
        server.use(
            http.get('*/first', () => {
                callCount++;
                return HttpResponse.json({ id: 'first' });
            }),
            http.get('*/second', () => {
                callCount++;
                return HttpResponse.json({ id: 'second' });
            }),
            http.get('*/third', () => {
                callCount++;
                return HttpResponse.json({ id: 'third' });
            })
        );

        await httpClient.get('http://localhost/first'); // callCount = 1. Cache: {first}
        await new Promise((r) => setTimeout(r, 10));
        await httpClient.get('http://localhost/second'); // callCount = 2. Cache: {first, second}
        await new Promise((r) => setTimeout(r, 10));
        await httpClient.get('http://localhost/third'); // callCount = 3. Cache: {second, third} (first evicted)

        expect(callCount).toBe(3);

        // Request second - should be cached
        await httpClient.get('http://localhost/second');
        expect(callCount).toBe(3); // Cache: {third, second}

        // Request first again - should hit network
        await httpClient.get('http://localhost/first');
        expect(callCount).toBe(4); // Cache: {second, first} (third evicted)

        // Request second again - should still be cached
        await httpClient.get('http://localhost/second');
        expect(callCount).toBe(4);
    });

    test('should not cache non-200 responses', async () => {
        const interceptor = new CacheInterceptor();
        const httpClient = new HTTP([interceptor]);

        let callCount = 0;
        server.use(
            http.get('*/notfound', () => {
                callCount++;
                return new HttpResponse(null, { status: 404 });
            })
        );

        await httpClient.get('http://localhost/notfound');
        expect(callCount).toBe(1);

        await httpClient.get('http://localhost/notfound');
        expect(callCount).toBe(2);
    });

    test('should never serve a POST response to a later GET (SEC-8)', async () => {
        const interceptor = new CacheInterceptor();
        const httpClient = new HTTP([interceptor]);

        let postCount = 0;
        let getCount = 0;
        server.use(
            http.post('*/same-url', () => {
                postCount++;
                return HttpResponse.json({ message: 'post response' });
            }),
            http.get('*/same-url', () => {
                getCount++;
                return HttpResponse.json({ message: 'get response' });
            })
        );

        await httpClient.post('http://localhost/same-url', { body: 'payload' });
        expect(postCount).toBe(1);

        // The GET must hit the network and receive the GET handler's body —
        // not the POST payload cached under a GET-derived key.
        const getResponse = await httpClient.get('http://localhost/same-url');
        expect(getCount).toBe(1);
        expect(await getResponse.json()).toEqual({ message: 'get response' });

        // A second GET is served from the GET cache entry.
        const cached = await httpClient.get('http://localhost/same-url');
        expect(getCount).toBe(1);
        expect(await cached.json()).toEqual({ message: 'get response' });
    });

    test('should not cache credentialed responses or serve them cross-user (SEC-8)', async () => {
        const interceptor = new CacheInterceptor();
        const httpClient = new HTTP([interceptor]);

        let callCount = 0;
        server.use(
            http.get('*/me', ({ request }) => {
                callCount++;
                return HttpResponse.json({ user: request.headers.get('authorization') });
            })
        );

        // User A's authenticated GET is never written to the shared cache.
        const userA = await httpClient.get('http://localhost/me', {
            headers: { Authorization: 'Bearer user-a' },
        });
        expect(await userA.json()).toEqual({ user: 'Bearer user-a' });

        // User B (no credentials) must hit the network, not user A's payload.
        const userB = await httpClient.get('http://localhost/me');
        expect(callCount).toBe(2);
        expect(await userB.json()).toEqual({ user: null });

        // And a credentialed request is never served a prior cached response:
        // a client with a warm cache still goes to the network.
        const warm = new HTTP([new CacheInterceptor()]);
        await warm.get('http://localhost/me');
        const authed = await warm.get('http://localhost/me', {
            headers: { Authorization: 'Bearer user-a' },
        });
        expect(await authed.json()).toEqual({ user: 'Bearer user-a' });
        expect(callCount).toBe(4);
    });
});
