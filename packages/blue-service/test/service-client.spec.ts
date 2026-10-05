/**
 * @module blue-service
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { describe, expect, test, vi, beforeEach, beforeAll } from 'vitest';
import { z } from 'zod';
import { HTTP } from '@blue/http';
import { service, getCall, postCall, putCall, deleteCall, patchCall, queryCall, serviceClient } from '../src';

const AccountSchema = z.object({
    id: z.number(),
    name: z.string(),
});

@service('accounts', { baseUrl: 'https://api.example.com' })
class AccountsAPI {
    @getCall('/accounts/:id')
    getById(id: number): Promise<unknown> {
        return undefined as unknown;
    }

    @postCall('/accounts')
    create(account: Account): Promise<unknown> {
        return undefined as unknown;
    }

    @getCall('/accounts/profile/:userId', { responseSchema: AccountSchema })
    getProfile(userId: number): Promise<{ id: number; name: string }> {
        return undefined as unknown;
    }

    @putCall('/accounts/:id')
    update(id: number, account: Account): Promise<unknown> {
        return undefined as unknown;
    }

    @deleteCall('/accounts/:id')
    remove(id: number): Promise<unknown> {
        return undefined as unknown;
    }

    @queryCall('/accounts/search')
    search(query: string): Promise<unknown> {
        return undefined as unknown;
    }

    @patchCall('/accounts/:id')
    patch(id: number, account: Account): Promise<unknown> {
        return undefined as unknown;
    }
}

type Account = { id: number; name: string };

let fetchMock: ReturnType<typeof vi.fn>;
let http: HTTP;

beforeEach(() => {
    fetchMock = vi.fn();
    http = new HTTP([], {}, fetchMock as unknown as typeof fetch);
});

/** The HTTP client passes a Request object to fetch; extract it. */
function lastRequest(): Request {
    const req = fetchMock.mock.calls[0]?.[0];
    expect(req).toBeInstanceOf(Request);
    return req as Request;
}

describe('serviceClient', () => {
    test('resolves path params and sends GET', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
        const client = serviceClient(AccountsAPI, http);

        await client.getById(42);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(lastRequest().url).toBe('https://api.example.com/accounts/42');
        expect(lastRequest().method).toBe('GET');
    });

    test('attaches the service name correlation header', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
        const client = serviceClient(AccountsAPI, http);

        await client.getById(7);

        expect(lastRequest().headers.get('X-Blue-Service')).toBe('accounts');
    });

    test('sends a JSON body for POST', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));
        const client = serviceClient(AccountsAPI, http);

        await client.create({ id: 1, name: 'Alice' });

        expect(lastRequest().method).toBe('POST');
        expect(await lastRequest().text()).toBe(JSON.stringify({ id: 1, name: 'Alice' }));
    });

    test('sets the HTTP method for PUT/DELETE/PATCH/QUERY', async () => {
        fetchMock.mockResolvedValue(new Response('ok', { status: 200 }));
        const client = serviceClient(AccountsAPI, http);

        await client.update(1, { id: 1, name: 'A' });
        await client.remove(2);
        await client.patch(3, { id: 3, name: 'C' });
        await client.search('alice');

        const methods = fetchMock.mock.calls.map(([req]) => (req as Request).method);
        expect(methods).toEqual(['PUT', 'DELETE', 'PATCH', 'QUERY']);
    });

    test('validates the JSON response with the declared Zod schema', async () => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ id: 1, name: 'Alice' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );
        const client = serviceClient(AccountsAPI, http);

        const profile = await client.getProfile(1);
        expect(profile).toEqual({ id: 1, name: 'Alice' });
    });

    test('throws when the response fails Zod validation', async () => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ id: 'nope', name: 42 }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );
        const client = serviceClient(AccountsAPI, http);

        await expect(client.getProfile(1)).rejects.toThrow('response validation failed');
    });

    test('returns the raw Response when no responseSchema is declared', async () => {
        fetchMock.mockResolvedValue(new Response('raw-body', { status: 200 }));
        const client = serviceClient(AccountsAPI, http);

        const result = await client.getById(9);
        expect(result).toBeInstanceOf(Response);
        expect(await (result as Response).text()).toBe('raw-body');
    });

    test('throws for a target without @service metadata', () => {
        class NotAService {}

        expect(() => serviceClient(NotAService, http)).toThrow('not @service-decorated');
    });
});

@service('ticker', { baseUrl: 'https://api.example.com' })
class TickerAPI {
    @getCall('/ticks', { stream: true })
    ticks(): AsyncIterable<unknown> {
        return undefined as unknown;
    }

    @getCall('/models', { stream: true, responseSchema: AccountSchema })
    models(): AsyncIterable<{ id: number; name: string }> {
        return undefined as unknown;
    }
}

