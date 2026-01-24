const { expect } = require('chai');
const { spy } = require('sinon');
import { worker } from '../_worker';
import { HTTP } from '../../src/http';
import { MappedResponseCodeHTTPInterceptor } from '../../src/interceptors/response-code-interceptor';

describe('ResponseCodeHTTPInterceptor', function () {
    let http, interceptor;

    before(() => worker.start({ quiet: true }));

    beforeEach(function () {
        interceptor = new MappedResponseCodeHTTPInterceptor({
            100: spy(),
            200: spy(),
            300: spy(),
            400: spy(),
            500: spy(),
        });
        http = new HTTP([interceptor]);
    });

    afterEach(function () {
        http = interceptor = void 0;
        worker.resetHandlers();
    });

    after(() => worker.stop());

    //! This does not work and I do not know why. -JBR
    xtest('it should handle informational responses', async function () {
        await http.request('/responseClass/100');
        const interceptor = http.interceptors[0].interceptor;
        expect(interceptor[100].called).toBe(true);
        expect(interceptor[200].called).toBe(false);
        expect(interceptor[300].called).toBe(false);
        expect(interceptor[400].called).toBe(false);
        expect(interceptor[500].called).toBe(false);
    });

    test('it should handle successful responses', async function () {
        await http.request('/responseClass/200');
        const interceptor = http.interceptors[0].interceptor;
        expect(interceptor[100].called).toBe(false);
        expect(interceptor[200].called).toBe(true);
        expect(interceptor[300].called).toBe(false);
        expect(interceptor[400].called).toBe(false);
        expect(interceptor[500].called).toBe(false);
    });

    test('it should handle redirect responses', async function () {
        await http.request('/responseClass/300');
        const interceptor = http.interceptors[0].interceptor;
        expect(interceptor[100].called).toBe(false);
        expect(interceptor[200].called).toBe(false);
        expect(interceptor[300].called).toBe(true);
        expect(interceptor[400].called).toBe(false);
        expect(interceptor[500].called).toBe(false);
    });

    test('it should handle client error responses', async function () {
        await http.request('/responseClass/400');
        const interceptor = http.interceptors[0].interceptor;
        expect(interceptor[100].called).toBe(false);
        expect(interceptor[200].called).toBe(false);
        expect(interceptor[300].called).toBe(false);
        expect(interceptor[400].called).toBe(true);
        expect(interceptor[500].called).toBe(false);
    });

    test('it should handle server error responses', async function () {
        await http.request('/responseClass/500');
        const interceptor = http.interceptors[0].interceptor;
        expect(interceptor[100].called).toBe(false);
        expect(interceptor[200].called).toBe(false);
        expect(interceptor[300].called).toBe(false);
        expect(interceptor[400].called).toBe(false);
        expect(interceptor[500].called).toBe(true);
    });
});
