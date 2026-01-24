import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { MappedResponseCodeHTTPInterceptor } from '../../src/interceptors/response-code-interceptor';

describe('ResponseCodeHTTPInterceptor', () => {
    let http: HTTP | undefined;
    let interceptor: MappedResponseCodeHTTPInterceptor | undefined;

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        interceptor = new MappedResponseCodeHTTPInterceptor({
            100: vi.fn(),
            200: vi.fn(),
            300: vi.fn(),
            400: vi.fn(),
            500: vi.fn(),
        });
        http = new HTTP([interceptor as any]);
    });

    afterEach(() => {
        http = interceptor = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    //! This does not work and I do not know why. -JBR
    test.skip('it should handle informational responses', async () => {
        await http!.request('http://localhost/responseClass/100');
        const interceptorObj = (http!.interceptors[0] as any).interceptor;
        expect(interceptorObj[100]).toHaveBeenCalled();
        expect(interceptorObj[200]).not.toHaveBeenCalled();
        expect(interceptorObj[300]).not.toHaveBeenCalled();
        expect(interceptorObj[400]).not.toHaveBeenCalled();
        expect(interceptorObj[500]).not.toHaveBeenCalled();
    });

    test('it should handle successful responses', async () => {
        await http!.request('http://localhost/responseClass/200');
        const interceptorObj = (http!.interceptors[0] as any).interceptor;
        expect(interceptorObj[100]).not.toHaveBeenCalled();
        expect(interceptorObj[200]).toHaveBeenCalled();
        expect(interceptorObj[300]).not.toHaveBeenCalled();
        expect(interceptorObj[400]).not.toHaveBeenCalled();
        expect(interceptorObj[500]).not.toHaveBeenCalled();
    });

    test('it should handle redirect responses', async () => {
        await http!.request('http://localhost/responseClass/300');
        const interceptorObj = (http!.interceptors[0] as any).interceptor;
        expect(interceptorObj[100]).not.toHaveBeenCalled();
        expect(interceptorObj[200]).not.toHaveBeenCalled();
        expect(interceptorObj[300]).toHaveBeenCalled();
        expect(interceptorObj[400]).not.toHaveBeenCalled();
        expect(interceptorObj[500]).not.toHaveBeenCalled();
    });

    test('it should handle client error responses', async () => {
        await http!.request('http://localhost/responseClass/400');
        const interceptorObj = (http!.interceptors[0] as any).interceptor;
        expect(interceptorObj[100]).not.toHaveBeenCalled();
        expect(interceptorObj[200]).not.toHaveBeenCalled();
        expect(interceptorObj[300]).not.toHaveBeenCalled();
        expect(interceptorObj[400]).toHaveBeenCalled();
        expect(interceptorObj[500]).not.toHaveBeenCalled();
    });

    test('it should handle server error responses', async () => {
        await http!.request('http://localhost/responseClass/500');
        const interceptorObj = (http!.interceptors[0] as any).interceptor;
        expect(interceptorObj[100]).not.toHaveBeenCalled();
        expect(interceptorObj[200]).not.toHaveBeenCalled();
        expect(interceptorObj[300]).not.toHaveBeenCalled();
        expect(interceptorObj[400]).not.toHaveBeenCalled();
        expect(interceptorObj[500]).toHaveBeenCalled();
    });
});
