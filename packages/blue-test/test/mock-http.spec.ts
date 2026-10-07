/**
 * @module blue-test
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import {
    requestMapping,
    getMapping,
    postMapping,
    ModelAndView,
    parameters,
    queryValue,
    bodyValue,
    headerValue,
    socketMapping,
    HANDLER_MAPPING,
    type RadixMetadataHandlerMapping,
} from '@blue/dispatcher';
import { CORSInterceptor } from '@blue/platform-node';
import { IslandView } from '@blue/view';
import { bootApp, MockHTTP } from '../src/index';

/**
 * Self-tests for `@blue/test`: a real controller is dispatched through the
 * actual Blue pipeline (NodeAutoConfiguration → NodeDispatcher → handler) via
 * MockHTTP, socket-free.
 */

@requestMapping('/')
class GreetingController {
    @getMapping('/')
    greet() {
        return { message: 'Hello, Node!' };
    }

    @getMapping('/hello')
    @parameters({ name: queryValue('name') })
    greetByName(name?: string) {
        return { message: `Hello, ${name ?? 'World'}!` };
    }

    @postMapping('/echo')
    @parameters({ value: bodyValue('value') })
    echo(value?: string) {
        return { echoed: value ?? null };
    }

    @postMapping('/echo/raw')
    @parameters({ value: bodyValue('value') })
    echoRaw(value?: string) {
        return { echoed: value ?? null };
    }

    @getMapping('/header')
    @parameters({ via: headerValue('x-via') })
    viaHeader(via?: string) {
        return { via: via ?? null };
    }

    @getMapping('/plain')
    plain() {
        return 'plain-text';
    }

    @getMapping('/multi')
    @parameters({ a: queryValue('a') })
    multi(a?: string | string[]) {
        return { a };
    }
}

@requestMapping('/socket')
class SocketOnlyController {
    @socketMapping('/channel')
    async *channel(): AsyncGenerator<string> {
        yield 'only-reachable-over-an-upgraded-connection';
    }

    @getMapping('/http')
    http() {
        return { route: 'http' };
    }
}

