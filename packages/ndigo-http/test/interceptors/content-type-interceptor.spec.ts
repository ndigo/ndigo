/**
 * @module ndigo-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { ContentTypeInit, ContentTypeInterceptor } from '../../src/interceptors/content-type-interceptor';
import { MediaTypes } from '@ndigo/core';

class TestContentTypeInterceptor extends ContentTypeInterceptor {
    preInit(url: URL, settings: ContentTypeInit) {
        const proceed = super.preInit(url, settings);
        expect(proceed).toBe(true);
        if (settings.contentType && settings.headers instanceof Headers) {
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

    beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

    beforeEach(() => {
        http = new HTTP([new TestContentTypeInterceptor()]);
    });

    afterEach(() => {
        http = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    test('it should handle string media types', async () => {
        expect(http).toBeDefined();
        const response = await http?.request('http://localhost/contentType', {
            contentType: 'text/html',
        } as ContentTypeInit);
        expect(response).toBeDefined();
        const text = response ? await parseXML(response) : '';
        expect(text).toBe('<div id="foo">123</div>');
    });

    test('it should handle instance media types', async () => {
        expect(http).toBeDefined();
        const response = await http?.request('http://localhost/contentType', {
            contentType: MediaTypes.TEXT_HTML,
        } as ContentTypeInit);
        expect(response).toBeDefined();
        const text = response ? await parseXML(response) : '';
        expect(text).toBe('<div id="foo">123</div>');
    });

    test('it should overwrite the existing Content-Type header', async () => {
        expect(http).toBeDefined();
        const response = await http?.request('http://localhost/contentType', {
            contentType: 'text/html',
            headers: new Headers({
                'Content-type': 'application/json',
            }),
        } as ContentTypeInit);
        expect(response).toBeDefined();
        const text = response ? await parseXML(response) : '';
        expect(text).toBe('<div id="foo">123</div>');
    });

    test('it should ignore requests that lack a contentType setting', async () => {
        expect(http).toBeDefined();
        const response = await http?.request('http://localhost/contentType', {
            headers: new Headers({
                'Content-type': 'application/json',
            }),
        });
        expect(response).toBeDefined();
        const json = await response?.json();
        expect(json).toEqual({ foo: 123 });
    });
});
