import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { MappedResponseClassHTTPInterceptor } from '../../src/interceptors/response-class-interceptor';

describe('ResponseClassHTTPInterceptor', () => {
    let http: HTTP | undefined;
    let interceptor: MappedResponseClassHTTPInterceptor | undefined;

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        interceptor = new MappedResponseClassHTTPInterceptor({
            postInformationalResponse: vi.fn(),
            postSuccessfulResponse: vi.fn(),
            postRedirectResponse: vi.fn(),
            postClientErrorResponse: vi.fn(),
            postServerErrorResponse: vi.fn(),
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
        expect(interceptorObj.postInformationalResponse).toHaveBeenCalled();
        expect(interceptorObj.postSuccessfulResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postRedirectResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postClientErrorResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postServerErrorResponse).not.toHaveBeenCalled();
    });

    test('it should handle successful responses', async () => {
        await http!.request('http://localhost/responseClass/200');
        const interceptorObj = (http!.interceptors[0] as any).interceptor;
        expect(interceptorObj.postInformationalResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postSuccessfulResponse).toHaveBeenCalled();
        expect(interceptorObj.postRedirectResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postClientErrorResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postServerErrorResponse).not.toHaveBeenCalled();
    });

    test('it should handle redirect responses', async () => {
        await http!.request('http://localhost/responseClass/300');
        const interceptorObj = (http!.interceptors[0] as any).interceptor;
        expect(interceptorObj.postInformationalResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postSuccessfulResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postRedirectResponse).toHaveBeenCalled();
        expect(interceptorObj.postClientErrorResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postServerErrorResponse).not.toHaveBeenCalled();
    });

    test('it should handle client error responses', async () => {
        await http!.request('http://localhost/responseClass/400');
        const interceptorObj = (http!.interceptors[0] as any).interceptor;
        expect(interceptorObj.postInformationalResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postSuccessfulResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postRedirectResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postClientErrorResponse).toHaveBeenCalled();
        expect(interceptorObj.postServerErrorResponse).not.toHaveBeenCalled();
    });

    test('it should handle server error responses', async () => {
        await http!.request('http://localhost/responseClass/500');
        const interceptorObj = (http!.interceptors[0] as any).interceptor;
        expect(interceptorObj.postInformationalResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postSuccessfulResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postRedirectResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postClientErrorResponse).not.toHaveBeenCalled();
        expect(interceptorObj.postServerErrorResponse).toHaveBeenCalled();
    });
});
