/**
 * STOMP 1.2 frame codec tests (AD-23 Phase 0).
 *
 * Covers round-trip serialization, all four header-value escapes (and the
 * fatal undefined ones), `content-length` framing (including NUL inside
 * bodies), CRLF line endings (`EOL = [CR] LF`), repeated header entries,
 * trailing EOLs after the terminating NUL, heart-beat pings, and
 * malformed-frame errors.
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

    test('rejects undefined escape sequences as a fatal protocol error', () => {
        // STOMP 1.2 §1.2: "Undefined escape sequences such as \t MUST be
        // treated as a fatal protocol error."
        expect(() => parseStompFrame('SEND\ndestination:/topic/x\\t\n\n\0')).toThrow(StompProtocolError);
        expect(() => parseStompFrame('SEND\nnote:trailing\\\n\n\0')).toThrow(StompProtocolError);
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

describe('CRLF frames (STOMP 1.2 EOL = [CR] LF)', () => {
    test('parses a CRLF frame identically to its LF twin', () => {
        const lf = parseStompFrame('SEND\ndestination:/topic/chat\nreceipt:r-1\n\nhello world\0');
        const crlf = parseStompFrame('SEND\r\ndestination:/topic/chat\r\nreceipt:r-1\r\n\r\nhello world\0');
        expect(crlf).toEqual(lf);
        expect(crlf.command).toBe('SEND');
        expect(crlf.headers).toEqual({ destination: '/topic/chat', receipt: 'r-1' });
        expect(crlf.body).toBe('hello world');
    });

    test('parses LF and CRLF lines mixed in one frame', () => {
        const frame = parseStompFrame('SEND\r\ndestination:/topic/chat\nreceipt:r-1\r\n\nhi\0');
        expect(frame.command).toBe('SEND');
        expect(frame.headers).toEqual({ destination: '/topic/chat', receipt: 'r-1' });
        expect(frame.body).toBe('hi');
    });

    test('honors content-length across CRLF lines', () => {
        const frame = parseStompFrame('MESSAGE\r\ncontent-length:5\r\n\r\nab\0cd\0');
        expect(frame.body).toBe('ab\0cd');
    });

    test('parses a CRLF binary frame', () => {
        const bytes = new TextEncoder().encode('SEND\r\ndestination:/topic/x\r\n\r\nhi\0');
        const frame = parseStompFrame(bytes);
        expect(frame.command).toBe('SEND');
        expect(frame.headers['destination']).toBe('/topic/x');
        expect(frame.body).toEqual(new Uint8Array([0x68, 0x69]));
    });

    test('treats a CRLF heart-beat as a ping', () => {
        expect(parseStompFrame('\r\n')).toEqual({ command: '', headers: {}, body: '' });
        expect(parseStompFrame(new Uint8Array([0x0d, 0x0a])).command).toBe('');
    });

    test('rejects a raw CR that is not a line-ending CR', () => {
        expect(() => parseStompFrame('SEND\ndestination:/t\rX\n\n\0')).toThrow(StompProtocolError);
        expect(() => parseStompFrame('SEND\ndestination:/t\r\r\n\n\0')).toThrow(StompProtocolError);
        expect(() => parseStompFrame(new TextEncoder().encode('SEND\r\ndestination:/t\rX\r\n\r\nhi\0'))).toThrow(
            StompProtocolError
        );
    });
});

describe('serializeStompFrame', () => {
    test('serializes a headerless frame without a spare LF', () => {
        const original: StompFrame = { command: 'DISCONNECT', headers: {}, body: '' };
        const wire = serializeStompFrame(original);
        // STOMP 1.2: "Only SEND, MESSAGE and ERROR frames MAY have a body" —
        // an extra LF would re-parse as a body of "\n".
        expect(wire).toBe('DISCONNECT\n\n\0');
        expect(roundTrip(original)).toEqual(original);
    });

    test('serializes a headerless binary frame without a spare LF', () => {
        const wire = serializeStompFrame({ command: 'MESSAGE', headers: {}, body: new Uint8Array(0) });
        expect(wire).toBeInstanceOf(Uint8Array);
        expect(new TextDecoder().decode(wire as Uint8Array)).toBe('MESSAGE\ncontent-length:0\n\n\0');
        expect(parseStompFrame(wire as Uint8Array).body).toEqual(new Uint8Array(0));
    });

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
        const frame = parseStompFrame(bytes as ArrayBuffer);
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

/** UTF-8 encoding helper for binary wire frames. */
const ascii = (text: string): Uint8Array => new TextEncoder().encode(text);

