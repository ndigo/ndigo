import { worker } from '../_worker';
import { HTTP } from '../../src/http';
import { ResponseTypeInterceptor } from '../../src/interceptors/response-type-interceptor';
import { MediaTypes } from '@blue/core';

class TestResponseTypeInterceptor extends ResponseTypeInterceptor {
    preInit(url, settings) {
        const proceed = super.preInit(url, settings);
        expect(proceed).toBe(true);
        return proceed;
    }

    async postResponse(response, settings) {
        return super.postResponse(response, settings);
    }
}

describe('ResponseTypeInterceptor', function () {
    let http, response;

    before(() => worker.start({ quiet: true }));

    beforeEach(function () {
        http = new HTTP([new TestResponseTypeInterceptor()]);
    });

    afterEach(function () {
        response = http = void 0;
        worker.resetHandlers();
    });

    after(() => worker.stop());

    test('it should report bad response types', async function () {
        const interceptor = new TestResponseTypeInterceptor();

        http = new HTTP([interceptor], { responseType: 0 });
        try {
            await http.request('/responseType/');
            expect(true).toBe(false);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    test('it should handle different response types', async function () {
        response = await http.request('/responseType/application/pdf', {
            responseType: 'application/pdf',
        });

        expect(response).to.have.ownProperty('data').that.is.instanceOf(Blob);

        response = await http.request('/responseType/image/gif', {
            responseType: MediaTypes.IMAGE_GIF,
        });

        expect(response).to.have.ownProperty('data').that.is.instanceOf(Blob);

        response = await http.request('/responseType/image/jpeg', {
            responseType: MediaTypes.IMAGE_JPEG,
        });

        expect(response).to.have.ownProperty('data').that.is.instanceOf(Blob);

        response = await http.request('/responseType/image/png', {
            responseType: MediaTypes.IMAGE_PNG,
        });

        expect(response).to.have.ownProperty('data').that.is.instanceOf(Blob);

        response = await http.request('/responseType/text/html', {
            responseType: 'text/html',
        });

        expect(response).to.have.ownProperty('data').that.is.instanceOf(Document);

        response = await http.request('/responseType/text/xml', {
            responseType: 'text/xml',
        });

        expect(response).to.have.ownProperty('data').that.is.instanceOf(Document);
    });

    test('it should handle custom parsers', async function () {
        response = await http.request('/responseType/text/foo', {
            responseType: 'text/foo',
            responseParsers: {
                'text/foo': (mediaType) => async (response) => await response.text(),
            },
        });

        expect(response).to.have.ownProperty('data').that.equals('foo=123');
    });
});
