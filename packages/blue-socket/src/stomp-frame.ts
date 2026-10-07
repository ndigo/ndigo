/**
 * STOMP 1.2 frame codec — parse/serialize text **and binary** frames
 * (AD-23 D1/D8).
 *
 * Wire shape: `COMMAND EOL header:value EOL ... EOL body\0` — an
 * EOL-delimited header block, a blank line, then the NUL-terminated body.
 * `EOL = [CR] LF` (STOMP 1.2 §1.2): lines may end in `\n` or `\r\n`, and
 * the two may be mixed inside one frame; a CR anywhere else in a line is a
 * protocol error. Header values escape `\` → `\\`, newline → `\n`,
 * carriage return → `\r`, colon → `\c`; any other backslash sequence is a
 * fatal protocol error (STOMP 1.2 §1.2, "Undefined escape sequences").
 * `content-length` is honored when present (the body is exactly that many
 * bytes; binary bodies require it and NULs inside are body data, not
 * terminators). A repeated header name keeps its first value (§1.2,
 * "Repeated Header Entries").
 *
 * The codec is transport-agnostic. Inbound accepts `string` (text frames)
 * or byte inputs (`Uint8Array`/`ArrayBuffer`/`Buffer` — binary frames,
 * D8); outbound returns a `string` for text bodies and a `Uint8Array`
 * when the body is bytes. Headers are always text; only the body is
 * byte-exact.
 *
 * A frame that is empty or holds nothing but EOLs (`\n` or `\r\n`),
 * optionally followed by a NUL in the byte path, is a heart-beat ping
 * (`command: ''`), matching STOMP 1.2 §4.2.3.
 *
 * The terminating NUL may be followed by any number of EOLs ("The NULL
 * octet can be optionally followed by multiple EOLs", §1.2); any other
 * octet after the NUL is trailing data and fatal.
 * @module blue-socket
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

/**
 * Frames whose header values are exempt from the STOMP 1.2 §1.2 escaping
 * rules: "The CONNECT and CONNECTED frames do not escape the carriage
 * return, line feed, or colon characters." `STOMP` is the STOMP 1.1 alias
 * of `CONNECT`, so it is exempt for the same reason (credentials carrying
 * `\`, `:` or `\n` must round-trip verbatim).
 */
const UNESCAPED_HEADER_COMMANDS: Record<string, true> = {
    CONNECT: true,
    STOMP: true,
    CONNECTED: true,
};

/** STOMP 1.2 header-value escapes, in replacement order. */
const ESCAPES: ReadonlyArray<{ raw: string; encoded: string }> = [
    { raw: '\\', encoded: '\\\\' },
    { raw: '\n', encoded: '\\n' },
    { raw: '\r', encoded: '\\r' },
    { raw: ':', encoded: '\\c' },
];

/** UTF-8 decoder for header blocks of binary frames — fatal: invalid header
 * bytes are a protocol error, not laundered into U+FFFD (which would let
 * distinct byte sequences alias onto the same decoded key). Bodies decode
 * leniently (`bodyAsText`). */
const TEXT_DECODER = new TextDecoder('utf-8', { fatal: true });

