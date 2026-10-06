/**
 * Manifest conformance checker for publishable BlueJS packages.
 *
 * Enforced contract (release + standalone-install correctness):
 *   1. Every runtime import (in `src/`) must be declared in `dependencies` —
 *      a package installed from the registry must resolve its own closure.
 *      (Allowlisted host-provided peers excepted, see PEER_ALLOWLIST.)
 *   2. No dependency may be declared but imported nowhere in the package
 *      (dead dependencies).
 *   3. Every test/bench/config import must be declared in `dependencies` or
 *      `devDependencies`.
 *   4. `peerDependencies` is reserved for host-provided plugin contracts and
 *      host-provided types, allowlisted per package below. Consumers must not
 *      be required to hand-assemble the framework graph.
 *   5. `devDependencies` entries must be used by tests/bench or be tooling
 *      (`@types/*`, typescript, vitest, nx, oxlint, tsx, jsdom, msw, debug).
 *   6. Legacy contract: license ISC, `type: module`, exports map with
 *      `.` -> `types` + `default`, explicit `sideEffects`, and `@blue/*`
 *      workspace deps pinned to `~0.0.1` in every section.
 *   7. README standard: the required H2 set
 *      (Installation, Getting Started, Usage, API, Development, Contributing,
 *      License) is present and in order — see
 *      docs/guides/12-package-documentation.md.
 *   8. Root manifest: devDependencies obey the same dead-dependency rule,
 *      judged against workspace-wide import usage (root scripts/configs plus
 *      every project's src/test/bench); implicitly-resolved tooling
 *      (ROOT_TOOLING) is allowlisted.
 *
 * Run: `node scripts/check-manifests.mjs` (wired into `pnpm manifest:check`
 * and `.github/workflows/ci.yml`).
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importsOf, SOURCE_DIRS, DEV_DIRS } from './import-scanner.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PACKAGES = join(ROOT, 'packages');
const APPS = join(ROOT, 'apps');
const BLUE_PREFIX = '@blue/';

/**
 * Packages whose peerDependencies must contain exactly these entries:
 * host-provided plugin contract or host-provided types the package
 * deliberately does not install itself.
 */
const PEER_ALLOWLIST = {
    '@blue/oxlint-plugin': ['oxlint'],
    '@blue/telemetry-node': ['ws'],
    // Asset-only runtime feature dep for the OpenAPI docs UI (see AD-35):
    // the platform serves the files but code never imports the module.
    '@blue/platform-node': ['swagger-ui-dist'],
    // Node-only capability subpaths: connection-only consumers need none of these.
    '@blue/redis': ['@blue/cache', '@blue/factory', '@blue/socket'],
    // OPTIONAL peer (AD-66): .toon config files decode through a lazy
    // variable-specifier dynamic import; consumers who never use TOON
    // install nothing and bundlers never resolve the module.
    '@blue/boot': ['@toon-format/toon'],
};

/** Dev-tooling that is imported/invoked by configs and tests but is not a package concern. */
const TOOLING = new Set(['typescript', 'vitest', 'tsx', 'nx', 'oxlint', 'oxfmt', 'jsdom', 'msw']);

/**
 * Implicitly-resolved tooling in the root manifest: binaries and plugins
 * invoked/loaded by name rather than imported, so the import scanner cannot
 * see them. Extends TOOLING for the root-manifest dead-devDep rule.
 */
const ROOT_TOOLING = new Set([
    ...TOOLING,
    'debug', // documented as dev tooling in rule 5; deduped by the webpack demo chain
    'typedoc', // spawned by scripts/doc-api.mjs
    'typedoc-plugin-markdown', // typedoc `plugin` entry, loaded by name
    '@vitest/coverage-v8', // vitest coverage provider resolved by name (`coverage.provider: 'v8'`)
    'oxlint-tsgolint', // oxlint --type-aware backend (declared peer of oxlint)
]);

