/**
 * `ndigo add <package>` — install and wire an \@ndigo/* capability.
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runInteractiveSpawn } from '../helpers/app-scripts.js';

/**
 * The capability add command.
 */
export const addCommand = buildCommand({
    async func(_flags: {}, pkg: string, dir: string) {
        const resolved = resolveAppDir(dir);
        if (!pkg.startsWith('\@ndigo/')) {
            process.stderr.write(`Only \@ndigo/* packages are supported: ${pkg}\n`);
            process.exitCode = 2;
            return;
        }
        const code = await runInteractiveSpawn(['pnpm', 'add', pkg], { cwd: resolved });
        process.exitCode = code;
        if (code === 0) {
            const setupName = pkg.replace('\@ndigo/', '') + '-setup';
            process.stdout.write(`\nAdded ${pkg}. Attempting setup generator \@ndigo/generators:${setupName}...\n`);
            const gcode = await runInteractiveSpawn(
                ['pnpm', 'exec', 'nx', 'g', `\@ndigo/generators:${setupName}`, '--directory', resolved],
                { cwd: resolved }
            );
            if (gcode !== 0 && gcode !== 127) {
                process.stdout.write(`(setup generator failed; wire manually)\n`);
            }
        }
    },
    parameters: {
        flags: {},
        positional: {
            kind: 'tuple',
            parameters: [
                { parse: (v: string) => v, brief: 'Package to add (must be \@ndigo/*).', placeholder: 'package' },
                {
                    parse: (v: string) => v,
                    brief: 'Application directory (default: current directory).',
                    default: '.',
                    placeholder: 'dir',
                },
            ],
        },
    },
    docs: { brief: 'Install and wire an \@ndigo/* capability into an app' },
});
