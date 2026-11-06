/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Dependency-boundary test: @ndigo/boot is isomorphic and must not import
 * either platform package from its runtime source. The import would make the
 * shared bootstrap package Node- or DOM-coupled — platform auto-configs are
 * passed in explicitly as application sources instead.
 *
 * The rule rejects any `@ndigo/platform-node` / `@ndigo/platform-web` import
 * (static or re-exported) under `src/`. Test files reach the platform sources
 * relatively (`../../ndigo-platform-node/src/…`) instead of naming them in
 * the manifest: any dependency entry — of any kind — puts the edge in the Nx
 * task graph, and `@ndigo/platform-node` depends on `@ndigo/boot` (AD-90), so
 * the build would fail on the cycle (AD-67's acyclicity gate).
 */

const SRC_ROOT = join(import.meta.dirname, '..', 'src');
const FORBIDDEN = [/^@ndigo\/platform-node(\/|$)/, /^@ndigo\/platform-web(\/|$)/, /^node:/];

function collectTsFiles(dir: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
            out.push(...collectTsFiles(full));
        } else if (name.endsWith('.ts') && !name.endsWith('.d.ts')) {
            out.push(full);
        }
    }
    return out;
}

describe('@ndigo/boot platform boundary', () => {
    test('runtime source imports no platform packages or node builtins', () => {
        const violations: string[] = [];
        for (const file of collectTsFiles(SRC_ROOT)) {
            const source = readFileSync(file, 'utf-8');
            for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
                const specifier = match[1];
                if (FORBIDDEN.some((pattern) => pattern.test(specifier))) {
                    violations.push(`${file}: ${specifier}`);
                }
            }
        }
        expect(violations).toEqual([]);
    });

    test('package.json carries no platform-node/platform-web entry at all', () => {
        const manifest = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf-8'));
        const all = { ...manifest.dependencies, ...manifest.peerDependencies, ...manifest.devDependencies };
        expect(all['@ndigo/platform-node']).toBeUndefined();
        expect(all['@ndigo/platform-web']).toBeUndefined();
    });
});
