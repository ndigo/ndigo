/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './_worker';
import { HTTP, HTTPExecutionChain } from '../src/http';
import type {
    CompletionAwareHTTPInterceptor,
    Fetch,
    InitializationAwareHTTPInterceptor,
    RequestAwareHTTPInterceptor,
    ResponseAwareHTTPInterceptor,
} from '../src/http';

const requestPath = /\/request$/;

class ExceptInterceptor
    implements InitializationAwareHTTPInterceptor, ResponseAwareHTTPInterceptor, CompletionAwareHTTPInterceptor
{
    preInit(url: URL) {
        expect(url.pathname).toBe('/request');
        return true;
    }

    async postResponse(response: Response): Promise<Response | void> {
        expect(response.url).toMatch(requestPath);
    }

    postComplete(request: Request, response: Response) {
        expect(request.url).toMatch(requestPath);
        expect(response.url).toMatch(requestPath);
    }
}

class HaltInterceptor implements InitializationAwareHTTPInterceptor {
    preInit(url: URL) {
        return false;
    }
}

class TestInterceptor
    implements
        InitializationAwareHTTPInterceptor,
        RequestAwareHTTPInterceptor,
        ResponseAwareHTTPInterceptor,
        CompletionAwareHTTPInterceptor
{
    preInit(url: URL) {
        return true;
    }

    async preRequest(request: Request, http: HTTP): Promise<Request | Response | void> {
        return;
    }

    async postResponse(response: Response): Promise<Response | void> {
        return;
    }

    postComplete(request: Request, response: Response) {
        return;
    }
}

