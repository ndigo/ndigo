/**
 * `ndigo info` — versions, installed @ndigo packages, workspace, git.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { runDiagnostics } from './_diagnostics.js';

export const infoCommand = buildCommand({
    async func() {
        process.exitCode = await runDiagnostics();
        // Installed @ndigo packages
        const nm = join(process.cwd(), 'node_modules', '@ndigo');
        if (existsSync(nm)) {
            process.stdout.write('\nInstalled @ndigo packages:\n');
            for (const name of readdirSync(nm)) {
                let version = 'unknown';
                try {
                    const m = JSON.parse(readFileSync(join(nm, name, 'package.json'), 'utf8')) as { version?: string };
                    version = m.version ?? version;
                } catch { /* ignore */ }
                process.stdout.write(`  @ndigo/${name}  ${version}\n`);
            }
        }
    },
    parameters: { flags: {}, positional: { kind: 'tuple', parameters: [] } },
    docs: { brief: 'Print framework + workspace diagnostics and installed @ndigo packages' },
});