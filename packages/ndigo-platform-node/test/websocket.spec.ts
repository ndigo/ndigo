/**
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect, vi } from 'vitest';
import { authenticated, authorized } from '@ndigo/auth-core';
import { MetadataConfigApplicationContext } from '@ndigo/context';
import {
    getMapping,
    requestMapping,
    socketMapping,
    parameters,
    socketSessionValue,
    queryValue,
    headerValue,
    type SocketSession,
} from '@ndigo/dispatcher';
import { delay } from '@ndigo/util';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { NodeSocketSessionRegistry } from '../src/node-socket-session-registry';
import { HTTPServer } from '../src/http-server';
import { WebSocket } from 'ws';

/**
 * End-to-end WebSocket integration through the Node pipeline:
 * context → NodeAutoConfiguration → NodeDispatcher → adapter → RFC 6455.
 *
 * Boots a real `node:http` server with the adapter's WebSocketServer
 * upgrade listener, connects a real `ws` client, and asserts the socket
 * handler receive/send contract.
 */

@requestMapping('/')
class SocketController {
    @getMapping('/')
    greet() {
        return { message: 'Hello, Socket!' };
    }

    @socketMapping('/echo')
    @parameters({ session: socketSessionValue('session') })
    async *echo(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'echo', data: message };
        }
    }

    // Room membership (AD-21 D5): the handler joins 'lobby' on connect;
    // the adapter's registry then fans out broadcastTo('lobby', …) to it.
    @socketMapping('/lobby')
    @parameters({ session: socketSessionValue('session') })
    async *lobby(session: SocketSession) {
        session.join('lobby');
        for await (const message of session.messages) {
            yield { event: 'lobby', data: message };
        }
    }

    // @parameters on a socket: bound from the upgrade sources into
    // session.params (query/header), gated by the query condition.
    @socketMapping({ value: '/room', queryParams: 'token=abc', private: false })
    @parameters({
        session: socketSessionValue('session'),
        token: queryValue('token'),
        via: headerValue('x-via'),
    })
    async *room(session: SocketSession, token: string, via: string) {
        for await (const message of session.messages) {
            yield {
                event: 'room',
                data: { token: String(token), via: String(via), text: String(message) },
            };
        }
    }
}

