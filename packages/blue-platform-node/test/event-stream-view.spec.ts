// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import type { AddressInfo } from 'node:net';
import { MetadataConfigApplicationContext } from '@blue/context';
import { getMapping, ModelAndView, RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { EventStreamView } from '../src/event-stream-view';

/**
 * SSE server push (AD-9): `EventStreamView` writes a model's async-iterable
 * event source to a real `node:http` response as `text/event-stream` frames,
 * one per yielded value, ending the response when the source completes.
 */

@getMapping('/')
class EventStreamProbeController {
    @getMapping('/events')
    events() {
        return new ModelAndView(new EventStreamView(), {
            events: (async function* () {
                yield { event: 'tick', data: { n: 1 } };
                yield { event: 'tick', data: { n: 2 } };
                yield { data: { n: 3 } };
            })(),
        });
    }

    @getMapping('/events/raw')
    raw() {
        return new ModelAndView(new EventStreamView(), {
            events: (async function* () {
                yield 1;
                yield 'two';
            })(),
        });
    }

    @getMapping('/events/broken')
    broken() {
        return new ModelAndView(new EventStreamView(), {});
    }
}

describe('EventStreamView over a real HTTP server', () => {
    let adapter: NodeHTTPServerAdapter;
    let base: string;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('event-stream');
        context.register(NodeAutoConfiguration);
        context.setValue(EventStreamProbeController.name, new EventStreamProbeController());
        context.refresh();
        const handlerMapping = context.getValue<RadixMetadataHandlerMapping>('handlerMapping');
        handlerMapping.setApplicationContext(context);
        handlerMapping.init();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        dispatcher.initStrategies(context);
        dispatcher.applicationContext = context;
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
        expect(await res.text()).toBe('event: tick\ndata: {"n":1}\n\nevent: tick\ndata: {"n":2}\n\ndata: {"n":3}\n\n');
    });

    test('frames raw values as unnamed data events', async () => {
        const res = await fetch(`${base}/events/raw`);
        expect(await res.text()).toBe('data: 1\n\ndata: "two"\n\n');
    });

    test('responds 500 when the model carries no event source', async () => {
        const res = await fetch(`${base}/events/broken`);
        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: 'EventStreamView requires model.events to be an async iterable' });
    });
});
