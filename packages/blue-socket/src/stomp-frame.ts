/**
 * STOMP 1.2 frame codec — parse/serialize text **and binary** frames
 * (AD-23 D1/D8).
 *
 * Wire shape: `COMMAND\nheader:value\n...\n\nbody\0` — newline-delimited
 * header block, blank line, NUL-terminated body. Header values escape
 * `\` → `\\`, newline → `\n`, carriage return → `\r`, colon → `\c`
 * (STOMP 1.2 §1.2). `content-length` is honored when present (the body is
 * exactly that many bytes; binary bodies require it and NULs inside are
 * body data, not terminators).
 *
 * The codec is transport-agnostic. Inbound accepts `string` (text frames)
 * or byte inputs (`Uint8Array`/`ArrayBuffer`/`Buffer` — binary frames,
 * D8); outbound returns a `string` for text bodies and a `Uint8Array`
 * when the body is bytes. Headers are always text; only the body is
 * byte-exact.
 *
 * A frame that is empty or a lone newline is a heart-beat ping
 * (`command: ''`); the codec tolerates a bare `\n` ping with no NUL,
 * matching STOMP 1.2 §4.2.3.
 *
 * Unknown escape sequences are passed through verbatim (lenient — a STOMP
 * 1.0 client never escapes; only the four 1.2 escapes are decoded).
 * * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 */

/** A STOMP body: text (string) or byte-exact binary (D8). */
export type StompBody = string | Uint8Array;

/** A parsed STOMP frame. `command: ''` marks a heart-beat ping. */
export interface StompFrame {
    /** Frame command (`CONNECT`, `SEND`, …, or `''` for a ping). */
    command: string;
    /** Decoded header map; names as sent, values unescaped. */
    headers: Record<string, string>;
    /** Frame body — string for text frames, bytes for binary (D8). */
    body: StompBody;
}

/** Byte-like inputs the codec accepts (binary WS frames, node Buffers). */
export type StompWireInput = string | Uint8Array | ArrayBuffer;

/** Raised on malformed frames (missing NUL, bad `content-length`, …). */
export class StompProtocolError extends Error {
    /**
     * @param message - Human-readable protocol failure detail.
     */
    constructor(message: string) {
        super(message);
        this.name = 'StompProtocolError';
    }
}

/** STOMP 1.2 header-value escapes, in replacement order. */
const ESCAPES: ReadonlyArray<{ raw: string; encoded: string }> = [
    { raw: '\\', encoded: '\\\\' },
    { raw: '\n', encoded: '\\n' },
    { raw: '\r', encoded: '\\r' },
    { raw: ':', encoded: '\\c' },
];

/** UTF-8 decoder for header blocks of binary frames. */
const TEXT_DECODER = new TextDecoder('utf-8', { fatal: false });

/**
 * Normalize byte inputs to a `Uint8Array` view.
 *
 * @param frame - The frame as delivered by the transport.
 * @returns The raw bytes.
 */
function toBytes(frame: Uint8Array | ArrayBuffer): Uint8Array {
    return frame instanceof Uint8Array ? frame : new Uint8Array(frame);
}

/**
 * Escape a header value per STOMP 1.2 §1.2.
 *
 * @param value - The raw header value.
 * @returns The wire-encoded value.
 */
function escapeHeaderValue(value: string): string {
    let out = '';
    for (const char of value) {
        const escape = ESCAPES.find((candidate) => candidate.raw === char);
        out += escape ? escape.encoded : char;
    }
    return out;
}

/**
 * Decode a header value per STOMP 1.2 §1.2. Unknown sequences are kept
 * verbatim (leniency toward never-escaping 1.0 clients).
 *
 * @param value - The wire-encoded value.
 * @returns The decoded value.
 */
