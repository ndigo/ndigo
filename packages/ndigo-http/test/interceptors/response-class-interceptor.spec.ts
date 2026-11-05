/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { server } from '../_worker';
import { HTTP, type HTTPInit } from '../../src/http';
import {
    MappedResponseClassHTTPInterceptor,
    ResponseClassAwareHTTPInterceptor,
} from '../../src/interceptors/response-class-interceptor';

/**
 * Builds a `Response` carrying an informational (1xx) status.
 *
 * The WHATWG `Response` constructor rejects statuses outside 200-599, and msw
 * cannot surface a 1xx to the client — under msw 3 the fetch never settles
 * (probe-verified 2026-10-31 on Node 22 and 24). The accessors are overridden
 * on a real `Response` so the classifier sees a faithful 100 case.
 */
function informationalResponse(): Response {
    const response = new Response(null, { status: 200 });
    Object.defineProperty(response, 'ok', { value: false });
    Object.defineProperty(response, 'status', { value: 100 });
    Object.defineProperty(response, 'statusText', { value: 'Continue' });
    return response;
}

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

    beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

    beforeEach(() => {
        hooks = {
            postInformationalResponse: vi.fn(),
            postSuccessfulResponse: vi.fn(),
            postRedirectResponse: vi.fn(),
            postClientErrorResponse: vi.fn(),
            postServerErrorResponse: vi.fn(),
        };
        interceptor = new MappedResponseClassHTTPInterceptor(hooks as unknown as ResponseClassAwareHTTPInterceptor);
        http = new HTTP([interceptor]);
    });

    afterEach(() => {
        http = interceptor = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    // The informational branch is exercised directly (msw 3 cannot surface 1xx;
    // see `informationalResponse`); the remaining classes run through msw.
    test('it should handle informational responses', async () => {
        await interceptor?.postResponse(informationalResponse(), {} as HTTPInit);
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
