/**
 * `ndigo clean` — remove build artifacts and caches for an application.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { resolveAppDir } from '../helpers/app-scripts.js';

const TARGETS = ['dist', 'lib', '.nx', 'coverage'] as const;

export const cleanCommand = buildCommand({
    async func(flags: { dryRun?: boolean; force?: boolean }, dir: string) {
        const resolved = resolveAppDir(dir);
        const forbidden =
            resolved === '/' || resolved === resolve(process.env.HOME ?? '/') || resolved.includes('/node_modules');
        if (forbidden) {
            process.stderr.write(`refusing to clean protected path: ${resolved}\n`);
            process.exitCode = 2;
            return;
        }
        // `--force` is required exactly as the help states (issue #146):
        // the gate used to be advertised but never enforced, so plain
        // `ndigo clean` recursively deleted dist/lib/.nx/coverage.
        if (!flags.dryRun && !flags.force) {
            process.stderr.write(`refusing to clean without --force (use --dryRun to preview)\n`);
            process.exitCode = 2;
            return;
        }
        for (const target of TARGETS) {
            const path = join(resolved, target);
            if (!existsSync(path)) continue;
            if (flags.dryRun) {
                process.stdout.write(`would remove ${path}\n`);
                continue;
            }
            rmSync(path, { recursive: true, force: true });
            process.stdout.write(`removed ${path}\n`);
        }
    },
    parameters: {
        flags: {
            dryRun: { kind: 'boolean', brief: 'Preview what would be removed.', optional: true },
            force: { kind: 'boolean', brief: 'Required to clean.', optional: true },
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
    docs: { brief: 'Remove build artifacts and caches' },
});
