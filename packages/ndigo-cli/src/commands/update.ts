/**
 * `ndigo update` — bump @ndigo/* versions in an app.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveAppDir } from '../helpers/app-scripts.js';

interface VersionManifest {
    packages: Record<string, string>;
}

function readManifest(path: string): VersionManifest | null {
    if (!existsSync(path)) return null;
    try {
        return JSON.parse(readFileSync(path, 'utf8')) as VersionManifest;
    } catch {
        return null;
    }
}

function readAppManifest(dir: string): Record<string, unknown> | null {
    try {
        return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as Record<string, unknown>;
    } catch {
        return null;
    }
}

export const updateCommand = buildCommand({
    async func(flags: { check?: boolean; manifest?: string }, dir: string) {
        const resolved = resolveAppDir(dir);
        const manifestPath =
            flags.manifest ?? process.env.NDIGO_VERSION_MANIFEST ?? join(resolved, 'ndigo-versions.json');
        const manifest = readManifest(manifestPath);

        const appManifest = readAppManifest(resolved) as {
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
        } | null;
        const deps = { ...appManifest?.dependencies, ...appManifest?.devDependencies };
        const ndigoDeps = Object.keys(deps).filter((name) => name.startsWith('@ndigo/'));

        if (flags.check) {
            if (!manifest) {
                process.stderr.write(`version manifest not found: ${manifestPath}\n`);
                process.exitCode = 2;
                return;
            }
            let behind = 0;
            for (const name of ndigoDeps) {
                const installed = deps[name];
                const latest = manifest.packages[name];
                if (latest && installed !== latest) {
                    process.stdout.write(`${name}: ${installed} -> ${latest}\n`);
                    behind++;
                }
            }
            if (behind > 0) {
                process.exitCode = 1;
                process.stdout.write(`${behind} package(s) can be updated. Run 'ndigo update'.\n`);
            } else {
                process.stdout.write('All @ndigo/* packages are up to date.\n');
            }
            return;
        }

        if (manifest) {
            // Apply manifest versions to package.json
            let changed = false;
            const full = readAppManifest(resolved) as Record<string, unknown>;
            for (const section of ['dependencies', 'devDependencies'] as const) {
                const sectionDeps = full[section] as Record<string, string> | undefined;
                if (!sectionDeps) continue;
                for (const name of Object.keys(sectionDeps)) {
                    if (name.startsWith('@ndigo/') && manifest.packages[name]) {
                        if (sectionDeps[name] !== manifest.packages[name]) {
                            sectionDeps[name] = manifest.packages[name];
                            changed = true;
                        }
                    }
                }
            }
            if (changed) {
                writeFileSync(join(resolved, 'package.json'), `${JSON.stringify(full, null, 2)}\n`, 'utf8');
                process.stdout.write('Updated package.json from manifest.\n');
            }
        }

        const child = spawn('pnpm', ['install'], { cwd: resolved, stdio: 'inherit' });
        const code = await new Promise<number>((resolve) => child.once('exit', (c) => resolve(c ?? 1)));
        process.exitCode = code;
    },
    parameters: {
        flags: {
            check: { kind: 'boolean', brief: 'Check without applying.', optional: true },
            manifest: {
                kind: 'parsed',
                parse: (v: string) => v,
                brief: 'Path to a version manifest JSON.',
                optional: true,
            },
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
    docs: { brief: 'Bump @ndigo/* versions in an app (optionally from a manifest)' },
});
