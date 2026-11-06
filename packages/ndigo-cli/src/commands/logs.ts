/**
 * `ndigo logs` — print (and optionally follow) an application log file.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const logsCommand = buildCommand({
    async func(flags: { file?: string; lines?: number; follow?: boolean }, dir: string) {
        const base = dir;
        const file = flags.file ?? join(base, 'logs', 'app.log');
        if (!existsSync(file)) {
            process.stderr.write(`log file not found: ${file}\n`);
            process.exitCode = 2;
            return;
        }
        const content = readFileSync(file, 'utf8');
        const lines = content.split(/\r?\n/);
        const n = flags.lines ?? 50;
        const tail = lines.slice(-n).join('\n');
        process.stdout.write(tail + (tail.endsWith('\n') ? '' : '\n'));
        if (flags.follow) {
            process.stderr.write('--follow is not yet supported; printing tail only.\n');
        }
    },
    parameters: {
        flags: {
            file: { kind: 'parsed', parse: (v: string) => v, brief: 'Log file path.', optional: true },
            lines: { kind: 'parsed', parse: (v: string) => Number(v), brief: 'Number of lines to show.', optional: true },
            follow: { kind: 'boolean', brief: 'Follow the log (not yet implemented).', optional: true },
        },
        positional: { kind: 'tuple', parameters: [
            { parse: (v: string) => v, brief: 'Application directory (default: current directory).', default: '.', placeholder: 'dir' },
        ] },
    },
    docs: { brief: 'Print (tail) an application log file' },
});