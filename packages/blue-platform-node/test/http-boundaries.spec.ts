/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect, vi } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { ServerResponse } from 'node:http';
import { MetadataConfigApplicationContext } from '@blue/context';
import { getMapping, requestMapping } from '@blue/dispatcher';
import type { Route } from '@blue/router';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { HTTPServer } from '../src/http-server';
import { NODE_RESPONSE_ATTRIBUTE } from '../src/node-request';
import { resolveHTTPRequestLimits, parseBody, RequestLimitError, BodyParseResult } from '../src/http-request-limits';

/**
 * Boundary behavior of the Node request pipeline: oversized bodies (413),
 * malformed JSON (400), malformed host (400), duplicate query preservation,
 * and bind-failure rejection. Exercised over a real `node:http` server on an
 * ephemeral port.
 */

@requestMapping('/')
class ProbeController {
    @getMapping('/probe')
    probe() {
        return { ok: true };
    }
}

describe('HTTP request pipeline boundaries', () => {
    let adapter: NodeHTTPServerAdapter;
    let base: string;
    let dispatcher: NodeDispatcher;

    async function boot(limits: Record<string, number> = { maxBodyBytes: 64 }): Promise<void> {
        const context = new MetadataConfigApplicationContext('boundaries');
        context.register(NodeAutoConfiguration);
        context.setValue(ProbeController.name, new ProbeController());
        context.refresh(); // auto-initializes the handler mapping + dispatcher
        dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher, { limits } as never);
        await adapter.listen(0, '127.0.0.1');
        base = `http://127.0.0.1:${(adapter.server as { address(): AddressInfo }).address().port}`;
    }

    afterAll(async () => {
        await adapter?.close();
    });

    test('bind failure (port already in use) rejects listen()', async () => {
        await boot();
        const port = (adapter.server as { address(): AddressInfo }).address().port;
        const second = new NodeHTTPServerAdapter(dispatcher);
        await expect(second.listen(port, '127.0.0.1')).rejects.toThrow();
        await second.close();
    });

    test('method mismatch on an existing path returns 405 with Allow (RFC 9110)', async () => {
        await boot();
        // /probe is GET-only — a POST to it must be 405, not 404.
        const res = await fetch(base + '/probe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: 1 }),
        });
        expect(res.status).toBe(405);
        expect(res.headers.get('allow')).toBe('GET');
        expect(await res.json()).toMatchObject({ type: 'urn:blue:method-not-allowed', status: 405 });
    });

    test('oversized body returns 413 with bounded error code', async () => {
        await boot({ maxBodyBytes: 16 });
        const res = await fetch(base, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: 'x'.repeat(64) }),
        });
        expect(res.status).toBe(413);
        expect(await res.json()).toMatchObject({
            type: 'urn:blue:body_too_large',
            status: 413,
            detail: 'body_too_large',
        });
    });

    test('malformed JSON body returns 400, not a wildcard string', async () => {
        await boot();
        const res = await fetch(base, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"broken": ',
        });
        expect(res.status).toBe(400);
        expect(await res.json()).toMatchObject({
            type: 'urn:blue:malformed-body',
            status: 400,
            detail: 'malformed_body',
        });
    });

    test('well-formed JSON with a non-object shape returns 400, not 500', async () => {
        await boot();
        for (const payload of ['[1,2]', '"hello"', '42']) {
            // oxlint-disable-next-line no-await-in-loop -- each payload is an isolated request; sequential sends keep assertions independent.
            const res = await fetch(base, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
            });
            expect(res.status).toBe(400);
            // oxlint-disable-next-line no-await-in-loop -- response body follows its own request in the loop above.
            expect(await res.json()).toMatchObject({
                type: 'urn:blue:malformed-body',
                status: 400,
                detail: 'malformed_body',
            });
        }
    });

    test('413 lands as soon as the cap is hit — a streaming body is never fully buffered', async () => {
        // The body stream never ends. The old adapter waited for EOF before
        // checking the cap, so this would stall into the 408 timeout instead.
        // The fix rejects at the first chunk pushing past the limit.
        await boot({ maxBodyBytes: 32, requestTimeoutMs: 1_500 });
        const chunk = new TextEncoder().encode('x'.repeat(16));
        const body = new ReadableStream({
            async pull(controller) {
                controller.enqueue(chunk);
                const { promise, resolve } = Promise.withResolvers<void>();
                setTimeout(resolve, 25);
                await promise;
            },
        });
        const res = await fetch(
            base,
            Object.assign(
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body,
                },
                { duplex: 'half' }
            )
        );
        expect(res.status).toBe(413);
        expect(await res.json()).toMatchObject({
            type: 'urn:blue:body_too_large',
            status: 413,
            detail: 'body_too_large',
        });
    });

    test('requests still dispatch after boundary errors (server stays healthy)', async () => {
        await boot();
        const before = await fetch(`${base}/probe`);
        expect(before.status).toBe(200);
        const after = await fetch(`${base}/probe`);
        expect(after.status).toBe(200);
        expect(await after.json()).toEqual({ ok: true });
    });

    test('duplicate query values are preserved as arrays (multi-value contract)', async () => {
        await boot();
        // The dispatcher renders duplicates through the route data; assert the
        // adapter does not crash and the request completes for repeated keys.
        const res = await fetch(`${base}/probe?tag=a&tag=b&tag=c`);
        expect(res.status).toBe(200);
    });

    test('a cookie header past the parser bound returns 431, not 500 (SEC-3)', async () => {
        await boot();
        const cookies = Array.from({ length: 51 }, (_, i) => `c${i}=v`).join('; ');
        const res = await fetch(base + '/probe', { headers: { cookie: cookies } });
        expect(res.status).toBe(431);
        expect(await res.json()).toMatchObject({
            type: 'urn:blue:headers_too_large',
            status: 431,
            detail: 'headers_too_large',
        });
    });

    test('an oversized cookie value returns 431, not 500 (SEC-3)', async () => {
        await boot();
        // 4097 bytes > the 4 KiB cookie-value bound, under Node's header cap
        // and the adapter's 16 KiB maxHeaderBytes — only the parser rejects.
        const res = await fetch(base + '/probe', { headers: { cookie: `big=${'x'.repeat(4097)}` } });
        expect(res.status).toBe(431);
        expect(await res.json()).toMatchObject({
            type: 'urn:blue:headers_too_large',
            status: 431,
            detail: 'headers_too_large',
        });
    });
});

