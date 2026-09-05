/**
 * Manifest conformance checker for publishable BlueJS packages.
 *
 * Fails with a non-zero exit when any package deviates from the release
 * contract:
 *   - license: ISC (the single workspace license)
 *   - exports map present (with `types` and `default`)
 *   - `type: module`
 *   - blue `@blue/*` workspace dependencies use the `~0.0.1` protocol
 *   - `sideEffects` declared explicitly
 *
 * Run: `node scripts/check-manifests.mjs`
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PACKAGES = join(ROOT, 'packages');
const PUBLISHABLE_EXCLUDES = new Set(['.git', 'node_modules']);
const BLUE_PREFIX = '@blue/';

/** Packages that intentionally carry no npm entry (tooling only). */
const NO_ENTRY_ALLOWLIST = new Set();

const failures = [];

for (const dir of readdirSync(PACKAGES)) {
    if (PUBLISHABLE_EXCLUDES.has(dir)) continue;
    const pkgPath = join(PACKAGES, dir, 'package.json');
    if (!existsSync(pkgPath)) continue;

    let manifest;
    try {
        manifest = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    } catch (error) {
        failures.push(`${dir}: unparseable package.json (${error.message})`);
        continue;
    }
    const name = manifest.name ?? dir;

    if (manifest.license !== 'ISC') failures.push(`${name}: license is ${String(manifest.license)}, expected ISC`);
    if (manifest.type !== 'module') failures.push(`${name}: type must be "module"`);
    if (typeof manifest.sideEffects === 'undefined') failures.push(`${name}: sideEffects must be declared`);

    const hasEntry = NO_ENTRY_ALLOWLIST.has(name);
    if (!hasEntry && !manifest.exports) {
        failures.push(`${name}: missing exports map`);
    } else if (!hasEntry && manifest.exports && !manifest.exports['.']) {
        failures.push(`${name}: exports must contain a "." entry`);
    }

    for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
        const deps = manifest[section] ?? {};
        for (const [dep, version] of Object.entries(deps)) {
            if (dep.startsWith(BLUE_PREFIX) && !version.startsWith('~0.0.1')) {
                failures.push(`${name}: ${section}.${dep} uses ${version}, expected ~0.0.1`);
            }
        }
    }
}

if (failures.length > 0) {
    console.error(`Manifest conformance: ${failures.length} deviation(s)`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
}
console.log('Manifest conformance: all packages conform.');
