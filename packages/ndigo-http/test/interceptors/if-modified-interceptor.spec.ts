/**
 * @module ndigo-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { eTag, lastModified, server } from '../_worker';
import { HTTP } from '../../src/http';
import { IfModifiedInit, IfModifiedInterceptor } from '../../src/interceptors/if-modified-interceptor';

class TestIfModifiedInterceptor extends IfModifiedInterceptor {
    eTagSpy = vi.fn();
    lastModifiedSpy = vi.fn();

    constructor() {
        super();
    }

    preInit(url: URL, settings: IfModifiedInit) {
        const proceed = super.preInit(url, settings);
        const { headers } = settings;
        if (headers instanceof Headers) {
            if (headers.has('If-Modified-Since')) {
                expect(headers.get('If-Modified-Since')).toBe(lastModified);
                this.lastModifiedSpy();
            }
            if (headers.has('If-None-Match')) {
                expect(headers.get('If-None-Match')).toBe(eTag);
                this.eTagSpy();
            }
        }
        expect(proceed).toBe(true);
        return proceed;
    }

    postResponse(response: Response, settings: IfModifiedInit): Promise<void> {
        return super.postResponse(response, settings);
    }
}

describe('IfModifiedInterceptor', () => {
    let http: HTTP | undefined;

    beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

    beforeEach(() => {
        http = new HTTP([new TestIfModifiedInterceptor()]);
    });

    afterEach(() => {
        http = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    // Un-skipped (TST-C): the conditional-request round trip — first response caches
    // ETag/Last-Modified, the second sends If-None-Match/If-Modified-Since — passes
    // against the current interceptor and MSW 2.x; the skip was stale.
    test('it should handle modification headers', async () => {
        await http?.request('http://localhost/ifModified', { ifModified: true } as IfModifiedInit);
        await http?.request('http://localhost/ifModified', { ifModified: true } as IfModifiedInit);
        const testInterceptor = http?.interceptors[0] as TestIfModifiedInterceptor | undefined;
        expect(testInterceptor?.eTagSpy).toHaveBeenCalled();
        expect(testInterceptor?.lastModifiedSpy).toHaveBeenCalled();
    });

    test('it should do nothing if turned off', async () => {
        await http?.request('http://localhost/ifModified', { ifModified: false } as IfModifiedInit);
        await http?.request('http://localhost/ifModified', { ifModified: false } as IfModifiedInit);
        const testInterceptor = http?.interceptors[0] as TestIfModifiedInterceptor | undefined;
        expect(testInterceptor?.eTagSpy).not.toHaveBeenCalled();
        expect(testInterceptor?.lastModifiedSpy).not.toHaveBeenCalled();
    });
});
