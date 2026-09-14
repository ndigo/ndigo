/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { http as mswHttp, HttpResponse } from 'msw';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { RetryInterceptor } from '../../src/interceptors/retry-interceptor';
import { NotOKInterceptor } from '../../src/interceptors/not-ok-interceptor';
import ResponseError from '../../src/response-error';

describe('RetryInterceptor', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    afterEach(() => {
        server.resetHandlers();
        vi.useRealTimers();
    });

    afterAll(() => server.close());

    test('should not retry when retryLimit is 0 (default)', async () => {
        const interceptor = new RetryInterceptor();
        const http = new HTTP([interceptor, new NotOKInterceptor()]);

        // base handler at /retry/always-fails already returns 503
        let response: unknown;
        try {
            response = await http.request('http://localhost/retry/always-fails');
        } catch (error) {
            response = error;
        }

        expect(response).toBeInstanceOf(ResponseError);
        expect(response.status).toBe(503);
    });

    test('should retry once when retryLimit = 1', async () => {
        const interceptor = new RetryInterceptor({ retryLimit: 1 });
        const http = new HTTP([interceptor, new NotOKInterceptor()]);

        let callCount = 0;
        server.use(
            mswHttp.get('http://localhost/retry/success-after-1', () => {
                callCount++;
                if (callCount === 1) {
                    return HttpResponse.text('failed', { status: 503 });
                } else {
                    return HttpResponse.text('success');
                }
            })
        );

        const response = await http.request('http://localhost/retry/success-after-1');
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('success');
    });

    test('should stop after retryLimit exhausted', async () => {
        const interceptor = new RetryInterceptor({ retryLimit: 2 });
        const http = new HTTP([interceptor, new NotOKInterceptor()]);

        // base handler already returns 503 for every call — no override needed
        let response: unknown;
        try {
            response = await http.request('http://localhost/retry/always-fails');
        } catch (error) {
            response = error;
        }

        expect(response).toBeInstanceOf(ResponseError);
        expect(response.status).toBe(503);
    });

    test('should respect retryStatusCodes filter', async () => {
        const interceptor = new RetryInterceptor({ retryStatusCodes: [503] });
        const http = new HTTP([interceptor, new NotOKInterceptor()]);

        // 404 — not in retryStatusCodes, should not retry (base handler returns 404)
        let response: unknown;
        try {
            response = await http.request('http://localhost/retry/fail-404');
        } catch (error) {
            response = error;
        }

        expect(response).toBeInstanceOf(ResponseError);
        expect(response.status).toBe(404);

        // 503 — in retryStatusCodes; override handler always returns 503 so retry exhausts
        server.use(
            mswHttp.get('http://localhost/retry/fail-503', () => {
                return HttpResponse.text('failed', { status: 503 });
            })
        );

        try {
            response = await http.request('http://localhost/retry/fail-503');
        } catch (error) {
            response = error;
        }

        expect(response).toBeInstanceOf(ResponseError);
        expect(response.status).toBe(503);
    });

    // Timer-based tests call postError() directly to avoid the need for
    // real async timers driving the full HTTP client pipeline.

    test('should use retryBufferInterval', async () => {
        vi.useFakeTimers();

        const interceptor = new RetryInterceptor({ retryLimit: 1, retryBufferInterval: 1 });
        const mockHTTP = {
            request: vi.fn().mockResolvedValue(new Response('success')),
        } as unknown as HTTP;
        const mockRequest = new Request('http://localhost/retry/with-interval');
        const mockResponse = new Response('failed', { status: 503 });
        const responseError = new ResponseError(mockResponse);

        const retryPromise = interceptor.postError(responseError, mockRequest, mockHTTP);

        // Timer hasn't fired yet — request not called
        expect(mockHTTP.request).not.toHaveBeenCalled();

        // Advance 1 second — setTimeout(fn, 1000) fires
        await vi.advanceTimersByTimeAsync(1000);

        const result = await retryPromise;
        expect(result?.status).toBe(200);
        expect(mockHTTP.request).toHaveBeenCalledTimes(1);
    });

    test('should use retryHeader override', async () => {
        vi.useFakeTimers();

        const interceptor = new RetryInterceptor({ retryLimit: 1, retryHeader: 'Retry-After' });
        const mockHTTP = {
            request: vi.fn().mockResolvedValue(new Response('success')),
        } as unknown as HTTP;
        const mockRequest = new Request('http://localhost/retry/with-header');
        const mockResponse = new Response('failed', {
            status: 503,
            headers: { 'Retry-After': '2' },
        });
        const responseError = new ResponseError(mockResponse);

        const retryPromise = interceptor.postError(responseError, mockRequest, mockHTTP);

        // At 999 ms — Retry-After: 2 means 2000 ms delay; timer hasn't fired yet
        await vi.advanceTimersByTimeAsync(999);
        expect(mockHTTP.request).not.toHaveBeenCalled();

        // Advance past 2 seconds total
        await vi.advanceTimersByTimeAsync(1001);

        const result = await retryPromise;
        expect(result?.status).toBe(200);
        expect(mockHTTP.request).toHaveBeenCalledTimes(1);
    });
});