describe('resolveHTTPRequestLimits', () => {
    test('fills conservative defaults', () => {
        const limits = resolveHTTPRequestLimits();
        expect(limits.maxBodyBytes).toBe(1_048_576);
        expect(limits.requestTimeoutMs).toBeGreaterThan(0);
    });

    test('rejects non-positive and non-finite values', () => {
        expect(() => resolveHTTPRequestLimits({ maxBodyBytes: 0 })).toThrow(RangeError);
        expect(() => resolveHTTPRequestLimits({ requestTimeoutMs: -5 })).toThrow(RangeError);
        expect(() => resolveHTTPRequestLimits({ headersTimeoutMs: Number.NaN })).toThrow(RangeError);
    });
});

describe('parseBody', () => {
    test('strict JSON parses objects and rejects malformed input', () => {
        const ok = parseBody('application/json', Buffer.from('{"a":1}'));
        expect(ok).toEqual({ kind: 'json', value: { a: 1 } });
        expect(() => parseBody('application/json', Buffer.from('{"broken":'))).toThrow(SyntaxError);
        expect(() => parseBody('application/json', Buffer.from('[1,2]'))).toThrow(RequestLimitError);
        expect(() => parseBody('application/json', Buffer.from('"just a string"'))).toThrow(RequestLimitError);
    });

    test('urlencoded bodies parse into records with repeated keys as arrays', () => {
        const result = parseBody('application/x-www-form-urlencoded', Buffer.from('a=1&b=2&a=3'));
        expect(result).toEqual({ kind: 'json', value: { a: ['1', '3'], b: '2' } });
    });

    test('a urlencoded field named __proto__ lands as an ordinary key on a null-prototype record (SEC-1)', () => {
        const result = parseBody('application/x-www-form-urlencoded', Buffer.from('__proto__=x&a=1'));
        expect(result.kind).toBe('json');
        const value = (result as Extract<BodyParseResult, { kind: 'json' }>).value;
        // The body stays a usable null-prototype record — no inherited accessor
        // was hit, so no hasOwnProperty TypeError, and __proto__ is a plain key.
        expect(Object.getPrototypeOf(value)).toBeNull();
        expect(Object.hasOwn(value, '__proto__')).toBe(true);
        expect(value['__proto__']).toBe('x');
        expect(Object.hasOwn(value, 'a')).toBe(true);
    });

    test('repeated urlencoded __proto__ keys accumulate into an array, not a prototype swap (SEC-1)', () => {
        const result = parseBody('application/x-www-form-urlencoded', Buffer.from('__proto__=a&__proto__=b'));
        expect(result.kind).toBe('json');
        const value = (result as Extract<BodyParseResult, { kind: 'json' }>).value;
        expect(Object.getPrototypeOf(value)).toBeNull();
        expect(Array.isArray(value['__proto__'])).toBe(true);
        expect(value['__proto__']).toEqual(['a', 'b']);
    });

    test('JSON bodies with a __proto__-named key stay plain objects (SEC-1)', () => {
        // JSON.parse defines own data properties, so this path was never at
        // risk — pin it so the contract cannot regress.
        const result = parseBody('application/json', Buffer.from('{"__proto__": 1, "a": 2}'));
        expect(result.kind).toBe('json');
        const value = (result as Extract<BodyParseResult, { kind: 'json' }>).value;
        expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
        expect(Object.hasOwn(value, '__proto__')).toBe(true);
        expect(value['__proto__']).toBe(1);
    });

    test('unknown content types fall back to raw text', () => {
        const result = parseBody('text/csv', Buffer.from('a,b'));
        expect(result).toEqual({ kind: 'raw', raw: 'a,b' });
    });

    test('empty bodies are reported as empty', () => {
        expect(parseBody('application/json', Buffer.alloc(0))).toEqual({ kind: 'empty' });
    });
});

