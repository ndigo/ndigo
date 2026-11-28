/**
 * STOMP 1.2 header escaping and escape constants.
 */
import { STOMPProtocolError } from './stomp-frame-error.js';

/**
 * Frames whose header values are exempt from the STOMP 1.2 §1.2 escaping
 * rules: "The CONNECT and CONNECTED frames do not escape the carriage
 * return, line feed, or colon characters." `STOMP` is the STOMP 1.1 alias
 * of `CONNECT`, so it is exempt for the same reason (credentials carrying
 * `\`, `:` or `\n` must round-trip verbatim).
 */
export const UNESCAPED_HEADER_COMMANDS: Record<string, true> = {
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

/**
 * Escape a header value per STOMP 1.2 §1.2.
 *
 * @param value - The raw header value.
 * @returns The wire-encoded value.
 */
export function escapeHeaderValue(value: string): string {
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
 * `\\t` MUST be treated as a fatal protocol error").
 *
 * @param value - The wire-encoded value.
 * @returns The decoded value.
 * @throws on an undefined escape sequence.
 */
export function unescapeHeaderValue(value: string): string {
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
            throw new STOMPProtocolError(`undefined header escape: "\\${next ?? ''}"`);
        }
        i += 1;
    }
    return out;
}