function unescapeHeaderValue(value: string): string {
    let out = '';
    for (let i = 0; i < value.length; i += 1) {
        const char = value[i];
        if (char !== '\\' || i + 1 >= value.length) {
            out += char;
            continue;
        }
        const next = value[i + 1];
        const decoded = next === 'n' ? '\n' : next === 'r' ? '\r' : next === 'c' ? ':' : next === '\\' ? '\\' : null;
        if (decoded === null) {
            // Unknown escape — pass both characters through untouched.
            out += char + next;
        } else {
            out += decoded;
        }
        i += 1;
    }
    return out;
}

/**
 * Parse a text header block (command + header lines).
 *
 * @param headerBlock - The text up to the first blank line.
 * @returns The parsed command and header map.
 */
function parseHeaderBlock(headerBlock: string): { command: string; headers: Record<string, string> } {
    const lines = headerBlock.split('\n');
    const command = lines[0] as string;
    if (command === '') {
        throw new StompProtocolError('frame has an empty command');
    }
    const headers: Record<string, string> = {};
    for (let i = 1; i < lines.length; i += 1) {
        const line = lines[i] as string;
        const colon = line.indexOf(':');
        if (colon <= 0) {
            throw new StompProtocolError(`malformed header line: "${line}"`);
        }
        const name = line.slice(0, colon);
        const value = unescapeHeaderValue(line.slice(colon + 1));
        headers[name] = value;
    }
    return { command, headers };
}

/**
 * Locate the header terminator (`\n\n`) in a byte frame.
 *
 * @param bytes - The frame bytes.
 * @returns The offset of the first blank-line terminator, or `-1`.
 */
function headerTerminatorAt(bytes: Uint8Array): number {
    for (let i = 0; i + 1 < bytes.length; i += 1) {
        if (bytes[i] === 0x0a && bytes[i + 1] === 0x0a) {
            return i;
        }
    }
    return -1;
}

/**
 * Parse a wire frame into its command/headers/body.
 *
 * Frame termination: with `content-length`, the body is exactly that many
 * bytes and the frame must end with NUL right after it; without it, the
 * body runs to the first NUL. A bare `\n` (no NUL) is a heart-beat ping.
 * Text frames yield string bodies; byte inputs yield `Uint8Array` bodies
 * (D8).
 *
 * @param frame - The wire frame (a WebSocket text or binary message).
 * @returns The parsed frame (`command: ''` for a ping).
 * @throws {@link StompProtocolError} on malformed input.
 */
export function parseStompFrame(frame: StompWireInput): StompFrame {
    if (typeof frame === 'string') {
        return parseTextFrame(frame);
    }
    const bytes = toBytes(frame);
    // Heart-beat ping: only newlines (possibly with a trailing NUL).
    let hasText = false;
    for (const byte of bytes) {
        if (byte !== 0x0a && byte !== 0x00) {
            hasText = true;
            break;
        }
    }
    if (!hasText) {
        return { command: '', headers: {}, body: new Uint8Array(0) };
    }
    const terminator = headerTerminatorAt(bytes);
    if (terminator < 0) {
        throw new StompProtocolError('frame has no header terminator');
    }
    const headerBlock = TEXT_DECODER.decode(bytes.slice(0, terminator));
    const { command, headers } = parseHeaderBlock(headerBlock);
    const bodyStart = terminator + 2;
    const contentLength = headers['content-length'];
    if (contentLength !== undefined) {
        if (!/^\d+$/.test(contentLength)) {
            throw new StompProtocolError(`invalid content-length: "${contentLength}"`);
        }
        const length = Number(contentLength);
        if (bytes.length < bodyStart + length) {
            throw new StompProtocolError(`body shorter than content-length ${length}`);
        }
        const body = bytes.slice(bodyStart, bodyStart + length);
        if (bodyStart + length >= bytes.length || bytes[bodyStart + length] !== 0x00) {
            throw new StompProtocolError('frame not NUL-terminated after content-length body');
        }
        return { command, headers, body };
    }
    // NUL-terminated body.
    let nul = -1;
    for (let i = bodyStart; i < bytes.length; i += 1) {
        if (bytes[i] === 0x00) {
            nul = i;
            break;
        }
    }
    if (nul < 0) {
        throw new StompProtocolError('frame missing NUL terminator');
    }
    return { command, headers, body: bytes.slice(bodyStart, nul) };
}

