/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP, type ResponseAwareHTTPInterceptor } from '../../src/http';
import {
    ResponseTypeInit,
    ResponseTypeSettings,
    ResponseTypeInterceptor,
} from '../../src/interceptors/response-type-interceptor';
import { MediaTypes } from '@blue/core';

class TestResponseTypeInterceptor extends ResponseTypeInterceptor {
    preInit(url: URL, settings: ResponseTypeInit) {
        const proceed = super.preInit(url, settings);
        expect(proceed).toBe(true);
        return proceed;
    }

    async postResponse(response: Response, settings: ResponseTypeSettings) {
        return super.postResponse(response, settings);
    }
}

describe('ResponseTypeInterceptor', () => {
    let http: HTTP | undefined;
    let response: (Response & { data?: unknown }) | undefined;

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        http = new HTTP([new TestResponseTypeInterceptor()]);
    });

    afterEach(() => {
        response = http = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    test('it should report bad response types', async () => {
        const interceptor = new TestResponseTypeInterceptor();

        // Deliberately invalid responseType (0) to exercise the preInit guard.
        http = new HTTP([interceptor], { responseType: 0 } as unknown as ResponseTypeInit);
        try {
            await http.request('http://localhost/responseType/');
            expect(true).toBe(false);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    test('it should handle different response types', async () => {
        expect(http).toBeDefined();
        response = await http?.request('http://localhost/responseType/application/pdf', {
            responseType: 'application/pdf',
        } as ResponseTypeInit);
        expect(response).toBeDefined();
        expect(response).toHaveProperty('data');
        expect(response?.data).toBeInstanceOf(Blob);

        response = await http?.request('http://localhost/responseType/image/gif', {
            responseType: MediaTypes.IMAGE_GIF,
        } as ResponseTypeInit);
        expect(response).toBeDefined();
        expect(response).toHaveProperty('data');
        expect(response?.data).toBeInstanceOf(Blob);

        response = await http?.request('http://localhost/responseType/image/jpeg', {
            responseType: MediaTypes.IMAGE_JPEG,
        } as ResponseTypeInit);
        expect(response).toBeDefined();
        expect(response).toHaveProperty('data');
        expect(response?.data).toBeInstanceOf(Blob);

        response = await http?.request('http://localhost/responseType/image/png', {
            responseType: MediaTypes.IMAGE_PNG,
        } as ResponseTypeInit);
        expect(response).toBeDefined();
        expect(response).toHaveProperty('data');
        expect(response?.data).toBeInstanceOf(Blob);

        response = await http?.request('http://localhost/responseType/text/html', {
            responseType: 'text/html',
        } as ResponseTypeInit);
        expect(response).toBeDefined();
        expect(response).toHaveProperty('data');
        expect(response?.data).toBeInstanceOf(Document);

        response = await http?.request('http://localhost/responseType/text/xml', {
            responseType: 'text/xml',
        } as ResponseTypeInit);
        expect(response).toBeDefined();
        expect(response).toHaveProperty('data');
        expect(response?.data).toBeInstanceOf(Document);
    });

    test('it should handle custom parsers', async () => {
        expect(http).toBeDefined();
        response = await http?.request('http://localhost/responseType/text/foo', {
            responseType: 'text/foo',
            responseParsers: {
                'text/foo': (mediaType: string) => async (response: Response) => await response.text(),
            },
        } as ResponseTypeInit);

        expect(response).toBeDefined();
        expect(response).toHaveProperty('data', 'foo=123');
    });

    test('parses via a clone so later interceptors can still read the body (HTT-REV-003)', async () => {
        const seen: string[] = [];
        class Reader implements ResponseAwareHTTPInterceptor {
            async postResponse(response: Response): Promise<Response | void> {
                // Pre-fix, ResponseType consumed the live body, so this clone
                // threw "Body is unusable" and the request rejected.
                seen.push(await response.clone().text());
                return response;
            }
        }

        const client = new HTTP(
            [new ResponseTypeInterceptor(), new Reader()],
            {},
            async () => new Response('payload-body', { headers: { 'content-type': 'text/plain' } })
        );

        const result = (await client.request('http://localhost/responseType/plain', {
            responseType: 'text/plain',
        } as ResponseTypeInit)) as Response & { data?: unknown };

        expect(result.data).toBe('payload-body');
        expect(seen).toEqual(['payload-body']);
        // The caller's own read still works too.
        expect(await result.text()).toBe('payload-body');
    });
});
