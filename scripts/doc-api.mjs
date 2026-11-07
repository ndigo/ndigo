/**
 * Per-package API documentation generator.
 *
 * For every package with a `src/` directory, runs TypeDoc (markdown plugin)
 * over the package's own `src/` tree and writes the reference to
 * `packages/<pkg>/api/`. Also regenerates `API.md`, the package-docs index
 * at the repo root.
 *
 * Entry points are the package's `src/` files (`entryPointStrategy: expand`),
 * so the reference is grouped **by source file**: the index lists every file
 * as a module page (`modules/<file>.md` or `<dir>/README.md`), each page lists
 * that file's symbols, and symbol pages are namespaced by their file
 * (`classes/<file>.<Symbol>.md`). `_*.ts` files are the repo's internal-file
 * convention and stay out of the reference.
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
 *
 * Requires built dependencies: `pnpm build` must run first (CI builds before
 * the docs step). TypeDoc resolves `@ndigo/*` imports through the workspace
 * symlinks into each dependency's `lib/`; without that build they join this
 * package's program and every cross-package `{@link}` degrades to a
 * "resolved but not documented" warning. The preflight below fails with that
 * hint instead (see docs/guides/12-package-documentation.md).
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
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

/**
 * Asserts every workspace dependency of the package has built declarations.
 *
 * TypeDoc resolves `@ndigo/*` imports through the workspace symlinks into each
 * dependency's published `types` entry (`lib/`). Without that build the imports
 * fall back into this package's program, and every cross-package `{@link}`
 * degrades to "resolved but is not documented" — warnings this script treats
 * as errors. Failing with a build hint is far clearer than 25 link warnings.
 *
 * @param manifest - The rendering package's manifest.
 * @param dir - Its directory name (for the message).
 * @returns A failure message, or `null` when every dependency is built.
 */
function missingBuiltDependencies(manifest, dir) {
    const deps = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies }).filter((name) =>
        name.startsWith('@ndigo/')
    );
    const missing = [];
    for (const name of deps) {
        const depDir = join(PACKAGES, `ndigo-${name.slice('@ndigo/'.length)}`);
        const depManifestPath = join(depDir, 'package.json');
        if (!existsSync(depManifestPath)) continue; // published, not a workspace member
        const depManifest = JSON.parse(readFileSync(depManifestPath, 'utf8'));
        const types =
            depManifest.types ??
            (typeof depManifest.exports === 'object' ? depManifest.exports['.']?.types : undefined);
        if (typeof types !== 'string') continue;
        if (!existsSync(join(depDir, types))) missing.push(name);
    }
    if (missing.length === 0) return null;
    return `✗ @ndigo/${dir.slice('ndigo-'.length)}: dependencies not built (${missing.join(', ')}) — run \`pnpm build\` before \`pnpm doc:api\``;
}

const EXTERNAL_SYMBOL_LINK_MAPPINGS = JSON.parse(
    readFileSync(join(ROOT, 'scripts', 'external-symbol-links.json'), 'utf8')
);

/**
 * Asserts that every subpath in the package's `exports` map still resolves to
 * `src/`. The reference itself is generated from the `src/` tree (grouped by
 * file), so the exports map is no longer the entry-point source — but it is
 * the published surface, and a subpath pointing at a missing source is a
 * packaging bug worth failing the docs build over.
 *
 * @returns The resolved source paths (unused beyond the assertion).
 */
