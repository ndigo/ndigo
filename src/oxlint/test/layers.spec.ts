/**
 * Drift checks for the package layer ranks (`_layers.ts`).
 *
 * Recomputed here from the package manifests, the ranks must match the
 * committed map exactly — and runtime `src/` code must contain no upward
 * imports (tests and benches may reach across layers, matching the
 * `devDependencies` exclusion in the rank derivation).
 * A dependency change that reorders layers therefore fails this spec (and by
 * extension `pnpm test:internal` in the quality lane) until the map is
 * updated deliberately.
 *
 * @module src/oxlint
 * @since 1.0.0
 * @author Jeff Rose
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { LAYER_RANK, TOOLING_PACKAGES } from '../_layers.ts';

interface PackageManifest {
    readonly slug: string;
    readonly runtimeDeps: ReadonlySet<string>;
}

/** Reads every `packages/ndigo-*` manifest and its runtime framework deps. */
function readManifests(): PackageManifest[] {
    return readdirSync('packages')
        .filter((dir) => dir.startsWith('ndigo-') && statSync(join('packages', dir)).isDirectory())
        .map((dir) => {
            const manifest = JSON.parse(readFileSync(join('packages', dir, 'package.json'), 'utf8')) as {
                name: string;
                dependencies?: Record<string, string>;
                peerDependencies?: Record<string, string>;
            };
            const runtimeDeps = new Set<string>();
            for (const section of [manifest.dependencies, manifest.peerDependencies]) {
                for (const dep of Object.keys(section ?? {})) {
                    if (dep.startsWith('@ndigo/')) {
                        runtimeDeps.add(dep.slice('@ndigo/'.length));
                    }
                }
            }
            return { slug: manifest.name.slice('@ndigo/'.length), runtimeDeps };
        });
}

/** `rank(p) = 1 + max(rank(deps))`; throws on cycles (which would make ranks ill-defined). */
function computeRanks(manifests: PackageManifest[]): Map<string, number> {
    const deps = new Map(manifests.map((manifest) => [manifest.slug, manifest.runtimeDeps]));
    const ranks = new Map<string, number>();
    const visiting = new Set<string>();
    const visit = (slug: string): number => {
        const known = ranks.get(slug);
        if (known !== undefined) {
            return known;
        }
        if (visiting.has(slug)) {
            throw new Error(`dependency cycle involving '${slug}'`);
        }
        visiting.add(slug);
        let rank = 0;
        for (const dep of deps.get(slug) ?? []) {
            rank = Math.max(rank, visit(dep) + 1);
        }
        visiting.delete(slug);
        ranks.set(slug, rank);
        return rank;
    };
    for (const slug of deps.keys()) {
        visit(slug);
    }
    return ranks;
}

/** Lists `.ts` files under each package's runtime source directory (`src/`). */
function listSourceFiles(): string[] {
    const files: string[] = [];
    const walk = (dir: string): void => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const full = join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.mts'))) {
                files.push(full);
            }
        }
    };
    for (const dir of readdirSync('packages')) {
        const src = join('packages', dir, 'src');
        if (dir.startsWith('ndigo-') && existsSync(src)) {
            walk(src);
        }
    }
    return files;
}

/** `import … from`, bare `import` and `import(…)` specifiers starting `@ndigo/`. */
const importSpecifierPattern = /(?:from|import)\s*\(?\s*['"](@ndigo\/[^'"]+)['"]/gu;

describe('the package layer ranks', () => {
    test('map and dependency graph agree, and tooling stays unranked', () => {
        const manifests = readManifests();
        const computed = computeRanks(manifests);
        const nonTooling = new Set(
            manifests.map((manifest) => manifest.slug).filter((slug) => !TOOLING_PACKAGES.has(slug))
        );

        const mismatches: string[] = [];
        for (const slug of nonTooling) {
            const fromMap: number | undefined = LAYER_RANK[slug];
            const fromGraph = computed.get(slug);
            if (fromMap !== fromGraph) {
                mismatches.push(`${slug}: map=${String(fromMap)} graph=${String(fromGraph)}`);
            }
        }
        for (const slug of Object.keys(LAYER_RANK)) {
            if (TOOLING_PACKAGES.has(slug)) {
                mismatches.push(`${slug}: tooling packages must not be ranked`);
            } else if (!nonTooling.has(slug)) {
                mismatches.push(`${slug}: ranked but not a current package`);
            }
        }
        expect(mismatches).toEqual([]);
    });

    test('no runtime source file imports upward through the ranks', () => {
        const violations: string[] = [];
        for (const file of listSourceFiles()) {
            const importerMatch = /packages[\\/]ndigo-([^\\/]+)[\\/]/u.exec(file);
            if (importerMatch === null) {
                continue;
            }
            const importer = importerMatch[1];
            const importerRank = LAYER_RANK[importer];
            if (importerRank === undefined) {
                continue;
            }
            const text = readFileSync(file, 'utf8');
            for (const match of text.matchAll(importSpecifierPattern)) {
                const target = /^@ndigo\/([^/]+)/u.exec(match[1])?.[1];
                if (target === undefined || target === importer || TOOLING_PACKAGES.has(target)) {
                    continue;
                }
                const targetRank = LAYER_RANK[target];
                if (targetRank !== undefined && targetRank > importerRank) {
                    violations.push(`${file}: ${importer}(${importerRank}) -> ${target}(${targetRank})`);
                }
            }
        }
        expect(violations).toEqual([]);
    });
});
