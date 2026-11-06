/**
 * `ndigo update` — bump @ndigo/* versions in an app.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readAppManifest, resolveAppDir, runInteractiveSpawn } from '../helpers/app-scripts.js';
import { readVersionManifest } from './_version-manifest.js';

/**
 * The version-bump command.
 */
export const updateCommand = buildCommand({
    async func(flags: { check?: boolean; manifest?: string }, dir: string) {
        const resolved = resolveAppDir(dir);
        const manifestPath =
            flags.manifest ?? process.env.NDIGO_VERSION_MANIFEST ?? join(resolved, 'ndigo-versions.json');
        const lookup = readVersionManifest(manifestPath);

        // The manifest is a trust boundary (issue #144): its values flow into
        // package.json and then `pnpm install`, so absent/broken manifests
        // stop the command with a usage error instead of a crash, and the
        // apply path never falls through to a bare `pnpm install` that would
        // look like a successful update.
        const describeFailure = (): string =>
            lookup.kind === 'invalid'
                ? `invalid version manifest ${lookup.path}: ${lookup.reason}\n`
                : `version manifest not found: ${manifestPath}\n`;

        if (flags.check) {
            if (lookup.kind === 'absent' || lookup.kind === 'invalid') {
                process.stderr.write(describeFailure());
                process.exitCode = 2;
                return;
            }
            const manifest = lookup.manifest;
            const appManifest = readAppManifest(resolved) as {
                dependencies?: Record<string, string>;
                devDependencies?: Record<string, string>;
            } | null;
            const deps = { ...appManifest?.dependencies, ...appManifest?.devDependencies };
            const ndigoDeps = Object.keys(deps).filter((name) => name.startsWith('@ndigo/'));
            let behind = 0;
            for (const name of ndigoDeps) {
                const installed = deps[name];
                const latest = manifest.packages[name];
                // Manifest values are exact pins (enforced by
                // _version-manifest), so the literal comparison equals a
                // pin-vs-specifier delta; say so when a range-style
                // specifier shows up, because `^1.0.1` will "stay behind"
                // `1.0.1` forever by design.
                if (latest && installed !== latest) {
                    const ranged = /^[\^~]/u.test(installed ?? '');
                    process.stdout.write(
                        ranged
                            ? `${name}: ${installed} -> ${latest} (the app uses a range specifier — pin it to compare cleanly)\n`
                            : `${name}: ${installed} -> ${latest}\n`
                    );
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

        if (lookup.kind === 'absent' || lookup.kind === 'invalid') {
            process.stderr.write(
                lookup.kind === 'absent'
                    ? `no version manifest to apply: ${manifestPath} does not exist — pass --manifest <path> or run --check first\n`
                    : describeFailure()
            );
            process.exitCode = 2;
            return;
        }
        const manifest = lookup.manifest;
        const full = readAppManifest(resolved) as Record<string, unknown>;
        let changed = false;
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
        const code = await runInteractiveSpawn(['pnpm', 'install'], { cwd: resolved });
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
    docs: {
        brief: 'Bump @ndigo/* versions in an app from a version manifest (exact pins only)',
    },
});
