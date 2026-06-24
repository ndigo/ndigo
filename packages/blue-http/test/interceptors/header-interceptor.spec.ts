import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { server } from '../_worker';
import { HttpResponse, http } from 'msw';

import { HeaderInterceptor } from '../../src/interceptors/header-interceptor';
import { HTTP } from '../../src/http';

describe('HeaderInterceptor', () => {
    const originalRandomUUID = crypto.randomUUID;

    beforeAll(() => {
        server.listen();
    });

    afterAll(() => {
        server.close();
    });

    afterEach(() => {
        server.resetHandlers();
    });

    beforeEach(() => {
        // Mock crypto.randomUUID to return a consistent value for testing
        vi.spyOn(crypto, 'randomUUID').mockReturnValue('12345678-1234-1234-1234-123456789012');
    });

    afterEach(() => {
        // Restore the original implementation
        vi.restoreAllMocks();
    });

    it('should not add any headers when no config is provided', async () => {
        server.use(
            http.get('http://localhost/test-headers', ({ request }) => {
                return HttpResponse.json({
                    csrf: request.headers.get('X-CSRF-Token'),
                    channel: request.headers.get('X-Channel-ID'),
                    requestId: request.headers.get('X-Request-ID'),
                });
            })
        );

        const interceptor = new HeaderInterceptor();
        const originalRequest = new Request('http://localhost/test-headers');
        
        // Mock HTTP client
        const mockHTTP: HTTP = {
            fetch: vi.fn().mockResolvedValue(new Response())
        };

        const result = await interceptor.preRequest(originalRequest, mockHTTP);
        
        expect(result.headers.get('X-CSRF-Token')).toBeNull();
        expect(result.headers.get('X-Channel-ID')).toBeNull();
        expect(result.headers.get('X-Request-ID')).toBeNull();

        // Verify original request is not mutated
        expect(originalRequest.headers.get('X-CSRF-Token')).toBeNull();
        expect(originalRequest.headers.get('X-Channel-ID')).toBeNull();
        expect(originalRequest.headers.get('X-Request-ID')).toBeNull();
    });

    it('should add CSRF token header when provided', async () => {
        server.use(
            http.get('http://localhost/test-headers', ({ request }) => {
                return HttpResponse.json({
                    csrf: request.headers.get('X-CSRF-Token'),
                    channel: request.headers.get('X-Channel-ID'),
                    requestId: request.headers.get('X-Request-ID'),
                });
            })
        );

        const interceptor = new HeaderInterceptor({ 
            csrfToken: 'test-csrf-token' 
        });
        
        const originalRequest = new Request('http://localhost/test-headers');
        const mockHTTP: HTTP = {
            fetch: vi.fn().mockResolvedValue(new Response())
        };

        const result = await interceptor.preRequest(originalRequest, mockHTTP);
        
        expect(result.headers.get('X-CSRF-Token')).toBe('test-csrf-token');
        expect(result.headers.get('X-Channel-ID')).toBeNull();
        expect(result.headers.get('X-Request-ID')).toBeNull();

        // Verify original request is not mutated
        expect(originalRequest.headers.get('X-CSRF-Token')).toBeNull();
    });

    it('should add channel ID header when provided', async () => {
        server.use(
            http.get('http://localhost/test-headers', ({ request }) => {
                return HttpResponse.json({
                    csrf: request.headers.get('X-CSRF-Token'),
                    channel: request.headers.get('X-Channel-ID'),
                    requestId: request.headers.get('X-Request-ID'),
                });
            })
        );

        const interceptor = new HeaderInterceptor({ 
            channelId: 'test-channel-id' 
        });
        
        const originalRequest = new Request('http://localhost/test-headers');
        const mockHTTP: HTTP = {
            fetch: vi.fn().mockResolvedValue(new Response())
        };

        const result = await interceptor.preRequest(originalRequest, mockHTTP);
        
        expect(result.headers.get('X-CSRF-Token')).toBeNull();
        expect(result.headers.get('X-Channel-ID')).toBe('test-channel-id');
        expect(result.headers.get('X-Request-ID')).toBeNull();

        // Verify original request is not mutated
        expect(originalRequest.headers.get('X-Channel-ID')).toBeNull();
    });

    it('should add request ID header when generateRequestId is true', async () => {
        server.use(
            http.get('http://localhost/test-headers', ({ request }) => {
                return HttpResponse.json({
                    csrf: request.headers.get('X-CSRF-Token'),
                    channel: request.headers.get('X-Channel-ID'),
                    requestId: request.headers.get('X-Request-ID'),
                });
            })
        );

        const interceptor = new HeaderInterceptor({ 
            generateRequestId: true
        });
        
        const originalRequest = new Request('http://localhost/test-headers');
        const mockHTTP: HTTP = {
            fetch: vi.fn().mockResolvedValue(new Response())
        };

        const result = await interceptor.preRequest(originalRequest, mockHTTP);
        
        expect(result.headers.get('X-CSRF-Token')).toBeNull();
        expect(result.headers.get('X-Channel-ID')).toBeNull();
        expect(result.headers.get('X-Request-ID')).toBe('12345678-1234-1234-1234-123456789012');

        // Verify original request is not mutated
        expect(originalRequest.headers.get('X-Request-ID')).toBeNull();
    });

    it('should add all headers when all options are provided', async () => {
        server.use(
            http.get('http://localhost/test-headers', ({ request }) => {
                return HttpResponse.json({
                    csrf: request.headers.get('X-CSRF-Token'),
                    channel: request.headers.get('X-Channel-ID'),
                    requestId: request.headers.get('X-Request-ID'),
                });
            })
        );

        const interceptor = new HeaderInterceptor({ 
            csrfToken: 'test-csrf-token',
            channelId: 'test-channel-id',
            generateRequestId: true
        });
        
        const originalRequest = new Request('http://localhost/test-headers');
        const mockHTTP: HTTP = {
            fetch: vi.fn().mockResolvedValue(new Response())
        };

        const result = await interceptor.preRequest(originalRequest, mockHTTP);
        
        expect(result.headers.get('X-CSRF-Token')).toBe('test-csrf-token');
        expect(result.headers.get('X-Channel-ID')).toBe('test-channel-id');
        expect(result.headers.get('X-Request-ID')).toBe('12345678-1234-1234-1234-123456789012');

        // Verify original request is not mutated
        expect(originalRequest.headers.get('X-CSRF-Token')).toBeNull();
        expect(originalRequest.headers.get('X-Channel-ID')).toBeNull();
        expect(originalRequest.headers.get('X-Request-ID')).toBeNull();
    });

    it('should ensure immutability of the original Request object', async () => {
        server.use(
            http.get('http://localhost/test-headers', ({ request }) => {
                return HttpResponse.json({
                    csrf: request.headers.get('X-CSRF-Token'),
                    channel: request.headers.get('X-Channel-ID'),
                    requestId: request.headers.get('X-Request-ID'),
                });
            })
        );

        const interceptor = new HeaderInterceptor({ 
            csrfToken: 'test-csrf-token',
            channelId: 'test-channel-id'
        });

        const originalHeaders = new Headers();
        originalHeaders.set('Authorization', 'Bearer token');
        
        const originalRequest = new Request('http://localhost/test-headers', {
            headers: originalHeaders
        });
        
        const mockHTTP: HTTP = {
            fetch: vi.fn().mockResolvedValue(new Response())
        };

        // Store the reference to check immutability later
        const originalHeaderMap = new Map(originalRequest.headers);
        
        await interceptor.preRequest(originalRequest, mockHTTP);

        // Verify that the original request headers are unchanged (except for our expected additions)
        expect(originalRequest.headers.get('Authorization')).toBe('Bearer token');
        expect(originalRequest.headers.get('X-CSRF-Token')).toBeNull();
        expect(originalRequest.headers.get('X-Channel-ID')).toBeNull();

        // Check if any new header was added to the original request
        const allOriginalHeaders = Array.from(originalHeaderMap.entries());
        for (const [key, value] of allOriginalHeaders) {
            expect(originalRequest.headers.get(key)).toBe(value);
        }
    });
});