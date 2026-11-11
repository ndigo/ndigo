/**
 * URLGlobPathMatcher: steady-state cache hit vs compile-every-call.
 *
 * The cached matcher is constructed and warmed once. The baseline re-parses the
 * glob and constructs a RegExp for every call. One measured iteration performs
 * all 25 pattern×path pairs (`@ops=25`).
 */
import { test } from 'vitest';
import { URLGlobPathMatcher } from '../src/path-matcher';
import { parseUrlGlob } from '../src/url-glob';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const patterns = ['/api/v1/users', '/api/*/users', '/api/**', '/api/v[12]/users', '*/man*/bash.*'];
const paths = ['/api/v1/users', '/api/v2/users', '/api/v1/users/42', '/api/v1/posts', 'man/man1/bash.1'];
const parse = parseUrlGlob;
const retain = sink;

const matcher = new URLGlobPathMatcher();
for (const pattern of patterns) {
    for (const path of paths) matcher.match(pattern, path);
}

function compileAndTest(pattern: string, path: string): boolean {
    const source = parse(pattern);
    return source === null ? false : new RegExp(source).test(path);
}

test('match — warm cache vs compile every call', async ({ bench }) => {
    for (const pattern of patterns) {
        for (const path of paths) {
            assertEquivalent(`glob ${pattern} ${path}`, matcher.match(pattern, path), compileAndTest(pattern, path));
        }
    }
    await bench.compare(
        bench(benchName('cached matcher (warm)', patterns.length * paths.length), () => {
            let matched = 0;
            for (const pattern of patterns) {
                for (const path of paths) matched += matcher.match(pattern, path) ? 1 : 0;
            }
            retain(matched);
        }),
        bench(benchName('compile RegExp every call', patterns.length * paths.length), () => {
            let matched = 0;
            for (const pattern of patterns) {
                for (const path of paths) matched += compileAndTest(pattern, path) ? 1 : 0;
            }
            retain(matched);
        })
    );
});

test('match — cold matcher construction', async ({ bench }) => {
    await bench.compare(
        bench(benchName('new matcher per iteration', patterns.length * paths.length), () => {
            const cold = new URLGlobPathMatcher();
            let matched = 0;
            for (const pattern of patterns) {
                for (const path of paths) matched += cold.match(pattern, path) ? 1 : 0;
            }
            retain(matched);
        }),
        bench(benchName('compile RegExp every call', patterns.length * paths.length), () => {
            let matched = 0;
            for (const pattern of patterns) {
                for (const path of paths) matched += compileAndTest(pattern, path) ? 1 : 0;
            }
            retain(matched);
        })
    );
});
