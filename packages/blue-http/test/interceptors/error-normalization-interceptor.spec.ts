import { describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { ErrorNormalizationInterceptor } from '../../src/interceptors/error-normalization-interceptor';
import ResponseError from '../../src/response-error';

describe('ErrorNormalizationInterceptor', () => {
    beforeAll(() => server.listen());
    afterAll(() => server.close());
    afterEach(() => server.resetHandlers());

    test('should succeed for successful responses', async () => {
        const http = new HTTP();
        const response = await http.request('http://localhost/request');
        expect(response.status).toBe(200);
    });

    test('should throw ResponseError for HTTP error responses', async () => {
        const http = new HTTP([new ErrorNormalizationInterceptor()]);
        const response = await http.request('http://localhost/notOK');
        expect(response).toBeInstanceOf(ResponseError);
        expect((response as ResponseError).message).toContain('HTTP Error: 404 Not Found');
    });

    test('should normalize network errors to ResponseError with default type', async () => {
        const interceptor = new ErrorNormalizationInterceptor();
        try {
            await interceptor.postError(new Error('fail'), new Request('http://localhost/test'), new HTTP());
            expect.fail('Expected ResponseError to be thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(ResponseError);
            expect((error as ResponseError).message).toBe('NETWORK_ERROR');
        }
    });

    test('should normalize network errors with custom default error type', async () => {
        const interceptor = new ErrorNormalizationInterceptor({
            defaultErrorType: 'CUSTOM_ERROR',
        });
        try {
            await interceptor.postError(new Error('fail'), new Request('http://localhost/test'), new HTTP());
            expect.fail('Expected ResponseError to be thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(ResponseError);
            expect((error as ResponseError).message).toBe('CUSTOM_ERROR');
        }
    });

    test('should return undefined for existing ResponseErrors', async () => {
        const interceptor = new ErrorNormalizationInterceptor();
        const result = await interceptor.postError(
            new ResponseError(undefined, 'EXISTING_ERROR'),
            new Request('http://localhost/test'),
            new HTTP()
        );
        expect(result).toBeUndefined();
    });
});
