import { worker } from './_worker';
import { HTTP, HTTPExecutionChain } from '../src/http';

const requestPath = /\/request$/;

class ExceptInterceptor {
    preInit(url) {
        expect(url.pathname).toBe('/request');
        return true;
    }

    async postResponse(response) {
        expect(response.url).to.match(requestPath);
    }

    postComplete(request, response) {
        expect(request.url).to.match(requestPath);
        expect(response.url).to.match(requestPath);
    }
}

class HaltInterceptor {
    preInit(url) {
        return false;
    }
}

class TestInterceptor {
    preInit(url) {
        return true;
    }

    preRequest(request, http) {
        return;
    }

    async postResponse(response) {
        return;
    }

    postComplete(request, response) {
        return;
    }
}

describe('HTTP', function () {
    before(() => worker.start({ quiet: true }));

    afterEach(() => worker.resetHandlers());

    after(() => worker.stop());

    test('it should make requests', async function () {
        const http = new HTTP(),
            response = await http.request('/request');
        const text = await response.text();
        expect(text).toBe('foo=123');
    });

    test('it should make requests with interceptors', async function () {
        const http = new HTTP([new TestInterceptor(), new ExceptInterceptor()]),
            response = await http.request('/request'),
            text = await response.text();
        expect(http).toHaveProperty('interceptors').that.is.an('array');
        expect(http.interceptors).to.have.lengthOf(2);
        expect(text).toBe('foo=123');
    });

    test('it should halt requests when preInit returns false', async function () {
        const http = new HTTP([new TestInterceptor(), new HaltInterceptor(), new ExceptInterceptor()]),
            response = await http.request('/request'),
            text = await response.text();
        expect(http).toHaveProperty('interceptors').that.is.an('array');
        expect(http.interceptors).to.have.lengthOf(3);
        expect(text).toBe('');
    });
});

describe('HTTPExecutionChain', function () {
    const http = new HTTP();

    test('it should create execution chains', async function () {
        const chain = new HTTPExecutionChain(http);
        expect(chain).toBeInstanceOf(HTTPExecutionChain);
        expect(chain.http).toBe(http);
        expect(Object.prototype.toString.call(chain)).toBe('[object HTTPExecutionChain]');
    });

    test('it should manage interceptors', async function () {
        const interceptor = new TestInterceptor(),
            chain = new HTTPExecutionChain(http, [interceptor]);

        expect(chain).toBeInstanceOf(HTTPExecutionChain);
        expect(chain.interceptors).to.have.ownProperty('length').that.equals(1);

        chain.addInterceptor(new ExceptInterceptor());

        expect(chain.interceptors).to.have.ownProperty('length').that.equals(2);

        chain.addInterceptors([new HaltInterceptor()]);

        expect(chain.interceptors).to.have.ownProperty('length').that.equals(3);

        expect(chain.interceptors[0]).toBe(interceptor);

        expect(Object.prototype.toString.call(chain)).toBe('[object HTTPExecutionChain]');
    });

    test('it should derive from other chains', async function () {
        const interceptor = new TestInterceptor(),
            chain1 = new HTTPExecutionChain(http, [interceptor]),
            chain2 = new HTTPExecutionChain(chain1);

        expect(chain2).toBeInstanceOf(HTTPExecutionChain);
        expect(chain2.http).toBe(http);
        expect(chain2.interceptors).to.have.ownProperty('length').that.equals(1);
    });
});
