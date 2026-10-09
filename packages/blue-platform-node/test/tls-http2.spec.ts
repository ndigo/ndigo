/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as http2 from 'node:http2';
import https from 'node:https';
import type { IncomingMessage } from 'node:http';
import type { AddressInfo } from 'node:net';
import { TLSSocket } from 'node:tls';
import { WebSocket } from 'ws';
import { MetadataConfigApplicationContext } from '@blue/context';
import {
    getMapping,
    postMapping,
    requestMapping,
    socketMapping,
    parameters,
    socketSessionValue,
    bodyValue,
    type SocketSession,
} from '@blue/dispatcher';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { HTTPServer, type TLSServerOptions } from '../src/http-server';

/**
 * TLS origin + HTTP/2 (AD-81): the secure adapter branch binds
 * `http2.createSecureServer({ allowHTTP1: true })` — ALPN negotiates h2
 * with an h1.1 fallback, WebSockets keep riding h1.1 (no RFC 8441), and
 * the drain deadline force-closes tracked sockets (the tls/h2 server has
 * no `closeAllConnections`).
 *
 * Requires the `openssl` CLI for a throwaway self-signed cert; the whole
 * suite is skipped when it is unavailable (CI and dev machines both ship
 * it).
 */

function hasOpenssl(): boolean {
    try {
        execFileSync('openssl', ['version'], { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

const OPENSSL_AVAILABLE = hasOpenssl();

@requestMapping('/')
class TlsProbeController {
    @getMapping('/probe')
    probe() {
        return { ok: true };
    }

    @postMapping('/echo')
    @parameters({ payload: bodyValue() })
    echo(payload: unknown) {
        return { echoed: payload };
    }

    @socketMapping('/ws')
    @parameters({ session: socketSessionValue('session') })
    async *ws(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'echo', data: message };
        }
    }
}

async function boot(tls: TLSServerOptions, limits?: Record<string, number>): Promise<NodeHTTPServerAdapter> {
    const context = new MetadataConfigApplicationContext('tls-http2');
    context.register(NodeAutoConfiguration);
    context.setValue(TlsProbeController.name, new TlsProbeController());
    context.refresh();
    const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
    const adapter = new NodeHTTPServerAdapter(dispatcher, { tls, limits } as never);
    await adapter.listen(0, '127.0.0.1');
    return adapter;
}

function portOf(adapter: NodeHTTPServerAdapter): number {
    // Test seam: `adapter.server` is the bound node listener in this suite.
    const server = adapter.server as { address(): AddressInfo };
    return server.address().port;
}

async function collectBody(stream: NodeJS.ReadableStream): Promise<string> {
    let body = '';
    for await (const chunk of stream) {
        body += String(chunk);
    }
    return body;
}

describe.skipIf(!OPENSSL_AVAILABLE)('TLS origin + HTTP/2 (AD-81)', () => {
    let dir: string;
    let keyPath: string;
    let certPath: string;
    let certPem: string;
    let adapter: NodeHTTPServerAdapter;
    let port: number;

    beforeAll(async () => {
        dir = mkdtempSync(join(tmpdir(), 'blue-tls-http2-'));
        keyPath = join(dir, 'key.pem');
        certPath = join(dir, 'cert.pem');
        execFileSync('openssl', [
            'req',
            '-x509',
            '-newkey',
            'rsa:2048',
            '-nodes',
            '-keyout',
            keyPath,
            '-out',
            certPath,
            '-days',
            '1',
            '-subj',
            '/CN=localhost',
        ]);
        certPem = readFileSync(certPath, 'utf8');
        adapter = await boot({ key: keyPath, cert: certPath });
        port = portOf(adapter);
    });

    afterAll(async () => {
        await adapter?.close();
        rmSync(dir, { recursive: true, force: true });
    });

    test('an h2 client negotiates 2.0 and reaches the dispatcher', async () => {
        const client = http2.connect(`https://127.0.0.1:${port}`, {
            ca: certPem,
            ALPNProtocols: ['h2'],
            rejectUnauthorized: false,
        });
        try {
            const req = client.request({ ':path': '/probe' });
            req.end();
            const headers = await new Promise<http2.IncomingHttpHeaders>((resolve) => req.on('response', resolve));
            const body = await collectBody(req);
            expect(headers[':status']).toBe(200);
            expect(JSON.parse(body)).toEqual({ ok: true });
            // ALPN is populated once the session is established — after the
            // exchange, never before the first handshake completes.
            if (client.socket instanceof TLSSocket) {
                expect(client.socket.alpnProtocol).toBe('h2');
            }
        } finally {
            client.close();
        }
    });

    test('an h1.1 TLS client falls back via allowHTTP1', async () => {
        const agent = new https.Agent({ ca: certPem, ALPNProtocols: ['http/1.1'], rejectUnauthorized: false });
        const res = await new Promise<IncomingMessage>((resolve, reject) => {
            const req = https.get(`https://127.0.0.1:${port}/probe`, { agent }, resolve);
            req.on('error', reject);
        });
        const body = await collectBody(res);
        expect(res.httpVersion).toBe('1.1');
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(body)).toEqual({ ok: true });
    });

    test('a POST body binds through the h2 compat layer', async () => {
        const client = http2.connect(`https://127.0.0.1:${port}`, {
            ca: certPem,
            ALPNProtocols: ['h2'],
            rejectUnauthorized: false,
        });
        try {
            const req = client.request({
                ':path': '/echo',
                ':method': 'POST',
                'content-type': 'application/json',
            });
            req.end(JSON.stringify({ name: 'tls' }));
            const headers = await new Promise<http2.IncomingHttpHeaders>((resolve) => req.on('response', resolve));
            const body = await collectBody(req);
            expect(headers[':status']).toBe(200);
            expect(JSON.parse(body)).toEqual({ echoed: { name: 'tls' } });
        } finally {
            client.close();
        }
    });

    test('method mismatch over h2 returns 405 with Allow', async () => {
        const client = http2.connect(`https://127.0.0.1:${port}`, {
            ca: certPem,
            ALPNProtocols: ['h2'],
            rejectUnauthorized: false,
        });
        try {
            const req = client.request({ ':path': '/probe', ':method': 'POST' });
            req.end();
            const headers = await new Promise<http2.IncomingHttpHeaders>((resolve) => req.on('response', resolve));
            await collectBody(req);
            expect(headers[':status']).toBe(405);
            expect(headers['allow']).toContain('GET');
        } finally {
            client.close();
        }
    });

    test('WebSocket upgrades keep working over the h1.1 fallback', async () => {
        const ws = new WebSocket(`wss://127.0.0.1:${port}/ws`, { rejectUnauthorized: false });
        const received = new Promise<unknown>((resolve, reject) => {
            ws.once('message', (data: unknown) => resolve(data));
            ws.once('error', reject);
        });
        await new Promise<void>((resolve, reject) => {
            ws.once('open', resolve);
            ws.once('error', reject);
        });
        ws.send('ping');
        const reply = await received;
        expect(String(reply)).toContain('ping');
        await new Promise<void>((resolve) => {
            ws.once('close', resolve);
            ws.close();
        });
    });

    test('inline PEM material is accepted (env-style one-line credentials)', async () => {
        const inline = await boot({ key: readFileSync(keyPath, 'utf8'), cert: certPem }, { shutdownTimeoutMs: 500 });
        try {
            const client = http2.connect(`https://127.0.0.1:${portOf(inline)}`, {
                ca: certPem,
                ALPNProtocols: ['h2'],
                rejectUnauthorized: false,
            });
            try {
                const req = client.request({ ':path': '/probe' });
                req.end();
                const headers = await new Promise<http2.IncomingHttpHeaders>((resolve) => req.on('response', resolve));
                expect(headers[':status']).toBe(200);
            } finally {
                client.close();
            }
        } finally {
            await inline.close();
        }
    });

    test('an unreadable key path rejects listen() with a typed error', async () => {
        const broken = new NodeHTTPServerAdapter(new NodeDispatcher(), {
            tls: { key: join(dir, 'missing.pem'), cert: certPath },
        });
        await expect(broken.listen(0, '127.0.0.1')).rejects.toThrow();
    });

    test('a half-configured env pair throws instead of serving plaintext', () => {
        vi.stubEnv('BLUE_TLS_KEY', '-----BEGIN PRIVATE KEY-----\nx');
        try {
            expect(() => new HTTPServer(null)).toThrow(/BLUE_TLS_KEY and BLUE_TLS_CERT must be set together/);
        } finally {
            vi.unstubAllEnvs();
        }
        vi.stubEnv('BLUE_TLS_KEY', '-----BEGIN PRIVATE KEY-----\nx');
        vi.stubEnv('BLUE_TLS_CERT', '-----BEGIN CERTIFICATE-----\nx');
        try {
            expect(() => new HTTPServer(null)).not.toThrow();
        } finally {
            vi.unstubAllEnvs();
        }
    });

    test('the drain deadline force-closes an open TLS connection', async () => {
        const draining = await boot({ key: keyPath, cert: certPath }, { shutdownTimeoutMs: 150 });
        const ws = new WebSocket(`wss://127.0.0.1:${portOf(draining)}/ws`, { rejectUnauthorized: false });
        await new Promise<void>((resolve, reject) => {
            ws.once('open', resolve);
            ws.once('error', reject);
        });
        const started = Date.now();
        await draining.close();
        expect(Date.now() - started).toBeLessThan(2_000);
    });
});
