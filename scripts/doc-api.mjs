/**
 * Per-package API documentation generator.
 *
 * For every package with a `src/` directory, runs TypeDoc (markdown plugin)
 * over the package's own `exports` map and writes the reference tree to
 * `packages/<pkg>/doc/api/`. Also regenerates `doc/README.md`, the
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

function typedocConfig(pkgDir, manifest) {
    return {
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
}

function runTypedoc(configPath, watch = false) {
    const args = ['--options', configPath];
    if (watch) args.push('--watch');
    return new Promise((resolve, reject) => {
        const child = spawn(findTypedoc(), args, { cwd: ROOT, stdio: 'inherit' });
        child.on('error', reject);
        child.on('exit', (code) => {
            (code === 0 ? resolve : reject)(new Error(`typedoc exited ${code}`));
        });
    });
}

/**
 * Documentation-coverage gate: every top-level exported declaration of the
 * four "needs prose" kinds must carry a doc comment.
 * Scoped deliberately: class/interface members, variables and enum members
 * self-document; `_`-prefixed internal files and bracket-named symbols
 * (Symbol.toStringTag etc.) are implementation artifacts.
 * @returns undocumented symbols [{name, kind, file}] — empty when clean.
 */
function coverageViolations(jsonPath, pkgDir, packageName) {
    const GATE_KINDS = new Map([[4, 'class'], [8, 'interface'], [64, 'function'], [262144, 'type-alias']]);
    const hasComment = (n) => !!n.comment || (n.signatures ?? []).some((s) => !!s.comment);
    const isInternal = (n) =>
        (n.comment?.blockTags ?? []).some((t) => t.tag === '@internal') ||
        (n.comment?.modifiers ?? []).includes('@internal');
    const violations = [];
    const doc = JSON.parse(readFileSync(jsonPath, 'utf8'));

    const walkTopLevel = (n, inNamespace = false) => {
        // entry-point modules and namespace containers only — not class/interface members
        if (!inNamespace && !n.children) return;
        for (const child of n.children ?? []) {
            const kind = GATE_KINDS.get(child.kind);
            if (kind && !hasComment(child) && !isInternal(child)) {
                const src = child.sources?.[0];
                const file = src?.fileName ?? '';
                const base = file.split('/').pop() ?? '';
                if (child.name.startsWith('[')) continue;      // synthetic keys
                if (base.startsWith('_')) continue;            // internal files
                if (!file.startsWith(pkgDir.replaceAll('\\', '/'))) continue; // external
                violations.push({ name: child.name, kind, file: `${base}:${src?.line ?? '?'}` });
            }
            if (child.kind === 16384 && child.children) walkTopLevel(child, true); // namespaces
        }
    };
    for (const module of doc.children ?? []) walkTopLevel(module);
    return violations;
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
let coverageFailures = 0;
for (const dir of packages) {
    const pkgDir = join(PACKAGES, dir);
    const manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
    try {
        const tmp = mkdtempSync(join(ROOT, '.nx'));
        const configPath = join(tmp, 'typedoc.json');
        const jsonPath = join(tmp, 'symbols.json');
        const config = typedocConfig(pkgDir, manifest);
        config.json = jsonPath;
        writeFileSync(configPath, JSON.stringify(config, null, 2));
        await runTypedoc(configPath);
        const violations = coverageViolations(jsonPath, pkgDir, manifest.name);
        rmSync(tmp, { recursive: true, force: true });
        if (violations.length) {
            coverageFailures += violations.length;
            console.error(`✗ ${manifest.name}: ${violations.length} public ${violations.length === 1 ? 'symbol has' : 'symbols have'} no doc comment:`);
            for (const v of violations.slice(0, 12)) console.error(`    ${v.kind} ${v.name} (${v.file})`);
            if (violations.length > 12) console.error(`    … and ${violations.length - 12} more`);
        } else {
            console.log(`✓ ${manifest.name}`);
        }
    } catch (error) {
        failures++;
        console.error(`✗ ${manifest.name}: ${error.message}`);
    }
    if (WATCH) break; // watch mode: first package only, hangs by design
}

// --- doc/README.md index -------------------------------------------------
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
        `| \`${manifest.name}\` | ${(manifest.description ?? '').replaceAll('|', '\\|')} | [doc/api/README.md](../packages/${dir}/doc/api/README.md) |`,
    );
}
indexLines.push('', 'Tooling notes:', '', '- `pnpm doc:api` regenerates everything (TypeDoc, zero-warning standard).');
mkdirSync(join(ROOT, 'doc'), { recursive: true });
writeFileSync(join(ROOT, 'doc', 'README.md'), indexLines.join('\n') + '\n');
console.log('✓ doc/README.md');
if (failures || coverageFailures) process.exit(1);