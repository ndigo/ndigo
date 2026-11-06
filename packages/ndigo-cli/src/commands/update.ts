/**
 * `ndigo update` — bump @ndigo/* versions in an app.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { spawn } from 'node:child_process';
import { resolveAppDir } from '../helpers/app-scripts.js';

export const updateCommand = buildCommand({
    async func(flags: { check?: boolean }, dir: string) {
        const resolved = resolveAppDir(dir);
        if (flags.check) {
            process.stdout.write('Checking for @ndigo/* updates (not yet implemented).\n');
            return;
        }
        const child = spawn('pnpm', ['update', '@ndigo/*'], { cwd: resolved, stdio: 'inherit' });
        const code = await new Promise<number>((resolve) => child.once('exit', (c) => resolve(c ?? 1)));
        process.exitCode = code;
    },
    parameters: {
        flags: {
            check: { kind: 'boolean', brief: 'Check without applying.', optional: true },
        },
        positional: { kind: 'tuple', parameters: [
            { parse: (v: string) => v, brief: 'Application directory (default: current directory).', default: '.', placeholder: 'dir' },
        ] },
    },
    docs: { brief: 'Bump @ndigo/* versions in an app' },
});