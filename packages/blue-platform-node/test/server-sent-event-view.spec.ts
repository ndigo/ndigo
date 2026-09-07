// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import type { AddressInfo } from 'node:net';
import { MetadataConfigApplicationContext } from '@blue/context';
import { getMapping } from '@blue/dispatcher';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { ServerSentEventView } from '../src/server-sent-event-view';

/**
 * SSE server push (AD-9): `ServerSentEventView` streams an async-iterable
 * event source to a real `node:http` response as `text/event-stream` frames,
 * one per yielded value, ending the response when the source completes.
 * Handlers return the view directly (imperative View — Spring
 * `SseEmitter`-style semantics, rendered through the direct-View branch).
 */

@getMapping('/')
class EventStreamProbeController {
    @getMapping('/events')
    events() {
        return new ServerSentEventView(
            (async function* () {
                yield { event: 'tick', data: { n: 1 } };
                yield { event: 'tick', data: { n: 2 } };
                yield { data: { n: 3 } };
            })()
        );
    }

    @getMapping('/events/raw')
    raw() {
        return new ServerSentEventView(
            (async function* () {
                yield 1;
                yield 'two';
            })()
        );
    }
}

describe('ServerSentEventView over a real HTTP server', () => {
    let adapter: NodeHTTPServerAdapter;
    let base: string;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('server-sent-event-view');
        context.register(NodeAutoConfiguration);
        context.setValue(EventStreamProbeController.name, new EventStreamProbeController());
        context.refresh(); // auto-initializes the handler mapping + dispatcher
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        base = `http://127.0.0.1:${(adapter.server as { address(): AddressInfo }).address().port}`;
    });

    afterAll(async () => {
        await adapter?.close();
    });

    test('streams framed SSE events with the event-stream content type', async () => {
        const res = await fetch(`${base}/events`);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toBe('text/event-stream; charset=utf-8');
        expect(await res.text()).toBe(
            'event: tick\ndata: {"n":1}\n\nevent: tick\ndata: {"n":2}\n\nevent: message\ndata: {"n":3}\n\n'
        );
    });

    test('frames raw values as default-message data events', async () => {
        const res = await fetch(`${base}/events/raw`);
        expect(await res.text()).toBe('event: message\ndata: 1\n\nevent: message\ndata: "two"\n\n');
    });
});

describe('ServerSentEventView construction', () => {
    test('rejects a non-async-iterable source', () => {
        expect(() => new ServerSentEventView(null as never)).toThrow(TypeError);
        expect(() => new ServerSentEventView({} as never)).toThrow(TypeError);
        expect(() => new ServerSentEventView([1, 2] as never)).toThrow(TypeError);
    });
});
