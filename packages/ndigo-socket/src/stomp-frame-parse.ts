/**
 * STOMP frame parsing: content-length handling and text/binary body decoding.
 */
import { STOMPProtocolError } from './stomp-frame-error.js';
import { assertTrailingEols, headerBlockEnd, headerTerminatorAt, parseHeaderBlock } from './_stomp-frame-scan.js';
import type { STOMPFrame, STOMPWireInput } from './stomp-frame-types.js';

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
 * Parse a wire frame into its command/headers/body.
 *
 * Frame termination: with `content-length`, the body is exactly that many
 * bytes and the frame must end with NUL right after it; without it, the
 * body runs to the first NUL. The NUL may be followed by any number of EOLs
 * (STOMP 1.2 §1.2). A frame holding nothing but EOLs — and, in the byte
 * path, NULs — is a heart-beat ping. Text frames yield string bodies; byte
 * inputs yield `Uint8Array` bodies.
 *
 * @param frame - The wire frame (a WebSocket text or binary message).
 * @returns The parsed frame (`command: ''` for a ping).
 * @throws on malformed input.
 *
 * @example
 * ```ts
 * parseStompFrame();
 * ```
 */
export function parseStompFrame(frame: STOMPWireInput): STOMPFrame {
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
        throw new STOMPProtocolError('frame has no header terminator');
    }
    let headerBlock: string;
    try {
        headerBlock = TEXT_DECODER.decode(bytes.slice(0, headerBlockEnd(bytes, terminator)));
    } catch {
        throw new STOMPProtocolError('frame headers are not valid UTF-8');
    }
    const { command, headers } = parseHeaderBlock(headerBlock);
    const bodyStart = terminator + 1;
    const contentLength = headers['content-length'];
    if (contentLength !== undefined) {
        if (!/^\d+$/.test(contentLength)) {
            throw new STOMPProtocolError(`invalid content-length: "${contentLength}"`);
        }
        const length = Number(contentLength);
        if (!Number.isSafeInteger(length)) {
            throw new STOMPProtocolError(`content-length out of range: "${contentLength}"`);
        }
        if (bytes.length < bodyStart + length) {
            throw new STOMPProtocolError(`body shorter than content-length ${length}`);
        }
        const body = bytes.slice(bodyStart, bodyStart + length);
        if (bodyStart + length >= bytes.length || bytes[bodyStart + length] !== 0x00) {
            throw new STOMPProtocolError('frame not NUL-terminated after content-length body');
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
        throw new STOMPProtocolError('frame missing NUL terminator');
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
 * @throws on malformed input.
 *
 * @example
 * ```ts
 * parseTextFrame();
 * ```
 */
export function parseTextFrame(frame: string): STOMPFrame {
    if (textPing.test(frame)) {
        return { command: '', headers: {}, body: '' };
    }
    // Header block ends at the first blank line (escaped newlines inside
    // values are literal backslash-n pairs, so the first real blank line is
    // the terminator).
    const terminator = headerTerminatorAt(frame);
    if (terminator < 0) {
        throw new STOMPProtocolError('frame has no header terminator');
    }
    const { command, headers } = parseHeaderBlock(frame.slice(0, headerBlockEnd(frame, terminator)));
    const bodyStart = terminator + 1;
    const contentLength = headers['content-length'];
    if (contentLength !== undefined) {
        if (!/^\d+$/.test(contentLength)) {
            throw new STOMPProtocolError(`invalid content-length: "${contentLength}"`);
        }
        const length = Number(contentLength);
        if (!Number.isSafeInteger(length)) {
            throw new STOMPProtocolError(`content-length out of range: "${contentLength}"`);
        }
        // STOMP counts `content-length` in octets; JS string indexes are
        // UTF-16 code units (equal only for ASCII). Do the length math on
        // the UTF-8 encoding: the body is the byte slice at
        // `bodyStartBytes..+length`, the frame must NUL-terminate exactly
        // there, and the decoded body keeps the text-frame string contract.
        const encoded = new TextEncoder().encode(frame);
        const bodyStartBytes = new TextEncoder().encode(frame.slice(0, bodyStart)).length;
        if (encoded.length < bodyStartBytes + length) {
            throw new STOMPProtocolError(`body shorter than content-length ${length}`);
        }
        if (encoded[bodyStartBytes + length] !== 0x00) {
            throw new STOMPProtocolError('frame not NUL-terminated after content-length body');
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
        throw new STOMPProtocolError('frame missing NUL terminator');
    }
    assertTrailingEols(frame, nul + 1);
    return { command, headers, body: frame.slice(bodyStart, nul) };
}
