import { worker } from '../_worker';
import { HTTP } from '../../src/http';
import { TimeoutInterceptor } from '../../src/interceptors/timeout-interceptor';
import ResponseError from '../../src/response-error';

class TestTimeoutInterceptor extends TimeoutInterceptor {
    preInit(url, settings) {
        const proceed = super.preInit(url, settings);
        expect(proceed).toBe(true);
        return proceed;
    }

    async postError(error, request) {
        const response = await super.postError(error, request);
        expect(response).toBeInstanceOf(ResponseError);
        return response;
    }

    async postComplete(request, response) {
        return super.postComplete(request, response);
    }
}

describe('TimeoutInterceptor', function () {
    let http, response;

    before(() => worker.start({ quiet: true }));

    beforeEach(function () {
        http = new HTTP([new TestTimeoutInterceptor(200)]);
    });

    afterEach(function () {
        response = http = void 0;
        worker.resetHandlers();
    });

    after(() => worker.stop());

    test('it should only handle valid timeouts', async function () {
        expect(() => (http = new HTTP([new TestTimeoutInterceptor(-200)]))).toThrow(TypeError);
    });

    test('it should handle timeouts', async function () {
        response = await http.request('/timeout/100');
        expect(await response.text()).toBe('');
        response = await http.request('/timeout/300');
        expect(response).toBeInstanceOf(ResponseError);
        expect(response.status).toBe(408);
        expect(response.statusText).toBe('Request Timeout');
    });

    test('it should handle timeout overrides', async function () {
        response = await http.request('/timeout/100', { timeout: 50 });
        expect(response).toBeInstanceOf(ResponseError);
        expect(response.status).toBe(408);
        expect(response.statusText).toBe('Request Timeout');
        response = await http.request('/timeout/300', { timeout: 350 });
        expect(await response.text()).toBe('');
    });
});
