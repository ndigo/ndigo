import { describe, expect, test } from 'vitest';
import { HTTP } from '../../src/http';
import type { TransformContext } from '../../src/transformers/http-transformer';

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
});