describe('Node WebSocket pipeline', () => {
    let context: MetadataConfigApplicationContext;
    let server: HTTPServer;
    let adapter: NodeHTTPServerAdapter;
    let httpBase: string;
    let wsUrl: string;

    beforeAll(async () => {
        context = new MetadataConfigApplicationContext('ws-integration');
        context.register(NodeAutoConfiguration);
        context.setValue(SocketController.name, new SocketController());
        context.refresh();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        const boundPort = (
            adapter.server as unknown as {
                address: () => { port: number } | null;
            }
        ).address()?.port;
        httpBase = `http://127.0.0.1:${boundPort}`;
        wsUrl = `ws://127.0.0.1:${boundPort}`;

        server = new HTTPServer(dispatcher, { adapter });
    });

    afterAll(async () => {
        await server?.close();
    });

    test('regular HTTP still works on a socket-enabled server', async () => {
        const res = await fetch(`${httpBase}/`);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ message: 'Hello, Socket!' });
    });

    test('a plain GET to a socket path is not upgraded (no WS handshake)', async () => {
        const res = await fetch(`${httpBase}/echo`);
        // No Upgrade header → the request is a normal HTTP request; no socket
        // handler matches GET, so it is 404/405, never a 101 Upgrade.
        expect([400, 404, 405]).toContain(res.status);
    });

    test('WebSocket upgrade at /echo echoes a message back', async () => {
        const ws = new WebSocket(`${wsUrl}/echo`);
        const opened = new Promise<void>((resolve, reject) => {
            ws.on('open', () => resolve());
            ws.on('error', reject);
        });
        await opened;

        const received = new Promise<unknown>((resolve) => {
            ws.once('message', (data: unknown) => resolve(data));
        });
        ws.send('ping');

        const reply = await received;
        expect(JSON.parse(String(reply))).toEqual({ event: 'echo', data: 'ping' });
        ws.close(1000, 'done');
    });

    test('unknown socket path refuses the handshake', async () => {
        const ws = new WebSocket(`${wsUrl}/nope`);
        let failed = false;
        ws.on('error', () => {
            failed = true;
        });
        // Allow a brief window for the refusal; the socket must not open.
        await delay(300);
        expect(failed).toBe(true);
    });

    test('queryParams condition gates a socket upgrade (original mapping API reused)', async () => {
        const ws = new WebSocket(`${wsUrl}/room?token=abc`, { headers: { 'x-via': 'ws-client' } });
        const opened = new Promise<void>((resolve, reject) => {
            ws.on('open', () => resolve());
            ws.on('error', reject);
        });
        await opened;

        const received = new Promise<unknown>((resolve) => {
            ws.once('message', (data: unknown) => resolve(data));
        });
        ws.send('hello room');

        const reply = await received;
        const parsed = JSON.parse(String(reply));
        // @parameters bound from the upgrade sources into session.params.
        expect(parsed).toEqual({ event: 'room', data: { token: 'abc', via: 'ws-client', text: 'hello room' } });
        ws.close(1000, 'done');
    });

    test('wrong query token fails the socket handshake (condition does not match)', async () => {
        const ws = new WebSocket(`${wsUrl}/room?token=wrong`);
        let failed = false;
        ws.on('open', () => {
            failed = false;
        });
        ws.on('error', () => {
            failed = true;
        });
        await delay(300);
        // Either the handshake errors (refused) or never opens — the socket
        // must not be usable.
        expect(failed).toBe(true);
    });

    const open = (ws: WebSocket): Promise<void> => {
        const { promise, resolve, reject } = Promise.withResolvers<void>();
        ws.once('open', resolve);
        ws.once('error', reject);
        return promise;
    };
    const waitMessage = (ws: WebSocket): Promise<unknown> => {
        const { promise, resolve } = Promise.withResolvers<unknown>();
        ws.once('message', (data: unknown) => resolve(JSON.parse(String(data))));
        return promise;
    };

    test('registry tracks live sessions and broadcasts to a path (AD-21)', async () => {
        const a = new WebSocket(`${wsUrl}/echo`);
        const b = new WebSocket(`${wsUrl}/echo`);
        await Promise.all([open(a), open(b)]);
        expect(adapter.socketRegistry.count('/echo')).toBe(2);

        // Out-of-handler push: any service with the registry can fan out.
        const ra = waitMessage(a);
        const rb = waitMessage(b);
        await adapter.socketRegistry.broadcast('/echo', { event: 'server', data: 'fan' });
        await expect(ra).resolves.toEqual({ event: 'server', data: 'fan' });
        await expect(rb).resolves.toEqual({ event: 'server', data: 'fan' });

        a.close(1000, 'done');
        b.close(1000, 'done');
        await delay(150);
        expect(adapter.socketRegistry.count('/echo')).toBe(0);
    });

    test('handler room join enables broadcastTo (AD-21 D5)', async () => {
        const ws = new WebSocket(`${wsUrl}/lobby`);
        await open(ws);
        expect(adapter.socketRegistry.count('/lobby')).toBe(1);
        // Give the handler a beat to run session.join('lobby').
        await delay(50);

        const received = waitMessage(ws);
        await adapter.socketRegistry.broadcastTo('lobby', { event: 'push', data: 'tick' });
        await expect(received).resolves.toEqual({ event: 'push', data: 'tick' });
        ws.close(1000, 'done');
    });
});

describe('WebSocket origin enforcement', () => {
    let originServer: HTTPServer;
    let originWsUrl: string;

    beforeAll(async () => {
        const originContext = new MetadataConfigApplicationContext('ws-origin');
        originContext.register(NodeAutoConfiguration);
        originContext.setValue(SocketController.name, new SocketController());
        originContext.refresh();
        const dispatcher = originContext.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher, {
            allowedWebSocketOrigins: ['http://127.0.0.1:9999'],
        });
        await adapter.listen(0, '127.0.0.1');
        // adapter.server is `unknown` by contract; the http server's
        // address() is the only shape offered here.
        const boundAddress = adapter.server as { address: () => { port: number } | null };
        const boundPort = boundAddress.address()?.port;
        originWsUrl = `ws://127.0.0.1:${boundPort}`;
        originServer = new HTTPServer(dispatcher, { adapter });
    });

    afterAll(async () => {
        await originServer?.close();
    });

    test('an allowlisted Origin upgrades normally', async () => {
        const ws = new WebSocket(`${originWsUrl}/echo`, { origin: 'http://127.0.0.1:9999' });
        const { promise: opened, resolve, reject } = Promise.withResolvers<void>();
        ws.on('open', resolve);
        ws.on('error', reject);
        await opened;

        const received = new Promise<unknown>((resolve) => {
            ws.once('message', (data: unknown) => resolve(data));
        });
        ws.send('ping');

        const reply = await received;
        expect(JSON.parse(String(reply))).toEqual({ event: 'echo', data: 'ping' });
        ws.close(1000, 'done');
    });

    test('a forged Origin is rejected with 403 before the connection fires', async () => {
        const ws = new WebSocket(`${originWsUrl}/echo`, { headers: { origin: 'https://evil.example' } });
        // The security control is the HTTP status: any refusal — 400, 401,
        // 500, or a stalled handshake — would pass an error-event-only
        // assertion, so pin the actual 403 the verifyClient callback sends.
        // (Attaching an `unexpected-response` listener suppresses ws's
        // generic error event for this path by design.)
        const status = await new Promise<number | null>((resolve) => {
            ws.once('unexpected-response', (_request, response) => resolve(response.statusCode ?? null));
            setTimeout(() => resolve(null), 400);
        });
        expect(status).toBe(403);
    });

    test('a missing Origin fails closed when the allowlist is configured', async () => {
        const ws = new WebSocket(`${originWsUrl}/echo`);
        const status = await new Promise<number | null>((resolve) => {
            ws.once('unexpected-response', (_request, response) => resolve(response.statusCode ?? null));
            setTimeout(() => resolve(null), 400);
        });
        expect(status).toBe(403);
    });

    test('invalid allowedWebSocketOrigins entries are rejected at construction', () => {
        const context = new MetadataConfigApplicationContext('ws-origin-invalid');
        context.register(NodeAutoConfiguration);
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        expect(
            () => new NodeHTTPServerAdapter(dispatcher, { allowedWebSocketOrigins: ['https://x.example/path'] })
        ).toThrow(RangeError);
        expect(() => new NodeHTTPServerAdapter(dispatcher, { allowedWebSocketOrigins: ['not-a-url'] })).toThrow(
            RangeError
        );
    });
});

