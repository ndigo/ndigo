/**
 * `ndigo logs` — print (and optionally follow) an application log file.
 * The follow protocol is byte-faithful: one fd plus Buffer end-offsets, so
 * multibyte logs stay intact and appended lines are read incrementally
 * rather than re-reading the whole file every poll (issue #146).
 */
import { buildCommand, numberParser } from '@stricli/core';
import { closeSync, existsSync, openSync, readFileSync, readSync, statSync, unwatchFile, watchFile } from 'node:fs';
import { resolveLogFile, tailLines } from '../helpers/log-tail.js';

/**
 * The log-file tail command.
 */
export const logsCommand = buildCommand({
    async func(flags: { file?: string; lines?: number; follow?: boolean }, dir: string) {
        // `dir` names the app whose default log location is used; --file
        // overrides the location entirely (no package.json check — a log
        // file is addressable without the app manifest).
        const file = resolveLogFile(dir, flags.file);
        if (!existsSync(file)) {
            process.stderr.write(`log file not found: ${file}\n`);
            process.exitCode = 2;
            return;
        }

        const lines = flags.lines ?? 50;
        // `numberParser` already rejects non-numbers; zero, negatives, and
        // fractions must not shift the tail silently — `slice(-NaN)` used
        // to print the whole file instead of failing (issue #146).
        if (!Number.isInteger(lines) || lines <= 0) {
            process.stderr.write(`--lines must be a positive integer (received ${flags.lines})\n`);
            process.exitCode = 2;
            return;
        }

        const printLastLines = (buffer: Buffer, count: number): void => {
            process.stdout.write(tailLines(buffer, count));
        };

        // One snapshot drives both the printed tail and the follow position:
        // snapshotting the offset AFTER a string-based print used to drop
        // every line appended in the gap between the two reads (issue #146).
        const initial = readFileSync(file);
        printLastLines(initial, lines);
        let position = initial.byteLength;
        let fd = openSync(file, 'r');

        if (!flags.follow) {
            closeSync(fd);
            return;
        }

        const onChange = (): void => {
            let size: number;
            try {
                size = statSync(file).size;
            } catch {
                // Deleted/transiently invisible mid-rotation: keep watching;
                // a permanent disappearance simply never updates again.
                return;
            }
            if (size > position) {
                const buffer = Buffer.alloc(size - position);
                let read: number;
                try {
                    read = readSync(fd, buffer, 0, buffer.byteLength, position);
                } catch {
                    // A shrank-mid-read race or EBUSY: skip this tick, the
                    // next stat re-checks from the unchanged position.
                    return;
                }
                if (read > 0) {
                    process.stdout.write(buffer.subarray(0, read));
                    position += read;
                }
            } else if (size < position) {
                // Truncated/rotated (new inode): reopen and print whole.
                closeSync(fd);
                fd = openSync(file, 'r');
                const buffer = readFileSync(file);
                process.stdout.write(buffer);
                position = buffer.byteLength;
            }
        };
        watchFile(file, { interval: 200 }, onChange);

        // Keep the process alive until interrupted; Ctrl-C/SIGTERM resolves
        // with exit code 0 (the tail contract the plan records).
        await new Promise<void>((resolve) => {
            const stop = (): void => {
                unwatchFile(file, onChange);
                closeSync(fd);
                resolve();
            };
            process.on('SIGINT', stop);
            process.on('SIGTERM', stop);
        });
    },
    parameters: {
        flags: {
            file: { kind: 'parsed', parse: (v: string) => v, brief: 'Log file path.', optional: true },
            lines: {
                kind: 'parsed',
                parse: numberParser,
                brief: 'Number of lines to show.',
                optional: true,
            },
            follow: { kind: 'boolean', brief: 'Follow the log (tail -f).', optional: true },
        },
        positional: {
            kind: 'tuple',
            parameters: [
                {
                    parse: (v: string) => v,
                    brief: 'Application directory (default: current directory).',
                    default: '.',
                    placeholder: 'dir',
                },
            ],
        },
    },
    docs: { brief: 'Print (and optionally follow) an application log file' },
});
