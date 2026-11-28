/**
 * `ndigo lint init` — write the recommended oxlint config into a project.
 *
 * A nested config shadows the nearest ancestor config, so the command refuses
 * when one already governs the directory (that is the correct answer inside
 * this monorepo, where apps inherit the root `.oxlintrc.json`). It also never
 * overwrites a local config without `--force`, and never rewrites an existing
 * `lint` script.
 */
import { buildCommand } from '@stricli/core';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { compareBy, stringComparator } from '@ndigo/core';
import { readAppManifest, resolveAppDir } from '../../helpers/app-scripts.js';
import { appDirPositional } from '../_script-fronts.js';
import { jsonFlag, writeJson } from '../_output.js';
import { recommendedLintConfig } from './_recommended.js';
import { OXLINT_VERSION_RANGE, PLUGIN_VERSION_RANGE } from './_versions.js';

/** Config filenames oxlint discovers; any of them shadows an ancestor config. */
const CONFIG_FILES = ['.oxlintrc.json', 'oxlint.config.ts', 'oxlint.config.js', 'oxlint.config.mjs'];

/** Package names that put a project on one side of the platform split. */
const BROWSER_PACKAGE = '@ndigo/platform-web';
const NODE_PACKAGE = '@ndigo/platform-node';

/** One file to write, rendered before anything touches disk. */
interface PlannedWrite {
    path: string;
    content: string;
}

/**
 * Returns the first config file in `dir`, if any.
 *
 * @param dir - Directory to inspect.
 * @returns The absolute config path, or `null`.
 */
function configIn(dir: string): string | null {
    for (const name of CONFIG_FILES) {
        const candidate = join(dir, name);
        if (existsSync(candidate)) return candidate;
    }
    return null;
}

/**
 * Walks from the target's parent to the filesystem root looking for a config
 * that already governs the target.
 *
 * @param appDir - The project directory.
 * @returns The governing ancestor config, or `null`.
 */
function ancestorConfig(appDir: string): string | null {
    let current = resolve(appDir);
    while (true) {
        const parent = dirname(current);
        if (parent === current) return null;
        const found = configIn(parent);
        if (found !== null) return found;
        current = parent;
    }
}

/** Reads a manifest's dependency names, both runtime and development. */
function dependencyNames(manifest: Record<string, unknown>): Set<string> {
    const names = new Set<string>();
    for (const field of ['dependencies', 'devDependencies']) {
        const record = manifest[field];
        if (typeof record === 'object' && record !== null) {
            for (const name of Object.keys(record as Record<string, unknown>)) {
                names.add(name);
            }
        }
    }
    return names;
}

/**
 * Renders the `.oxlintrc.json` document for a project.
 *
 * @param manifest - The parsed `package.json`.
 * @param kind - Explicit platform from `--kind`, if given.
 * @returns The config object.
 */
function renderConfig(manifest: Record<string, unknown>, kind?: 'browser' | 'node'): Record<string, unknown> {
    const names = dependencyNames(manifest);
    const browser = kind === undefined ? names.has(BROWSER_PACKAGE) : kind === 'browser';
    const node = kind === undefined ? names.has(NODE_PACKAGE) : kind === 'node';
    return recommendedLintConfig({
        browser,
        node,
        vitest: names.has('vitest'),
        // A hybrid app carries browser-only files; the guard only fits a
        // project that never runs in a browser.
        nodeRule: node && !browser,
    });
}

/**
 * Merges the lint script and dev dependencies into the manifest, preserving
 * the existing key order and never overwriting a user's version or script.
 *
 * @param manifest - The parsed `package.json`.
 * @returns The updated manifest.
 */
