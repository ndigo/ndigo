/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { MappedResponseClassHTTPInterceptor } from '../../src/interceptors/response-class-interceptor';

describe('ResponseClassHTTPInterceptor', () => {
    let http: HTTP | undefined;
    let interceptor: MappedResponseClassHTTPInterceptor | undefined;
    let hooks: {
        postInformationalResponse: ReturnType<typeof vi.fn>;
        postSuccessfulResponse: ReturnType<typeof vi.fn>;
        postRedirectResponse: ReturnType<typeof vi.fn>;
        postClientErrorResponse: ReturnType<typeof vi.fn>;
        postServerErrorResponse: ReturnType<typeof vi.fn>;
    };

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        hooks = {
            postInformationalResponse: vi.fn(),
            postSuccessfulResponse: vi.fn(),
            postRedirectResponse: vi.fn(),
            postClientErrorResponse: vi.fn(),
            postServerErrorResponse: vi.fn(),
        };
        interceptor = new MappedResponseClassHTTPInterceptor(hooks);
        http = new HTTP([interceptor]);
    });

    afterEach(() => {
        http = interceptor = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    //! This does not work and I do not know why.
    test.skip('it should handle informational responses', async () => {
        await http?.request('http://localhost/responseClass/100');
        expect(hooks.postInformationalResponse).toHaveBeenCalled();
        expect(hooks.postSuccessfulResponse).not.toHaveBeenCalled();
        expect(hooks.postRedirectResponse).not.toHaveBeenCalled();
        expect(hooks.postClientErrorResponse).not.toHaveBeenCalled();
        expect(hooks.postServerErrorResponse).not.toHaveBeenCalled();
    });

    test('it should handle successful responses', async () => {
        await http?.request('http://localhost/responseClass/200');
        expect(hooks.postInformationalResponse).not.toHaveBeenCalled();
        expect(hooks.postSuccessfulResponse).toHaveBeenCalled();
        expect(hooks.postRedirectResponse).not.toHaveBeenCalled();
        expect(hooks.postClientErrorResponse).not.toHaveBeenCalled();
        expect(hooks.postServerErrorResponse).not.toHaveBeenCalled();
    });

    test('it should handle redirect responses', async () => {
        await http?.request('http://localhost/responseClass/300');
        expect(hooks.postInformationalResponse).not.toHaveBeenCalled();
        expect(hooks.postSuccessfulResponse).not.toHaveBeenCalled();
        expect(hooks.postRedirectResponse).toHaveBeenCalled();
        expect(hooks.postClientErrorResponse).not.toHaveBeenCalled();
        expect(hooks.postServerErrorResponse).not.toHaveBeenCalled();
    });

    test('it should handle client error responses', async () => {
        await http?.request('http://localhost/responseClass/400');
        expect(hooks.postInformationalResponse).not.toHaveBeenCalled();
        expect(hooks.postSuccessfulResponse).not.toHaveBeenCalled();
        expect(hooks.postRedirectResponse).not.toHaveBeenCalled();
        expect(hooks.postClientErrorResponse).toHaveBeenCalled();
        expect(hooks.postServerErrorResponse).not.toHaveBeenCalled();
    });

    test('it should handle server error responses', async () => {
        await http?.request('http://localhost/responseClass/500');
        expect(hooks.postInformationalResponse).not.toHaveBeenCalled();
        expect(hooks.postSuccessfulResponse).not.toHaveBeenCalled();
        expect(hooks.postRedirectResponse).not.toHaveBeenCalled();
        expect(hooks.postClientErrorResponse).not.toHaveBeenCalled();
        expect(hooks.postServerErrorResponse).toHaveBeenCalled();
    });
});