describe('WebSocket upgrade authentication + limits', () => {
    let context: MetadataConfigApplicationContext;
    let adapter: NodeHTTPServerAdapter;
    let wsUrl: string;
    const seenPaths: string[] = [];

    @requestMapping('/authws')
    class AuthedSocketController {
        @socketMapping('/private')
        @parameters({ session: socketSessionValue('session') })
        async *privateEcho(session: SocketSession) {
            for await (const message of session.messages) {
                // Text frames arrive as strings; binary frames as bytes
                // (AD-23 D8) — decode explicitly for the text contract.
                const data = typeof message === 'string' ? message : new TextDecoder().decode(message as Uint8Array);
                yield { event: 'private', principal: session.attributes['principal'], data };
            }
        }
    }

    @requestMapping('/brokenws')
    class BrokenSocketController {
        // Broadcast-style handler: consumes messages without yielding —
        // returns a Promise, exercising the async-handler path. The throw
        // inside must route to session.close(1011), not crash the process.
        @socketMapping('/boom')
        @parameters({ session: socketSessionValue('session') })
        async broken(session: SocketSession) {
            seenPaths.push(session.path);
            for await (const _message of session.messages) {
                throw new Error('handler exploded');
            }
        }

        // Never drains inbound: lets the bounded queue fill so the overflow
        // close (1009) is observable.
        @socketMapping('/sink')
        async *sink() {
            // Pends forever without consuming `session.messages`.
            await new Promise<void>(() => undefined);
            yield undefined; // unreachable — keeps the generator shape
        }
    }

    const open = (ws: WebSocket): Promise<void> => {
        const { promise, resolve, reject } = Promise.withResolvers<void>();
        ws.once('open', resolve);
        ws.once('error', reject);
        return promise;
    };
    const waitClose = (ws: WebSocket): Promise<{ code: number; reason: string }> => {
        const { promise, resolve } = Promise.withResolvers<{ code: number; reason: string }>();
        ws.once('close', (code: number, reason: Buffer) => {
            resolve({ code, reason: reason.toString() });
        });
        return promise;
    };

    beforeAll(async () => {
        context = new MetadataConfigApplicationContext('ws-auth-limits');
        context.register(NodeAutoConfiguration);
        context.setValue(AuthedSocketController.name, new AuthedSocketController());
        context.setValue(BrokenSocketController.name, new BrokenSocketController());
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher, {
            authenticate: (sources) => {
                const token = String(sources.query['token'] ?? '');
                if (token !== 'good') {
                    return null;
                }
                return { principal: 'alice', token };
            },
            socketLimits: { maxQueuedMessages: 2 },
        });
        await adapter.listen(0, '127.0.0.1');
        const boundAddress = adapter.server as { address: () => { port: number } | null };
        const boundPort = boundAddress.address()?.port;
        wsUrl = `ws://127.0.0.1:${boundPort}`;
    });

    afterAll(async () => {
        await adapter?.close();
    });

    test('authenticate hook rejects upgrades without a valid token (1008)', async () => {
        const ws = new WebSocket(`${wsUrl}/authws/private`);
        const closed = waitClose(ws);
        ws.on('error', () => undefined); // ws surfaces the 1008 as an error too
        await expect(closed).resolves.toMatchObject({ code: 1008 });
        expect(seenPaths).toEqual([]);
    });

    test('authenticate hook populates session.attributes before the handler runs', async () => {
        const ws = new WebSocket(`${wsUrl}/authws/private?token=good`);
        await open(ws);
        const reply = waitMessage(ws);
        ws.send('hi');
        await expect(reply).resolves.toEqual({ event: 'private', principal: 'alice', data: 'hi' });
        ws.close(1000, 'done');
    });

    test('an async (non-generator) handler rejection closes the session with 1011', async () => {
        const ws = new WebSocket(`${wsUrl}/brokenws/boom?token=good`);
        await open(ws);
        ws.on('error', () => undefined);
        const closed = waitClose(ws);
        ws.send('trigger');
        await expect(closed).resolves.toMatchObject({ code: 1011, reason: 'handler error' });
        expect(seenPaths).toEqual(['/brokenws/boom']);
    });

    test('inbound queue overflow closes the session (1013) under a tiny cap', async () => {
        // maxQueuedMessages: 2 — the /sink handler never drains, so the
        // queue fills and the third message trips the overflow close.
        // 1013 ("try again later"): the consuming side is the slow party —
        // 1009 stays reserved for per-frame size violations (ws sends it
        // for maxPayload).
        const ws = new WebSocket(`${wsUrl}/brokenws/sink?token=good`);
        await open(ws);
        ws.on('error', () => undefined);
        const closed = waitClose(ws);
        ws.send('1');
        ws.send('2');
        ws.send('3');
        await expect(closed).resolves.toMatchObject({ code: 1013, reason: 'inbound queue overflow' });
    });

    test('binary frames arrive byte-exact; handlers decode explicitly (AD-23 D8)', async () => {
        const ws = new WebSocket(`${wsUrl}/authws/private?token=good`);
        await open(ws);
        const reply = waitMessage(ws);
        ws.send(Buffer.from('héllo binary'));
        // The old "binary arrives as UTF-8 strings" promise is replaced:
        // binary frames surface as Uint8Array (AD-23 D8) and the handler
        // decodes; text frames still arrive as strings.
        await expect(reply).resolves.toEqual({ event: 'private', principal: 'alice', data: 'héllo binary' });
        ws.close(1000, 'done');
    });
});

