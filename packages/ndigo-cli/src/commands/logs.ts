/**
 * `ndigo logs` — print (and optionally follow) an application log file.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { existsSync, readFileSync, watchFile, unwatchFile, statSync } from 'node:fs';
import { join } from 'node:path';

export const logsCommand = buildCommand({
    async func(flags: { file?: string; lines?: number; follow?: boolean }, dir: string) {
        const file = flags.file ?? join(dir, 'logs', 'app.log');
        if (!existsSync(file)) {
            process.stderr.write(`log file not found: ${file}\n`);
            process.exitCode = 2;
            return;
        }

        const printTail = (n: number): void => {
            const content = readFileSync(file, 'utf8');
            const lines = content.split(/\r?\n/);
            const tail = lines.slice(-n).join('\n');
            process.stdout.write(tail + (tail.endsWith('\n') ? '' : '\n'));
        };

        const n = flags.lines ?? 50;
        printTail(n);

        if (!flags.follow) return;

        let position = statSync(file).size;
        const onChange = (): void => {
            let size: number;
            try { size = statSync(file).size; }
            catch { return; }
            if (size < position) {
                // Truncated/rotated: print whole file.
                process.stdout.write(readFileSync(file, 'utf8'));
                position = size;
                return;
            }
            if (size === position) return;
            const buf = readFileSync(file, 'utf8');
            process.stdout.write(buf.slice(position));
            position = size;
        };

        watchFile(file, { interval: 200 }, onChange);

        // Keep the process alive until interrupted.
        await new Promise<void>((resolve) => {
            const stop = (): void => {
                unwatchFile(file, onChange);
                resolve();
            };
            process.on('SIGINT', stop);
            process.on('SIGTERM', stop);
        });
    },
    parameters: {
        flags: {
            file: { kind: 'parsed', parse: (v: string) => v, brief: 'Log file path.', optional: true },
            lines: { kind: 'parsed', parse: (v: string) => Number(v), brief: 'Number of lines to show.', optional: true },
            follow: { kind: 'boolean', brief: 'Follow the log (tail -f).', optional: true },
        },
        positional: { kind: 'tuple', parameters: [
            { parse: (v: string) => v, brief: 'Application directory (default: current directory).', default: '.', placeholder: 'dir' },
        ] },
    },
    docs: { brief: 'Print (and optionally follow) an application log file' },
});