describe('content-length byte semantics (octets, not UTF-16 units)', () => {
    test('parses a non-ASCII text body against a byte-accurate content-length', () => {
        // 'café' is 4 code units but 5 UTF-8 octets; a conforming broker
        // (Spring, Artemis) counts octets.
        const frame = parseStompFrame('SEND\ncontent-length:5\n\ncaf\u00e9\0');
        expect(frame.body).toBe('caf\u00e9');
    });

    test('rejects a content-length that under-counts non-ASCII octets', () => {
        expect(() => parseStompFrame('SEND\ncontent-length:4\n\ncaf\u00e9\0')).toThrow(StompProtocolError);
    });

    test('serializes content-length in octets for NUL-bearing non-ASCII text bodies', () => {
        const wire = serializeStompFrame({ command: 'SEND', headers: { destination: '/t' }, body: 'a\0caf\u00e9' });
        expect(wire).toContain('content-length:7\n\n');
        const parsed = parseStompFrame(wire as string);
        expect(parsed.headers['content-length']).toBe('7');
        expect(parsed.body).toBe('a\0caf\u00e9');
    });

    test('rejects a caller-declared content-length that mismatches the body', () => {
        expect(() =>
            serializeStompFrame({
                command: 'SEND',
                headers: { destination: '/t', 'content-length': '3' },
                body: 'abcd',
            })
        ).toThrow(StompProtocolError);
    });
});

describe('header hygiene', () => {
    test('keeps the first entry of a repeated header', () => {
        // STOMP 1.2 §1.2 (Repeated Header Entries): "only the first header
        // entry SHOULD be used" — store-and-forward hops prepend or update a
        // header, and that must not drop the connection.
        const repeated = parseStompFrame('SEND\nfoo:World\nfoo:Hello\n\n\0');
        expect(repeated.headers['foo']).toBe('World');
        const linked = parseStompFrame('SEND\ncontent-length:4\ncontent-length:1\n\nbody\0');
        expect(linked.headers['content-length']).toBe('4');
        expect(linked.body).toBe('body');
    });

    test('treats hostile header names as ordinary keys', () => {
        const frame = parseStompFrame('SEND\n__proto__:x\nconstructor:y\n\n\0');
        expect(frame.headers['__proto__']).toBe('x');
        expect(frame.headers['constructor']).toBe('y');
        expect(Object.getPrototypeOf(frame.headers)).toBe(null);
    });

    test('rejects raw CR or NUL in header lines', () => {
        expect(() => parseStompFrame('SEND\naccept-version\ra:1\n\n\0')).toThrow(StompProtocolError);
        expect(() => parseStompFrame('SEND\na:x\0y\n\n\0')).toThrow(StompProtocolError);
    });

    test('rejects invalid commands and header names on serialize', () => {
        expect(() => serializeStompFrame({ command: 'SEND\nX:1', headers: {}, body: '' })).toThrow(StompProtocolError);
        expect(() => serializeStompFrame({ command: 'send', headers: {}, body: '' })).toThrow(StompProtocolError);
        expect(() => serializeStompFrame({ command: 'SEND', headers: { 'a:b': 'x' }, body: '' })).toThrow(
            StompProtocolError
        );
        expect(() => serializeStompFrame({ command: 'SEND', headers: { 'a\r': 'x' }, body: '' })).toThrow(
            StompProtocolError
        );
    });

    test('rejects NUL in header values on serialize', () => {
        expect(() => serializeStompFrame({ command: 'SEND', headers: { a: 'x\0y' }, body: '' })).toThrow(
            StompProtocolError
        );
    });
});

