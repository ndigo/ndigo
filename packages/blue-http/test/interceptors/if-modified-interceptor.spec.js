const { expect } = require('chai');
const { spy } = require('sinon');
import { eTag, lastModified, worker } from '../_worker';
import { HTTP } from '../../src/http';
import { IfModifiedInterceptor } from '../../src/interceptors/if-modified-interceptor';

class TestIfModifiedInterceptor extends IfModifiedInterceptor {
    constructor() {
        super();
        this.eTagSpy = spy();
        this.lastModifiedSpy = spy();
    }

    preInit(url, settings) {
        const proceed = super.preInit(url, settings),
            { headers } = settings;
        if (headers) {
            if (headers.has('If-Modified-Since')) {
                expect(headers.get('If-Modified-Since')).toBe(lastModified);
                this.eTagSpy();
            }
            if (headers.has('If-None-Match')) {
                expect(headers.get('If-None-Match')).toBe(eTag);
                this.lastModifiedSpy();
            }
        }
        expect(proceed).toBe(true);
        return proceed;
    }

    postResponse(response, settings) {
        return super.postResponse(response, settings);
    }
}

describe('IfModifiedInterceptor', function () {
    let http;

    before(() => worker.start({ quiet: true }));

    beforeEach(function () {
        http = new HTTP([new TestIfModifiedInterceptor()]);
    });

    afterEach(function () {
        http = void 0;
        worker.resetHandlers();
    });

    after(() => worker.stop());

    test('it should handle modification headers', async function () {
        await http.request('/ifModified', { ifModified: true });
        await http.request('/ifModified', { ifModified: true });
        const testInterceptor = http.interceptors[0];
        expect(testInterceptor.eTagSpy.called).toBe(true);
        expect(testInterceptor.lastModifiedSpy.called).toBe(true);
    });

    test('it should do nothing if turned off', async function () {
        await http.request('/ifModified', { ifModified: false });
        await http.request('/ifModified', { ifModified: false });
        const testInterceptor = http.interceptors[0];
        expect(testInterceptor.eTagSpy.called).toBe(false);
        expect(testInterceptor.lastModifiedSpy.called).toBe(false);
    });
});