/** A heart-beat ping: an empty frame or nothing but EOLs (STOMP 1.2 §4.2.3). */
const textPing = /^(?:\r?\n)*$/u;

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
 * Decode a header value per STOMP 1.2 §1.2. Only `\n`, `\r`, `\c` and `\\`
 * are defined; any other backslash sequence — including a trailing lone
 * backslash — is a fatal protocol error ("Undefined escape sequences such as
 * \t MUST be treated as a fatal protocol error").
 *
 * @param value - The wire-encoded value.
 * @returns The decoded value.
 * @throws {@link StompProtocolError} on an undefined escape sequence.
 */
function unescapeHeaderValue(value: string): string {
    let out = '';
    const length = value.length;
    for (let i = 0; i < length; i += 1) {
        const char = value[i] as string;
        if (char !== '\\') {
            out += char;
            continue;
        }
        const next: string | undefined = value[i + 1];
        if (next === 'n') {
            out += '\n';
        } else if (next === 'r') {
            out += '\r';
        } else if (next === 'c') {
            out += ':';
        } else if (next === '\\') {
            out += '\\';
        } else {
            throw new StompProtocolError(`undefined header escape: "\\${next ?? ''}"`);
        }
        i += 1;
    }
    return out;
}

/**
 * Parse a text header block (command line + header lines). Lines end with
 * `EOL = [CR] LF` (STOMP 1.2 §1.2), so exactly one trailing CR is stripped
 * from each line; a CR anywhere else in a line stays a protocol error.
 *
 * A repeated header name keeps the first value — "only the first header
 * entry SHOULD be used" (§1.2, Repeated Header Entries) — which is what
 * store-and-forward hops that prepend or update a header rely on.
 *
 * `CONNECT`/`STOMP`/`CONNECTED` values are exempt from the §1.2 escape
 * rules and are taken verbatim.
 *
 * @param headerBlock - The frame text before the blank line, EOLs excluded.
 * @returns The parsed command and header map.
 * @throws {@link StompProtocolError} on an empty command, a raw CR/NUL, a
 * malformed header line, or an undefined escape sequence.
 */
function parseHeaderBlock(headerBlock: string): { command: string; headers: Record<string, string> } {
    const lines = headerBlock.split('\n');
    const rawCommand = lines[0] as string;
    const command = rawCommand.endsWith('\r') ? rawCommand.slice(0, -1) : rawCommand;
    if (command === '') {
        throw new StompProtocolError('frame has an empty command');
    }
    if (command.includes('\r') || command.includes('\0')) {
        throw new StompProtocolError('command line contains raw CR or NUL');
    }
    // Null-prototype map: untrusted header names (`__proto__`, `constructor`, …)
    // must land as ordinary keys, never touch the object prototype.
    const headers: Record<string, string> = Object.create(null);
    // CONNECT/STOMP/CONNECTED header values are exempt from escaping
    // (STOMP 1.2 §1.2) — `\c` there is not an escape sequence, so the value
    // is taken verbatim (still with the raw-CR/NUL guard below).
    const exempt = UNESCAPED_HEADER_COMMANDS[command] === true;
    const length = lines.length;
    for (let i = 1; i < length; i += 1) {
        const rawLine = lines[i] as string;
        const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
        // STOMP 1.2 forbids raw CR and NUL in header lines.
        if (line.includes('\r') || line.includes('\0')) {
            throw new StompProtocolError('header line contains raw CR or NUL');
        }
        const colon = line.indexOf(':');
        if (colon <= 0) {
            throw new StompProtocolError(`malformed header line: "${line}"`);
        }
        const name = line.slice(0, colon);
        // Only the first entry of a repeated header is used (STOMP 1.2 §1.2).
        if (name in headers) {
            continue;
        }
        headers[name] = exempt ? line.slice(colon + 1) : unescapeHeaderValue(line.slice(colon + 1));
    }
    return { command, headers };
}

/**
 * Offset of the line feed that ends a frame's blank line, or `-1` when the
 * frame has none. STOMP 1.2 lines end with `EOL = [CR] LF`, so the blank
 * line is `\n` or `\r\n`. One scanner serves both paths — `units` holds a
 * text frame's code units or a byte frame's octets — so the text and byte
 * paths cannot drift apart on the CRLF rule.
 *
 * @param units - The frame, indexed by code unit (text) or octet (bytes).
 * @returns The blank line's LF offset, or `-1`.
 */
function headerTerminatorAt(units: ArrayLike<string | number>): number {
    let lineStart = 0;
    const length = units.length;
    for (let i = 0; i < length; i += 1) {
        const unit = units[i];
        if (unit !== '\n' && unit !== 0x0a) {
            continue;
        }
        const previous = units[i - 1];
        // The line holding this LF is blank: the LF alone, or a CR before it.
        if (i === lineStart || (i - 1 === lineStart && (previous === '\r' || previous === 0x0d))) {
            return i;
        }
        lineStart = i + 1;
    }
    return -1;
}

/**
 * Offset where the header block closed by the blank line at `terminator`
 * ends (exclusive): the blank line's `[CR] LF` and the previous line's LF
 * are not part of the block. The previous line's CR stays in the block so
 * that `parseHeaderBlock` strips exactly one trailing CR from that line and
 * any CR before it is still caught as raw.
 *
 * @param units - The frame, indexed by code unit (text) or octet (bytes).
 * @param terminator - The blank line's LF offset (`headerTerminatorAt`).
 * @returns The offset just past the last header line.
 */
function headerBlockEnd(units: ArrayLike<string | number>, terminator: number): number {
    let end = terminator;
    const blankCr = units[end - 1];
    if (blankCr === '\r' || blankCr === 0x0d) {
        end -= 1;
    }
    const lineLf = units[end - 1];
    if (lineLf === '\n' || lineLf === 0x0a) {
        end -= 1;
    }
    return end;
}

/**
 * Accept the EOLs STOMP 1.2 allows after the terminating NUL — "The NULL
 * octet can be optionally followed by multiple EOLs" (§1.2); a CR only
 * counts as part of a CRLF pair.
 *
 * @param units - The frame, indexed by code unit (text) or octet (bytes).
 * @param from - Offset just past the terminating NUL.
 * @throws {@link StompProtocolError} on any octet that is not an EOL.
 */
function assertTrailingEols(units: ArrayLike<string | number>, from: number): void {
    const length = units.length;
    for (let i = from; i < length; i += 1) {
        const unit = units[i];
        if (unit === '\n' || unit === 0x0a) {
            continue;
        }
        const next = units[i + 1];
        if ((unit === '\r' || unit === 0x0d) && (next === '\n' || next === 0x0a)) {
            i += 1;
            continue;
        }
        throw new StompProtocolError('frame has trailing data after the terminating NUL');
    }
}

/**
 * Parse a wire frame into its command/headers/body.
 *
 * Frame termination: with `content-length`, the body is exactly that many
 * bytes and the frame must end with NUL right after it; without it, the
 * body runs to the first NUL. The NUL may be followed by any number of EOLs
 * (STOMP 1.2 §1.2). A frame holding nothing but EOLs — and, in the byte
 * path, NULs — is a heart-beat ping. Text frames yield string bodies; byte
 * inputs yield `Uint8Array` bodies (D8).
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
    // Heart-beat ping: nothing but EOLs, optionally with NULs.
    let hasText = false;
    const bytesLength = bytes.length;
    for (let i = 0; i < bytesLength; i += 1) {
        const byte = bytes[i];
        if (byte === 0x0a || byte === 0x00) {
            continue;
        }
        if (byte === 0x0d && bytes[i + 1] === 0x0a) {
            i += 1;
            continue;
        }
        hasText = true;
        break;
    }
    if (!hasText) {
        return { command: '', headers: {}, body: new Uint8Array(0) };
    }
    const terminator = headerTerminatorAt(bytes);
    if (terminator < 0) {
        throw new StompProtocolError('frame has no header terminator');
    }
    let headerBlock: string;
    try {
        headerBlock = TEXT_DECODER.decode(bytes.slice(0, headerBlockEnd(bytes, terminator)));
    } catch {
        throw new StompProtocolError('frame headers are not valid UTF-8');
    }
    const { command, headers } = parseHeaderBlock(headerBlock);
    const bodyStart = terminator + 1;
    const contentLength = headers['content-length'];
    if (contentLength !== undefined) {
        if (!/^\d+$/.test(contentLength)) {
            throw new StompProtocolError(`invalid content-length: "${contentLength}"`);
        }
        const length = Number(contentLength);
        if (!Number.isSafeInteger(length)) {
            throw new StompProtocolError(`content-length out of range: "${contentLength}"`);
        }
        if (bytes.length < bodyStart + length) {
            throw new StompProtocolError(`body shorter than content-length ${length}`);
        }
        const body = bytes.slice(bodyStart, bodyStart + length);
        if (bodyStart + length >= bytes.length || bytes[bodyStart + length] !== 0x00) {
            throw new StompProtocolError('frame not NUL-terminated after content-length body');
        }
        assertTrailingEols(bytes, bodyStart + length + 1);
        return { command, headers, body };
    }
    // NUL-terminated body.
    let nul = -1;
    for (let i = bodyStart; i < bytesLength; i += 1) {
        if (bytes[i] === 0x00) {
            nul = i;
            break;
        }
    }
    if (nul < 0) {
        throw new StompProtocolError('frame missing NUL terminator');
    }
    assertTrailingEols(bytes, nul + 1);
    return { command, headers, body: bytes.slice(bodyStart, nul) };
}

/**
 * Parse a text frame (string input).
 *
 * Lines end with `EOL = [CR] LF` (STOMP 1.2 §1.2), so `\r\n` and `\n` may
 * be mixed; the NUL may be followed by any number of EOLs.
 *
 * @param frame - The wire frame text.
 * @returns The parsed frame (`command: ''` for a ping).
 * @throws {@link StompProtocolError} on malformed input.
 */
export function parseTextFrame(frame: string): StompFrame {
    if (textPing.test(frame)) {
        return { command: '', headers: {}, body: '' };
    }
    // Header block ends at the first blank line (escaped newlines inside
    // values are literal backslash-n pairs, so the first real blank line is
    // the terminator).
    const terminator = headerTerminatorAt(frame);
    if (terminator < 0) {
        throw new StompProtocolError('frame has no header terminator');
    }
    const { command, headers } = parseHeaderBlock(frame.slice(0, headerBlockEnd(frame, terminator)));
    const bodyStart = terminator + 1;
    const contentLength = headers['content-length'];
    if (contentLength !== undefined) {
        if (!/^\d+$/.test(contentLength)) {
            throw new StompProtocolError(`invalid content-length: "${contentLength}"`);
        }
        const length = Number(contentLength);
        if (!Number.isSafeInteger(length)) {
            throw new StompProtocolError(`content-length out of range: "${contentLength}"`);
        }
        // STOMP counts `content-length` in octets; JS string indexes are
        // UTF-16 code units (equal only for ASCII). Do the length math on
        // the UTF-8 encoding: the body is the byte slice at
        // `bodyStartBytes..+length`, the frame must NUL-terminate exactly
        // there, and the decoded body keeps the text-frame string contract.
        const encoded = new TextEncoder().encode(frame);
        const bodyStartBytes = new TextEncoder().encode(frame.slice(0, bodyStart)).length;
        if (encoded.length < bodyStartBytes + length) {
            throw new StompProtocolError(`body shorter than content-length ${length}`);
        }
        if (encoded[bodyStartBytes + length] !== 0x00) {
            throw new StompProtocolError('frame not NUL-terminated after content-length body');
        }
        assertTrailingEols(encoded, bodyStartBytes + length + 1);
        const body = new TextDecoder('utf-8', { fatal: false }).decode(
            encoded.slice(bodyStartBytes, bodyStartBytes + length)
        );
        return { command, headers, body };
    }
    // NUL-terminated body.
    const nul = frame.indexOf('\0', bodyStart);
    if (nul < 0) {
        throw new StompProtocolError('frame missing NUL terminator');
    }
    assertTrailingEols(frame, nul + 1);
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
    if (!/^[A-Z][A-Z0-9-]*$/.test(command)) {
        throw new StompProtocolError(`invalid command: "${command}"`);
    }
    const textBody = typeof body === 'string';
    // STOMP `content-length` counts octets: binary bodies are byte-exact;
    // text bodies measure their UTF-8 encoding (a JS string's `.length` is
    // UTF-16 code units — equal only for ASCII).
    const octets = (candidate: StompBody): number =>
        typeof candidate === 'string' ? new TextEncoder().encode(candidate).length : candidate.length;
    const callerContentLength = headers['content-length'];
    if (callerContentLength !== undefined && callerContentLength !== String(octets(body))) {
        throw new StompProtocolError(
            `content-length ${callerContentLength} does not match body (${String(octets(body))} octets)`
        );
    }
    const needsContentLength = (body instanceof Uint8Array || body.includes('\0')) && callerContentLength === undefined;
    // CONNECT/STOMP/CONNECTED values are not escaped (STOMP 1.2 §1.2), so a
    // CR/LF there cannot be framed at all (an escaped `\n` would be read
    // back verbatim as a literal backslash-n on the peer).
    const exempt = UNESCAPED_HEADER_COMMANDS[command] === true;
    const serializedHeaders: Array<[string, string]> = [];
    for (const [name, value] of Object.entries(headers)) {
        // `:` would re-split on parse, CR/LF would forge header lines, and
        // NUL would corrupt the frame — all rejected up front.
        if (name === '' || /[\n\r:\0]/.test(name)) {
            throw new StompProtocolError(`invalid header name: "${name}"`);
        }
        if (value.includes('\0') || (exempt && /[\n\r]/.test(value))) {
            throw new StompProtocolError(`invalid header value for ${command}: "${name}"`);
        }
        serializedHeaders.push([name, exempt ? value : escapeHeaderValue(value)]);
    }
    if (needsContentLength) {
        serializedHeaders.push(['content-length', String(octets(body))]);
    }
    // The header block is `COMMAND EOL headers EOL EOL`: with no header
    // lines the command's own EOL *is* the first one, so a headerless frame
    // gets exactly one blank line and then its (empty) body — never a spare
    // LF that would be parsed back as body data.
    const headerText =
        serializedHeaders.length === 0
            ? `${command}\n\n`
            : `${command}\n${serializedHeaders.map(([name, value]) => `${name}:${value}`).join('\n')}\n\n`;
    if (!textBody) {
        const headerBytes = new TextEncoder().encode(headerText);
        const wire = new Uint8Array(headerBytes.length + body.length + 1);
        wire.set(headerBytes, 0);
        wire.set(body, headerBytes.length);
        wire[wire.length - 1] = 0x00;
        return wire;
    }
    return headerText + body + '\0';
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
