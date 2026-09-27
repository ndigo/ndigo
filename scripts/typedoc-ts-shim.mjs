/**
 * TypeDoc + TypeScript 7 compatibility shim.
 *
 * TypeDoc 0.28 declares `typescript: 5.x..6.0.x` as a peer dependency, but
 * the workspace's own TypeScript 7.0.2 devDependency wins peer fallback
 * resolution, and TypeDoc 0.28 cannot load the TS 7 API surface (`SyntaxKind`
 * moved): TypeDoc runs crashed with "Cannot read properties of
 * undefined (reading 'PropertyDeclaration')". Upstream TypeDoc has no TS 7
 * support, and pnpm 11.4 offers no working mechanism to scope a dependency
 * pin to a single peer edge (parent-scoped `overrides`, `pnpmfile.cjs`
 * hooks, and `packageExtensions` are all ignored or locked out by the shared
 * lockfile).
 *
 * This shim relinks every broken TypeDoc flavor's `typescript` peer symlink
 * to the in-range 6.0.3 flavor already present in the store. It runs from
 * the root `postinstall` hook so any fresh `pnpm install` re-applies it;
 * when a pnpm release can satisfy the peer range natively the broken flavor
 * directory disappears and the shim becomes a no-op.
 */

import { readdirSync, readlinkSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pnpm = join(root, 'node_modules', '.pnpm');
const TS6_PREFIX = 'typescript@6.0.3';
const TS7_PEER_SUFFIX = '_typescript@7.';

let patched = 0;
for (const flavor of readdirSync(pnpm)) {
    if (!flavor.startsWith('typedoc@') || !flavor.includes(TS7_PEER_SUFFIX)) {
        continue;
    }
    const linkDir = join(pnpm, flavor, 'node_modules');
    const link = join(linkDir, 'typescript');
    const target = readdirSync(pnpm).find((name) => name.startsWith(TS6_PREFIX));
    if (!target) {
        continue; // 6.0.3 flavor not installed — nothing safe to point at
    }
    const relative = join('..', '..', target, 'node_modules', 'typescript');
    try {
        if (readlinkSync(link).includes(TS6_PREFIX)) {
            continue; // already relinked
        }
    } catch {
        // not a symlink (layout changed) — ignore
        continue;
    }
    rmSync(link);
    symlinkSync(relative, link);
    patched += 1;
}

if (patched > 0) {
    console.log(`typedoc-ts-shim: relinked ${patched} TypeDoc flavor(s) to typescript 6.0.3`);
}