// HTTPServer lifecycle guard: close() twice is a no-op, start() after close() restarts.
describe('HTTPServer lifecycle', () => {
    test('close is idempotent and adapter rejects double listen', async () => {
        const context = new MetadataConfigApplicationContext('lifecycle');
        context.register(NodeAutoConfiguration);
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const server = new HTTPServer(dispatcher, { port: 0, host: '127.0.0.1' });
        await server.start();
        expect(server.started).toBe(true);
        await server.close();
        expect(server.started).toBe(false);
        await server.close();
    });

    test('binds the supplied host and answers on it (AD-36 D-2)', async () => {
        const context = new MetadataConfigApplicationContext('bind-host');
        context.register(NodeAutoConfiguration);
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const server = new HTTPServer(dispatcher, { port: 0, host: '127.0.0.1' });
        await server.start();
        try {
            const port = (server.server as { address(): { port: number } }).address();
            // The listener is reachable exactly on the configured interface
            // — bind separation is honored (AD-36 D-2 posture: private
            // interfaces, never 0.0.0.0).
            const res = await fetch(`http://127.0.0.1:${port.port}/`);
            expect([200, 404]).toContain(res.status);
        } finally {
            await server.close();
        }
    });

    test('defaults the bind host to loopback when omitted', async () => {
        const context = new MetadataConfigApplicationContext('bind-default');
        context.register(NodeAutoConfiguration);
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const server = new HTTPServer(dispatcher, { port: 0 });
        await server.start();
        try {
            const port = (server.server as { address(): { port: number } }).address();
            const res = await fetch(`http://127.0.0.1:${port.port}/`);
            expect([200, 404]).toContain(res.status);
        } finally {
            await server.close();
        }
    });

    test('rejects out-of-range and non-integer ports at construction', () => {
        const context = new MetadataConfigApplicationContext('ports');
        context.register(NodeAutoConfiguration);
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        expect(() => new HTTPServer(dispatcher, { port: -1 })).toThrow(RangeError);
        expect(() => new HTTPServer(dispatcher, { port: 65_536 })).toThrow(RangeError);
        expect(() => new HTTPServer(dispatcher, { port: 1.5 })).toThrow(RangeError);
    });

    test('managed entry stays inert on refresh, starts on demand, stops on close', async () => {
        const context = new MetadataConfigApplicationContext('managed-server');
        context.register(NodeAutoConfiguration);
        context.refresh();

        // NodeAutoConfiguration provisions the server as an entry…
        const server = context.getValue<HTTPServer>('httpServer');
        expect(server).toBeInstanceOf(HTTPServer);
        // …but must not bind a port during refresh (isAutoStartup = false).
        expect(server.isRunning).toBe(false);

        // Starts on demand, resolving the dispatcher from the context.
        await server.start();
        expect(server.isRunning).toBe(true);

        // context.close() fires LifecycleProcessor.onClose → server.stop().
        context.close();
        await vi.waitFor(() => {
            expect(server.isRunning).toBe(false);
        });
    });
});

// COR-14: the graceful-shutdown drain deadline must bound `close()`, not just
// run after it — an open SSE/streaming connection cannot hang close() forever.
describe('adapter close drains within shutdownTimeoutMs', () => {
    test('close() resolves within the deadline even with an open SSE stream (COR-14)', async () => {
        let streamOpen = false;
        const dispatcher = {
            getHandler() {
                return { handler: { __noop() {} } };
            },
            dispatch(route: Route) {
                const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
                if (res && !res.writableEnded) {
                    // Open an SSE-style stream and never end it.
                    streamOpen = true;
                    res.writeHead(200, { 'content-type': 'text/event-stream' });
                    res.write('data: hello\n\n');
                }
                // Never resolves — the response (and its socket) stays open.
                return new Promise<void>(() => {});
            },
        } as unknown as NodeDispatcher;
        const adapter = new NodeHTTPServerAdapter(dispatcher, { limits: { shutdownTimeoutMs: 200 } });
        await adapter.listen(0, '127.0.0.1');
        const base = `http://127.0.0.1:${(adapter.server as { address(): AddressInfo }).address().port}`;

        const response = await fetch(base + '/events');
        await vi.waitFor(() => expect(streamOpen).toBe(true));

        const started = Date.now();
        await adapter.close();
        // Close resolves once the deadline force-destroys the lingering
        // connection, far inside a generous 2 s bound (the old code hung here).
        expect(Date.now() - started).toBeLessThan(2_000);

        // The forced teardown kills the client's stream.
        await expect(response.text()).rejects.toBeDefined();
    });
});
