/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, beforeAll, afterAll, afterEach } from 'vitest';
import { http as mswHttp, HttpResponse } from 'msw';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import type { CompletionAwareHTTPInterceptor, ErrorAwareHTTPInterceptor } from '../../src/http';
import type { TransformContext } from '../../src/transformers/http-transformer';
import { TimeoutInterceptor } from '../../src/interceptors/timeout-interceptor';
import ResponseError from '../../src/response-error';

describe('TransformInterceptor', () => {
    beforeAll(() => server.listen());
    afterAll(() => server.close());
    afterEach(() => server.resetHandlers());

    test('applies request transforms through HTTP.create config', async () => {
        const http = HTTP.create({
            baseURL: 'http://localhost/',
            requestTransforms: [
                (body: unknown, context: TransformContext) => {
                    expect(context.direction).toBe('request');
                    return {
                        ...(body as Record<string, unknown>),
                        transformed: true,
                    };
                },
            ],
            fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
                const request = input instanceof Request ? input : new Request(input, init);
                const payload = await request.json();

                expect(payload).toEqual({
                    message: 'hello',
                    transformed: true,
                });

                return new Response(JSON.stringify(payload), {
                    headers: {
                        'content-type': 'application/json',
                    },
                });
            },
        });

        const response = await http.post('api/transform', {
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ message: 'hello' }),
        });

        expect(response.ok).toBe(true);
    });

    test('applies response transforms and returns new response', async () => {
        const http = HTTP.create({
            baseURL: 'http://localhost/',
            responseTransforms: [
                (body: unknown, context: TransformContext) => {
                    expect(context.direction).toBe('response');
                    return {
                        ...(body as Record<string, unknown>),
                        parsed: true,
                    };
                },
            ],
            fetch: async () => {
                return new Response(JSON.stringify({ value: 42 }), {
                    headers: {
                        'content-type': 'application/json',
                    },
                });
            },
        });

        const response = await http.get('api/transform-response');
        const payload = await response.json();

        expect(payload).toEqual({ value: 42, parsed: true });
    });

    test('preserves the timeout signal across a request transform (COR-9)', async () => {
        // The TimeoutInterceptor arms an AbortController in preInit; the
        // TransformInterceptor rebuilds the request. The rebuild must keep
        // that signal, or a slow transformed POST would never abort.
        const http = HTTP.create({
            baseURL: 'http://localhost/',
            interceptors: [new TimeoutInterceptor(50)],
            requestTransforms: [
                (body: unknown) => {
                    return body;
                },
            ],
            fetch: async (input: RequestInfo | URL) => {
                const request = input instanceof Request ? input : new Request(input);
                return new Promise<Response>((resolve, reject) => {
                    const timer = setTimeout(() => resolve(new Response('late but alive')), 300);
                    request.signal.addEventListener(
                        'abort',
                        () => {
                            clearTimeout(timer);
                            reject(new DOMException('The operation was aborted.', 'AbortError'));
                        },
                        { once: true }
                    );
                });
            },
        });

        const response = await http.post('api/slow', {
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ message: 'hello' }),
        });

        // The timeout fired through the rebuilt request: 408, not a late 200.
        expect(response.status).toBe(408);
        expect(response.statusText).toBe('Request Timeout');
    });

    test('skips bodyless HEAD requests and 204 responses (HT-3)', async () => {
        let seen: Request | undefined;
        const http = HTTP.create({
            baseURL: 'http://localhost/',
            requestTransforms: [(body: unknown) => body],
            fetch: async (input) => {
                seen = input as Request;
                return new Response(null, { status: 204, headers: { 'content-type': 'application/json' } });
            },
        });

        const response = await http.head('api/head', { headers: { 'content-type': 'application/json' } });

        expect(response.status).toBe(204);
        expect(seen?.method).toBe('HEAD');
    });

    test('skips zero-length request bodies instead of parsing them (HT-3)', async () => {
        const seen: string[] = [];
        const http = HTTP.create({
            baseURL: 'http://localhost/',
            requestTransforms: [
                (body: unknown) => {
                    seen.push('transformed');
                    return body;
                },
            ],
            fetch: async (input) => {
                seen.push(await (input as Request).text());
                return new Response('ok');
            },
        });

        const response = await http.post('api/empty', {
            headers: { 'content-type': 'application/json' },
            body: '',
        });

        expect(await response.text()).toBe('ok');
        expect(seen).toEqual(['']);
    });

    test('routes preRequest failures through the error and completion hooks (HT-3)', async () => {
        const observed: string[] = [];

        class Observer implements ErrorAwareHTTPInterceptor, CompletionAwareHTTPInterceptor {
            async postError(error: Error): Promise<Response | undefined> {
                observed.push(`error:${error.message}`);
                return undefined;
            }

            postComplete(_request: Request, response: Response | ResponseError): void {
                observed.push(response instanceof ResponseError ? 'complete:error' : 'complete:response');
            }
        }

        const http = HTTP.create({
            baseURL: 'http://localhost/',
            interceptors: [new Observer()],
            requestTransforms: [
                () => {
                    throw new Error('transform failed');
                },
            ],
            fetch: async () => new Response('never reached'),
        });

        const response = await http.post('api/failing', {
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ value: 1 }),
        });

        expect(response).toBeInstanceOf(ResponseError);
        expect((response as ResponseError).message).toBe('transform failed');
        expect(observed).toEqual(['error:transform failed', 'complete:error']);
    });

    test('preserves url and drops the stale Content-Length on rebuild (HTT-REV-011)', async () => {
        server.use(
            mswHttp.get('http://localhost/transform/meta', () =>
                HttpResponse.json({ value: 1 }, { headers: { 'Content-Length': '11' } })
            )
        );

        const client = HTTP.create({
            baseURL: 'http://localhost/',
            responseTransforms: [(body: unknown) => body],
        });

        const response = await client.get('transform/meta');

        // The rebuilt response must keep the transport URL, not reset to ''.
        expect(response.url).toBe('http://localhost/transform/meta');
        // The transformed body invalidates the original length.
        expect(response.headers.get('content-length')).toBeNull();
    });

    test('isolates a throwing postComplete hook from the response (HTT-REV-010)', async () => {
        const completed: string[] = [];
        class ThrowingCompletion implements CompletionAwareHTTPInterceptor {
            postComplete(): void {
                throw new Error('completion boom');
            }
        }
        class Observer implements CompletionAwareHTTPInterceptor {
            postComplete(): void {
                completed.push('observed');
            }
        }

        const client = HTTP.create({
            baseURL: 'http://localhost/',
            interceptors: [new ThrowingCompletion(), new Observer()],
            fetch: async () => new Response('ok'),
        });

        const response = await client.get('api/completed');

        // Pre-fix the throw escaped postComplete, discarding the response and
        // preempting the later completion hook.
        expect(await response.text()).toBe('ok');
        expect(completed).toEqual(['observed']);
    });
});
