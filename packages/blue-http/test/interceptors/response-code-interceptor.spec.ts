/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { server } from '../_worker';
import { HTTP, type HTTPInit } from '../../src/http';
import {
    MappedResponseCodeHTTPInterceptor,
    ResponseCodeAwareHTTPInterceptor,
} from '../../src/interceptors/response-code-interceptor';

/**
 * Builds a `Response` carrying an informational (1xx) status.
 *
 * The WHATWG `Response` constructor rejects statuses outside 200-599, and msw
 * cannot surface a 1xx to the client — under msw 3 the fetch never settles
 * (probe-verified 2026-10-31 on Node 22 and 24). The accessors are overridden
 * on a real `Response` so the numeric-code map sees a faithful 100 case.
 */
function informationalResponse(): Response {
    const response = new Response(null, { status: 200 });
    Object.defineProperty(response, 'ok', { value: false });
    Object.defineProperty(response, 'status', { value: 100 });
    Object.defineProperty(response, 'statusText', { value: 'Continue' });
    return response;
}

describe('ResponseCodeHTTPInterceptor', () => {
    let http: HTTP | undefined;
    let interceptor: MappedResponseCodeHTTPInterceptor | undefined;
    let handlers: Record<number, ReturnType<typeof vi.fn>>;

    beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

    beforeEach(() => {
        handlers = {
            100: vi.fn(),
            200: vi.fn(),
            300: vi.fn(),
            400: vi.fn(),
            500: vi.fn(),
        };
        interceptor = new MappedResponseCodeHTTPInterceptor(handlers as unknown as ResponseCodeAwareHTTPInterceptor);
        http = new HTTP([interceptor]);
    });

    afterEach(() => {
        http = interceptor = undefined;
        server.resetHandlers();
    });

    afterAll(() => server.close());

    // The informational branch is exercised directly (msw 3 cannot surface 1xx;
    // see `informationalResponse`); the remaining codes run through msw.
    test('it should handle informational responses', async () => {
        await interceptor?.postResponse(informationalResponse(), {} as HTTPInit);
        expect(handlers[100]).toHaveBeenCalled();
        expect(handlers[200]).not.toHaveBeenCalled();
        expect(handlers[300]).not.toHaveBeenCalled();
        expect(handlers[400]).not.toHaveBeenCalled();
        expect(handlers[500]).not.toHaveBeenCalled();
    });

    test('it should handle successful responses', async () => {
        await http?.request('http://localhost/responseClass/200');
        expect(handlers[100]).not.toHaveBeenCalled();
        expect(handlers[200]).toHaveBeenCalled();
        expect(handlers[300]).not.toHaveBeenCalled();
        expect(handlers[400]).not.toHaveBeenCalled();
        expect(handlers[500]).not.toHaveBeenCalled();
    });

    test('it should handle redirect responses', async () => {
        await http?.request('http://localhost/responseClass/300');
        expect(handlers[100]).not.toHaveBeenCalled();
        expect(handlers[200]).not.toHaveBeenCalled();
        expect(handlers[300]).toHaveBeenCalled();
        expect(handlers[400]).not.toHaveBeenCalled();
        expect(handlers[500]).not.toHaveBeenCalled();
    });

    test('it should handle client error responses', async () => {
        await http?.request('http://localhost/responseClass/400');
        expect(handlers[100]).not.toHaveBeenCalled();
        expect(handlers[200]).not.toHaveBeenCalled();
        expect(handlers[300]).not.toHaveBeenCalled();
        expect(handlers[400]).toHaveBeenCalled();
        expect(handlers[500]).not.toHaveBeenCalled();
    });

    test('it should handle server error responses', async () => {
        await http?.request('http://localhost/responseClass/500');
        expect(handlers[100]).not.toHaveBeenCalled();
        expect(handlers[200]).not.toHaveBeenCalled();
        expect(handlers[300]).not.toHaveBeenCalled();
        expect(handlers[400]).not.toHaveBeenCalled();
        expect(handlers[500]).toHaveBeenCalled();
    });
});
