/**
 * Log-tail primitives shared by `ndigo logs` and the MCP `get_logs` tool.
 */
import { closeSync, openSync, readSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Resolves the log file for an application directory, honouring an override.
 *
 * @param dir - The application directory.
 * @param file - Explicit log path, when supplied.
 * @returns The absolute or explicitly supplied path.
 *
 * @example
 * ```ts
 * const file = resolveLogFile('/path/to/app');
 * ```
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
 *
 * @example
 * ```ts
 * const tail = tailLines(Buffer.from('a\nb\nc\n'), 2);
 * console.log(tail.toString()); // "b\nc\n"
 * ```
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
 * Upper bound on the log slice that the tail reader reads. Reading only the
 * trailing chunk prevents a huge log from exhausting memory when `--lines` is
 * larger than the file.
 */
const MAX_LOG_TAIL_BYTES = 64 * 1024;

/**
 * Reads the tail of a log file as UTF-8.
 *
 * @param file - The log path.
 * @param count - The number of lines to keep.
 * @returns The retained text.
 *
 * @example
 * ```ts
 * const tail = readLogTail('/path/to/app/logs/app.log', 50);
 * console.log(tail);
 * ```
 */
export function readLogTail(file: string, count: number): string {
    const stats = statSync(file);
    if (!stats.isFile()) {
        throw new Error(`log path is not a file: ${file}`);
    }
    const fd = openSync(file, 'r');
    const readSize = Math.min(MAX_LOG_TAIL_BYTES, stats.size);
    const buffer = Buffer.alloc(readSize);
    try {
        readSync(fd, buffer, 0, readSize, stats.size - readSize);
    } finally {
        closeSync(fd);
    }
    return tailLines(buffer, count).toString('utf8');
}
