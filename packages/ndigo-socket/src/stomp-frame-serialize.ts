/**
 * STOMP frame serialization and body text projection.
 */
import { STOMPProtocolError } from './stomp-frame-error.js';
import { UNESCAPED_HEADER_COMMANDS, escapeHeaderValue } from './_stomp-frame-escapes.js';
import type { STOMPBody, STOMPFrame } from './stomp-frame-types.js';

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
 * @throws on values that cannot be framed.
 *
 * @example
 * ```ts
 * serializeStompFrame();
 * ```
 */
export function serializeStompFrame(frame: STOMPFrame): STOMPBody {
    const { command, headers, body } = frame;
    if (command === '') {
        throw new STOMPProtocolError('cannot serialize a heart-beat ping');
    }
    if (!/^[A-Z][A-Z0-9-]*$/.test(command)) {
        throw new STOMPProtocolError(`invalid command: "${command}"`);
    }
    const textBody = typeof body === 'string';
    // STOMP `content-length` counts octets: binary bodies are byte-exact;
    // text bodies measure their UTF-8 encoding (a JS string's `.length` is
    // UTF-16 code units — equal only for ASCII).
    const octets = (candidate: STOMPBody): number =>
        typeof candidate === 'string' ? new TextEncoder().encode(candidate).length : candidate.length;
    const callerContentLength = headers['content-length'];
    if (callerContentLength !== undefined && callerContentLength !== String(octets(body))) {
        throw new STOMPProtocolError(
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
            throw new STOMPProtocolError(`invalid header name: "${name}"`);
        }
        if (value.includes('\0') || (exempt && /[\n\r]/.test(value))) {
            throw new STOMPProtocolError(`invalid header value for ${command}: "${name}"`);
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
 *
 * @example
 * ```ts
 * bodyAsText();
 * ```
 */
export function bodyAsText(body: STOMPBody): string {
    if (typeof body === 'string') {
        return body;
    }
    return new TextDecoder('utf-8', { fatal: false }).decode(body);
}