function assertExportsMapResolvable(manifest, pkgDir) {
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
    assertExportsMapResolvable(manifest, pkgDir);
    return {
        name: manifest.name,
        // One module per source file: the reference is grouped by file, and
        // every `src/` file must be documented (internal `_*.ts` excluded).
        entryPoints: [join(pkgDir, 'src')],
        entryPointStrategy: 'expand',
        out: join(pkgDir, 'api'),
        plugin: [
            'typedoc-plugin-markdown',
            join(ROOT, 'scripts', 'typedoc-module-summary-plugin.mjs'),
            join(ROOT, 'scripts', 'typedoc-function-kind-plugin.mjs'),
        ],
        readme: 'none',
        excludePrivate: true,
        excludeProtected: true,
        // Other packages' declarations are external (they resolve through the
        // workspace symlinks into node_modules); never materialise them as
        // empty stubs in this package's reference.
        excludeExternals: true,
        includeVersion: true,
        hideGenerator: true,
        disableSources: false,
        skipErrorChecking: true,
        treatWarningsAsErrors: true,
        treatValidationWarningsAsErrors: true,
        exclude: ['**/node_modules/**', '**/test/**', 'archive/**', '**/_*.ts'],
        externalSymbolLinkMappings: EXTERNAL_SYMBOL_LINK_MAPPINGS,
        compilerOptions: { skipLibCheck: true, noEmit: true },
        // TypeDoc discovers `tsconfig.json` from its cwd (the repo root) when
        // this is absent; the root config is scoped to root tooling, so the
        // docs program declares its own `include` (packages/*/src).
        tsconfig: join(ROOT, 'tsconfig.docs.json'),
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
 *
 * Scoped deliberately: class/interface members, variables and enum members
 * self-document; `_`-prefixed internal files never reach the tree (they are
 * excluded at conversion time) and bracket-named symbols (Symbol.toStringTag
 * etc.) are implementation artifacts.
 *
 * @returns undocumented symbols [{name, kind, file}] — empty when clean.
 */
function coverageViolations(jsonPath, packageName, packageDir) {
    // TypeDoc ReflectionKind values: Class 128, Interface 256, Function 64,
    // TypeAlias 2097152. (4 is Namespace, 8 is Enum, 262144 is Accessor — an
    // earlier version of this map had those, so the gate checked nothing.)
    const GATE_KINDS = new Map([
        [128, 'class'],
        [256, 'interface'],
        [64, 'function'],
        [2097152, 'type-alias'],
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
                if (child.name.startsWith('[')) continue; // synthetic keys
                // Declarations copied in from another package (re-exports resolve
                // to their owning package's file) are that package's coverage to
                // keep, not this one's.
                const file = child.sources?.[0]?.fileName ?? '';
                if (file && !file.includes(`/${packageDir}/`)) continue;
                violations.push({ name: child.name, kind, file: packageName });
            }
            if (child.kind === 4 && child.children) walkTopLevel(child, true); // namespaces
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

/**
 * Removes the `Defined in:` source pointers TypeDoc emits when sources are
 * enabled. They are kept out of the committed tree on purpose: their line
 * numbers come from the *built* `lib/*.d.ts` of a sibling package, so they
 * drift with any rebuild and would make the freshness gate flap. The gate
 * still reads the source file of every reflection from the JSON.
 */
function stripSourcePointers(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
            stripSourcePointers(path);
            continue;
        }
        if (!entry.name.endsWith('.md')) continue;
        const text = readFileSync(path, 'utf8');
        const next = text.replace(/^Defined in: .*\n(?:\n)?/gm, '').replace(/\n{3,}/g, '\n\n');
        if (next !== text) writeFileSync(path, next);
    }
}

/** Renders one package to its `api` tree; returns its report block. */
async function renderPackage(dir) {
    const pkgDir = join(PACKAGES, dir);
    const manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
    const unbuilt = missingBuiltDependencies(manifest, dir);
    if (unbuilt !== null) return { failed: true, coverage: 0, lines: [unbuilt] };
    let tmp;
    try {
        tmp = mkdtempSync(join(tmpdir(), 'ndigo-doc-'));
        const configPath = join(tmp, 'typedoc.json');
        const jsonPath = join(tmp, 'symbols.json');
        const config = typedocConfig(pkgDir, manifest);
        config.json = jsonPath;
        writeFileSync(configPath, JSON.stringify(config, null, 2));
        await runTypedoc(configPath);
        stripSourcePointers(join(pkgDir, 'api'));
        const violations = coverageViolations(jsonPath, manifest.name, dir);
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

// --- API.md index --------------------------------------------------------
const indexLines = [
    '# Ndigo Package API Documentation',
    '',
    '> **Generated by [`scripts/doc-api.mjs`](scripts/doc-api.mjs) — do not edit by hand.**',
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
        `| \`${manifest.name}\` | ${(manifest.description ?? '').replaceAll('|', '\\|')} | [api/README.md](packages/${dir}/api/README.md) |`
    );
}
indexLines.push('', 'Tooling notes:', '', '- `pnpm doc:api` regenerates everything (TypeDoc, zero-warning standard).');
writeFileSync(join(ROOT, 'API.md'), indexLines.join('\n') + '\n');
console.log('✓ API.md');
if (failures || coverageFailures) process.exit(1);
