/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { HTTP } from '../../src/http';
import type { TransformContext } from '../../src/transformers/http-transformer';
import { TimeoutInterceptor } from '../../src/interceptors/timeout-interceptor';

describe('TransformInterceptor', () => {
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
});
