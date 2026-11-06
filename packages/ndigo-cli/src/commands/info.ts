/**
 * `ndigo info` — versions, installed \@ndigo packages, workspace, git.
 */
import { buildCommand } from '@stricli/core';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { runDiagnostics } from './_diagnostics.js';
import { appDirPositional } from './_script-fronts.js';

/**
 * The diagnostics-plus-packages command.
 */
export const infoCommand = buildCommand({
    async func(_flags: {}, dir: string) {
        const resolved = join(dir, 'node_modules', '@ndigo');
        process.exitCode = await runDiagnostics();
        // Installed @ndigo packages of the addressed app (`.` or the
        // positional; review REV-017 gave the same app-addressing model to
        // every command).
        if (existsSync(resolved)) {
            process.stdout.write('\nInstalled @ndigo packages:\n');
            for (const name of readdirSync(resolved)) {
                let version = 'unknown';
                try {
                    const m = JSON.parse(readFileSync(join(resolved, name, 'package.json'), 'utf8')) as {
                        version?: string;
                    };
                    version = m.version ?? version;
                } catch {
                    /* ignore */
                }
                process.stdout.write(`  @ndigo/${name}  ${version}\n`);
            }
        }
    },
    parameters: {
        flags: {},
        positional: {
            kind: 'tuple',
            parameters: [appDirPositional],
        },
    },
    docs: { brief: 'Print framework + workspace diagnostics and installed @ndigo packages' },
});
