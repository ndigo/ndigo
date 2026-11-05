/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../_worker';
import { HTTP } from '../../src/http';
import { StatusInterceptor } from '../../src/interceptors/status-interceptor';

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('StatusInterceptor', () => {
    test('should map status codes to custom statuses', async () => {
        const interceptor = new StatusInterceptor({
            statusMappings: {
                200: 'SUCCESS',
                404: 'NOT_FOUND',
            },
        });

        // Test 200 response
        const response200 = new Response('Success body', { status: 200, statusText: 'OK' });
        const result200 = await interceptor.postResponse(response200, {});
        expect(result200?.headers.get('X-App-Status')).toBe('SUCCESS');

        // Test 404 response
        const response404 = new Response('Not found body', { status: 404, statusText: 'Not Found' });
        const result404 = await interceptor.postResponse(response404, {});
        expect(result404?.headers.get('X-App-Status')).toBe('NOT_FOUND');
    });

    test('should apply default status for unmapped responses', async () => {
        const interceptor = new StatusInterceptor({
            defaultStatus: 'MY_DEFAULT',
        });

        // Test unmapped response (500)
        const response500 = new Response('Internal error body', { status: 500, statusText: 'Internal Server Error' });
        const result = await interceptor.postResponse(response500, {});
        expect(result?.headers.get('X-App-Status')).toBe('MY_DEFAULT');
    });

    test('should apply fallback status for unmapped responses with no config', async () => {
        const interceptor = new StatusInterceptor({});

        // Test unmapped response (503)
        const response503 = new Response('Service unavailable body', {
            status: 503,
            statusText: 'Service Unavailable',
        });
        const result = await interceptor.postResponse(response503, {});
        expect(result?.headers.get('X-App-Status')).toBe('UNKNOWN');
    });

    test('should preserve existing headers in response', async () => {
        const interceptor = new StatusInterceptor({});

        // Create mock response with existing headers
        const originalHeaders = new Headers();
        originalHeaders.set('Content-Type', 'application/json');
        originalHeaders.set('Authorization', 'Bearer token123');
        const response = new Response('Body content', {
            status: 200,
            statusText: 'OK',
            headers: originalHeaders,
        });

        // Test the postResponse method directly with mock Response objects
        const result = await interceptor.postResponse(response, {});

        expect(result?.headers.get('Content-Type')).toBe('application/json');
        expect(result?.headers.get('Authorization')).toBe('Bearer token123');
        expect(result?.headers.get('X-App-Status')).toBe('UNKNOWN');
    });

    test('should work with empty config', async () => {
        const interceptor = new StatusInterceptor();

        // Test unmapped response (400)
        const response400 = new Response('Bad request body', { status: 400, statusText: 'Bad Request' });
        const result = await interceptor.postResponse(response400, {});
        expect(result?.headers.get('X-App-Status')).toBe('UNKNOWN');
    });

    test('preserves url/redirected metadata on rebuild (HTT-REV-011)', async () => {
        const interceptor = new StatusInterceptor({ statusMappings: { 302: 'REDIRECT' } });
        const source = new Response('redirecting', {
            status: 302,
            headers: { location: 'http://localhost/final' },
        });
        // A followed redirect carries this metadata; `Response.redirect()`
        // does not populate it, so set it directly on the source.
        Object.defineProperty(source, 'url', { value: 'http://localhost/final', configurable: true });
        Object.defineProperty(source, 'redirected', { value: true, configurable: true });

        const result = await interceptor.postResponse(source, {});

        // Pre-fix, `new Response(...)` reset these to '' / false.
        expect(result?.url).toBe('http://localhost/final');
        expect(result?.redirected).toBe(true);
        expect(result?.headers.get('X-App-Status')).toBe('REDIRECT');
        expect(result?.headers.get('location')).toBe('http://localhost/final');
    });
});
