/**
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { ServerResponse } from 'node:http';
import { MetadataConfigApplicationContext } from '@ndigo/context';
import { getMapping, requestMapping, ModelAndView } from '@ndigo/dispatcher';
import type { Route } from '@ndigo/router';
import { MediaTypes, MediaType } from '@ndigo/core';
import { NotAcceptableError, View, ViewTarget } from '@ndigo/view';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { ServerSentEventView } from '../src/server-sent-event-view';
import { NODE_RESPONSE_ATTRIBUTE } from '../src/node-request';

/**
 * DSV-B1 / PLN-F4 / PLN-F5 end-to-end: a view render failure must terminate
 * the HTTP response deterministically (never hang), a failure after headers
 * were flushed must destroy the connection rather than throw
 * `ERR_HTTP_HEADERS_SENT` out of the request listener, and the streaming
 * happy path must be unaffected.
 */

/** A view whose `render` throws — optionally after flushing headers. */
class ThrowingView implements View {
    readonly #afterHeaders: boolean;
    mediaType: MediaType | null = null;

    constructor(afterHeaders: boolean) {
        this.#afterHeaders = afterHeaders;
    }

    async render(model: unknown, route: Route, _target?: ViewTarget): Promise<void> {
        if (this.#afterHeaders) {
            const res = route.attributes[NODE_RESPONSE_ATTRIBUTE] as ServerResponse;
            // Simulate a streaming view that already committed a 200 status
            // line before its producer failed.
            res.writeHead(200, { 'Content-Type': 'text/event-stream' });
            res.flushHeaders();
        }
        throw new Error('view render failed');
    }
}

class ThrowingViewResolver {
    resolveViewName(name: string): View | null {
        if (name === 'boom') {
            return new ThrowingView(false);
        }
        if (name === 'boom-after-headers') {
            return new ThrowingView(true);
        }
        if (name === 'no-rep') {
            // Content negotiation resolved candidates but none served the
            // accepted range — the route/handler exists, so this is 406.
            throw new NotAcceptableError('no-rep', [MediaTypes.APPLICATION_JSON]);
        }
        return null;
    }
}

@requestMapping('/')
class FailingRenderController {
    @getMapping('/boom')
    boom() {
        return new ModelAndView('boom', {});
    }

    @getMapping('/boom-stream')
    boomStream() {
        return new ModelAndView('boom-after-headers', {});
    }

    @getMapping('/no-rep')
    noRep() {
        return new ModelAndView('no-rep', {});
    }

    @getMapping('/events')
    events() {
        return new ServerSentEventView(
            (async function* () {
                yield { event: 'tick', data: { n: 1 } };
            })()
        );
    }
}

describe('dispatch failure response finalization', () => {
    let adapter: NodeHTTPServerAdapter;
    let base: string;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('dispatch-error-response');
        context.register(NodeAutoConfiguration);
        context.setValue(FailingRenderController.name, new FailingRenderController());
        context.setValue('viewResolver', new ThrowingViewResolver());
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        // `server` is the adapter's `node:http` server; its address is a
        // bound `AddressInfo` once listening (the spec's ephemeral-port idiom).
        const bound = adapter.server as { address(): AddressInfo };
        base = `http://127.0.0.1:${bound.address().port}`;
    });

    afterAll(async () => {
        await adapter?.close();
    });

    test('a throwing view render returns a terminal 500, not a hang (DSV-B1)', async () => {
        const res = await fetch(base + '/boom');
        expect(res.status).toBe(500);
        expect(await res.json()).toMatchObject({
            type: 'urn:ndigo:internal-error',
            title: 'Internal Server Error',
            status: 500,
        });
    });

    test('a not-acceptable negotiation failure returns 406, not 404 or 500 (DSV-VIEW-1)', async () => {
        const res = await fetch(base + '/no-rep');

        expect(res.status).toBe(406);
        expect(await res.json()).toMatchObject({
            type: 'urn:ndigo:not-acceptable',
            title: 'Not Acceptable',
            status: 406,
        });
    });

    test('a failure after headers were flushed destroys the connection without an unhandled rejection (PLN-F4/F5)', async () => {
        const unhandled: unknown[] = [];
        const onUnhandled = (reason: unknown): void => {
            unhandled.push(reason);
        };
        process.on('unhandledRejection', onUnhandled);
        try {
            // The client either sees the socket reset outright or a 200 whose
            // body errors — never a hang, and never a post-headers `writeHead`.
            let bodyError = false;
            try {
                const res = await fetch(base + '/boom-stream');
                await res.text();
            } catch {
                bodyError = true;
            }
            expect(bodyError).toBe(true);

            // Give the (fire-and-forget) request handler a tick to settle any
            // escaped rejection before asserting none was raised.
            const { promise, resolve } = Promise.withResolvers<void>();
            setTimeout(resolve, 50);
            await promise;
            expect(unhandled).toEqual([]);
        } finally {
            process.off('unhandledRejection', onUnhandled);
        }
    });

    test('the SSE happy path still streams and ends on its own', async () => {
        const res = await fetch(base + '/events');
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toBe('text/event-stream; charset=utf-8');
        expect(await res.text()).toBe('event: tick\ndata: {"n":1}\n\n');
    });

    test('the server stays healthy after an error response (DSV-B1)', async () => {
        const res = await fetch(base + '/events');
        expect(res.status).toBe(200);
    });
});
