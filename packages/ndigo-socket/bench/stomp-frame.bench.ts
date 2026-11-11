/**
 * `@ndigo/socket` STOMP 1.2 frame codec throughput.
 *
 * Rows cover the message hot path: serialize (text and binary bodies) and
 * parse (text wire and byte wire). Every fixture is round-trip verified
 * (`serialize(parse(wire)) === wire`) before timing. The template-literal
 * row is a labelled floor that skips escaping/validation — same shape, less
 * work — so its ratio is not a like-for-like claim.
 */
import { test } from 'vitest';
import { bodyAsText, parseStompFrame, serializeStompFrame, type StompFrame } from '../src/stomp-frame';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;

const payload = JSON.stringify({ type: 'chat', room: 'lobby', sender: 'alice', text: 'hello world' });
const frame: StompFrame = {
    command: 'MESSAGE',
    headers: {
        destination: '/topic/lobby',
        'message-id': 'msg-123456',
        'content-type': 'application/json',
        subscription: 'sub-0',
    },
    body: payload,
};

const largeBody = 'x'.repeat(2_048);
const largeFrame: StompFrame = { command: 'MESSAGE', headers: frame.headers, body: largeBody };

const wireText = serializeStompFrame(frame) as string;
const wireBytes = new TextEncoder().encode(wireText);

test('STOMP — serialize text frame', async ({ bench }) => {
    assertEquivalent('round-trip text', serializeStompFrame(parseStompFrame(wireText)), wireText);
    await bench.compare(
        bench(benchName('serializeStompFrame (text body)', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(serializeStompFrame(frame));
        }),
        bench(benchName('template floor', BATCH), () => {
            const { command, body } = frame as { command: string; body: string };
            for (let i = 0; i < BATCH; i++)
                retain(`${command}\ndestination:/topic/lobby\nmessage-id:msg-123456\n\n${body}\0`);
        })
    );
});

test('STOMP — parse text frame', async ({ bench }) => {
    const parsed = parseStompFrame(wireText);
    assertEquivalent('command', parsed.command, 'MESSAGE');
    assertEquivalent('header', parsed.headers.destination, '/topic/lobby');
    assertEquivalent('body', parsed.body, payload);
    await bench(benchName('parseStompFrame (text wire)', BATCH), () => {
        for (let i = 0; i < BATCH; i++) retain(parseStompFrame(wireText).command);
    }).run();
});

test('STOMP — parse byte wire', async ({ bench }) => {
    const parsed = parseStompFrame(wireBytes);
    assertEquivalent('byte body', bodyAsText(parsed.body), payload);
    await bench(benchName('parseStompFrame (byte wire)', BATCH), () => {
        for (let i = 0; i < BATCH; i++) retain(parseStompFrame(wireBytes).command);
    }).run();
});

test('STOMP — large body frame', async ({ bench }) => {
    const largeWire = serializeStompFrame(largeFrame) as string;
    assertEquivalent('round-trip large', serializeStompFrame(parseStompFrame(largeWire)), largeWire);
    await bench.compare(
        bench(benchName('serialize 2KiB body', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(serializeStompFrame(largeFrame));
        }),
        bench(benchName('parse 2KiB body', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(parseStompFrame(largeWire).command);
        })
    );
});
