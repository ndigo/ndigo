/**
 * @module blue-service
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { parseServerSentEvents, ServerSentEventParser } from '../src/server-sent-events';

/**
 * The SSE wire-format parser (AD-09): incremental chunk feeding, field
 * accumulation, JSON data decoding, comments, and end-of-stream flushing.
 */

describe('ServerSentEventParser', () => {
    test('parses a single named event with JSON data', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('event: tick\ndata: {"n":1}\n\n')).toEqual([{ event: 'tick', data: { n: 1 } }]);
    });

    test('defaults the event name to message', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('data: hello\n\n')).toEqual([{ event: 'message', data: 'hello' }]);
    });

    test('unparseable data stays a raw string', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('data: not json\n\n')).toEqual([{ event: 'message', data: 'not json' }]);
    });

    test('repeated data fields join with newlines', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('data: line one\ndata: line two\n\n')).toEqual([
            { event: 'message', data: 'line one\nline two' },
        ]);
    });

    test('an empty data field yields an empty string', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('data:\n\n')).toEqual([{ event: 'message', data: '' }]);
    });

    test('event with no data yields an undefined payload', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('event: ping\n\n')).toEqual([{ event: 'ping', data: undefined }]);
    });

    test('carries the id field', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('id: 17\nevent: tick\ndata: {"n":3}\n\n')).toEqual([
            { id: '17', event: 'tick', data: { n: 3 } },
        ]);
    });

    test('ignores comment and unknown fields', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed(': keep-alive\nx-ignore: nope\ndata: {"ok":true}\n\n')).toEqual([
            { event: 'message', data: { ok: true } },
        ]);
    });

    test('ignores a retry-only block instead of dispatching a phantom message', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('retry: 3000\n\n')).toEqual([]);
        expect(parser.finish()).toEqual([]);
    });

    test('ignores an id-only block instead of dispatching a phantom message', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('id: 17\n\n')).toEqual([]);
    });

    test('a retry field does not swallow the event that follows it', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('retry: 3000\ndata: {"n":1}\n\n')).toEqual([{ event: 'message', data: { n: 1 } }]);
    });

    test('handles CRLF line endings', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('data: {"a":1}\r\n\r\n')).toEqual([{ event: 'message', data: { a: 1 } }]);
    });

    test('incremental feed assembles events split across chunk boundaries', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('event: tic')).toEqual([]);
        expect(parser.feed('k\ndata: {"n":')).toEqual([]);
        expect(parser.feed('2}\n\n')).toEqual([{ event: 'tick', data: { n: 2 } }]);
    });

    test('multiple events in one chunk arrive in order', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('data: {"n":1}\n\ndata: {"n":2}\n\ndata: {"n":3}\n\n')).toEqual([
            { event: 'message', data: { n: 1 } },
            { event: 'message', data: { n: 2 } },
            { event: 'message', data: { n: 3 } },
        ]);
    });

    test('finish flushes an event whose data lacks a trailing newline', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('event: tick\ndata: {"n":9}')).toEqual([]);
        expect(parser.finish()).toEqual([{ event: 'tick', data: { n: 9 } }]);
    });

    test('finish after a completed event emits nothing', () => {
        const parser = new ServerSentEventParser();
        parser.feed('data: {"n":1}\n\n');
        expect(parser.finish()).toEqual([]);
    });

    test('splits on lone CR line terminators (WHATWG event-stream, REV-007)', () => {
        const parser = new ServerSentEventParser();
        // Pre-fix only CRLF/LF were recognized, so the lone-CR frame was
        // never terminated and produced no event.
        expect(parser.feed('event: tick\rdata: {"n":1}\r\r')).toEqual([{ event: 'tick', data: { n: 1 } }]);
    });

    test('a CRLF split across chunks still terminates one line', () => {
        const parser = new ServerSentEventParser();
        expect(parser.feed('data: a\r')).toEqual([]);
        expect(parser.feed('\n\n')).toEqual([{ event: 'message', data: 'a' }]);
    });

    test('strips a single leading byte order mark (REV-007)', () => {
        const parser = new ServerSentEventParser();
        // Pre-fix the BOM glued to the first field name, so the `data` line
        // was an unknown field and the event vanished.
        expect(parser.feed('\uFEFFdata: hello\n\n')).toEqual([{ event: 'message', data: 'hello' }]);
        // A BOM later in the stream is content, not a marker.
        const later = new ServerSentEventParser();
        expect(later.feed('data: a\uFEFFb\n\n')).toEqual([{ event: 'message', data: 'a\uFEFFb' }]);
    });
});

describe('parseServerSentEvents', () => {
    test('yields events from an async chunk stream', async () => {
        async function* chunks(): AsyncGenerator<string> {
            yield 'event: tick\ndata: {"n":1}\n\n';
            yield 'event: tick\ndata: {"n":2}\n\n';
        }

        const events = [];
        for await (const event of parseServerSentEvents(chunks())) {
            events.push(event);
        }
        expect(events).toEqual([
            { event: 'tick', data: { n: 1 } },
            { event: 'tick', data: { n: 2 } },
        ]);
    });

    test('yields events as they complete, before the stream ends', async () => {
        const seen: Array<{ event: string; data: unknown }> = [];
        async function* chunks(): AsyncGenerator<string> {
            yield 'event: tick\ndata: {"n":1}\n\n';
            await new Promise((resolve) => setTimeout(resolve, 10));
            yield 'event: tick\ndata: {"n":2}\n\n';
        }

        for await (const event of parseServerSentEvents(chunks())) {
            seen.push(event);
        }
        expect(seen).toHaveLength(2);
        expect(seen[0]).toEqual({ event: 'tick', data: { n: 1 } });
        expect(seen[1]).toEqual({ event: 'tick', data: { n: 2 } });
    });
});
