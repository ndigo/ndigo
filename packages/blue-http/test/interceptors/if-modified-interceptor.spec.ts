import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { eTag, lastModified, server } from '../_worker';
import { HTTP } from '../../src/http';
import { IfModifiedInterceptor } from '../../src/interceptors/if-modified-interceptor';

class TestIfModifiedInterceptor extends IfModifiedInterceptor {
    eTagSpy = vi.fn();
    lastModifiedSpy = vi.fn();

    constructor() {
        super();
    }

    preInit(url: URL, settings?: any) {
        const proceed = super.preInit(url, settings);
        const { headers } = settings;
        if (headers) {
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

    postResponse(response: Response, settings?: any) {
        return super.postResponse(response, settings);
    }
}

describe('IfModifiedInterceptor', () => {
    let http: HTTP | undefined;

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        http = new HTTP([new TestIfModifiedInterceptor() as any]);
    });

    afterEach(() => {
        http = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    test.skip('it should handle modification headers', async () => {
        await http!.request('http://localhost/ifModified', { ifModified: true } as any);
        await http!.request('http://localhost/ifModified', { ifModified: true } as any);
        const testInterceptor = http!.interceptors[0] as TestIfModifiedInterceptor;
        expect(testInterceptor.eTagSpy).toHaveBeenCalled();
        expect(testInterceptor.lastModifiedSpy).toHaveBeenCalled();
    });

    test('it should do nothing if turned off', async () => {
        await http!.request('http://localhost/ifModified', { ifModified: false } as any);
        await http!.request('http://localhost/ifModified', { ifModified: false } as any);
        const testInterceptor = http!.interceptors[0] as TestIfModifiedInterceptor;
        expect(testInterceptor.eTagSpy).not.toHaveBeenCalled();
        expect(testInterceptor.lastModifiedSpy).not.toHaveBeenCalled();
    });
});
