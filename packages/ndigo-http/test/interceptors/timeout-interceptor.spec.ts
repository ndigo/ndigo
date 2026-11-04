/**
 * @module ndigo-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { server } from '../_worker';
import {
    HTTP,
    HTTPInit,
    type ErrorAwareHTTPInterceptor,
    type InitializationAwareHTTPInterceptor,
} from '../../src/http';
import { TimeoutInit, TimeoutInterceptor } from '../../src/interceptors/timeout-interceptor';
import { RetryInterceptor } from '../../src/interceptors/retry-interceptor';
import ResponseError from '../../src/response-error';

class TestTimeoutInterceptor extends TimeoutInterceptor {
    preInit(url: URL, settings: TimeoutInit) {
        const proceed = super.preInit(url, settings);
        expect(proceed).toBe(true);
        return proceed;
    }

    async postError(error: Error, request: Request, http: HTTP, settings?: HTTPInit) {
        const response = await super.postError(error, request, http, settings);
        if (response !== undefined) {
            expect(response).toBeInstanceOf(ResponseError);
        }
        return response;
    }

    async postComplete(request: Request, response: Response, settings?: HTTPInit) {
        return super.postComplete(request, response, settings);
    }
}

describe('TimeoutInterceptor', () => {
    let http: HTTP | undefined;
    let response: Response | undefined;

    beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

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
        expect((result as ResponseError).message).toBe('fetch failed');
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

    test('it releases each timer when its request completes (HT-2)', async () => {
        // A completed request must clear its timeout: an unresolved timer
        // counts as a live `Timeout` resource and keeps the event loop alive.
        const completing = new HTTP([new TimeoutInterceptor(1000)], {}, async () => new Response('ok'));
        const baseline = process.getActiveResourcesInfo().filter((resource) => resource === 'Timeout').length;

        await Promise.all(
            Array.from({ length: 3 }, async () => {
                const result = await completing.request('http://localhost/completed');
                expect(await result.text()).toBe('ok');
            })
        );

        expect(
            process.getActiveResourcesInfo().filter((resource) => resource === 'Timeout').length
        ).toBeLessThanOrEqual(baseline);
    });

    test('it releases each timer when a request transform replaces the request (HT-2)', async () => {
        // HTTP.create appends its TransformInterceptor after the timeout, so
        // the request handed to fetch is a different object; cleanup must not
        // depend on that identity.
        const transforming = HTTP.create({
            baseURL: 'http://localhost/',
            interceptors: [new TimeoutInterceptor(1000)],
            requestTransforms: [(body: unknown) => body],
            fetch: async () => new Response('ok'),
        });
        const baseline = process.getActiveResourcesInfo().filter((resource) => resource === 'Timeout').length;

        await Promise.all(
            Array.from({ length: 3 }, async (_unused, index) => {
                const result = await transforming.post('api/completed', {
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ index }),
                });
                expect(await result.text()).toBe('ok');
            })
        );

        expect(
            process.getActiveResourcesInfo().filter((resource) => resource === 'Timeout').length
        ).toBeLessThanOrEqual(baseline);
    });

    test('it releases the timer when a request fails (HT-2)', async () => {
        const failing = new HTTP([new TimeoutInterceptor(1000)], {}, async () => {
            throw new TypeError('fetch failed');
        });
        const baseline = process.getActiveResourcesInfo().filter((resource) => resource === 'Timeout').length;

        const result = await failing.request('http://localhost/failing');

        expect(result.status).not.toBe(408);
        expect(
            process.getActiveResourcesInfo().filter((resource) => resource === 'Timeout').length
        ).toBeLessThanOrEqual(baseline);
    });

    test('it propagates a pre-aborted caller signal as a cancel (HT-5)', async () => {
        const caller = new AbortController();
        const aborting = new HTTP([new TimeoutInterceptor(1000)], {}, async (input) => {
            const request = input as Request;
            const { promise, resolve, reject } = Promise.withResolvers<Response>();
            const lateResponse = setTimeout(() => resolve(new Response('completed')), 25);
            const abort = (): void => {
                clearTimeout(lateResponse);
                reject(request.signal.reason);
            };

            if (request.signal.aborted) {
                abort();
            } else {
                request.signal.addEventListener('abort', abort, { once: true });
            }

            return promise;
        });

        caller.abort(new DOMException('caller cancelled', 'AbortError'));

        const result = await aborting.request('http://localhost/slow', { signal: caller.signal });

        expect(result).toBeInstanceOf(ResponseError);
        expect(result.status).not.toBe(408);
        expect((result as ResponseError).message).toContain('caller cancelled');
    });

    test('it aborts in-flight requests when the caller aborts (HT-5)', async () => {
        const caller = new AbortController();
        const aborting = new HTTP([new TimeoutInterceptor(1000)], {}, async (input) => {
            const request = input as Request;
            const { promise, resolve, reject } = Promise.withResolvers<Response>();
            const lateResponse = setTimeout(() => resolve(new Response('completed')), 100);

            request.signal.addEventListener(
                'abort',
                () => {
                    clearTimeout(lateResponse);
                    reject(request.signal.reason);
                },
                { once: true }
            );
            setTimeout(() => caller.abort(new DOMException('caller cancelled later', 'AbortError')), 10);

            return promise;
        });

        const result = await aborting.request('http://localhost/slow', { signal: caller.signal });

        expect(result).toBeInstanceOf(ResponseError);
        expect(result.status).not.toBe(408);
        expect((result as ResponseError).message).toContain('caller cancelled later');
    });

    test('it still yields 408 when the caller signal never aborts (HT-5)', async () => {
        const caller = new AbortController();
        response = await http?.request('http://localhost/timeout/1000', {
            signal: caller.signal,
            timeout: 50,
        } as TimeoutInit);

        expect(response).toBeInstanceOf(ResponseError);
        expect(response?.status).toBe(408);
        expect(response?.statusText).toBe('Request Timeout');
    });

    test('it clears the timer on an error exit that never reaches postComplete (HTT-REV-009)', async () => {
        vi.useFakeTimers();
        try {
            class Thrower implements ErrorAwareHTTPInterceptor {
                async postError(): Promise<Response | undefined> {
                    throw new Error('postError boom');
                }
            }
            // Thrower runs first, so Timeout's own postError never executes —
            // only the completion path can release the timer.
            const client = new HTTP([new Thrower(), new TimeoutInterceptor(1000)], {}, async () => {
                throw new TypeError('fetch failed');
            });

            await expect(client.request('http://localhost/throws')).rejects.toThrow('postError boom');

            // The 1000 ms timeout timer must not survive a failed request whose
            // error chain threw before the completion hooks could run.
            expect(vi.getTimerCount()).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    test('it clears the timer when a request is cancelled before fetch (HTT-REV-009)', async () => {
        vi.useFakeTimers();
        try {
            class Canceller implements InitializationAwareHTTPInterceptor {
                preInit(): boolean {
                    return false;
                }
            }
            const client = new HTTP(
                [new TimeoutInterceptor(1000), new Canceller()],
                {},
                async () => new Response('never')
            );

            const result = await client.request('http://localhost/cancelled');
            expect(result.status).toBe(200);
            expect(vi.getTimerCount()).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });
});
