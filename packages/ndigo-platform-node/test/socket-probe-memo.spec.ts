/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect, vi } from 'vitest';
import { MetadataConfigApplicationContext } from '@ndigo/context';
import {
    getMapping,
    parameters,
    pathVariable,
    requestMapping,
    socketMapping,
    socketSessionValue,
    type SocketSession,
} from '@ndigo/dispatcher';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { HTTPServer } from '../src/http-server';

/**
 * Regression (PL-8): the socket-probe memo must stay bounded.
 *
 * `handleRequest` runs a second, method-less radix lookup per request to
 * tell a socket-only path (HTTP 404) from a real HTTP route; the result is
 * memoized per request path. A parameterized mapping matches every concrete
 * path (`/items/1`, `/items/2`, …), so memoizing it keys the cache by
 * unbounded request input. The adapter now skips the memo for parameterized
 * matches, and these specs flood distinct paths and pin the probe behavior
 * by counting dispatcher lookups: the probe is exactly one extra
 * `getHandler` call, so a parameterized path that is not memoized keeps
 * costing that lookup on every request while a static path is memoized
 * after its first probe.
 */

@requestMapping('/')
class ProbeMemoController {
    @getMapping('/static')
    staticRoute() {
        return { route: 'static' };
    }

    @getMapping('/items/:id')
    @parameters({ id: pathVariable('id') })
    item(id: string) {
        return { id };
    }

    // Socket-only endpoints: the probe resolves both (HTTP 404), but plain
    // HTTP requests never reach the handlers below.
    @socketMapping('/echo')
    @parameters({ session: socketSessionValue('session') })
    async *echo(session: SocketSession) {
        for await (const message of session.messages) {
            yield message;
        }
    }

    @socketMapping('/live/:id')
    @parameters({ session: socketSessionValue('session') })
    async *live(session: SocketSession) {
        for await (const message of session.messages) {
            yield message;
        }
    }
}

describe('socket-probe memo boundedness', () => {
    let context: MetadataConfigApplicationContext;
    let dispatcher: NodeDispatcher;
    let server: HTTPServer;
    let base: string;

    beforeAll(async () => {
        context = new MetadataConfigApplicationContext('socket-probe-memo');
        context.register(NodeAutoConfiguration);
        // Controller instance is a context value the mapping can resolve.
        context.setValue(ProbeMemoController.name, new ProbeMemoController());
        context.refresh();

        dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        // The adapter surfaces its raw `node:http.Server` as `unknown` (the
        // interface is platform-agnostic); narrow to the one member the
        // integration test needs — the OS-assigned bound port.
        const rawServer = adapter.server as unknown as { address(): { port: number } | null };
        const boundPort = rawServer.address()?.port;
        base = `http://127.0.0.1:${boundPort}`;

        server = new HTTPServer(dispatcher, { adapter });
    });

    afterAll(async () => {
        vi.restoreAllMocks();
        await server?.close();
    });

    test('a socket route still resolves: socket-only paths 404 over HTTP', async () => {
        // Static socket path: the first probe computes + memoizes `true`.
        await Promise.all(
            Array.from({ length: 3 }, async () => {
                const res = await fetch(`${base}/echo`);
                expect(res.status).toBe(404);
            })
        );
        // Parameterized socket path: the probe re-resolves per request and
        // still identifies the socket mapping.
        await Promise.all(
            ['a', 'b', 'a'].map(async (id) => {
                const res = await fetch(`${base}/live/${id}`);
                expect(res.status).toBe(404);
            })
        );
    });

    test('flooding distinct parameterized paths serves every request correctly', async () => {
        await Promise.all(
            Array.from({ length: 50 }, async (_value, i) => {
                const res = await fetch(`${base}/items/${i}`);
                expect(res.status).toBe(200);
                expect(await res.json()).toEqual({ id: String(i) });
            })
        );
    });

    test('parameterized routes are not memoized; static routes still are', async () => {
        const spy = vi.spyOn(dispatcher, 'getHandler');
        const lookupsFor = async (path: string, times: number): Promise<number> => {
            spy.mockClear();
            const requestOnce = async (remaining: number): Promise<void> => {
                if (remaining === 0) {
                    return;
                }
                const res = await fetch(`${base}${path}`);
                expect(res.status).toBe(200);
                return requestOnce(remaining - 1);
            };
            await requestOnce(times);
            return spy.mock.calls.length;
        };

        // Static path: request match + first probe + dispatch = 3 lookups;
        // every following request turns the probe into a Map read = 2 each.
        expect(await lookupsFor('/static', 4)).toBe(3 + 3 * 2);
        // Parameterized path: its concrete path is never memoized — flooding
        // distinct ids must not retain entries — so every request pays the
        // probe's lookup: request match + probe + dispatch = 3 each.
        expect(await lookupsFor('/items/123', 4)).toBe(4 * 3);
        spy.mockRestore();
    });
});