/**
 * Required H2 sections of every package README, in order. `Configuration` and
 * `See Also` are optional; see docs/guides/12-package-documentation.md.
 */
const REQUIRED_README_SECTIONS = [
    'Installation',
    'Getting Started',
    'Usage',
    'API',
    'Development',
    'Contributing',
    'License',
];

const failures = [];

function fail(pkg, message) {
    failures.push(`${pkg}: ${message}`);
}

/** Every specifier imported anywhere in the workspace — feeds the root rule. */
const workspaceUsage = importsOf(ROOT, DEV_DIRS);

for (const dir of readdirSync(PACKAGES)) {
    const pkgPath = join(PACKAGES, dir, 'package.json');
    if (!existsSync(pkgPath)) continue;
    let manifest;
    try {
        manifest = JSON.parse(readFileSync(pkgPath, 'utf8'));
    } catch {
        fail(dir, 'unparseable package.json');
        continue;
    }
    const name = manifest.name ?? dir;
    const runtime = importsOf(join(PACKAGES, dir), SOURCE_DIRS);
    const dev = importsOf(join(PACKAGES, dir), DEV_DIRS);
    for (const spec of runtime) workspaceUsage.add(spec);
    for (const spec of dev) workspaceUsage.add(spec);
    const blueSelf = name; // manifest.name already carries the @blue/ scope

    const dependencies = manifest.dependencies ?? {};
    const devDependencies = manifest.devDependencies ?? {};
    const peerDependencies = manifest.peerDependencies ?? {};

    // Legacy contract
    if (manifest.license !== 'ISC') fail(name, `license is ${String(manifest.license)}, expected ISC`);
    if (manifest.type !== 'module') fail(name, `type must be "module"`);
    if (typeof manifest.sideEffects === 'undefined') fail(name, `sideEffects must be declared`);
    if (!manifest.exports?.['.']?.types || !(manifest.exports['.'].default || manifest.exports['.'].import)) {
        fail(name, `exports["."] must carry "types" plus a "default" or "import" entry`);
    }
    for (const [section, deps] of [
        ['dependencies', dependencies],
        ['devDependencies', devDependencies],
        ['peerDependencies', peerDependencies],
    ]) {
        for (const [dep, version] of Object.entries(deps)) {
            if (dep.startsWith(BLUE_PREFIX) && !version.startsWith('~0.0.1')) {
                fail(name, `${section}.${dep} uses ${version}, expected ~0.0.1`);
            }
        }
    }

    // Documentation standard (see docs/guides/12-package-documentation.md)
    const readmePath = join(PACKAGES, dir, 'README.md');
    const readme = existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : '';
    if (readme.trim().length < 200) {
        fail(name, `README.md must exist with real content (docs/guides/12-package-documentation.md)`);
    } else {
        const h2s = readme
            .split('\n')
            .filter((line) => line.startsWith('## '))
            .map((line) => line.slice(3).trim());
        const positions = REQUIRED_README_SECTIONS.map((section) => h2s.indexOf(section));
        const missing = REQUIRED_README_SECTIONS.filter((_, index) => positions[index] === -1);
        if (missing.length > 0) {
            fail(
                name,
                `README.md is missing required section(s) ${missing.map((s) => `"## ${s}"`).join(', ')} — the required H2 set is defined in docs/guides/12-package-documentation.md`
            );
        } else if (positions.some((position, index) => index > 0 && position < positions[index - 1])) {
            fail(
                name,
                `README.md required sections are out of order — expected ${REQUIRED_README_SECTIONS.map((s) => `"## ${s}"`).join(' → ')} (docs/guides/12-package-documentation.md)`
            );
        }
    }
    const desc = manifest.description ?? '';
    if (desc.length < 25 || /^blue\s+\w+$/i.test(desc.trim())) {
        fail(name, `description is generic or too short: "${desc}" (docs standard)`);
    }
    if (!manifest.author) fail(name, `author is required (docs standard)`);
    if (!Array.isArray(manifest.keywords) || manifest.keywords.length === 0) {
        fail(name, `keywords must be a non-empty array (docs standard)`);
    }
    // Documentation standard (see docs/guides/12-package-documentation.md): every
    // publishable package ships its compiled lib/ and generated doc/. (No
    // @blue/generators exemption — it is a normal build-output package: its
    // exports point at lib/ and its files include lib alongside the Nx-runtime
    // assets src/ and generators.json.)
    if (!Array.isArray(manifest.files) || !manifest.files.includes('doc') || !manifest.files.includes('lib')) {
        fail(name, `files must include "doc" and "lib" (docs standard)`);
    }

    // Rule 1: runtime closure — every src/ import is a dependency
    // (allowlisted host-provided peers excepted, e.g. telemetry-node's `ws`).
    for (const spec of runtime) {
        if (spec === blueSelf) continue;
        if (!dependencies[spec] && !peerDependencies[spec]) {
            fail(name, `runtime import "${spec}" is not declared in dependencies`);
        }
    }

    // Rule 2: no dead dependencies.
    for (const dep of Object.keys(dependencies)) {
        if (dep === blueSelf) continue;
        if (!runtime.has(dep) && !peerDependencies[dep]) {
            fail(name, `dependencies.${dep} is imported nowhere in src/`);
        }
    }

    // Rule 3: every dev-time import is declared.
    for (const spec of dev) {
        if (spec === blueSelf) continue;
        if (!dependencies[spec] && !devDependencies[spec] && !TOOLING.has(spec) && !peerDependencies[spec]) {
            fail(name, `test/bench import "${spec}" is not declared (add to devDependencies or dependencies)`);
        }
    }

    // Rule 4: peerDependencies is allowlisted.
    const allowed = PEER_ALLOWLIST[name] ?? [];
    for (const dep of Object.keys(peerDependencies)) {
        if (!allowed.includes(dep)) fail(name, `peerDependencies.${dep} is not in the peer allowlist for this package`);
    }
    for (const dep of allowed) {
        if (!peerDependencies[dep]) fail(name, `peerDependencies must declare "${dep}" (allowlisted contract)`);
    }

    // Rule 5: devDependencies entries must be used or tooling.
    for (const [dep, version] of Object.entries(devDependencies)) {
        if (dep === blueSelf) continue;
        if (dep.startsWith('@types/') || TOOLING.has(dep)) continue;
        if (!dev.has(dep) && !runtime.has(dep) && !peerDependencies[dep]) {
            fail(name, `devDependencies.${dep} (${version}) is imported nowhere in test/bench`);
        }
    }
}

