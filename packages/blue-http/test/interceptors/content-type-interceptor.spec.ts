import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { ContentTypeInterceptor } from '../../src/interceptors/content-type-interceptor';
import { MediaTypes } from '@blue/core';

class TestContentTypeInterceptor extends ContentTypeInterceptor {
    preInit(url: URL, settings?: any) {
        const proceed = super.preInit(url, settings);
        expect(proceed).toBe(true);
        if (settings.contentType) {
            expect(settings.headers.get('Content-Type')).toBe('text/html');
        }
        return proceed;
    }
}

const parseXML = async (response: Response) => {
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    const result = new XMLSerializer().serializeToString(doc);
    return result;
};

describe('ContentTypeInterceptor', () => {
    let http: HTTP | undefined;

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        http = new HTTP([new TestContentTypeInterceptor() as any]);
    });

    afterEach(() => {
        http = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    test('it should handle string media types', async () => {
        const response = await http!.request('http://localhost/contentType', {
            contentType: 'text/html',
        } as any);
        const text = await parseXML(response);
        expect(text).toBe('<div id="foo">123</div>');
    });

    test('it should handle instance media types', async () => {
        const response = await http!.request('http://localhost/contentType', {
            contentType: MediaTypes.TEXT_HTML,
        } as any);
        const text = await parseXML(response);
        expect(text).toBe('<div id="foo">123</div>');
    });

    test('it should overwrite the existing Content-Type header', async () => {
        const response = await http!.request('http://localhost/contentType', {
            contentType: 'text/html',
            headers: new Headers({
                'Content-type': 'application/json',
            }),
        } as any);
        const text = await parseXML(response);
        expect(text).toBe('<div id="foo">123</div>');
    });

    test('it should ignore requests that lack a contentType setting', async () => {
        const response = await http!.request('http://localhost/contentType', {
            headers: new Headers({
                'Content-type': 'application/json',
            }),
        });
        const json = await response.json();
        expect(json).toEqual({ foo: 123 });
    });
});
