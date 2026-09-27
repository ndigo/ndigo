/**
 * Per-package API documentation generator.
 *
 * For every package with a `src/` directory, runs TypeDoc (markdown plugin)
 * over the package's own `exports` map and writes the reference tree to
 * `packages/<pkg>/doc/api/`. Also regenerates `doc-md/README.md`, the
 * package-docs index at the repo root.
 *
 * Why per-package: each BlueJS package must read like a standalone library
 * — its API docs live with it, travel with it in the npm tarball (`files`
 * includes `doc`), and link correctly from its README.
 *
 * Usage:
 *   node scripts/doc-api.mjs            # regenerate everything
 *   node scripts/doc-api.mjs --watch    # typedoc --watch (first package);
 *                                       # dev aid only, not used in CI
 *
 * Deterministic: output is derived from source + manifests only. CI verifies
 * freshness by regenerating and diffing the working tree.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PACKAGES = join(ROOT, 'packages');

const WATCH = process.argv.includes('--watch');

const EXTERNAL_SYMBOL_LINK_MAPPINGS = JSON.parse(
    readFileSync(join(ROOT, 'scripts', 'external-symbol-links.json'), 'utf8'),
);

/** Map `exports` values to source entry points (`./lib/x.js` -> `src/x.ts`). */
function entryPointsFor(manifest, pkgDir) {
    const points = [];
    for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
        const value = typeof target === 'string' ? target : target?.default ?? target?.import;
        if (!value) continue;
        const source = toSourcePath(value);
        if (source && existsSync(join(pkgDir, source))) points.push(source);
        else if (subpath === '.') {
            // exports points at a missing src entry point — surface loudly
            throw new Error(`${manifest.name}: cannot map exports["."] (${value}) to a source entryPoint`);
        }
    }
    if (!points.length) throw new Error(`${manifest.name}: no source entryPoints derivable from exports`);
    return points;
}

function toSourcePath(value) {
    if (!value.startsWith('./')) return null;
    const file = value.slice(2).replace(/\.js$/, '.ts');
    if (file.startsWith('lib/')) return `src/${file.slice('lib/'.length)}`;
    if (file.startsWith('src/')) return file;
    return null;
}

function runTypedoc(pkgDir, manifest, watch) {
    const config = {
        name: manifest.name,
        entryPoints: entryPointsFor(manifest, pkgDir).map((p) => join(pkgDir, p)),
        out: join(pkgDir, 'doc', 'api'),
        plugin: ['typedoc-plugin-markdown', join(ROOT, 'scripts', 'typedoc-tags-plugin.mjs')],
        readme: 'none',
        excludePrivate: true,
        excludeProtected: true,
        includeVersion: true,
        hideGenerator: true,
        disableSources: true,
        skipErrorChecking: true,
        treatWarningsAsErrors: true,
        treatValidationWarningsAsErrors: true,
        exclude: ['**/node_modules/**', '**/test/**', 'archive/**'],
        externalSymbolLinkMappings: EXTERNAL_SYMBOL_LINK_MAPPINGS,
        compilerOptions: { skipLibCheck: true, noEmit: true },
    };
    const tmp = mkdtempSync(join(ROOT, '.nx'));
    const configPath = join(tmp, 'typedoc.json');
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    const args = ['--options', configPath];
    if (watch) args.push('--watch');
    return new Promise((resolve, reject) => {
        const child = spawn(findTypedoc(), args, { cwd: ROOT, stdio: 'inherit' });
        child.on('error', reject);
        child.on('exit', (code) => {
            rmSync(tmp, { recursive: true, force: true }); // drop the throwaway config
            (code === 0 ? resolve : reject)(new Error(`typedoc exited ${code} for ${manifest.name}`));
        });
    });
}

function findTypedoc() {
    const candidates = [
        join(ROOT, 'node_modules', '.bin', 'typedoc'),
        join(ROOT, 'node_modules', 'typedoc', 'bin', 'typedoc'),
    ];
    for (const candidate of candidates) {
        if (existsSync(candidate)) return candidate;
    }
    return 'typedoc'; // PATH fallback
}

const packages = readdirSync(PACKAGES)
    .filter((dir) => existsSync(join(PACKAGES, dir, 'package.json')) && existsSync(join(PACKAGES, dir, 'src')))
    .sort();

let failures = 0;
for (const dir of packages) {
    const pkgDir = join(PACKAGES, dir);
    const manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
    try {
        await runTypedoc(pkgDir, manifest, WATCH);
        console.log(`✓ ${manifest.name}`);
    } catch (error) {
        failures++;
        console.error(`✗ ${manifest.name}: ${error.message}`);
    }
    if (WATCH) break; // watch mode: first package only, hangs by design
}

// --- doc-md/README.md index -------------------------------------------------
const indexLines = [
    '# BlueJS Package API Documentation',
    '',
    '> **Generated by [`scripts/doc-api.mjs`](../scripts/doc-api.mjs) — do not edit by hand.**',
    '> Regenerate with `pnpm doc:api`; CI fails when this index or the per-package',
    '> references drift from the committed tree.',
    '',
    'Every BlueJS package documents itself: its README and its generated API',
    'reference live **inside the package** (`packages/<name>/doc/api/`), so each',
    'package can be read — and installed — on its own.',
    '',
    '| Package | Description | API reference |',
    '| :------ | :----------- | :------------ |',
];
for (const dir of packages) {
    const manifest = JSON.parse(readFileSync(join(PACKAGES, dir, 'package.json'), 'utf8'));
    indexLines.push(
        `| \`${manifest.name}\` | ${(manifest.description ?? '').replaceAll('|', '\\|')} | [doc/api/index.md](../packages/${dir}/doc/api/index.md) |`,
    );
}
indexLines.push('', 'Tooling notes:', '', '- `pnpm doc:api` regenerates everything (TypeDoc, zero-warning standard).');
mkdirSync(join(ROOT, 'doc-md'), { recursive: true });
writeFileSync(join(ROOT, 'doc-md', 'README.md'), indexLines.join('\n') + '\n');
console.log('✓ doc-md/README.md');
if (failures) process.exit(1);