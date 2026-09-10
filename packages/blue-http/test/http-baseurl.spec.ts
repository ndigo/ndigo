import { describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './_worker';
import { HTTP, MappedHTTPInterceptor } from '../src/http'; // Import MappedHTTPInterceptor
import type { InitializationAwareHTTPInterceptor } from '../src/http';

describe('HTTP baseURL', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    describe('Instance-level baseURL', () => {
        test('should resolve relative URLs with baseURL', async () => {
            const http = HTTP.create({ baseURL: 'http://localhost/' });
            const response = await http.get('request');
            expect(response.url).toBe('http://localhost/request');
        });

        test('should resolve absolute URLs ignoring baseURL', async () => {
            const http = HTTP.create({ baseURL: 'http://localhost/' });
            const response = await http.get('http://localhost/request');
            expect(response.url).toBe('http://localhost/request');
        });

        test('should handle baseURL with path segments', async () => {
            const http = HTTP.create({ baseURL: 'http://localhost/api/v1/' });
            const response = await http.get('users');
            expect(response.url).toBe('http://localhost/api/v1/users');
        });

        test('should handle baseURL without trailing slash (documents behavior)', async () => {
            const http = HTTP.create({ baseURL: 'http://localhost/api/v1' });
            const response = await http.get('users');
            // Native URL behavior: drops 'v1' segment when base has no trailing slash
            expect(response.url).toBe('http://localhost/api/users');
        });
    });

    describe('Per-request baseURL override', () => {
        test('should override instance baseURL per request', async () => {
            const http = HTTP.create({ baseURL: 'http://localhost/api/' });
            const response = await http.get('request', {
                baseURL: 'http://localhost/',
            });
            expect(response.url).toBe('http://localhost/request');
        });
    });

    describe('Environment fallback', () => {
        let originalLocation: Location | undefined;

        beforeAll(() => {
            originalLocation = (globalThis as unknown as { location?: Location }).location;
        });

        afterEach(() => {
            (globalThis as unknown as { location?: Location }).location = originalLocation;
        });

        test('should use location.href fallback in browser', async () => {
            // location.href mocked in test/setup.ts as 'http://localhost:3000/'
            const http = new HTTP();
            const response = await http.get('request');
            expect(response.url).toBe('http://localhost:3000/request');
        });

        test('should use http://localhost/ fallback when location is undefined', async () => {
            delete (globalThis as unknown as { location?: Location }).location;

            const http = new HTTP();
            const response = await http.get('request');
            expect(response.url).toBe('http://localhost/request');
        });
    });

    describe('Backward compatibility', () => {
        test('should work without baseURL (existing behavior)', async () => {
            const http = new HTTP();
            const response = await http.get('http://localhost/request');
            expect(response.url).toBe('http://localhost/request');
        });
    });
});

describe('HTTP baseURL with interceptors', () => {
    describe('MappedHTTPInterceptor URL matching', () => {
        test('should match resolved URL not input URL', async () => {
            let interceptorCalled = false;

            class TestInterceptor implements InitializationAwareHTTPInterceptor {
                preInit(url: URL) {
                    // URL should be resolved: http://localhost/api/v1/users
                    interceptorCalled = true;
                    expect(url.href).toBe('http://localhost/api/v1/users');
                    return true;
                }
            }

            const http = new HTTP([new TestInterceptor()], { baseURL: 'http://localhost/api/v1/' });

            await http.get('users'); // Input: 'users'
            expect(interceptorCalled).toBe(true);
        });

        test('MappedHTTPInterceptor should match against resolved URL', async () => {
            let interceptorApplied = false;

            class MarkedInterceptor implements InitializationAwareHTTPInterceptor {
                preInit() {
                    interceptorApplied = true;
                    return true;
                }
            }

            const mapped = new MappedHTTPInterceptor(
                new MarkedInterceptor(),
                ['http://localhost/api/*'] // Match pattern
            );

            const http = new HTTP([mapped], { baseURL: 'http://localhost/api/' });

            await http.get('users'); // Resolves to http://localhost/api/users
            expect(interceptorApplied).toBe(true);
        });
    });
});

describe('HTTP baseURL edge cases', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    test('should handle empty string baseURL', async () => {
        const http = HTTP.create({ baseURL: '' });
        const response = await http.get('http://localhost/request');
        expect(response.url).toBe('http://localhost/request');
    });

    test('should handle baseURL with query params', async () => {
        const http = HTTP.create({ baseURL: 'http://localhost/api/?key=abc' });
        const response = await http.get('users');
        // URL constructor appends path, query stays in base
        expect(response.url).toMatch(/^http:\/\/localhost\/api\/users/);
    });

    test('should handle baseURL with hash', async () => {
        const http = HTTP.create({ baseURL: 'http://localhost/api/#section' });
        const response = await http.get('users');
        // Hash is dropped by URL constructor
        expect(response.url).toBe('http://localhost/api/users');
    });

    test('should handle protocol-relative URLs', async () => {
        const http = HTTP.create({ baseURL: 'http://localhost/' });
        const response = await http.get('//other.com/request');
        // Protocol-relative URL uses base protocol
        expect(response.url).toBe('http://other.com/request');
    });
});