const waitMessage = (ws: WebSocket): Promise<unknown> => {
    const { promise, resolve } = Promise.withResolvers<unknown>();
    ws.once('message', (data: unknown) => resolve(JSON.parse(String(data))));
    return promise;
};

describe('WebSocket upgrade auth failure modes', () => {
    let context: MetadataConfigApplicationContext;
    let adapter: NodeHTTPServerAdapter;
    let registry: NodeSocketSessionRegistry;
    let wsUrl: string;
    const seenPaths: string[] = [];

    @requestMapping('/flaky')
    class FlakySocketController {
        @socketMapping('/x')
        @parameters({ session: socketSessionValue('session') })
        async *echo(session: SocketSession) {
            seenPaths.push(session.path);
            for await (const message of session.messages) {
                yield { event: 'echo', data: message };
            }
        }
    }

    beforeAll(async () => {
        context = new MetadataConfigApplicationContext('ws-auth-failures');
        context.register(NodeAutoConfiguration);
        context.setValue(FlakySocketController.name, new FlakySocketController());
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        registry = new NodeSocketSessionRegistry();
        adapter = new NodeHTTPServerAdapter(dispatcher, {
            socketRegistry: registry,
            authenticate: async () => {
                // The hook holds long enough for a peer close to race the
                // auth await, then fails — the identity provider is down.
                await new Promise<void>((resolve) => setTimeout(resolve, 120));
                throw new Error('identity provider down');
            },
        });
        await adapter.listen(0, '127.0.0.1');
        const boundAddress = adapter.server as { address: () => { port: number } | null };
        const boundPort = boundAddress.address()?.port;
        wsUrl = `ws://127.0.0.1:${boundPort}`;
    });

    const open = (ws: WebSocket): Promise<void> => {
        const { promise, resolve, reject } = Promise.withResolvers<void>();
        ws.once('open', resolve);
        ws.once('error', reject);
        return promise;
    };
    const waitClose = (ws: WebSocket): Promise<{ code: number; reason: string }> => {
        const { promise, resolve } = Promise.withResolvers<{ code: number; reason: string }>();
        ws.once('close', (code: number, reason: Buffer) => {
            resolve({ code, reason: reason.toString() });
        });
        return promise;
    };

    afterAll(async () => {
        await adapter?.close();
    });

    test('a throwing authenticate hook closes the upgrade with 1011 and never tracks the session', async () => {
        const ws = new WebSocket(`${wsUrl}/flaky/x`);
        const closed = waitClose(ws);
        ws.on('error', () => undefined);
        await expect(closed).resolves.toMatchObject({ code: 1011, reason: 'authentication failed' });
        expect(seenPaths).toEqual([]);
        expect(registry.count('/flaky/x')).toBe(0);
    });

    test('a peer closing while authentication is pending leaves no registry entry', async () => {
        const ws = new WebSocket(`${wsUrl}/flaky/x`);
        await open(ws);
        // Close before the 120ms auth hook resolves — the removal listener
        // attached at session creation must already be registered.
        ws.close(1000, 'impatient');
        await vi.waitFor(() => expect(registry.count('/flaky/x')).toBe(0));
        expect(seenPaths).toEqual([]);
    });
});

