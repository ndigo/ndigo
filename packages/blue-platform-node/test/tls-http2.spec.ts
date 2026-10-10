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
import { HTTPServer, type HTTPServerAdapter, type TLSServerOptions } from '../src/http-server';
import type { HTTPRequestLimits } from '../src/http-request-limits';

/**
 * TLS origin + HTTP/2 (AD-81): the secure adapter branch binds
 * `http2.createSecureServer({ allowHTTP1: true })` — ALPN negotiates h2
 * with an h1.1 fallback, WebSockets keep riding h1.1 (no RFC 8441), and
 * the drain deadline force-closes tracked sockets (the tls/h2 server has
 * no `closeAllConnections`).
 *
 * Requires the `openssl` CLI for throwaway self-signed server and client
 * certificates; the whole suite is skipped when it is unavailable (CI and
 * dev machines both ship it).
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

async function boot(tls: TLSServerOptions, limits?: HTTPRequestLimits): Promise<NodeHTTPServerAdapter> {
    const context = new MetadataConfigApplicationContext('tls-http2');
    context.register(NodeAutoConfiguration);
    context.setValue(TlsProbeController.name, new TlsProbeController());
    context.refresh();
    const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
    const adapter = new NodeHTTPServerAdapter(dispatcher, { tls, ...(limits !== undefined ? { limits } : {}) });
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
    let clientKeyPath: string;
    let clientCertPath: string;
    let clientKeyPem: string;
    let clientCertPem: string;
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
        // Client identity for the mTLS cases (REV-101): self-signed like the
        // server cert; the server trusts it by pointing `ca` at it.
        clientKeyPath = join(dir, 'client-key.pem');
        clientCertPath = join(dir, 'client-cert.pem');
        execFileSync('openssl', [
            'req',
            '-x509',
            '-newkey',
            'rsa:2048',
            '-nodes',
            '-keyout',
            clientKeyPath,
            '-out',
            clientCertPath,
            '-days',
            '1',
            '-subj',
            '/CN=blue-test-client',
        ]);
        clientKeyPem = readFileSync(clientKeyPath, 'utf8');
        clientCertPem = readFileSync(clientCertPath, 'utf8');
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
        // The filesystem error surfaces as the listen() rejection (AD-81
        // D-3's typed-error contract), not a bare handshake failure later.
        await expect(broken.listen(0, '127.0.0.1')).rejects.toThrow(/ENOENT|no such file/i);
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

    test('clientAuth request admits anonymous clients', async () => {
        const mTls = await boot({ key: keyPath, cert: certPath, ca: certPem, clientAuth: 'request' });
        let client: http2.ClientHttp2Session | null = null;
        try {
            client = http2.connect(`https://127.0.0.1:${portOf(mTls)}`, {
                ca: certPem,
                ALPNProtocols: ['h2'],
                rejectUnauthorized: false,
            });
            try {
                const req = client.request({ ':path': '/probe' });
                req.end();
                const headers = await new Promise<http2.IncomingHttpHeaders>((resolve) => req.on('response', resolve));
                await collectBody(req);
                expect(headers[':status']).toBe(200);
            } finally {
                client.close();
            }
        } finally {
            await mTls.close();
        }
    });

    test('clientAuth require rejects anonymous clients', async () => {
        const mTls = await boot({ key: keyPath, cert: certPath, ca: certPem, clientAuth: 'require' });
        try {
            const client = http2.connect(`https://127.0.0.1:${portOf(mTls)}`, {
                ca: certPem,
                ALPNProtocols: ['h2'],
                rejectUnauthorized: false,
            });
            try {
                // No client certificate: the server aborts the handshake, so
                // the request can never reach the dispatcher.
                const outcome = await new Promise<'ok' | 'error'>((resolve) => {
                    client.once('error', () => resolve('error'));
                    const req = client.request({ ':path': '/probe' });
                    req.once('error', () => resolve('error'));
                    req.once('response', () => resolve('ok'));
                    req.end();
                });
                expect(outcome).toBe('error');
            } finally {
                client.close();
            }
        } finally {
            await mTls.close();
        }
    });

    test('clientAuth require admits a certificate verifying against ca', async () => {
        const mTls = await boot({ key: keyPath, cert: certPath, ca: clientCertPem, clientAuth: 'require' });
        try {
            const client = http2.connect(`https://127.0.0.1:${portOf(mTls)}`, {
                ca: certPem,
                key: clientKeyPem,
                cert: clientCertPem,
                ALPNProtocols: ['h2'],
                rejectUnauthorized: false,
            });
            try {
                const req = client.request({ ':path': '/probe' });
                req.end();
                const headers = await new Promise<http2.IncomingHttpHeaders>((resolve) => req.on('response', resolve));
                await collectBody(req);
                expect(headers[':status']).toBe(200);
            } finally {
                client.close();
            }
        } finally {
            await mTls.close();
        }
    });

    test('maxConcurrentStreams is advertised in server SETTINGS', async () => {
        const capped = await boot({ key: keyPath, cert: certPath, maxConcurrentStreams: 4 });
        try {
            const client = http2.connect(`https://127.0.0.1:${portOf(capped)}`, {
                ca: certPem,
                ALPNProtocols: ['h2'],
                rejectUnauthorized: false,
            });
            try {
                const settings = await new Promise<http2.Settings>((resolve, reject) => {
                    client.once('remoteSettings', resolve);
                    client.once('error', reject);
                });
                expect(settings.maxConcurrentStreams).toBe(4);
            } finally {
                client.close();
            }
        } finally {
            await capped.close();
        }
    });

    test('an invalid maxConcurrentStreams rejects listen()', async () => {
        const bad = new NodeHTTPServerAdapter(new NodeDispatcher(), {
            tls: { key: keyPath, cert: certPath, maxConcurrentStreams: -1 },
        });
        await expect(bad.listen(0, '127.0.0.1')).rejects.toThrow();
    });

    test('minVersion is enforced by the secure listener', async () => {
        const strict = await boot({ key: keyPath, cert: certPath, minVersion: 'TLSv1.3' });
        try {
            // A TLSv1.2-only client cannot handshake against the
            // TLSv1.3-only listener.
            const agent = new https.Agent({
                ca: certPem,
                ALPNProtocols: ['http/1.1'],
                minVersion: 'TLSv1.2',
                maxVersion: 'TLSv1.2',
                rejectUnauthorized: false,
            });
            let handshakeFailed = false;
            await new Promise<void>((resolve) => {
                const req = https.get(`https://127.0.0.1:${portOf(strict)}/probe`, { agent }, () => resolve());
                req.on('error', () => {
                    handshakeFailed = true;
                    resolve();
                });
            });
            expect(handshakeFailed).toBe(true);
        } finally {
            await strict.close();
        }
    });

    test('a bogus cipher list rejects listen()', async () => {
        const bad = new NodeHTTPServerAdapter(new NodeDispatcher(), {
            tls: { key: keyPath, cert: certPath, ciphers: 'NOT-A-CIPHER-SUITE' },
        });
        await expect(bad.listen(0, '127.0.0.1')).rejects.toThrow();
    });

    test('a valid cipher list still serves h2', async () => {
        const ciphered = await boot({
            key: keyPath,
            cert: certPath,
            ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256',
        });
        let client: http2.ClientHttp2Session | null = null;
        try {
            client = http2.connect(`https://127.0.0.1:${portOf(ciphered)}`, {
                ca: certPem,
                ALPNProtocols: ['h2'],
                rejectUnauthorized: false,
            });
            try {
                const req = client.request({ ':path': '/probe' });
                req.end();
                const headers = await new Promise<http2.IncomingHttpHeaders>((resolve) => req.on('response', resolve));
                await collectBody(req);
                expect(headers[':status']).toBe(200);
            } finally {
                client.close();
            }
        } finally {
            await ciphered.close();
        }
    });

    test('inline PEM with surrounding whitespace is still PEM (REV-103)', async () => {
        const inline = await boot({ key: `  \n${readFileSync(keyPath, 'utf8')}`, cert: `\n${certPem}\n` });
        let client: http2.ClientHttp2Session | null = null;
        try {
            client = http2.connect(`https://127.0.0.1:${portOf(inline)}`, {
                ca: certPem,
                ALPNProtocols: ['h2'],
                rejectUnauthorized: false,
            });
            try {
                const req = client.request({ ':path': '/probe' });
                req.end();
                const headers = await new Promise<http2.IncomingHttpHeaders>((resolve) => req.on('response', resolve));
                await collectBody(req);
                expect(headers[':status']).toBe(200);
            } finally {
                client.close();
            }
        } finally {
            await inline.close();
        }
    });

    test('a failed bind leaves the adapter reusable (REV-107)', async () => {
        const occupier = await boot({ key: keyPath, cert: certPath });
        const retry = new NodeHTTPServerAdapter(new NodeDispatcher(), { tls: { key: keyPath, cert: certPath } });
        try {
            await expect(retry.listen(portOf(occupier), '127.0.0.1')).rejects.toThrow();
            // The failed bind must not poison the adapter: a retry on a free
            // ephemeral port succeeds, and a later close() is a clean no-op.
            await retry.listen(0, '127.0.0.1');
            expect(retry.server).not.toBeNull();
        } finally {
            await retry.close();
            await occupier.close();
        }
    });

    test('a half-configured env pair is ignored with a custom adapter (REV-102)', () => {
        const fakeAdapter: HTTPServerAdapter = {
            listen: async () => undefined,
            close: async () => undefined,
            server: null,
        };
        vi.stubEnv('BLUE_TLS_KEY', '-----BEGIN PRIVATE KEY-----\nx');
        try {
            expect(() => new HTTPServer(null, { adapter: fakeAdapter })).not.toThrow();
        } finally {
            vi.unstubAllEnvs();
        }
    });

    test('explicit TLS options win over a half-configured env pair', () => {
        vi.stubEnv('BLUE_TLS_KEY', '-----BEGIN PRIVATE KEY-----\nx');
        try {
            expect(() => new HTTPServer(null, { tls: { key: 'k', cert: 'c' } })).not.toThrow();
        } finally {
            vi.unstubAllEnvs();
        }
    });

    test('blank BLUE_TLS_* values count as unset (REV-103)', () => {
        vi.stubEnv('BLUE_TLS_KEY', '');
        vi.stubEnv('BLUE_TLS_CERT', '   ');
        try {
            expect(() => new HTTPServer(null)).not.toThrow();
        } finally {
            vi.unstubAllEnvs();
        }
    });
});
