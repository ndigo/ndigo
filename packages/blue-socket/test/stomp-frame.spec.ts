/**
 * STOMP 1.2 frame codec tests (AD-23 Phase 0).
 *
 * Covers round-trip serialization, all four header-value escapes,
 * `content-length` framing (including NUL inside bodies), heart-beat
 * pings, and malformed-frame errors.
 * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { StompProtocolError, bodyAsText, parseStompFrame, serializeStompFrame, type StompFrame } from '../src/index';

/** Round-trip helper: parse(serialize(frame)) equals the original. */
function roundTrip(frame: StompFrame): StompFrame {
    return parseStompFrame(serializeStompFrame(frame));
}

describe('parseStompFrame', () => {
    test('parses a minimal CONNECT frame', () => {
        const frame = parseStompFrame('CONNECT\naccept-version:1.2\nhost:x\n\n\0');
        expect(frame.command).toBe('CONNECT');
        expect(frame.headers).toEqual({ 'accept-version': '1.2', host: 'x' });
        expect(frame.body).toBe('');
    });

    test('parses a SEND with a body', () => {
        const frame = parseStompFrame('SEND\ndestination:/topic/chat\n\nhello world\0');
        expect(frame.command).toBe('SEND');
        expect(frame.headers['destination']).toBe('/topic/chat');
        expect(frame.body).toBe('hello world');
    });

    test('decodes all four STOMP 1.2 header escapes', () => {
        const frame = parseStompFrame('SEND\ndestination:/topic/x\\c\nnote:back\\\\slash\\nnewline\\rcr\n\n\0');
        expect(frame.headers['destination']).toBe('/topic/x:');
        expect(frame.headers['note']).toBe('back\\slash\nnewline\rcr');
    });

    test('passes unknown escape sequences through verbatim', () => {
        const frame = parseStompFrame('SEND\ndestination:/topic/x\\q\n\n\0');
        expect(frame.headers['destination']).toBe('/topic/x\\q');
    });

    test('honors content-length with a NUL inside the body', () => {
        const frame = parseStompFrame('MESSAGE\ncontent-length:5\n\nab\0cd\0');
        expect(frame.body).toBe('ab\0cd');
    });

    test('rejects a content-length shorter than the body prefix', () => {
        // content-length:3 with a 6-char body: the "terminator" lands mid-body.
        expect(() => parseStompFrame('SEND\ncontent-length:3\n\nabcdef\0')).toThrow(StompProtocolError);
    });

    test('rejects a content-length longer than the delivered body', () => {
        expect(() => parseStompFrame('SEND\ncontent-length:9\n\nabcdef\0')).toThrow(StompProtocolError);
    });

    test('treats a bare newline as a heart-beat ping', () => {
        expect(parseStompFrame('\n')).toEqual({ command: '', headers: {}, body: '' });
        expect(parseStompFrame('')).toEqual({ command: '', headers: {}, body: '' });
        expect(parseStompFrame('\n\n')).toEqual({ command: '', headers: {}, body: '' });
        expect(parseStompFrame('\n\n\n')).toEqual({ command: '', headers: {}, body: '' });
    });

    test('rejects a frame with no header terminator', () => {
        expect(() => parseStompFrame('CONNECT\naccept-version:1.2\0')).toThrow(StompProtocolError);
    });

    test('rejects an empty command', () => {
        expect(() => parseStompFrame('\n\n\0')).toThrow(StompProtocolError);
    });

    test('rejects malformed header lines', () => {
        expect(() => parseStompFrame('SEND\nbadline\n\n\0')).toThrow(StompProtocolError);
        expect(() => parseStompFrame('SEND\n:value\n\n\0')).toThrow(StompProtocolError);
    });

    test('rejects invalid content-length values', () => {
        expect(() => parseStompFrame('SEND\ncontent-length:abc\n\nbody\0')).toThrow(StompProtocolError);
        expect(() => parseStompFrame('SEND\ncontent-length:-1\n\nbody\0')).toThrow(StompProtocolError);
    });

    test('rejects a frame missing its NUL terminator', () => {
        expect(() => parseStompFrame('SEND\ndestination:/topic/x\n\nbody')).toThrow(StompProtocolError);
    });

    test('parses multi-word header values and repeated sends', () => {
        const frame = parseStompFrame('SUBSCRIBE\ndestination:/topic/chat\nid:sub-1\nack:client\n\n\0');
        expect(frame.command).toBe('SUBSCRIBE');
        expect(frame.headers).toEqual({ destination: '/topic/chat', id: 'sub-1', ack: 'client' });
    });
});