describe('socket auth metadata enforcement (SEC-3)', () => {
    let context: MetadataConfigApplicationContext;
    let server: HTTPServer;
    let adapter: NodeHTTPServerAdapter;
    let wsUrl: string;
    let httpBase: string;

    @requestMapping('/gate')
    class GatedSocketController {
        // No auth metadata: the public-socket posture (SEC-3's documented
        // contrast) — the identity bag is still bound when a hook supplies one.
        @socketMapping('/open')
        @parameters({ session: socketSessionValue('session') })
        async *open(session: SocketSession) {
            for await (const message of session.messages) {
                yield { event: 'open', user: session.attributes['user'] ?? null, data: message };
            }
        }

        @socketMapping('/private')
        @authenticated
        @parameters({ session: socketSessionValue('session') })
        async *priv(session: SocketSession) {
            for await (const message of session.messages) {
                yield { event: 'private', user: session.attributes['user'] ?? null, data: message };
            }
        }

        // Roles imply authentication (the AuthRouteGuard contract): a
        // principal without the role is denied, one with it proceeds.
        @socketMapping('/admin')
        @authorized('admin')
        @parameters({ session: socketSessionValue('session') })
        async *admin(session: SocketSession) {
            for await (const message of session.messages) {
                yield { event: 'admin', user: session.attributes['user'] ?? null, data: message };
            }
        }

        // `queryValue()` binds the whole parsed query map, so the handler
        // observes exactly the map the adapter built from the URL.
        @socketMapping('/proto')
        @parameters({ session: socketSessionValue('session'), query: queryValue() })
        async *proto(session: SocketSession, query: Record<string, string | string[]>) {
            for await (const message of session.messages) {
                yield {
                    event: 'proto',
                    prototypeIsNull: Object.getPrototypeOf(query) === null,
                    ownProtoKey: Object.hasOwn(query, '__proto__'),
                    values: query['__proto__'],
                    data: message,
                };
            }
        }

        @getMapping('/query-proto')
        @parameters({ query: queryValue() })
        protoQuery(query: Record<string, string | string[]>) {
            return {
                prototypeIsNull: Object.getPrototypeOf(query) === null,
                ownProtoKey: Object.hasOwn(query, '__proto__'),
                values: query['__proto__'],
            };
        }
    }

    // Class-level `@authenticated`: every socket method on the controller is
    // gated (the other metadata form the adapter must read).
    @requestMapping('/classgate')
    @authenticated
    class ClassGatedSocketController {
        @socketMapping('/echo')
        @parameters({ session: socketSessionValue('session') })
        async *echo(session: SocketSession) {
            for await (const message of session.messages) {
                yield { event: 'class', user: session.attributes['user'] ?? null, data: message };
            }
        }
    }

    const open = (ws: WebSocket): Promise<void> => {
        const { promise, resolve, reject } = Promise.withResolvers<void>();
        ws.once('open', resolve);
        ws.once('error', reject);
        return promise;
    };
    const waitMessage = (ws: WebSocket): Promise<unknown> => {
        const { promise, resolve } = Promise.withResolvers<unknown>();
        ws.once('message', (data: unknown) => resolve(JSON.parse(String(data))));
        return promise;
    };
    const waitClose = (ws: WebSocket): Promise<{ code: number; reason: string }> => {
        const { promise, resolve } = Promise.withResolvers<{ code: number; reason: string }>();
        ws.once('close', (code: number, reason: Buffer) => {
            resolve({ code, reason: reason.toString() });
        });
        return promise;
    };

    /** Demo identity: shape-checks like `@ndigo/auth-core`'s `Principal`. */
    const principal = (id: string, roles: string[]) => ({
        id,
        hasRole: (role: string): boolean => roles.includes(role),
    });

    beforeAll(async () => {
        context = new MetadataConfigApplicationContext('ws-auth-gate');
        context.register(NodeAutoConfiguration);
        context.setValue(GatedSocketController.name, new GatedSocketController());
        context.setValue(ClassGatedSocketController.name, new ClassGatedSocketController());
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher, {
            // A 64-byte cookie bound makes SEC-10's upgrade-path check
            // observable; 100 ms keeps the hanging-hook test quick.
            limits: { maxHeaderBytes: 64 },
            authenticateTimeoutMs: 100,
            authenticate: async (sources) => {
                const token = String(sources.query['token'] ?? '');
                // Anonymous: public endpoints still upgrade; decorated ones
                // fail closed on the missing principal.
                if (token === '') return {};
                if (token === 'alice') return { principal: principal('alice', ['user']), user: 'alice' };
                if (token === 'root') return { principal: principal('root', ['admin']), user: 'root' };
                // Never settles: exercises the SEC-9 authentication budget.
                if (token === 'hang') {
                    await new Promise<void>(() => undefined);
                    return null;
                }
                // A presented credential that resolves to nothing is a failed
                // authentication, not anonymity.
                return null;
            },
        });
        await adapter.listen(0, '127.0.0.1');
        const boundPort = (adapter.server as { address: () => { port: number } | null }).address()?.port;
        wsUrl = `ws://127.0.0.1:${boundPort}`;
        httpBase = `http://127.0.0.1:${boundPort}`;
        server = new HTTPServer(dispatcher, { adapter });
    });

    afterAll(async () => {
        await server?.close();
    });

    test('an upgrade to an @authenticated path without a principal is closed with 1008', async () => {
        const ws = new WebSocket(`${wsUrl}/gate/private`);
        ws.on('error', () => undefined);
        await expect(waitClose(ws)).resolves.toMatchObject({ code: 1008, reason: 'authentication required' });
    });

    test('an authenticated upgrade reaches the handler with its identity bag', async () => {
        const ws = new WebSocket(`${wsUrl}/gate/private?token=alice`);
        await open(ws);
        const reply = waitMessage(ws);
        ws.send('hi');
        await expect(reply).resolves.toEqual({ event: 'private', user: 'alice', data: 'hi' });
        ws.close(1000, 'done');
    });

    test('class-level @authenticated gates the controller socket methods too', async () => {
        const anonymous = new WebSocket(`${wsUrl}/classgate/echo`);
        anonymous.on('error', () => undefined);
        await expect(waitClose(anonymous)).resolves.toMatchObject({
            code: 1008,
            reason: 'authentication required',
        });

        const authed = new WebSocket(`${wsUrl}/classgate/echo?token=alice`);
        await open(authed);
        const reply = waitMessage(authed);
        authed.send('class');
        await expect(reply).resolves.toEqual({ event: 'class', user: 'alice', data: 'class' });
        authed.close(1000, 'done');
    });

    test('a principal missing a required role is closed with 1008', async () => {
        const ws = new WebSocket(`${wsUrl}/gate/admin?token=alice`);
        ws.on('error', () => undefined);
        await expect(waitClose(ws)).resolves.toMatchObject({ code: 1008, reason: 'insufficient role' });
    });

    test('a principal holding the required role proceeds', async () => {
        const ws = new WebSocket(`${wsUrl}/gate/admin?token=root`);
        await open(ws);
        const reply = waitMessage(ws);
        ws.send('go');
        await expect(reply).resolves.toEqual({ event: 'admin', user: 'root', data: 'go' });
        ws.close(1000, 'done');
    });

    test('an unresolvable token is refused by the hook before the handler runs', async () => {
        const ws = new WebSocket(`${wsUrl}/gate/open?token=bogus`);
        ws.on('error', () => undefined);
        await expect(waitClose(ws)).resolves.toMatchObject({ code: 1008, reason: 'authentication required' });
    });

    test('an undecorated socket path is unaffected by the metadata check', async () => {
        const ws = new WebSocket(`${wsUrl}/gate/open`);
        await open(ws);
        const reply = waitMessage(ws);
        ws.send('public');
        await expect(reply).resolves.toEqual({ event: 'open', user: null, data: 'public' });
        ws.close(1000, 'done');
    });

    test('a hanging authenticate hook is closed with 1011 at the timeout', async () => {
        const ws = new WebSocket(`${wsUrl}/gate/private?token=hang`);
        ws.on('error', () => undefined);
        await expect(waitClose(ws)).resolves.toMatchObject({ code: 1011, reason: 'authentication timeout' });
    });

    test('an oversized handshake header is refused on the upgrade path (SEC-10)', async () => {
        const ws = new WebSocket(`${wsUrl}/gate/open`, { headers: { cookie: `big=${'a'.repeat(200)}` } });
        const status = await new Promise<number | null>((resolve) => {
            ws.once('unexpected-response', (_request, response) => resolve(response.statusCode ?? null));
            setTimeout(() => resolve(null), 400);
        });
        // Refused before the 101: the handshake aborts with a 400.
        expect(status).toBe(400);
    });

    test('repeated __proto__ parameters leave the socket query map intact (SEC-8)', async () => {
        const ws = new WebSocket(`${wsUrl}/gate/proto?__proto__=a&__proto__=b`);
        await open(ws);
        const reply = waitMessage(ws);
        ws.send('go');
        await expect(reply).resolves.toEqual({
            event: 'proto',
            prototypeIsNull: true,
            ownProtoKey: true,
            values: ['a', 'b'],
            data: 'go',
        });
        ws.close(1000, 'done');
    });

    test('repeated __proto__ parameters leave the HTTP query map intact (SEC-8)', async () => {
        const response = await fetch(`${httpBase}/gate/query-proto?__proto__=a&__proto__=b`);
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            prototypeIsNull: true,
            ownProtoKey: true,
            values: ['a', 'b'],
        });
    });

    test('an explicit authenticate option wins over the socketRequestAuthenticator bean', async () => {
        // The managed server resolves the bean only as a fallback: an app
        // that passes its own hook keeps it.
        const beanContext = new MetadataConfigApplicationContext('ws-auth-precedence');
        beanContext.register(NodeAutoConfiguration);
        beanContext.setValue(GatedSocketController.name, new GatedSocketController());
        beanContext.setValue('socketRequestAuthenticator', {
            authenticate: () => ({ principal: principal('bean', ['admin']), user: 'bean' }),
        });
        beanContext.refresh();

        const managed = new HTTPServer(beanContext.getValue<NodeDispatcher>('dispatcher'), {
            port: 0,
            authenticate: () => ({ principal: principal('option', ['admin']), user: 'option' }),
        });
        managed.setApplicationContext(beanContext);
        await managed.start();
        try {
            const port = (managed.server as { address: () => { port: number } | null }).address()?.port;
            const ws = new WebSocket(`ws://127.0.0.1:${port}/gate/private`);
            await open(ws);
            const reply = waitMessage(ws);
            ws.send('who');
            await expect(reply).resolves.toEqual({ event: 'private', user: 'option', data: 'who' });
            ws.close(1000, 'done');
        } finally {
            await managed.close();
        }
    });
});