describe('MockHTTP', () => {
    let mockHTTP: MockHTTP;

    beforeAll(() => {
        mockHTTP = new MockHTTP(bootApp([GreetingController]));
    });

    afterAll(() => {
        // no-op; booted app closes in the ported test
    });

    test('GET / returns JSON through the real dispatcher', async () => {
        const res = await mockHTTP.get('/').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ message: 'Hello, Node!' });
    });

    test('GET /hello?name=... binds the query parameter', async () => {
        const res = await mockHTTP.get('/hello').query({ name: 'Jeff' }).exec();
        expect(res.json()).toEqual({ message: 'Hello, Jeff!' });
    });

    test('POST /echo binds the JSON body', async () => {
        const res = await mockHTTP.post('/echo').body({ value: 'ping' }).exec();
        expect(res.json()).toEqual({ echoed: 'ping' });
    });

    test('plain-object return is JSON, not mutated with a default view name', async () => {
        const res = await mockHTTP.get('/plain').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual('plain-text');
    });

    test('empty body yields undefined from .json()', async () => {
        const res = await mockHTTP.get('/missing').exec();
        expect(res.response.status).toBe(404);
    });

    test('request header keys are case-normalized like Node IncomingMessage (RUS-4)', async () => {
        const res = await mockHTTP.get('/header').headers({ 'X-Via': 'case-folded' }).exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ via: 'case-folded' });
    });

    test('a non-multipart rawBody is parsed into the request body, not dropped (RUS-4)', async () => {
        const res = await mockHTTP
            .post('/echo/raw')
            .rawBody(JSON.stringify({ value: 'raw-json' }))
            .headers({ 'content-type': 'application/json' })
            .exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ echoed: 'raw-json' });
    });

    test('repeated query parameters accumulate through the fluent builder (IN-4)', async () => {
        const res = await mockHTTP.get('/multi').query({ a: '1' }).query({ a: '2' }).exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ a: ['1', '2'] });
    });

    test('a __proto__ query key stays an ordinary parameter, not a prototype write (IN-4, SEC-8)', async () => {
        const res = await mockHTTP
            .get('/multi')
            .query({ ['__proto__']: 'x' })
            .exec();
        const data = res.route.route.data as Record<string, unknown>;
        expect(res.response.status).toBe(200);
        expect(Object.getPrototypeOf(data)).toBeNull();
        expect(Object.getOwnPropertyDescriptor(data, '__proto__')?.value).toBe('x');
    });

    test('method mismatch on an existing path returns 405 with Allow (IN-5, adapter parity)', async () => {
        const res = await mockHTTP.request({ method: 'POST', path: '/hello' });
        expect(res.response.status).toBe(405);
        expect(res.response.headers['allow']).toBe('GET');
        expect(res.json()).toMatchObject({ type: 'urn:blue:method-not-allowed', status: 405 });
    });

    test('unmatched OPTIONS dispatches through interceptors so preflights finalize (IN-5)', async () => {
        const app = bootApp([GreetingController]);
        const mapping = app.context.getValue<RadixMetadataHandlerMapping>(HANDLER_MAPPING);
        mapping.interceptors.push(new CORSInterceptor({ allowedOrigins: ['https://example.com'] }));
        try {
            const mock = new MockHTTP(app);
            const res = await mock.request({
                method: 'OPTIONS',
                path: '/not/a/route',
                headers: {
                    origin: 'https://example.com',
                    'access-control-request-method': 'POST',
                },
            });
            expect(res.response.status).toBe(204);
            expect(res.response.headers['access-control-allow-origin']).toBe('https://example.com');
            expect(res.response.headers['access-control-allow-methods']).toContain('POST');
        } finally {
            app.close();
        }
    });

    test('unmatched OPTIONS mirrors the live adapter when no interceptor finalizes (IN-5)', async () => {
        // Live-verified parity: against NodeHTTPServerAdapter +
        // NodeAutoConfiguration the same request returns 500 — the last-resort
        // error resolver finalizes the unmatched dispatch (a method-less chain
        // has no handler adapter) before the adapter's 404 default can land.
        const res = await mockHTTP.request({ method: 'OPTIONS', path: '/not/a/route' });
        expect(res.response.status).toBe(500);
        expect(res.json()).toMatchObject({ type: 'urn:blue:internal-error', status: 500 });
    });

    test('unmatched OPTIONS with no error resolver falls back to the adapter 404 default (IN-5)', async () => {
        const app = bootApp([GreetingController]);
        // Without the Node error chain nothing finalizes the method-less
        // dispatch, so the adapter's documented 404 default is what lands.
        app.dispatcher.errorResolvers = [];
        try {
            const res = await new MockHTTP(app).request({ method: 'OPTIONS', path: '/not/a/route' });
            expect(res.response.status).toBe(404);
            expect(res.json()).toMatchObject({ type: 'urn:blue:not-found', status: 404 });
        } finally {
            app.close();
        }
    });

    test('a socket-only endpoint 404s over plain HTTP (IN-5, adapter parity)', async () => {
        const app = bootApp([SocketOnlyController]);
        try {
            const mock = new MockHTTP(app);
            const res = await mock.get('/socket/channel').exec();
            expect(res.response.status).toBe(404);
            expect(res.json()).toMatchObject({ type: 'urn:blue:not-found', status: 404 });
            // The sibling HTTP route on the same controller still dispatches.
            const sibling = await mock.get('/socket/http').exec();
            expect(sibling.response.status).toBe(200);
            expect(sibling.json()).toEqual({ route: 'http' });
        } finally {
            app.close();
        }
    });

    test('multipart part-limit rejection maps to the live 413 problem document (SEC-13)', async () => {
        const app = bootApp([GreetingController]);
        const limitingMock = new MockHTTP(app, { multipartLimits: { maxParts: 1 } });
        try {
            const boundary = '----blueMockLimitTest';
            const payload = [
                `--${boundary}`,
                'Content-Disposition: form-data; name="a"',
                '',
                '1',
                `--${boundary}`,
                'Content-Disposition: form-data; name="b"',
                '',
                '2',
                `--${boundary}--`,
                '',
            ].join('\r\n');
            const res = await limitingMock
                .post('/echo')
                .rawBody(payload)
                .headers({ 'content-type': `multipart/form-data; boundary=${boundary}` })
                .exec();
            expect(res.response.status).toBe(413);
            expect(res.json()).toMatchObject({
                type: 'urn:blue:too_many_parts',
                status: 413,
                detail: 'too_many_parts',
            });
            expect(res.response.headers['content-type']).toContain('application/problem+json');
        } finally {
            app.close();
        }
    });

    test('a malformed JSON rawBody maps to the adapter 400 malformed-body problem (HTT-REV-012)', async () => {
        const res = await mockHTTP
            .post('/echo/raw')
            .rawBody('{"broken": ')
            .headers({ 'content-type': 'application/json' })
            .exec();
        expect(res.response.status).toBe(400);
        expect(res.json()).toMatchObject({
            type: 'urn:blue:malformed-body',
            status: 400,
            detail: 'malformed_body',
        });
    });

    test('well-formed non-object JSON maps to 400, not 500 (HTT-REV-012)', async () => {
        const res = await mockHTTP
            .post('/echo/raw')
            .rawBody('[1,2]')
            .headers({ 'content-type': 'application/json' })
            .exec();
        expect(res.response.status).toBe(400);
        expect(res.json()).toMatchObject({
            type: 'urn:blue:malformed-body',
            status: 400,
            detail: 'malformed_body',
        });
    });

    test('multipart rawBody parses with a canonical-case Content-Type header (HTT-REV-013)', async () => {
        const app = bootApp([GreetingController]);
        try {
            const mock = new MockHTTP(app);
            const boundary = '----blueCanonicalCase';
            const payload = [
                `--${boundary}`,
                'Content-Disposition: form-data; name="value"',
                '',
                'canonical',
                `--${boundary}--`,
                '',
            ].join('\r\n');
            const res = await mock
                .post('/echo')
                .rawBody(payload)
                // Canonical-case key: Node folds it, so the harness must too.
                .headers({ 'Content-Type': `multipart/form-data; boundary=${boundary}` })
                .exec();
            expect(res.response.status).toBe(200);
            expect(res.json()).toEqual({ echoed: 'canonical' });
        } finally {
            app.close();
        }
    });

    test('a cookie header past the parser bound maps to 431, not 500 (HTT-REV-014)', async () => {
        const res = await mockHTTP
            .get('/')
            .headers({ cookie: `big=${'x'.repeat(5000)}` })
            .exec();
        expect(res.response.status).toBe(431);
        expect(res.json()).toMatchObject({
            type: 'urn:blue:headers_too_large',
            status: 431,
            detail: 'headers_too_large',
        });
    });

    test('an oversized body maps to 413 under the configured limit (HTT-REV-014)', async () => {
        const app = bootApp([GreetingController]);
        try {
            const mock = new MockHTTP(app, { limits: { maxBodyBytes: 16 } });
            const res = await mock
                .post('/echo')
                .body({ value: 'x'.repeat(64) })
                .exec();
            expect(res.response.status).toBe(413);
            expect(res.json()).toMatchObject({
                type: 'urn:blue:body_too_large',
                status: 413,
                detail: 'body_too_large',
            });
        } finally {
            app.close();
        }
    });

    test('an aborted request maps to 400 request_aborted (HTT-REV-014)', async () => {
        const res = await mockHTTP.get('/').abort().exec();
        expect(res.response.status).toBe(400);
        expect(res.json()).toMatchObject({
            type: 'urn:blue:request_aborted',
            status: 400,
            detail: 'request_aborted',
        });
    });

    test('a timed-out request maps to 408 request_timeout (HTT-REV-014)', async () => {
        const res = await mockHTTP.get('/').timeout().exec();
        expect(res.response.status).toBe(408);
        expect(res.json()).toMatchObject({
            type: 'urn:blue:request_timeout',
            status: 408,
            detail: 'request_timeout',
        });
    });
});

describe('IslandView through MockHTTP dispatch (SSR islands)', () => {
    @requestMapping('/islands')
    class IslandsController {
        @getMapping('/todo')
        todo() {
            return new ModelAndView(new IslandView('todo-app'), {
                items: [{ text: 'a', checked: false }],
                filter: 'all',
            });
        }
    }

    test('server dispatches island markup with the serialized model', async () => {
        const app = bootApp([IslandsController]);
        try {
            const mockHTTP = new MockHTTP(app);
            const res = await mockHTTP.get('/islands/todo').exec();
            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('<todo-app data-blue-island data-blue-locale="en-US" data-blue-model=');
            expect(html).toContain('&quot;filter&quot;:&quot;all&quot;');
        } finally {
            app.close();
        }
    });
});