describe('serviceClient stream calls (AD-09)', () => {
    /** Minimal facet of the finished spans surfaced by the shared exporter. */
    type FinishedSpan = {
        name: string;
        kind: number;
        attributes: Record<string, unknown>;
    };
    /** InMemorySpanExporter shared by the span-asserting tests. */
    let streamExporter: { reset(): void; getFinishedSpans(): FinishedSpan[] } | undefined;

    /** Guards the exporter assigned in beforeAll (lint rule forbids `!`). */
    const requireExporter = (): NonNullable<typeof streamExporter> => {
        if (!streamExporter) throw new Error('shared span exporter not installed');
        return streamExporter;
    };

    // @opentelemetry/api registers only ONE global tracer provider per process,
    // so a single provider + exporter is installed once and shared by all
    // span-asserting tests in this suite.
    beforeAll(async () => {
        const { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } =
            await import('@opentelemetry/sdk-trace-base');
        const { trace } = await import('@opentelemetry/api');
        streamExporter = new InMemorySpanExporter();
        const provider = new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(streamExporter)] });
        trace.setGlobalTracerProvider(provider);
    });

    /** Builds an SSE response whose body is enqueued in the given chunks. */
    function sseResponse(chunks: string[], status = 200): Response {
        const encoder = new TextEncoder();
        return new Response(
            new ReadableStream({
                start(controller) {
                    for (const chunk of chunks) {
                        controller.enqueue(encoder.encode(chunk));
                    }
                    controller.close();
                },
            }),
            { status, headers: { 'Content-Type': 'text/event-stream' } }
        );
    }

    async function collect<T>(stream: AsyncIterable<T>): Promise<T[]> {
        const values: T[] = [];
        for await (const value of stream) {
            values.push(value);
        }
        return values;
    }

    beforeEach(() => {
        fetchMock = vi.fn();
        http = new HTTP([], {}, fetchMock as unknown as typeof fetch);
    });

    test('sends Accept: text/event-stream and returns parsed events in order', async () => {
        fetchMock.mockResolvedValue(sseResponse(['event: tick\ndata: {"n":1}\n\n', 'event: tick\ndata: {"n":2}\n\n']));
        const client = serviceClient(TickerAPI, http);

        const events = await collect(client.ticks());

        expect(lastRequest().method).toBe('GET');
        expect(lastRequest().headers.get('Accept')).toBe('text/event-stream');
        expect(events).toEqual([
            { event: 'tick', data: { n: 1 } },
            { event: 'tick', data: { n: 2 } },
        ]);
    });

    test('yields schema-validated data for stream calls with a responseSchema', async () => {
        fetchMock.mockResolvedValue(
            sseResponse(['data: {"id":1,"name":"Alice"}\n\n', 'data: {"id":2,"name":"Bob"}\n\n'])
        );
        const client = serviceClient(TickerAPI, http);

        expect(await collect(client.models())).toEqual([
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
        ]);
    });

    test('throws when a streamed event fails Zod validation', async () => {
        fetchMock.mockResolvedValue(sseResponse(['data: {"id":"nope","name":42}\n\n']));
        const client = serviceClient(TickerAPI, http);

        await expect(collect(client.models())).rejects.toThrow('response validation failed');
    });

    test('throws when the stream request fails', async () => {
        fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));
        const client = serviceClient(TickerAPI, http);

        await expect(collect(client.ticks())).rejects.toThrow('stream request failed');
    });

    test('emits a ServiceClient.streamCall CLIENT span with event count', async () => {
        requireExporter().reset();
        fetchMock.mockResolvedValue(sseResponse(['event: tick\ndata: {"n":1}\n\n', 'event: tick\ndata: {"n":2}\n\n']));
        const client = serviceClient(TickerAPI, http);

        await collect(client.ticks());

        await new Promise((r) => setTimeout(r, 50));
        const spans = requireExporter()
            .getFinishedSpans()
            .filter((s) => s.name === 'ServiceClient.streamCall');
        expect(spans).toHaveLength(1);
        const span = spans[0];
        expect(span).toBeDefined();
        expect(span?.kind).toBe(2 /* SpanKind.CLIENT */);
        expect(span?.attributes['service.name']).toBe('ticker');
        expect(span?.attributes['http.route']).toBe('/ticks');
        expect(span?.attributes['stream.events']).toBe(2);
        expect(Number(span?.attributes['stream.duration_ms'])).toBeGreaterThanOrEqual(0);
    });

    /** Builds an SSE response whose body enqueues `firstChunk` and stays open. */
    function inflightSseResponse(firstChunk: string): Response {
        const encoder = new TextEncoder();
        return new Response(
            new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(firstChunk));
                    // Never close: the stream stays open mid-flight.
                },
            }),
            { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
        );
    }

    test('completes the generator and ends the span when the consumer breaks mid-stream', async () => {
        // The stream buffered a trailing, not-yet-terminated event when the
        // consumer breaks: against the old implementation `parser.finish()`
        // yielded inside the finally, parking the generator forever and leaking
        // the reader lock and span.
        requireExporter().reset();
        fetchMock.mockResolvedValue(inflightSseResponse('event: tick\ndata: {"n":1}\n\ndata: {"n":2}'));
        const client = serviceClient(TickerAPI, http);

        const seen: unknown[] = [];
        let completed = false;
        const sink = (async () => {
            for await (const value of client.ticks()) {
                seen.push(value);
                break; // dispose the generator mid-stream
            }
            completed = true;
        })();
        const outcome = await Promise.race([
            sink,
            new Promise((resolve) => setTimeout(() => resolve('timeout'), 1000)),
        ]);

        expect(outcome).not.toBe('timeout');
        expect(completed).toBe(true);
        expect(seen).toEqual([{ event: 'tick', data: { n: 1 } }]);

        // The outer finally ran (releasing the reader lock / cancelling the
        // stream) because the span was ended and exported.
        await new Promise((resolve) => setTimeout(resolve, 50));
        const spans = requireExporter()
            .getFinishedSpans()
            .filter((s) => s.name === 'ServiceClient.streamCall');
        expect(spans).toHaveLength(1);
        expect(spans[0].attributes['stream.events']).toBe(1);
        expect(Number(spans[0].attributes['stream.duration_ms'])).toBeGreaterThanOrEqual(0);
    });

    test('delivers a trailing event buffered without a final newline on normal EOF', async () => {
        fetchMock.mockResolvedValue(sseResponse(['event: tick\ndata: {"n":1}\n\n', 'data: {"n":2}']));
        const client = serviceClient(TickerAPI, http);

        expect(await collect(client.ticks())).toEqual([
            { event: 'tick', data: { n: 1 } },
            { event: 'message', data: { n: 2 } },
        ]);
    });
});