describe('socket connection cap (SEC-9)', () => {
    let context: MetadataConfigApplicationContext;
    let adapter: NodeHTTPServerAdapter;
    let wsUrl: string;

    @requestMapping('/cap')
    class CapSocketController {
        @socketMapping('/echo')
        @parameters({ session: socketSessionValue('session') })
        async *echo(session: SocketSession) {
            for await (const message of session.messages) {
                yield { event: 'echo', data: message };
            }
        }
    }

    const open = (ws: WebSocket): Promise<void> => {
        const { promise, resolve, reject } = Promise.withResolvers<void>();
        ws.once('open', resolve);
        ws.once('error', reject);
        return promise;
    };
    const waitMessage = (ws: WebSocket): Promise<unknown> => {
        const { promise, resolve } = Promise.withResolvers<unknown>();
        ws.once('message', (data: unknown) => resolve(JSON.parse(String(data))));
        return promise;
    };
    const waitClose = (ws: WebSocket): Promise<{ code: number; reason: string }> => {
        const { promise, resolve } = Promise.withResolvers<{ code: number; reason: string }>();
        ws.once('close', (code: number, reason: Buffer) => {
            resolve({ code, reason: reason.toString() });
        });
        return promise;
    };

    beforeAll(async () => {
        context = new MetadataConfigApplicationContext('ws-connection-cap');
        context.register(NodeAutoConfiguration);
        context.setValue(CapSocketController.name, new CapSocketController());
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher, { maxConnections: 2 });
        await adapter.listen(0, '127.0.0.1');
        const boundPort = (adapter.server as { address: () => { port: number } | null }).address()?.port;
        wsUrl = `ws://127.0.0.1:${boundPort}`;
    });

    afterAll(async () => {
        await adapter?.close();
    });

    test('an upgrade over maxConnections is closed with 1013, and a freed slot is reusable', async () => {
        const a = new WebSocket(`${wsUrl}/cap/echo`);
        const b = new WebSocket(`${wsUrl}/cap/echo`);
        await Promise.all([open(a), open(b)]);
        // The cap is counted from the accepted upgrade: the registry holds both.
        await vi.waitFor(() => expect(adapter.socketRegistry.count('/cap/echo')).toBe(2));

        const overflow = new WebSocket(`${wsUrl}/cap/echo`);
        overflow.on('error', () => undefined);
        await expect(waitClose(overflow)).resolves.toMatchObject({
            code: 1013,
            reason: 'connection limit reached',
        });

        // Admitted sockets are untouched by the refusal.
        const reply = waitMessage(a);
        a.send('still here');
        await expect(reply).resolves.toEqual({ event: 'echo', data: 'still here' });

        // The ledger releases on close, so the next upgrade fits again.
        a.close(1000, 'done');
        await vi.waitFor(() => expect(adapter.socketRegistry.count('/cap/echo')).toBe(1));
        const after = new WebSocket(`${wsUrl}/cap/echo`);
        await open(after);
        after.close(1000, 'done');
        b.close(1000, 'done');
    });

    test('a socket still authenticating holds its slot before registration', async () => {
        // SEC-9 counts from the accepted upgrade: the session is not in the
        // registry while the auth hook is in flight, but the slot is taken.
        const slow = new NodeHTTPServerAdapter(context.getValue<NodeDispatcher>('dispatcher'), {
            maxConnections: 1,
            authenticateTimeoutMs: 5_000,
            authenticate: async (sources) => {
                if (String(sources.query['token'] ?? '') === 'hang') {
                    await new Promise<void>(() => undefined);
                }
                return {};
            },
        });
        await slow.listen(0, '127.0.0.1');
        try {
            const slowPort = (slow.server as { address: () => { port: number } | null }).address()?.port;
            const pending = new WebSocket(`ws://127.0.0.1:${slowPort}/cap/echo?token=hang`);
            await open(pending);
            expect(slow.socketRegistry.count('/cap/echo')).toBe(0);

            const overflow = new WebSocket(`ws://127.0.0.1:${slowPort}/cap/echo`);
            overflow.on('error', () => undefined);
            await expect(waitClose(overflow)).resolves.toMatchObject({
                code: 1013,
                reason: 'connection limit reached',
            });
            pending.close(1000, 'done');
        } finally {
            await slow.close();
        }
    });
});

