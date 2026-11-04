/**
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { HTTP } from '@ndigo/http';
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

    test('rejects the newest request with a documented error when the queue is full', async () => {
        vi.stubGlobal('navigator', { onLine: false });
        const interceptor = new RetryOnOfflineInterceptor({ queueCap: 1 });
        const request = makeRequest('http://localhost/api');

        // Do not await `first` — its queued promise only settles on drain.
        void interceptor.preRequest(request, new HTTP());
        expect(interceptor.queuedCount).toBe(1);

        // Overflow policy: the newest (2nd) request is rejected, oldest kept.
        await expect(interceptor.preRequest(request, new HTTP())).rejects.toThrow(/queue full/);
        expect(interceptor.queuedCount).toBe(1);
    });

    test('drains the queue when back online', async () => {
        vi.useFakeTimers();
        try {
            vi.stubGlobal('navigator', { onLine: false });
            const fetchMock = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
            vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

            const interceptor = new RetryOnOfflineInterceptor({ retryInterval: 1000 });
            const queued = interceptor.preRequest(makeRequest('http://localhost/api'), new HTTP());
            expect(interceptor.queuedCount).toBe(1);
            expect(fetchMock).not.toHaveBeenCalled();

            vi.stubGlobal('navigator', { onLine: true });
            vi.advanceTimersByTime(1000);

            const response = (await queued) as Response;
            expect(response.status).toBe(200);
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(interceptor.queuedCount).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    test('applies per-entry exponential backoff across retries (attempt 0/1/2)', async () => {
        vi.useFakeTimers();
        try {
            const base = 1000;
            const t0 = Date.now();
            vi.stubGlobal('navigator', { onLine: false });
            const attemptOffsets: number[] = [];
            const fetchMock = vi.fn((input: Request) => {
                attemptOffsets.push(Date.now() - t0);
                return new Promise((_, reject) => reject(new Error('still offline')));
            });
            vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

            // maxRetries counts retries after the initial attempt, so a value
            // of 2 yields exactly 3 attempts (indices 0, 1, 2) before reject.
            const interceptor = new RetryOnOfflineInterceptor({
                retryInterval: base,
                maxRetries: 2,
                maxRetryInterval: 30000,
            });
            const queued = interceptor.preRequest(makeRequest('http://localhost/api'), new HTTP());
            expect(interceptor.queuedCount).toBe(1);

            // Advance fake time, then yield so the suspended async queue drain
            // (awaiting the rejected fetch) can settle and re-queue the entry
            // before the next window elapses.
            const advance = async (ms: number): Promise<void> => {
                vi.advanceTimersByTime(ms);
                await Promise.resolve();
                await Promise.resolve();
            };

            vi.stubGlobal('navigator', { onLine: true });
            await advance(base); // attempt 0
            await advance(base * 2); // attempt 1
            await advance(base * 4); // attempt 2 → max retries → reject

            expect(fetchMock).toHaveBeenCalledTimes(3);
            expect(attemptOffsets).toEqual([base, base * 3, base * 7]);

            // Intervals between attempts: base, 2*base, 4*base.
            const deltas = [
                attemptOffsets[0],
                attemptOffsets[1] - attemptOffsets[0],
                attemptOffsets[2] - attemptOffsets[1],
            ];
            expect(deltas).toEqual([base, base * 2, base * 4]);

            await expect(queued).rejects.toThrow('still offline');
            expect(interceptor.queuedCount).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    test('replays a queued failed request with its original method, headers, and body', async () => {
        vi.useFakeTimers();
        try {
            vi.stubGlobal('navigator', { onLine: true });
            const interceptor = new RetryOnOfflineInterceptor({ retryInterval: 1000 });
            const request = new Request('http://localhost/api/items', {
                method: 'POST',
                headers: { Authorization: 'Bearer secret', 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'widget' }),
            });

            // Online preRequest captures the undisturbed clone; the browser then
            // goes offline before the failed response is handled.
            await interceptor.preRequest(request, new HTTP());
            vi.stubGlobal('navigator', { onLine: false });

            const failed = new Response('Bad Gateway', { status: 503 });
            Object.defineProperty(failed, 'url', { value: 'http://localhost/api/items', configurable: true });

            const queued = interceptor.postResponse(failed, {}, request);
            expect(queued).toBeInstanceOf(Promise);
            expect(interceptor.queuedCount).toBe(1);

            const replayed: Request[] = [];
            const fetchMock = vi.fn(async (input: Request) => {
                replayed.push(input);
                return new Response('ok', { status: 200 });
            });
            vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

            vi.stubGlobal('navigator', { onLine: true });
            vi.advanceTimersByTime(1000);

            const response = (await queued) as Response;
            expect(response.status).toBe(200);
            expect(replayed).toHaveLength(1);
            expect(replayed[0].method).toBe('POST');
            expect(replayed[0].headers.get('authorization')).toBe('Bearer secret');
            expect(await replayed[0].clone().text()).toBe(JSON.stringify({ name: 'widget' }));
        } finally {
            vi.useRealTimers();
        }
    });

    test('replays a failed POST with its original method, headers, and body through the HTTP pipeline', async () => {
        try {
            vi.stubGlobal('navigator', { onLine: true });
            const replayed: Request[] = [];
            let sentOriginal = false;
            const fetchMock = vi.fn((input: Request) => {
                if (!sentOriginal) {
                    sentOriginal = true;
                    // The request went out while online; drop the connection
                    // before the failed response is handled so it is queued.
                    vi.stubGlobal('navigator', { onLine: false });
                    const failed = new Response('Bad Gateway', { status: 503 });
                    Object.defineProperty(failed, 'url', { value: 'http://localhost/api/items', configurable: true });
                    return Promise.resolve(failed);
                }
                replayed.push(input);
                return Promise.resolve(new Response('ok', { status: 200 }));
            });
            vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

            const interceptor = new RetryOnOfflineInterceptor({ retryInterval: 1 });
            const http = new HTTP([interceptor]);
            const pending = http.post('http://localhost/api/items', {
                headers: { Authorization: 'Bearer secret' },
                body: JSON.stringify({ name: 'widget' }),
            });

            await vi.waitFor(() => expect(interceptor.queuedCount).toBe(1));

            vi.stubGlobal('navigator', { onLine: true });
            const response = await pending;

            expect(response.status).toBe(200);
            expect(replayed).toHaveLength(1);
            expect(replayed[0].method).toBe('POST');
            expect(replayed[0].headers.get('authorization')).toBe('Bearer secret');
            expect(await replayed[0].clone().text()).toBe(JSON.stringify({ name: 'widget' }));
        } finally {
            vi.useRealTimers();
        }
    });

    test('replays a keyed clone when a later interceptor replaced the Request (PWB-REV-006)', async () => {
        vi.useFakeTimers();
        try {
            vi.stubGlobal('navigator', { onLine: true });
            const interceptor = new RetryOnOfflineInterceptor({ retryInterval: 1000, maxRetries: 0 });
            const original = new Request('http://localhost/api/items', {
                method: 'POST',
                headers: { Authorization: 'Bearer secret', 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'widget' }),
            });

            // Online preRequest captures the undisturbed clone keyed by method+url.
            await interceptor.preRequest(original, new HTTP());

            // A later interceptor replaces the Request object and its body is
            // consumed by fetch, so it can no longer be replayed.
            const replaced = new Request(original);
            await replaced.text();

            vi.stubGlobal('navigator', { onLine: false });
            const failed = new Response('Bad Gateway', { status: 503 });
            Object.defineProperty(failed, 'url', { value: 'http://localhost/api/items', configurable: true });

            const queued = interceptor.postResponse(failed, {}, replaced);
            expect(interceptor.queuedCount).toBe(1);

            const replayed: Request[] = [];
            vi.stubGlobal(
                'fetch',
                vi.fn(async (input: Request) => {
                    replayed.push(input);
                    return new Response('ok', { status: 200 });
                }) as unknown as typeof fetch
            );

            vi.stubGlobal('navigator', { onLine: true });
            vi.advanceTimersByTime(1000);

            const response = (await queued) as Response;
            expect(response.status).toBe(200);
            expect(replayed).toHaveLength(1);
            expect(replayed[0].method).toBe('POST');
            expect(replayed[0].headers.get('authorization')).toBe('Bearer secret');
            expect(await replayed[0].clone().text()).toBe(JSON.stringify({ name: 'widget' }));
        } finally {
            vi.useRealTimers();
        }
    });

    test('rejects a bodyUsed fallback instead of queueing an unreplayable request (PWB-REV-006)', async () => {
        vi.stubGlobal('navigator', { onLine: false });
        const interceptor = new RetryOnOfflineInterceptor();

        const request = new Request('http://localhost/api/items', { method: 'POST', body: 'payload' });
        await request.text();

        const failed = new Response('Server Error', { status: 500 });
        const result = interceptor.postResponse(failed, {}, request);

        expect(interceptor.queuedCount).toBe(0);
        await expect(result).rejects.toThrow(/body was already consumed/);
    });

    test('drains an offline preRequest queue through the client, running the full chain (PWB-REV-007)', async () => {
        vi.useFakeTimers();
        try {
            vi.stubGlobal('navigator', { onLine: false });
            const seen: string[] = [];
            const observer = {
                preRequest: vi.fn(() => {
                    seen.push('pre');
                }),
                postResponse: vi.fn(async (response: Response) => {
                    seen.push('post');
                    return response;
                }),
            };
            const fetchMock = vi.fn(async () => new Response('ok', { status: 200 }));
            vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

            const interceptor = new RetryOnOfflineInterceptor({ retryInterval: 1000 });
            const http = new HTTP([interceptor, observer]);

            const pending = http.get('http://localhost/api/data');
            await Promise.resolve();

            expect(interceptor.queuedCount).toBe(1);
            expect(fetchMock).not.toHaveBeenCalled();
            expect(observer.preRequest).not.toHaveBeenCalled();

            vi.stubGlobal('navigator', { onLine: true });
            vi.advanceTimersByTime(1000);

            const response = await pending;
            expect(response.status).toBe(200);
            expect(fetchMock).toHaveBeenCalledTimes(1);

            // The replay ran the whole interceptor pipeline, not a bare fetch.
            expect(observer.preRequest).toHaveBeenCalledTimes(1);
            expect(observer.postResponse).toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });
});
