/**
 * STOMP header-block scanning: command line, line terminators, and the
 * blank-line boundary.
 */
import { STOMPProtocolError } from './stomp-frame-error.js';
import { UNESCAPED_HEADER_COMMANDS, unescapeHeaderValue } from './_stomp-frame-escapes.js';

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
 * @throws on an empty command, a raw CR/NUL, a
 * malformed header line, or an undefined escape sequence.
 */
export function parseHeaderBlock(headerBlock: string): { command: string; headers: Record<string, string> } {
    const lines = headerBlock.split('\n');
    const rawCommand = lines[0] as string;
    const command = rawCommand.endsWith('\r') ? rawCommand.slice(0, -1) : rawCommand;
    if (command === '') {
        throw new STOMPProtocolError('frame has an empty command');
    }
    if (command.includes('\r') || command.includes('\0')) {
        throw new STOMPProtocolError('command line contains raw CR or NUL');
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
            throw new STOMPProtocolError('header line contains raw CR or NUL');
        }
        const colon = line.indexOf(':');
        if (colon <= 0) {
            throw new STOMPProtocolError(`malformed header line: "${line}"`);
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
export function headerTerminatorAt(units: ArrayLike<string | number>): number {
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
export function headerBlockEnd(units: ArrayLike<string | number>, terminator: number): number {
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
 * @throws on any octet that is not an EOL.
 */
export function assertTrailingEols(units: ArrayLike<string | number>, from: number): void {
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
        throw new STOMPProtocolError('frame has trailing data after the terminating NUL');
    }
}
