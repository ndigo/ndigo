/**
 */
import { describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP, type ErrorAwareHTTPInterceptor } from '../../src/http';
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
        const result = await interceptor.postError(new Error('fail'), new Request('http://localhost/test'), new HTTP());
        expect(result).toBeInstanceOf(ResponseError);
        expect((result as ResponseError).message).toBe('NETWORK_ERROR');
    });

    test('should normalize network errors with custom default error type', async () => {
        const interceptor = new ErrorNormalizationInterceptor({
            defaultErrorType: 'CUSTOM_ERROR',
        });
        const result = await interceptor.postError(new Error('fail'), new Request('http://localhost/test'), new HTTP());
        expect(result).toBeInstanceOf(ResponseError);
        expect((result as ResponseError).message).toBe('CUSTOM_ERROR');
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

    test('preserves the original failure as the cause (HTT-REV-008)', async () => {
        const interceptor = new ErrorNormalizationInterceptor();
        const cause = new TypeError('fetch failed');
        const result = (await interceptor.postError(
            cause,
            new Request('http://localhost/test'),
            new HTTP()
        )) as ResponseError;
        expect(result.cause).toBe(cause);
        expect(result.stack).toBe(cause.stack);
    });

    test('does not throw, so later error-aware interceptors still run (HTT-REV-008)', async () => {
        const observed: string[] = [];
        class Observer implements ErrorAwareHTTPInterceptor {
            async postError(): Promise<Response | undefined> {
                observed.push('observed');
                return undefined;
            }
        }
        const http = new HTTP([new ErrorNormalizationInterceptor(), new Observer()], {}, async () => {
            throw new TypeError('fetch failed');
        });

        const result = await http.request('http://localhost/normalized');
        // Pre-fix, postError threw and preempted Observer; now the chain runs
        // and the request resolves with the normalized error.
        expect(observed).toEqual(['observed']);
        expect(result).toBeInstanceOf(ResponseError);
        expect((result as ResponseError).message).toBe('NETWORK_ERROR');
    });

    test('leaves AbortError and TimeoutError for the rest of the chain (HTT-REV-008)', async () => {
        const interceptor = new ErrorNormalizationInterceptor();
        const request = new Request('http://localhost/test');
        expect(
            await interceptor.postError(new DOMException('aborted', 'AbortError'), request, new HTTP())
        ).toBeUndefined();
        expect(
            await interceptor.postError(new DOMException('timed out', 'TimeoutError'), request, new HTTP())
        ).toBeUndefined();
    });
});