// SEC-3: cookie-bound violations (51-cookie / 4 KiB-value limits) must reject
// the upgrade cleanly — the RangeError must never escape `shouldHandle`.
describe('WebSocket cookie bound rejection', () => {
    let context: MetadataConfigApplicationContext;
    let adapter: NodeHTTPServerAdapter;
    let wsUrl: string;
    let uncaught: Array<unknown>;
    const onUncaught = (error: unknown): void => {
        uncaught.push(error);
    };

    @requestMapping('/cookie-bound')
    class CookieBoundSocketController {
        @socketMapping('/open')
        async *open() {
            yield { ok: true };
        }
    }

    const handshakeStatus = (ws: WebSocket): Promise<number | null> =>
        new Promise<number | null>((resolve) => {
            ws.once('unexpected-response', (_request: unknown, response: { statusCode?: number }) =>
                resolve(response.statusCode ?? null)
            );
            setTimeout(() => resolve(null), 400);
        });

    beforeAll(async () => {
        uncaught = [];
        process.on('uncaughtExceptionMonitor', onUncaught);
        context = new MetadataConfigApplicationContext('ws-cookie-bounds');
        context.register(NodeAutoConfiguration);
        context.setValue(CookieBoundSocketController.name, new CookieBoundSocketController());
        context.refresh();
        adapter = new NodeHTTPServerAdapter(context.getValue<NodeDispatcher>('dispatcher'));
        await adapter.listen(0, '127.0.0.1');
        const boundAddress = adapter.server as { address: () => { port: number } | null };
        const boundPort = boundAddress.address()?.port;
        wsUrl = `ws://127.0.0.1:${boundPort}`;
    });

    afterAll(async () => {
        process.off('uncaughtExceptionMonitor', onUncaught);
        await adapter?.close();
    });

    test('an over-limit cookie header aborts the upgrade with 400, never throwing (SEC-3)', async () => {
        const cookies = Array.from({ length: 51 }, (_, i) => `c${i}=v`).join('; ');
        const ws = new WebSocket(`${wsUrl}/cookie-bound/open`, { headers: { cookie: cookies } });
        const status = await handshakeStatus(ws);
        expect(status).toBe(400);
        expect(uncaught).toEqual([]);
    });

    test('an oversized cookie value aborts the upgrade with 400, never throwing (SEC-3)', async () => {
        const ws = new WebSocket(`${wsUrl}/cookie-bound/open`, {
            headers: { cookie: `big=${'x'.repeat(4097)}` },
        });
        const status = await handshakeStatus(ws);
        expect(status).toBe(400);
        expect(uncaught).toEqual([]);
    });
});

// PLN-F10: the adapter's teardown must release the socket registry's fanout
// subscriptions — previously only `stop()` ran, so the path/room subscriptions
// leaked on every closed adapter.
describe('NodeHTTPServerAdapter socket registry teardown (PLN-F10)', () => {
    test('close() closes the registry (unsubscribes fanout) and is idempotent', async () => {
        const context = new MetadataConfigApplicationContext('ws-registry-teardown');
        context.register(NodeAutoConfiguration);
        context.setValue(SocketController.name, new SocketController());
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');

        const unsubscribed: string[] = [];
        const registry = new NodeSocketSessionRegistry({
            fanout: {
                subscribe: async (scope) => async () => {
                    unsubscribed.push(scope);
                },
                publish: async () => undefined,
            },
        });
        await registry.connect();
        expect(unsubscribed).toEqual([]);

        const adapter = new NodeHTTPServerAdapter(dispatcher, { socketRegistry: registry });
        await adapter.listen(0, '127.0.0.1');
        await adapter.close();
        expect([...unsubscribed].sort()).toEqual(['path', 'room']);

        // Idempotent: a second teardown neither throws nor double-unsubscribes.
        await adapter.close();
        expect(unsubscribed).toHaveLength(2);

        context.close();
    });
});
