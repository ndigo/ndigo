/**
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { type IncomingMessage, type ServerResponse, request as httpRequest } from 'node:http';
import { readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE, type NodeRequest } from '../src/node-request';
import type { Route } from '@ndigo/router';
import { delay } from '@ndigo/util';

/**
 * Round-trip test for the adapter's multipart wiring: a real `node:http` server
 * receives a genuine `multipart/form-data` request and the adapter streams it
 * through busboy, attaching the parsed parts to `nodeRequest` before dispatch.
 * A minimal dispatcher captures the dispatched route so the test can assert on
 * what the adapter attached — the @multipartFile argument binding itself is
 * Wave 3.
 */

/** Captures the most recently dispatched route and finalizes with a clean 200. */
function capturingDispatcher(): { dispatcher: NodeDispatcher; last?: Route } {
    let last: Route | undefined;
    const dispatcher = {
        getHandler(_route: Route) {
            // Non-empty handler so the adapter treats the route as matched — it
            // gates on `Object.keys(chain.handler).length === 0`.
            return { handler: { __noop() {} } };
        },
        async dispatch(route: Route) {
            last = route;
            const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
            if (res && !res.writableEnded) {
                res.writeHead(200, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            }
        },
    };
    return {
        dispatcher: dispatcher as unknown as NodeDispatcher,
        get last() {
            return last;
        },
    };
}

const BOUNDARY = '----ndigoMultipartRoundTripBoundary';

/** POSTs a raw body to the server and resolves with status + parsed JSON body. */
function post(path: string, body: Buffer, contentType: string): Promise<{ status: number; json: unknown }> {
    const { promise, resolve, reject } = Promise.withResolvers<{ status: number; json: unknown }>();
    const req = httpRequest(base, { method: 'POST', path, headers: { 'content-type': contentType } });
    req.on('error', reject);
    req.end(body);
    req.on('response', (res: IncomingMessage) => {
        let data = '';
        res.setEncoding('utf-8');
        res.on('data', (chunk: string): void => {
            data += chunk;
        });
        res.on('end', (): void => resolve({ status: res.statusCode ?? 0, json: JSON.parse(data) }));
    });
    return promise;
}

/** Builds a multipart/form-data body with one text field and one file part. */
function buildMultipartBody(): Buffer {
    const payload = [
        `--${BOUNDARY}`,
        'Content-Disposition: form-data; name="title"',
        '',
        'hello world',
        `--${BOUNDARY}`,
        'Content-Disposition: form-data; name="avatar"; filename="note.txt"',
        'Content-Type: text/plain',
        '',
        'file contents here',
        `--${BOUNDARY}--`,
        '',
    ].join('\r\n');
    return Buffer.from(payload);
}

let base: string;

describe('Node multipart request wiring', () => {
    let adapter: NodeHTTPServerAdapter;
    const cap = capturingDispatcher();
    const { dispatcher } = cap;

    beforeAll(async () => {
        adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        const boundPort = (adapter.server as unknown as { address: () => { port: number } | null }).address()?.port;
        if (boundPort === undefined) {
            throw new Error('adapter did not bind to a port');
        }
        base = `http://127.0.0.1:${boundPort}`;
    });

    afterAll(async () => {
        await adapter.close();
    });

    test('streams multipart/form-data and attaches parts to nodeRequest', async () => {
        const res = await post('/upload', buildMultipartBody(), `multipart/form-data; boundary=${BOUNDARY}`);

        expect(res.status).toBe(200);
        expect(res.json).toEqual({ ok: true });

        const nodeRequest = cap.last?.attributes?.[NODE_REQUEST_ATTRIBUTE] as NodeRequest | undefined;
        expect(nodeRequest).toBeDefined();

        // Text field merged into request.body.
        expect(nodeRequest?.body.title).toBe('hello world');

        // File part attached on the multipart context.
        const context = nodeRequest?.multipart;
        expect(context).toBeDefined();
        expect(context?.fields.title).toBe('hello world');

        const files = context?.files.get('avatar');
        expect(files).toHaveLength(1);
        const file = files?.[0];
        expect(file?.originalFilename).toBe('note.txt');
        expect(file?.contentType).toBe('text/plain');
        expect(new TextDecoder().decode(await file?.bytes())).toBe('file contents here');

        await context?.cleanup();
    });

    test('leaves multipart undefined for a non-multipart body', async () => {
        const res = await post('/echo', Buffer.from(JSON.stringify({ hello: 'world' })), 'application/json');

        expect(res.status).toBe(200);
        const nodeRequest = cap.last?.attributes?.[NODE_REQUEST_ATTRIBUTE] as NodeRequest | undefined;
        expect(nodeRequest?.multipart).toBeUndefined();
    });

    test('a multipart text field named __proto__ merges into the body as an ordinary key (SEC-1)', async () => {
        const payload = [
            `--${BOUNDARY}`,
            'Content-Disposition: form-data; name="__proto__"',
            '',
            'polluted',
            `--${BOUNDARY}--`,
            '',
        ].join('\r\n');
        const res = await post('/upload', Buffer.from(payload), `multipart/form-data; boundary=${BOUNDARY}`);

        expect(res.status).toBe(200);
        const nodeRequest = cap.last?.attributes?.[NODE_REQUEST_ATTRIBUTE] as NodeRequest | undefined;
        expect(nodeRequest).toBeDefined();
        const context = nodeRequest?.multipart;

        // The body record is a plain null-prototype record whose __proto__ is
        // an ordinary key — no hasOwnProperty TypeError, no prototype swap.
        const body = nodeRequest?.body;
        expect(Object.getPrototypeOf(body)).toBeNull();
        expect(Object.hasOwn(body ?? {}, '__proto__')).toBe(true);
        expect(body?.['__proto__']).toBe('polluted');
        // The record stays fully usable end to end.
        expect(JSON.stringify(body)).toBe('{"__proto__":"polluted"}');
        expect(Object.keys(body ?? {})).toEqual(['__proto__']);

        await context?.cleanup();
    });

    test('spilled multipart requests leave no ndigo-upload-* temp files after dispatch (SEC-6)', async () => {
        // `os.tmpdir()` is shared with parallel suites (the ndigo-api uploads
        // spill through this same parser), so transient foreign spill files
        // must be waited out — a real leak from this request never clears.
        const spill = (): string[] =>
            readdirSync(tmpdir(), { withFileTypes: true })
                .filter((entry) => entry.isFile() && entry.name.startsWith('ndigo-upload-'))
                .map((entry) => entry.name);
        const before = new Set(spill());

        const payload = [
            `--${BOUNDARY}`,
            'Content-Disposition: form-data; name="blob"; filename="big.bin"',
            'Content-Type: application/octet-stream',
            '',
            'z'.repeat(300_000), // well above the 128 KiB fileThreshold → spills to tmpdir
            `--${BOUNDARY}--`,
            '',
        ].join('\r\n');
        const res = await post('/upload', Buffer.from(payload), `multipart/form-data; boundary=${BOUNDARY}`);

        expect(res.status).toBe(200);
        // The adapter disposes the parsed context after dispatch — no temp
        // files survive the request.
        const leftoverAfter = async (until: number): Promise<string[]> => {
            const found = spill().filter((name) => !before.has(name));
            if (found.length === 0 || Date.now() >= until) return found;
            await delay(25);
            return leftoverAfter(until);
        };
        await expect(leftoverAfter(Date.now() + 2_000)).resolves.toEqual([]);
    });

    test('Content-Length over the multipart cap rejects 413 before the body is read (SEC-5)', async () => {
        // The adapter surfaces parser limits via NodeHTTPServerAdapterOptions.multipart.
        const cap = capturingDispatcher();
        const limited = new NodeHTTPServerAdapter(cap.dispatcher, { multipart: { maxRequestSize: 24 } });
        await limited.listen(0, '127.0.0.1');
        const port = (limited.server as unknown as { address: () => { port: number } | null }).address()?.port;
        try {
            const res = await new Promise<{ status: number; json: unknown }>((resolve, reject) => {
                const req = httpRequest(`http://127.0.0.1:${port}`, {
                    method: 'POST',
                    path: '/upload',
                    headers: { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` },
                });
                req.on('error', reject);
                req.end(buildMultipartBody());
                req.on('response', (res: IncomingMessage) => {
                    let data = '';
                    res.setEncoding('utf-8');
                    res.on('data', (chunk: string): void => {
                        data += chunk;
                    });
                    res.on('end', (): void => resolve({ status: res.statusCode ?? 0, json: JSON.parse(data) }));
                });
            });
            expect(res.status).toBe(413);
            expect(res.json).toMatchObject({ type: 'urn:ndigo:request_too_large', status: 413 });
        } finally {
            await limited.close();
        }
    });
});