describe('frame boundary strictness', () => {
    test('accepts trailing EOLs after the terminating NUL (text)', () => {
        // STOMP 1.2 §1.2: "The NULL octet can be optionally followed by
        // multiple EOLs."
        expect(parseStompFrame('SEND\ndestination:/t\n\nhi\0\n\n').body).toBe('hi');
        expect(parseStompFrame('SEND\ndestination:/t\n\nhi\0\r\n').body).toBe('hi');
        expect(parseStompFrame('MESSAGE\ncontent-length:4\n\nbody\0\n\r\n').body).toBe('body');
        expect(parseStompFrame('SEND\r\ndestination:/t\r\n\r\nhi\0\r\n').body).toBe('hi');
    });

    test('accepts trailing EOLs after the terminating NUL (binary)', () => {
        expect(parseStompFrame(ascii('SEND\ndestination:/t\n\nhi\0\n\n')).body).toEqual(new Uint8Array([0x68, 0x69]));
        expect(parseStompFrame(ascii('MESSAGE\ncontent-length:4\n\nbody\0\r\n\r\n')).body).toEqual(
            new Uint8Array([0x62, 0x6f, 0x64, 0x79])
        );
    });

    test('rejects a bare CR after the terminating NUL', () => {
        // A CR is only an EOL as part of a CRLF pair (`EOL = [CR] LF`).
        expect(() => parseStompFrame('SEND\ndestination:/t\n\nhi\0\r')).toThrow(StompProtocolError);
        expect(() => parseStompFrame(ascii('SEND\ndestination:/t\n\nhi\0\r'))).toThrow(StompProtocolError);
    });

    test('rejects trailing data after the terminating NUL (text)', () => {
        expect(() => parseStompFrame('SEND\ndestination:/t\n\nbody\0garbage')).toThrow(StompProtocolError);
        expect(() => parseStompFrame('SEND\ncontent-length:4\n\nbody\0garbage')).toThrow(StompProtocolError);
    });

    test('rejects trailing data after the terminating NUL (binary)', () => {
        const bytes = new Uint8Array([...ascii('SEND\ndestination:/t\n\nbody\0'), 0x78]);
        expect(() => parseStompFrame(bytes)).toThrow(StompProtocolError);
    });

    test('rejects invalid UTF-8 in binary frame headers', () => {
        const bytes = new Uint8Array([...ascii('SEND\ndestination:/t'), 0x80, 0xc3, 0x28, ...ascii('\n\nx\0')]);
        expect(() => parseStompFrame(bytes)).toThrow(StompProtocolError);
    });
});

describe('CONNECT/CONNECTED header escaping exemption (STOMP 1.2 §1.2)', () => {
    // "The CONNECT and CONNECTED frames do not escape the carriage return,
    // line feed, or colon characters." `STOMP` is the 1.1 alias of CONNECT.

    test('parses CONNECT header values verbatim (no unescaping)', () => {
        const frame = parseStompFrame('CONNECT\naccept-version:1.2\nhost:x\nlogin:user\\cdept\npasscode:p\\nss\n\n\0');
        // Pre-fix `\c` decoded to ':' and `\n` to a newline — both wrong for
        // an unescaped frame.
        expect(frame.headers['login']).toBe('user\\cdept');
        expect(frame.headers['passcode']).toBe('p\\nss');
    });

    test('parses the STOMP 1.1 alias and CONNECTED verbatim', () => {
        expect(parseStompFrame('STOMP\nhost:x\nlogin:a\\cb\n\n\0').headers['login']).toBe('a\\cb');
        expect(parseStompFrame('CONNECTED\nversion:1.2\nsession:a\\cb\n\n\0').headers['session']).toBe('a\\cb');
    });

    test('serializes CONNECT header values without escaping', () => {
        const wire = serializeStompFrame({ command: 'CONNECT', headers: { host: 'x', login: 'a:b' }, body: '' });
        expect(wire).toContain('login:a:b\n');
        expect(wire).not.toContain('a\\cb');
        // A non-exempt frame still escapes (the SEND path is unchanged).
        const send = serializeStompFrame({ command: 'SEND', headers: { note: 'a:b' }, body: '' });
        expect(send).toContain('note:a\\cb');
    });

    test('round-trips CONNECT credentials containing backslashes and colons', () => {
        const frame: StompFrame = {
            command: 'CONNECT',
            headers: { host: 'x', login: 'a:b', passcode: 'b\\c\\n' },
            body: '',
        };
        expect(roundTrip(frame)).toEqual(frame);
    });

    test('still rejects NUL/CR in a CONNECT value and CR/LF on serialize', () => {
        expect(() => parseStompFrame('CONNECT\nhost:x\nlogin:a\0b\n\n\0')).toThrow(StompProtocolError);
        expect(() => parseStompFrame('CONNECT\nhost:x\nlogin:a\rb\n\n\0')).toThrow(StompProtocolError);
        // No escaping is available for an exempt frame, so CR/LF cannot be
        // framed at all.
        expect(() => serializeStompFrame({ command: 'CONNECT', headers: { login: 'a\rb' }, body: '' })).toThrow(
            StompProtocolError
        );
        expect(() => serializeStompFrame({ command: 'CONNECTED', headers: { session: 'a\nb' }, body: '' })).toThrow(
            StompProtocolError
        );
    });
});