/**
 * Parse a text frame (string input).
 *
 * @param frame - The wire frame text.
 * @returns The parsed frame (`command: ''` for a ping).
 */
export function parseTextFrame(frame: string): StompFrame {
    if (frame === '' || !/[^\n]/u.test(frame)) {
        return { command: '', headers: {}, body: '' };
    }
    // Header block ends at the first empty line (escaped newlines inside
    // values are literal backslash-n pairs, so the first real `\n\n` is
    // the terminator).
    const headerEnd = frame.indexOf('\n\n');
    if (headerEnd < 0) {
        throw new StompProtocolError('frame has no header terminator');
    }
    const { command, headers } = parseHeaderBlock(frame.slice(0, headerEnd));
    const bodyStart = headerEnd + 2;
    const contentLength = headers['content-length'];
    if (contentLength !== undefined) {
        if (!/^\d+$/.test(contentLength)) {
            throw new StompProtocolError(`invalid content-length: "${contentLength}"`);
        }
        const length = Number(contentLength);
        if (frame.length < bodyStart + length) {
            throw new StompProtocolError(`body shorter than content-length ${length}`);
        }
        const body = frame.slice(bodyStart, bodyStart + length);
        const terminator = frame[bodyStart + length];
        if (terminator !== '\0') {
            throw new StompProtocolError('frame not NUL-terminated after content-length body');
        }
        return { command, headers, body };
    }
    // NUL-terminated body.
    const nul = frame.indexOf('\0', bodyStart);
    if (nul < 0) {
        throw new StompProtocolError('frame missing NUL terminator');
    }
    return { command, headers, body: frame.slice(bodyStart, nul) };
}

/**
 * Serialize a frame to the wire format (NUL-terminated, escaped headers).
 *
 * Text bodies return a string (text frame); binary bodies return a
 * `Uint8Array` (binary frame, D8) and always carry `content-length` in
 * bytes. A text body containing NUL also forces `content-length` — the
 * framing ambiguity the header exists to resolve.
 *
 * @param frame - The frame to serialize.
 * @returns The wire frame (string for text bodies, bytes for binary).
 * @throws {@link StompProtocolError} on values that cannot be framed.
 */
export function serializeStompFrame(frame: StompFrame): StompBody {
    const { command, headers, body } = frame;
    if (command === '') {
        throw new StompProtocolError('cannot serialize a heart-beat ping');
    }
    const binaryBody = typeof body !== 'string';
    const callerContentLength = headers['content-length'];
    const needsContentLength = (binaryBody || body.includes('\0')) && callerContentLength === undefined;
    const serializedHeaders: Array<[string, string]> = [];
    for (const [name, value] of Object.entries(headers)) {
        if (name.includes('\n') || name.includes('\0') || name === '') {
            throw new StompProtocolError(`invalid header name: "${name}"`);
        }
        serializedHeaders.push([name, escapeHeaderValue(value)]);
    }
    if (needsContentLength) {
        serializedHeaders.push(['content-length', String(body.length)]);
    }
    const headerText = command + '\n' + serializedHeaders.map(([name, value]) => `${name}:${value}`).join('\n') + '\n';
    if (binaryBody) {
        const headerBytes = new TextEncoder().encode(headerText + '\n');
        const wire = new Uint8Array(headerBytes.length + body.length + 1);
        wire.set(headerBytes, 0);
        wire.set(body, headerBytes.length);
        wire[wire.length - 1] = 0x00;
        return wire;
    }
    return headerText + '\n' + body + '\0';
}

/**
 * Interpret a STOMP body as text (UTF-8 for byte bodies).
 *
 * @param body - The body.
 * @returns The text form.
 */
export function bodyAsText(body: StompBody): string {
    if (typeof body === 'string') {
        return body;
    }
    return new TextDecoder('utf-8', { fatal: false }).decode(body);
}
