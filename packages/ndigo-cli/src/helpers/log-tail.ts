/**
 * Log-tail primitives shared by `ndigo logs` and the MCP `get_logs` tool.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Resolves the log file for an application directory, honouring an override.
 *
 * @param dir - The application directory.
 * @param file - Explicit log path, when supplied.
 * @returns The absolute or explicitly supplied path.
 */
export function resolveLogFile(dir: string, file?: string): string {
    return file ?? join(dir, 'logs', 'app.log');
}

/**
 * Returns the last `count` visibly populated lines of a buffer.
 *
 * A single trailing newline closes the final line and must not consume one of
 * the requested lines (the previous `slice(-n)` counted that empty segment
 * too, so `--lines 2` showed one line on newline-terminated logs — the
 * off-by-one fixed under issue #146).
 *
 * @param buffer - The log snapshot.
 * @param count - The number of lines to keep.
 * @returns A view over the retained bytes, untouched.
 */
export function tailLines(buffer: Buffer, count: number): Buffer {
    let end = buffer.byteLength;
    if (end > 0 && buffer[end - 1] === 0x0a) {
        end--;
    }
    let cut = 0;
    let seen = 0;
    for (let index = end - 1; index >= 0; index--) {
        if (buffer[index] === 0x0a) {
            seen++;
            if (seen === count) {
                cut = index + 1;
                break;
            }
        }
    }
    return buffer.subarray(cut);
}

/**
 * Reads the tail of a log file as UTF-8.
 *
 * @param file - The log path.
 * @param count - The number of lines to keep.
 * @returns The retained text.
 */
export function readLogTail(file: string, count: number): string {
    return tailLines(readFileSync(file), count).toString('utf8');
}
