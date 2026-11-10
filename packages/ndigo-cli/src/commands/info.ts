/**
 * `ndigo info` — versions, installed \@ndigo packages, workspace, git.
 */
import { buildCommand } from '@stricli/core';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { collectDiagnostics, runDiagnostics } from './_diagnostics.js';
import { jsonFlag, writeJson } from './_output.js';
import { appDirPositional } from './_script-fronts.js';

/** One installed `@ndigo/*` package. */
interface InstalledPackage {
    readonly name: string;
    readonly version: string;
}

function installedPackages(dir: string): InstalledPackage[] {
    const resolved = join(dir, 'node_modules', '@ndigo');
    if (!existsSync(resolved)) return [];
    const packages: InstalledPackage[] = [];
    for (const name of readdirSync(resolved)) {
        let version = 'unknown';
        try {
            const manifest = JSON.parse(readFileSync(join(resolved, name, 'package.json'), 'utf8')) as {
                version?: string;
            };
            version = manifest.version ?? version;
        } catch {
            /* ignore */
        }
        packages.push({ name, version });
    }
    return packages;
}

/**
 * The diagnostics-plus-packages command.
 */
export const infoCommand = buildCommand({
    async func(flags: { json?: boolean }, dir: string) {
        if (flags.json === true) {
            const report = await collectDiagnostics();
            const exitCode = report.failures.length === 0 ? 0 : 1;
            writeJson({
                ok: exitCode === 0,
                exitCode,
                rows: report.rows,
                failures: report.failures,
                packages: installedPackages(dir),
            });
            process.exitCode = exitCode;
            return;
        }

        process.exitCode = await runDiagnostics();
        // Installed @ndigo packages of the addressed app (`.` or the
        // positional; review REV-017 gave the same app-addressing model to
        // every command).
        const packages = installedPackages(dir);
        if (existsSync(join(dir, 'node_modules', '@ndigo'))) {
            process.stdout.write('\nInstalled @ndigo packages:\n');
            for (const pkg of packages) process.stdout.write(`  @ndigo/${pkg.name}  ${pkg.version}\n`);
        }
    },
    parameters: {
        flags: { json: jsonFlag },
        positional: {
            kind: 'tuple',
            parameters: [appDirPositional],
        },
    },
    docs: { brief: 'Print framework + workspace diagnostics and installed @ndigo packages' },
});
