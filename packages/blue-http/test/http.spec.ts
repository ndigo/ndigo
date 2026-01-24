import { describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './_worker';
import { HTTP, HTTPExecutionChain } from '../src/http';
import type { HTTPInterceptor } from '../src/http';

const requestPath = /\/request$/;

class ExceptInterceptor implements Partial<HTTPInterceptor> {
    preInit(url: URL) {
        expect(url.pathname).toBe('/request');
        return true;
    }

    async postResponse(response: Response) {
        expect(response.url).toMatch(requestPath);
    }

    postComplete(request: Request, response: Response) {
        expect(request.url).toMatch(requestPath);
        expect(response.url).toMatch(requestPath);
    }
}

class HaltInterceptor implements Partial<HTTPInterceptor> {
    preInit(url: URL) {
        return false;
    }
}

class TestInterceptor implements Partial<HTTPInterceptor> {
    preInit(url: URL) {
        return true;
    }

    preRequest(request: Request, http: HTTP) {
        return;
    }

    async postResponse(response: Response) {
        return;
    }

    postComplete(request: Request, response: Response) {
        return;
    }
}

describe('HTTP', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

    afterEach(() => server.resetHandlers());

    afterAll(() => server.close());

    test('it should make requests', async () => {
        const http = new HTTP();
        const response = await http.request('http://localhost/request');
        const text = await response.text();
        expect(text).toBe('foo=123');
    });

    test('it should make requests with interceptors', async () => {
        const http = new HTTP([new TestInterceptor() as any, new ExceptInterceptor() as any]);
        const response = await http.request('http://localhost/request');
        const text = await response.text();
        expect(http).toHaveProperty('interceptors');
        expect(Array.isArray(http.interceptors)).toBe(true);
        expect(http.interceptors).toHaveLength(2);
        expect(text).toBe('foo=123');
    });

    test('it should halt requests when preInit returns false', async () => {
        const http = new HTTP([
            new TestInterceptor() as any,
            new HaltInterceptor() as any,
            new ExceptInterceptor() as any,
        ]);
        const response = await http.request('http://localhost/request');
        const text = await response.text();
        expect(http).toHaveProperty('interceptors');
        expect(Array.isArray(http.interceptors)).toBe(true);
        expect(http.interceptors).toHaveLength(3);
        expect(text).toBe('');
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
        const chain = new HTTPExecutionChain(http, [interceptor as any]);

        expect(chain).toBeInstanceOf(HTTPExecutionChain);
        expect(chain.interceptors).toHaveProperty('length', 1);

        chain.addInterceptor(new ExceptInterceptor() as any);

        expect(chain.interceptors).toHaveProperty('length', 2);

        chain.addInterceptors([new HaltInterceptor() as any]);

        expect(chain.interceptors).toHaveProperty('length', 3);

        expect(chain.interceptors[0]).toBe(interceptor);

        expect(Object.prototype.toString.call(chain)).toBe('[object HTTPExecutionChain]');
    });

    test('it should derive from other chains', async () => {
        const interceptor = new TestInterceptor();
        const chain1 = new HTTPExecutionChain(http, [interceptor as any]);
        const chain2 = new HTTPExecutionChain(chain1);

        expect(chain2).toBeInstanceOf(HTTPExecutionChain);
        expect(chain2.http).toBe(http);
        expect(chain2.interceptors).toHaveProperty('length', 1);
    });
});