// Apps contribute to root tooling usage as well (vite, tsx, @types/*, …).
for (const dir of readdirSync(APPS)) {
    const pkgDir = join(APPS, dir);
    if (!existsSync(join(pkgDir, 'package.json'))) continue;
    for (const spec of importsOf(pkgDir, SOURCE_DIRS)) workspaceUsage.add(spec);
    for (const spec of importsOf(pkgDir, DEV_DIRS)) workspaceUsage.add(spec);
}

// Root manifest — devDependencies are the workspace's shared tooling pool
// (tooling binaries resolve from the root install for every project), so the
// same dead-dependency rule applies: an entry must be imported somewhere in
// the workspace (root scripts/configs or any project's src/test/bench) or be
// implicitly-resolved tooling (ROOT_TOOLING).
const rootManifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
for (const [dep, version] of Object.entries(rootManifest.devDependencies ?? {})) {
    if (dep.startsWith('@types/') || ROOT_TOOLING.has(dep)) continue;
    if (!workspaceUsage.has(dep)) {
        fail('@blue/js (root)', `devDependencies.${dep} (${version}) is imported nowhere in the workspace`);
    }
}

if (failures.length > 0) {
    console.error(`Manifest conformance: ${failures.length} deviation(s)`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
}
console.log('Manifest conformance: all packages and the root manifest conform.');
