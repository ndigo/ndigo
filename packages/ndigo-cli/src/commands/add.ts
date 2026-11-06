/**
 * `ndigo add <package>` — install and wire an @ndigo/* capability.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { spawn } from 'node:child_process';
import { resolveAppDir } from '../helpers/app-scripts.js';

export const addCommand = buildCommand({
    async func(_flags: {}, pkg: string, dir: string) {
        const resolved = resolveAppDir(dir);
        if (!pkg.startsWith('@ndigo/')) {
            process.stderr.write(`Only @ndigo/* packages are supported: ${pkg}\n`);
            process.exitCode = 2;
            return;
        }
        const child = spawn('pnpm', ['add', pkg], { cwd: resolved, stdio: 'inherit' });
        const code = await new Promise<number>((resolve) => child.once('exit', (c) => resolve(c ?? 1)));
        process.exitCode = code;
        if (code === 0) {
            const setupName = pkg.replace('@ndigo/', '') + '-setup';
            process.stdout.write(`\nAdded ${pkg}. Attempting setup generator @ndigo/generators:${setupName}...\n`);
            const gen = spawn('pnpm', ['exec', 'nx', 'g', `@ndigo/generators:${setupName}`, '--directory', resolved], {
                cwd: resolved,
                stdio: 'inherit',
            });
            const gcode = await new Promise<number>((resolve) => gen.once('exit', (c) => resolve(c ?? 1)));
            if (gcode !== 0) {
                process.stdout.write(`(no setup generator available or it failed; wire manually)\n`);
            }
        }
    },
    parameters: {
        flags: {},
        positional: {
            kind: 'tuple',
            parameters: [
                { parse: (v: string) => v, brief: 'Package to add (must be @ndigo/*).', placeholder: 'package' },
                {
                    parse: (v: string) => v,
                    brief: 'Application directory (default: current directory).',
                    default: '.',
                    placeholder: 'dir',
                },
            ],
        },
    },
    docs: { brief: 'Install and wire an @ndigo/* capability into an app' },
});
