import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { TimeoutInit, TimeoutInterceptor } from '../../src/interceptors/timeout-interceptor';
import ResponseError from '../../src/response-error';

class TestTimeoutInterceptor extends TimeoutInterceptor {
    preInit(url: URL, settings: TimeoutInit) {
        const proceed = super.preInit(url, settings);
        expect(proceed).toBe(true);
        return proceed;
    }

    async postError(error: Error, request: Request) {
        const response = await super.postError(error, request);
        expect(response).toBeInstanceOf(ResponseError);
        return response;
    }

    async postComplete(request: Request, response: Response) {
        return super.postComplete(request, response);
    }
}

describe('TimeoutInterceptor', () => {
    let http: HTTP | undefined;
    let response: Response | undefined;

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        http = new HTTP([new TestTimeoutInterceptor(200)]);
    });

    afterEach(() => {
        response = http = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    test('it should only handle valid timeouts', async () => {
        expect(() => (http = new HTTP([new TestTimeoutInterceptor(-200)]))).toThrow(TypeError);
    });

    test.skip('it should handle timeouts', async () => {
        response = await http?.request('http://localhost/timeout/100');
        expect(await response?.text()).toBe('');
        response = await http?.request('http://localhost/timeout/300');
        expect(response).toBeInstanceOf(ResponseError);
        expect(response?.status).toBe(408);
        expect(response?.statusText).toBe('Request Timeout');
    });

    test.skip('it should handle timeout overrides', async () => {
        response = await http?.request('http://localhost/timeout/100', { timeout: 50 } as TimeoutInit);
        expect(response).toBeInstanceOf(ResponseError);
        expect(response?.status).toBe(408);
        expect(response?.statusText).toBe('Request Timeout');
        response = await http?.request('http://localhost/timeout/300', { timeout: 350 } as TimeoutInit);
        expect(await response?.text()).toBe('');
    });
});