function withLintWiring(manifest: Record<string, unknown>): Record<string, unknown> {
    const scriptsRecord = (manifest.scripts as Record<string, unknown> | undefined) ?? {};
    const scripts = { ...scriptsRecord };
    if (typeof scripts.lint !== 'string') {
        scripts.lint = 'oxlint';
    }

    const devDependenciesRecord = (manifest.devDependencies as Record<string, unknown> | undefined) ?? {};
    const devDependencies = { ...devDependenciesRecord };
    devDependencies['@ndigo/oxlint-plugin'] ??= PLUGIN_VERSION_RANGE;
    devDependencies.oxlint ??= OXLINT_VERSION_RANGE;
    const sortedDevDependencies = Object.fromEntries(
        Object.entries(devDependencies).sort(compareBy(([key]) => key, stringComparator.compare))
    );

    // Rebuild in place so the written manifest keeps the author's key order
    // (`scripts` and `devDependencies` land where they already were).
    const updated: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(manifest)) {
        if (key === 'scripts') {
            updated[key] = scripts;
        } else if (key === 'devDependencies') {
            updated[key] = sortedDevDependencies;
        } else {
            updated[key] = value;
        }
    }
    updated.scripts ??= scripts;
    updated.devDependencies ??= sortedDevDependencies;

    return updated;
}

/** The init command. */
export const initLintCommand = buildCommand({
    async func(flags: { kind?: 'browser' | 'node'; force?: boolean; json?: boolean }, dir: string) {
        const appDir = resolveAppDir(dir);
        const writes: PlannedWrite[] = [];
        let configPath = join(appDir, '.oxlintrc.json');

        const ancestor = ancestorConfig(appDir);
        if (ancestor !== null) {
            if (flags.json === true) {
                writeJson({ written: false, skipped: true, configPath: ancestor });
                return;
            }
            process.stdout.write(
                `Skipped: ${ancestor} already governs this directory — a nested config would shadow it.\n`
            );
            return;
        }

        const local = configIn(appDir);
        if (local !== null && flags.force !== true) {
            if (flags.json === true) {
                writeJson({ written: false, skipped: true, configPath: local });
                return;
            }
            process.stdout.write(`Skipped: ${local} exists (pass --force to overwrite).\n`);
            return;
        }
        configPath = local ?? configPath;

        const manifest = readAppManifest(appDir);
        if (manifest === null) {
            throw new Error(`No package.json in ${appDir}`);
        }

        writes.push({ path: configPath, content: `${JSON.stringify(renderConfig(manifest, flags.kind), null, 2)}\n` });

        // Fail before writing anything when the manifest is not a JSON object.
        const before = readFileSync(join(appDir, 'package.json'), 'utf8');
        const wired = withLintWiring(manifest);
        const after = `${JSON.stringify(wired, null, 2)}\n`;
        if (after !== before) {
            writes.push({ path: join(appDir, 'package.json'), content: after });
        }

        for (const write of writes) {
            writeFileSync(write.path, write.content, 'utf8');
        }

        if (flags.json === true) {
            writeJson({ written: true, skipped: false, configPath });
            return;
        }

        process.stdout.write(`Wrote ${configPath}\n`);
        if (writes.length > 1) {
            process.stdout.write(`Added "lint": "oxlint" and the oxlint devDependencies to package.json\n`);
        }
        process.stdout.write('Run `pnpm install`, then `pnpm lint`.\n');
    },
    parameters: {
        flags: {
            kind: {
                kind: 'parsed',
                parse: (value: string) => {
                    if (value !== 'browser' && value !== 'node') {
                        throw new Error(`--kind must be "browser" or "node", got "${value}"`);
                    }
                    return value;
                },
                brief: 'Platform kind (default: inferred from @ndigo/platform-* dependencies).',
                optional: true,
            },
            force: { kind: 'boolean', brief: 'Overwrite an existing local lint config.', optional: true },
            json: jsonFlag,
        },
        positional: { kind: 'tuple', parameters: [appDirPositional] },
    },
    docs: { brief: 'Write .oxlintrc.json with the recommended Ndigo lint rules' },
});
