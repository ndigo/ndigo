/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { TimeoutInit, TimeoutInterceptor } from '../../src/interceptors/timeout-interceptor';
import { RetryInterceptor } from '../../src/interceptors/retry-interceptor';
import ResponseError from '../../src/response-error';

class TestTimeoutInterceptor extends TimeoutInterceptor {
    preInit(url: URL, settings: TimeoutInit) {
        const proceed = super.preInit(url, settings);
        expect(proceed).toBe(true);
        return proceed;
    }

    async postError(error: Error, request: Request) {
        const response = await super.postError(error, request);
        if (response !== undefined) {
            expect(response).toBeInstanceOf(ResponseError);
        }
        return response;
    }

    async postComplete(request: Request, response: Response) {
        return super.postComplete(request, response);
    }
}

describe('TimeoutInterceptor', () => {
    let http: HTTP | undefined;
    let response: Response | undefined;

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        http = new HTTP([new TestTimeoutInterceptor(200)]);
    });

    afterEach(() => {
        response = http = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    test('it should only handle valid timeouts', async () => {
        expect(() => (http = new HTTP([new TestTimeoutInterceptor(-200)]))).toThrow(TypeError);
    });

    test('it should handle timeouts', async () => {
        response = await http?.request('http://localhost/timeout/100');
        expect(await response?.text()).toBe('');
        response = await http?.request('http://localhost/timeout/300');
        expect(response).toBeInstanceOf(ResponseError);
        expect(response?.status).toBe(408);
        expect(response?.statusText).toBe('Request Timeout');
    });

    test('it should handle timeout overrides', async () => {
        response = await http?.request('http://localhost/timeout/100', { timeout: 50 } as TimeoutInit);
        expect(response).toBeInstanceOf(ResponseError);
        expect(response?.status).toBe(408);
        expect(response?.statusText).toBe('Request Timeout');
        response = await http?.request('http://localhost/timeout/300', { timeout: 350 } as TimeoutInit);
        expect(await response?.text()).toBe('');
    });

    test('it should isolate timers across concurrent requests (COR-5)', async () => {
        // The first request settles (~50 ms) before the second's deadline
        // (200 ms). One completion must not cancel the other's timeout —
        // the slow request still aborts at 200 ms and becomes a 408.
        const [fast, slow] = await Promise.all([
            http?.request('http://localhost/timeout/50'),
            http?.request('http://localhost/timeout/1000'),
        ]);

        expect(fast?.status).toBe(200);
        expect(slow).toBeInstanceOf(ResponseError);
        expect(slow?.status).toBe(408);
        expect(slow?.statusText).toBe('Request Timeout');
    });

    test('it should propagate transport failures instead of mislabeling them 408 (COR-6)', async () => {
        // A DNS/TLS/TypeError failure is not a timeout: the interceptor must
        // fall through and the original error must reach the caller.
        const failing = new HTTP([new TestTimeoutInterceptor(200)], {}, async () => {
            throw new TypeError('fetch failed');
        });

        const result = await failing.request('http://localhost/dns-failure');
        expect(result).toBeInstanceOf(ResponseError);
        expect(result.status).not.toBe(408);
        expect(result.message).toBe('fetch failed');
    });

    test('it should allow [Timeout, Retry] to retry after a timeout (COR-6)', async () => {
        let callCount = 0;
        const httpWithRetry = new HTTP(
            [new TimeoutInterceptor(1000), new RetryInterceptor({ retryLimit: 1 })],
            {},
            async () => {
                callCount++;
                if (callCount === 1) {
                    // Simulate the timeout aborting the first attempt.
                    throw new DOMException('The operation was aborted.', 'AbortError');
                }
                return new Response('recovered');
            }
        );

        const result = await httpWithRetry.request('http://localhost/flaky');
        expect(result.status).toBe(200);
        expect(await result.text()).toBe('recovered');
        expect(callCount).toBe(2);
    });

    test('it should still yield 408 on abort with [Retry, Timeout] order (COR-6)', async () => {
        let callCount = 0;
        const httpWithRetry = new HTTP(
            [new RetryInterceptor({ retryLimit: 1 }), new TimeoutInterceptor(1000)],
            {},
            async () => {
                callCount++;
                throw new DOMException('The operation was aborted.', 'AbortError');
            }
        );

        const result = await httpWithRetry.request('http://localhost/always-aborts');
        expect(result).toBeInstanceOf(ResponseError);
        expect(result.status).toBe(408);
        expect(callCount).toBe(1);
    });
});
