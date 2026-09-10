import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { MappedResponseCodeHTTPInterceptor } from '../../src/interceptors/response-code-interceptor';

describe('ResponseCodeHTTPInterceptor', () => {
    let http: HTTP | undefined;
    let interceptor: MappedResponseCodeHTTPInterceptor | undefined;
    let handlers: Record<number, ReturnType<typeof vi.fn>>;

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    beforeEach(() => {
        handlers = {
            100: vi.fn(),
            200: vi.fn(),
            300: vi.fn(),
            400: vi.fn(),
            500: vi.fn(),
        };
        interceptor = new MappedResponseCodeHTTPInterceptor(handlers);
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
