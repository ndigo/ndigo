/**
 * Per-package API documentation generator.
 *
 * For every package with a `src/` directory, runs TypeDoc (markdown plugin)
 * over the package's own `exports` map and writes the reference tree to
 * `packages/<pkg>/api/`. Also regenerates `api/README.md`, the
 * package-docs index at the repo root.
 *
 * Why per-package: each Ndigo package must read like a standalone library
 * — its API docs live with it, travel with it in the npm tarball (`files`
 * includes `doc`), and link correctly from its README.
 *
 * Usage:
 *   node scripts/doc-api.mjs                 # regenerate everything
 *   node scripts/doc-api.mjs --only a,b,c    # regenerate just those packages
 *                                            # (the root index is always
 *                                            # rewritten); CI uses this for
 *                                            # PR-affected docs
 *   node scripts/doc-api.mjs --watch         # typedoc --watch (first package);
 *                                            # dev aid only, not used in CI
 *
 * Deterministic: output is derived from source + manifests only. CI verifies
 * freshness by regenerating and diffing the working tree.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { cpus, tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PACKAGES = join(ROOT, 'packages');

const WATCH = process.argv.includes('--watch');

/**
 * Parses `--only <dirs>` (comma-separated package directories). Returns
 * `null` when the flag is absent. Unknown directories are rejected where the
 * package list is known — a typo must never silently skip regeneration.
 */
function parseOnly(argv) {
    const index = argv.indexOf('--only');
    if (index === -1) return null;
    const value = argv[index + 1];
    const dirs = value
        ? value
              .split(',')
              .map((dir) => dir.trim())
              .filter(Boolean)
        : [];
    if (!dirs.length) {
        console.error('✗ --only requires a comma-separated list of package directories');
        process.exit(1);
    }
    return dirs;
}

const ONLY = parseOnly(process.argv);

const EXTERNAL_SYMBOL_LINK_MAPPINGS = JSON.parse(
    readFileSync(join(ROOT, 'scripts', 'external-symbol-links.json'), 'utf8')
);

/** Map `exports` values to source entry points (`./lib/x.js` -> `src/x.ts`). */
function entryPointsFor(manifest, pkgDir) {
    const points = [];
    for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
        const value = typeof target === 'string' ? target : (target?.default ?? target?.import);
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
        out: join(pkgDir, 'api'),
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
    const GATE_KINDS = new Map([
        [4, 'class'],
        [8, 'interface'],
        [64, 'function'],
        [262144, 'type-alias'],
    ]);
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
                if (child.name.startsWith('[')) continue; // synthetic keys
                if (base.startsWith('_')) continue; // internal files
                if (!file.startsWith(`${pkgDir.replaceAll('\\', '/')}/`)) continue; // external
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

/**
 * Bounded parallelism (MIN-1): each TypeDoc run builds a full TS program, so
 * per-package spawns dominate wall time. Workers print per-package blocks
 * atomically — diagnostics stay readable; the generated tree does not depend
 * on ordering.
 */
const CONCURRENCY = Math.max(2, Math.min(4, cpus().length));

let failures = 0;
let coverageFailures = 0;

/** Renders one package to its `api` tree; returns its report block. */
async function renderPackage(dir) {
    const pkgDir = join(PACKAGES, dir);
    const manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
    let tmp;
    try {
        tmp = mkdtempSync(join(tmpdir(), 'ndigo-doc-'));
        const configPath = join(tmp, 'typedoc.json');
        const jsonPath = join(tmp, 'symbols.json');
        const config = typedocConfig(pkgDir, manifest);
        config.json = jsonPath;
        writeFileSync(configPath, JSON.stringify(config, null, 2));
        await runTypedoc(configPath);
        const violations = coverageViolations(jsonPath, pkgDir, manifest.name);
        if (violations.length) {
            const lines = [
                `✗ ${manifest.name}: ${violations.length} public ${violations.length === 1 ? 'symbol has' : 'symbols have'} no doc comment:`,
            ];
            for (const v of violations.slice(0, 12)) lines.push(`    ${v.kind} ${v.name} (${v.file})`);
            if (violations.length > 12) lines.push(`    … and ${violations.length - 12} more`);
            return { failed: false, coverage: violations.length, lines };
        }
        return { failed: false, coverage: 0, lines: [`✓ ${manifest.name}`] };
    } catch (error) {
        return { failed: true, coverage: 0, lines: [`✗ ${manifest.name}: ${error.message}`] };
    } finally {
        // Never leak ndigo-doc-* dirs under OS tmp: typedoc non-zero exit, JSON
        // parse and coverage failures all throw above — clean up on every path.
        if (tmp) rmSync(tmp, { recursive: true, force: true });
    }
}

let targets;
if (WATCH) {
    targets = packages.slice(0, 1); // watch mode: first package only, hangs by design
} else if (ONLY) {
    const unknown = ONLY.filter((dir) => !packages.includes(dir));
    if (unknown.length) {
        console.error(`✗ --only references unknown package directories: ${unknown.join(', ')}`);
        process.exit(1);
    }
    targets = packages.filter((dir) => ONLY.includes(dir));
} else {
    targets = packages;
}
const workers = Math.min(WATCH ? 1 : CONCURRENCY, targets.length);
let next = 0;
await Promise.all(
    Array.from({ length: workers }, async () => {
        while (next < targets.length) {
            // oxlint-disable-next-line no-await-in-loop -- bounded worker pool: each worker renders one package at a time
            const result = await renderPackage(targets[next++]);
            if (result.failed) failures += 1;
            coverageFailures += result.coverage;
            for (const line of result.lines) {
                if (result.failed || result.coverage > 0) console.error(line);
                else console.log(line);
            }
        }
    })
);

// --- api/README.md index -------------------------------------------------
const indexLines = [
    '# Ndigo Package API Documentation',
    '',
    '> **Generated by [`scripts/doc-api.mjs`](../scripts/doc-api.mjs) — do not edit by hand.**',
    '> Regenerate with `pnpm doc:api`; CI fails when this index or the per-package',
    '> references drift from the committed tree.',
    '',
    'Every Ndigo package documents itself: its README and its generated API',
    'reference live **inside the package** (`packages/<name>/api/`), so each',
    'package can be read — and installed — on its own.',
    '',
    '| Package | Description | API reference |',
    '| :------ | :----------- | :------------ |',
];
for (const dir of packages) {
    const manifest = JSON.parse(readFileSync(join(PACKAGES, dir, 'package.json'), 'utf8'));
    indexLines.push(
        `| \`${manifest.name}\` | ${(manifest.description ?? '').replaceAll('|', '\\|')} | [api/README.md](../packages/${dir}/api/README.md) |`
    );
}
indexLines.push('', 'Tooling notes:', '', '- `pnpm doc:api` regenerates everything (TypeDoc, zero-warning standard).');
mkdirSync(join(ROOT, 'api'), { recursive: true });
writeFileSync(join(ROOT, 'api', 'README.md'), indexLines.join('\n') + '\n');
console.log('✓ api/README.md');
if (failures || coverageFailures) process.exit(1);
