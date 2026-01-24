import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { ResponseTypeInterceptor } from '../../src/interceptors/response-type-interceptor';
import { MediaTypes } from '@blue/core';

class TestResponseTypeInterceptor extends ResponseTypeInterceptor {
    preInit(url: URL, settings?: any) {
        const proceed = super.preInit(url, settings);
        expect(proceed).toBe(true);
        return proceed;
    }

    async postResponse(response: Response, settings?: any) {
        return super.postResponse(response, settings);
    }
}

describe('ResponseTypeInterceptor', () => {
    let http: HTTP | undefined;
    let response: any;

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        http = new HTTP([new TestResponseTypeInterceptor() as any]);
    });

    afterEach(() => {
        response = http = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    test('it should report bad response types', async () => {
        const interceptor = new TestResponseTypeInterceptor();

        http = new HTTP([interceptor as any], { responseType: 0 } as any);
        try {
            await http.request('http://localhost/responseType/');
            expect(true).toBe(false);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    test('it should handle different response types', async () => {
        response = await http!.request('http://localhost/responseType/application/pdf', {
            responseType: 'application/pdf',
        } as any);

        expect(response).toHaveProperty('data');
        expect(response.data).toBeInstanceOf(Blob);

        response = await http!.request('http://localhost/responseType/image/gif', {
            responseType: MediaTypes.IMAGE_GIF,
        } as any);

        expect(response).toHaveProperty('data');
        expect(response.data).toBeInstanceOf(Blob);

        response = await http!.request('http://localhost/responseType/image/jpeg', {
            responseType: MediaTypes.IMAGE_JPEG,
        } as any);

        expect(response).toHaveProperty('data');
        expect(response.data).toBeInstanceOf(Blob);

        response = await http!.request('http://localhost/responseType/image/png', {
            responseType: MediaTypes.IMAGE_PNG,
        } as any);

        expect(response).toHaveProperty('data');
        expect(response.data).toBeInstanceOf(Blob);

        response = await http!.request('http://localhost/responseType/text/html', {
            responseType: 'text/html',
        } as any);

        expect(response).toHaveProperty('data');
        expect(response.data).toBeInstanceOf(Document);

        response = await http!.request('http://localhost/responseType/text/xml', {
            responseType: 'text/xml',
        } as any);

        expect(response).toHaveProperty('data');
        expect(response.data).toBeInstanceOf(Document);
    });

    test('it should handle custom parsers', async () => {
        response = await http!.request('http://localhost/responseType/text/foo', {
            responseType: 'text/foo',
            responseParsers: {
                'text/foo': (mediaType: any) => async (response: Response) => await response.text(),
            },
        } as any);

        expect(response).toHaveProperty('data', 'foo=123');
    });
});
