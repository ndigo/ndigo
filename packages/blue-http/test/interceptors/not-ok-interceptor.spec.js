import { worker } from '../_worker';
import { HTTP } from '../../src/http';
import { NotOKInterceptor } from '../../src/interceptors/not-ok-interceptor';
import ResponseError from '../../src/response-error';

describe('NotOKInterceptor', function () {
    let http;

    before(() => worker.start({ quiet: true }));

    beforeEach(function () {
        http = new HTTP([new NotOKInterceptor()]);
    });

    afterEach(function () {
        http = void 0;
        worker.resetHandlers();
    });

    after(() => worker.stop());

    test('it should reject when response is not okay', async function () {
        let response;

        try {
            response = await http.request('/notOK');
        } catch (error) {
            response = error;
        }

        expect(response).toBeInstanceOf(ResponseError);
        expect(response).toHaveProperty('message').that.equals('Status Code is not 200-299');
        expect(response).toHaveProperty('type').that.equals('error');
        expect(response).toHaveProperty('ok').that.is.false;
    });
});