describe('HTTP', () => {
    beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

    afterEach(() => server.resetHandlers());

    afterAll(() => server.close());

    test('it should make requests', async () => {
        const http = new HTTP();
        const response = await http.request('http://localhost/request');
        const text = await response.text();
        expect(text).toBe('foo=123');
    });

    test('it should make requests with interceptors', async () => {
        const http = new HTTP([new TestInterceptor(), new ExceptInterceptor()]);
        const response = await http.request('http://localhost/request');
        const text = await response.text();
        expect(http).toHaveProperty('interceptors');
        expect(Array.isArray(http.interceptors)).toBe(true);
        expect(http.interceptors).toHaveLength(2);
        expect(text).toBe('foo=123');
    });

    test('it should halt requests when preInit returns false', async () => {
        const http = new HTTP([new TestInterceptor(), new HaltInterceptor(), new ExceptInterceptor()]);
        const response = await http.request('http://localhost/request');
        const text = await response.text();
        expect(http).toHaveProperty('interceptors');
        expect(Array.isArray(http.interceptors)).toBe(true);
        expect(http.interceptors).toHaveLength(3);
        expect(text).toBe('');
    });

    describe('HTTP.create() factory method', () => {
        test('should create HTTP instance with empty config', () => {
            const http = HTTP.create();
            expect(http).toBeInstanceOf(HTTP);
            expect(http.interceptors).toHaveLength(0);
        });

        test('should create HTTP instance with baseURL', async () => {
            const http = HTTP.create({
                baseURL: 'http://localhost/',
            });
            const response = await http.get('request');
            expect(response.url).toBe('http://localhost/request');
        });

        test('should create HTTP instance with headers', async () => {
            const mockFetch = async (request: Request) => {
                expect(request.headers.get('X-Custom-Header')).toBe('test-value');
                return new Response('ok');
            };

            const http = HTTP.create({
                baseURL: 'http://localhost/',
                headers: { 'X-Custom-Header': 'test-value' },
                fetch: mockFetch as unknown as Fetch,
            });

            await http.get('request');
        });

        test('should create HTTP instance with params', async () => {
            const http = HTTP.create({
                baseURL: 'http://localhost/',
                params: { key: 'value', foo: 'bar' },
            });
            const response = await http.get('request');
            const url = new URL(response.url);
            expect(url.searchParams.get('key')).toBe('value');
            expect(url.searchParams.get('foo')).toBe('bar');
        });

        test('should create HTTP instance with all config options', async () => {
            const mockFetch = async (request: Request) => {
                expect(request.headers.get('Authorization')).toBe('Bearer token');
                const url = new URL(request.url);
                expect(url.searchParams.get('version')).toBe('v2');
                return new Response('ok');
            };

            const http = HTTP.create({
                baseURL: 'http://localhost/',
                headers: { Authorization: 'Bearer token' },
                params: { version: 'v2' },
                fetch: mockFetch as unknown as Fetch,
            });

            await http.get('request');
        });

        test('should accept interceptors in config', async () => {
            const http = HTTP.create({
                baseURL: 'http://localhost/',
                interceptors: [new TestInterceptor(), new ExceptInterceptor()],
            });

            expect(http.interceptors).toHaveLength(2);
            const response = await http.get('request');
            expect(response.url).toMatch(requestPath);
        });

        test('should accept empty interceptors array', () => {
            const http = HTTP.create({
                baseURL: 'http://localhost/',
                interceptors: [],
            });

            expect(http.interceptors).toHaveLength(0);
        });

        test('should work with multiple interceptors', async () => {
            const http = HTTP.create({
                baseURL: 'http://localhost/',
                interceptors: [new TestInterceptor(), new ExceptInterceptor(), new TestInterceptor()],
            });

            expect(http.interceptors).toHaveLength(3);
            const response = await http.get('request');
            expect(response.url).toMatch(requestPath);
        });

        test('should accept custom fetch implementation', async () => {
            let customFetchCalled = false;
            const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
                customFetchCalled = true;
                return new Response('custom response');
            };

            const http = HTTP.create({
                baseURL: 'http://localhost/',
                fetch: customFetch,
            });

            await http.get('request');
            expect(customFetchCalled).toBe(true);
        });

        test('should default to globalThis.fetch when fetch not provided', async () => {
            const http = HTTP.create({
                baseURL: 'http://localhost/',
            });

            const response = await http.get('request');
            expect(response).toBeInstanceOf(Response);
        });

        test('should handle undefined config', () => {
            const http = HTTP.create(undefined);
            expect(http).toBeInstanceOf(HTTP);
            expect(http.interceptors).toHaveLength(0);
        });

        test('should produce same result as constructor with empty interceptors', async () => {
            const config = {
                baseURL: 'http://localhost/',
                headers: { 'X-Test': 'value' },
                params: { key: 'value' },
            };

            const http1 = HTTP.create(config);
            const http2 = new HTTP([], config);

            expect(http1.interceptors).toHaveLength(http2.interceptors.length);
            expect(http1.settings).toEqual(http2.settings);

            const response1 = await http1.get('request');
            const response2 = await http2.get('request');

            expect(response1.url).toBe(response2.url);
        });

        test('should produce same result as constructor with interceptors', async () => {
            const interceptors = [new TestInterceptor(), new ExceptInterceptor()];
            const config = {
                baseURL: 'http://localhost/',
                headers: { 'X-Test': 'value' },
            };

            const http1 = HTTP.create({ ...config, interceptors });
            const http2 = new HTTP(interceptors, config);

            expect(http1.interceptors).toHaveLength(http2.interceptors.length);
            expect(http1.settings).toEqual(http2.settings);

            const response1 = await http1.get('request');
            const response2 = await http2.get('request');

            expect(response1.url).toBe(response2.url);
        });
    });
});

describe('HTTPExecutionChain', () => {
    const http = new HTTP();

    test('it should create execution chains', async () => {
        const chain = new HTTPExecutionChain(http);
        expect(chain).toBeInstanceOf(HTTPExecutionChain);
        expect(chain.http).toBe(http);
        expect(Object.prototype.toString.call(chain)).toBe('[object HTTPExecutionChain]');
    });

    test('it should manage interceptors', async () => {
        const interceptor = new TestInterceptor();
        const chain = new HTTPExecutionChain(http, [interceptor]);

        expect(chain).toBeInstanceOf(HTTPExecutionChain);
        expect(chain.interceptors).toHaveProperty('length', 1);

        chain.addInterceptor(new ExceptInterceptor());

        expect(chain.interceptors).toHaveProperty('length', 2);

        chain.addInterceptors([new HaltInterceptor()]);

        expect(chain.interceptors).toHaveProperty('length', 3);

        expect(chain.interceptors[0]).toBe(interceptor);

        expect(Object.prototype.toString.call(chain)).toBe('[object HTTPExecutionChain]');
    });

    test('it should derive from other chains', async () => {
        const interceptor = new TestInterceptor();
        const chain1 = new HTTPExecutionChain(http, [interceptor]);
        const chain2 = new HTTPExecutionChain(chain1);

        expect(chain2).toBeInstanceOf(HTTPExecutionChain);
        expect(chain2.http).toBe(http);
        expect(chain2.interceptors).toHaveProperty('length', 1);
    });
});