describe('serializeStompFrame', () => {
    test('round-trips a CONNECT frame', () => {
        const original: StompFrame = {
            command: 'CONNECT',
            headers: { 'accept-version': '1.2', host: 'example.com' },
            body: '',
        };
        const wire = serializeStompFrame(original);
        expect(wire).toBe('CONNECT\naccept-version:1.2\nhost:example.com\n\n\0');
        expect(parseStompFrame(wire)).toEqual(original);
    });

    test('round-trips escaped values', () => {
        const original: StompFrame = {
            command: 'SEND',
            headers: { destination: '/topic/a:b', note: 'line1\nline2\rcr\\end' },
            body: '',
        };
        const parsed = roundTrip(original);
        expect(parsed.headers).toEqual(original.headers);
    });

    test('emits content-length when the body contains NUL', () => {
        const wire = serializeStompFrame({ command: 'MESSAGE', headers: {}, body: 'a\0b' });
        expect(wire).toBe('MESSAGE\ncontent-length:3\n\na\0b\0');
    });

    test('omits content-length when the body has no NUL', () => {
        const wire = serializeStompFrame({ command: 'SEND', headers: { destination: '/t' }, body: 'hello' });
        expect(wire).toBe('SEND\ndestination:/t\n\nhello\0');
        expect(wire).not.toContain('content-length');
    });

    test('does not double-set content-length when the caller already has it', () => {
        const wire = serializeStompFrame({
            command: 'MESSAGE',
            headers: { 'content-length': '3' },
            body: 'ab\0',
        });
        expect(wire).toBe('MESSAGE\ncontent-length:3\n\nab\0\0');
    });

    test('round-trips a caller-declared content-length', () => {
        const original: StompFrame = {
            command: 'MESSAGE',
            headers: { 'content-length': '5' },
            body: 'ab\0cd',
        };
        const parsed = roundTrip(original);
        expect(parsed.body).toBe('ab\0cd');
        expect(parsed.headers['content-length']).toBe('5');
    });

    test('rejects serializing a heart-beat ping', () => {
        expect(() => serializeStompFrame({ command: '', headers: {}, body: '' })).toThrow(StompProtocolError);
    });

    test('rejects invalid header names', () => {
        expect(() => serializeStompFrame({ command: 'SEND', headers: { 'bad\nname': 'x' }, body: '' })).toThrow(
            StompProtocolError
        );
        expect(() => serializeStompFrame({ command: 'SEND', headers: { '': 'x' }, body: '' })).toThrow(
            StompProtocolError
        );
    });

    test('round-trips an empty-body frame with headers', () => {
        const original: StompFrame = { command: 'CONNECTED', headers: { version: '1.2', session: 's1' }, body: '' };
        const parsed = roundTrip(original);
        expect(parsed).toEqual(original);
    });
});

describe('parseStompFrame binary (AD-23 D8)', () => {
    const ascii = (text: string): Uint8Array => new TextEncoder().encode(text);

    test('parses a binary frame with a NUL-containing binary body', () => {
        const frameBytes = new Uint8Array(ascii('MESSAGE\ncontent-length:5\n\nab\0cd\0'));
        const frame = parseStompFrame(frameBytes);
        expect(frame.command).toBe('MESSAGE');
        expect(frame.headers['content-length']).toBe('5');
        expect(frame.body).toEqual(new Uint8Array([0x61, 0x62, 0x00, 0x63, 0x64])); // ab\0cd
    });

    test('parses ArrayBuffer input', () => {
        const bytes = ascii('SEND\ndestination:/topic/x\n\nhi\0').buffer;
        const frame = parseStompFrame(bytes);
        expect(frame.command).toBe('SEND');
        expect(frame.headers['destination']).toBe('/topic/x');
        expect(frame.body).toEqual(new Uint8Array([0x68, 0x69]));
    });

    test('treats newline-only binary frames as heart-beat pings', () => {
        expect(parseStompFrame(ascii('\n')).command).toBe('');
        expect(parseStompFrame(new Uint8Array([0x0a, 0x0a])).command).toBe('');
    });

    test('decodes non-ASCII header values from binary frames', () => {
        const bytes = ascii('SEND\ndestination:/topic/caf\u00e9\n\n\0');
        const frame = parseStompFrame(bytes);
        expect(frame.headers['destination']).toBe('/topic/caf\u00e9');
    });

    test('rejects binary frames with a missing NUL terminator', () => {
        expect(() => parseStompFrame(ascii('SEND\ndestination:/t\n\nbody'))).toThrow(StompProtocolError);
    });

    test('rejects a truncated content-length body', () => {
        const bytes = ascii('SEND\ncontent-length:9\n\nbody\0');
        expect(() => parseStompFrame(bytes)).toThrow(StompProtocolError);
    });
});

describe('serializeStompFrame binary (AD-23 D8)', () => {
    test('serializes a binary body to bytes with content-length', () => {
        const wire = serializeStompFrame({ command: 'MESSAGE', headers: {}, body: new Uint8Array([1, 2, 0, 3]) });
        expect(wire).toBeInstanceOf(Uint8Array);
        const parsed = parseStompFrame(wire as Uint8Array);
        expect(parsed.headers['content-length']).toBe('4');
        expect(parsed.body).toEqual(new Uint8Array([1, 2, 0, 3]));
    });

    test('round-trips byte-exact binary bodies', () => {
        const body = new Uint8Array([0, 255, 128, 0, 7, 8, 9]);
        const wire = serializeStompFrame({
            command: 'MESSAGE',
            headers: { destination: '/queue/bin', subscription: 's', 'message-id': 'm-1' },
            body,
        });
        const parsed = parseStompFrame(wire as Uint8Array);
        expect(parsed.body).toEqual(body);
    });

    test('keeps text serialization for string bodies', () => {
        const wire = serializeStompFrame({ command: 'SEND', headers: { destination: '/t' }, body: 'hello' });
        expect(wire).toBe('SEND\ndestination:/t\n\nhello\0');
    });

    test('bodyAsText decodes bytes as UTF-8', () => {
        expect(bodyAsText('plain')).toBe('plain');
        expect(bodyAsText(new Uint8Array([0x68, 0x69]))).toBe('hi');
    });
});
