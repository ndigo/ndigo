// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Dependency-boundary test: @blue/boot is isomorphic and must not import
 * either platform package from its runtime source. The import would make the
 * shared bootstrap package Node- or DOM-coupled — platform auto-configs are
 * passed in explicitly as application sources instead.
 *
 * The rule rejects any `@blue/platform-node` / `@blue/platform-web` import
 * (static or re-exported) under `src/`. Test files MAY import platforms.
 */

const SRC_ROOT = join(import.meta.dirname, '..', 'src');
const FORBIDDEN = [/^@blue\/platform-node(\/|$)/, /^@blue\/platform-web(\/|$)/, /^node:/];

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

describe('@blue/boot platform boundary', () => {
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

    test('package.json has no runtime platform-node dependency', () => {
        const manifest = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf-8'));
        const runtime = { ...manifest.dependencies, ...manifest.peerDependencies };
        expect(runtime['@blue/platform-node']).toBeUndefined();
    });
});
