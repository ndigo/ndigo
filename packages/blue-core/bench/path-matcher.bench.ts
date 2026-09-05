/**
 * @author Jeff Rose
 *
 * Benchmark: URLGlobPathMatcher.match() — LRU cache vs no-cache baseline.
 *
 * Both scenarios perform the same amount of work per iteration:
 *   - Round 1: first pass over all pattern×path combinations (cold miss for cached, compile for baseline)
 *   - Round 2: second pass over the same combinations (cache hit for cached, recompile for baseline)
 *
 * This measures the real per-match cost of the LRU cache vs. always recompiling.
 */
import { bench, describe } from 'vitest';
import { URLGlobPathMatcher } from '../src/path-matcher';
import { parseUrlGlob } from '../src/url-glob';

const patterns = ['/api/v1/users', '/api/*/users', '/api/**', '/api/v[12]/users', '*/man*/bash.*'];

const paths = ['/api/v1/users', '/api/v2/users', '/api/v1/users/42', '/api/v1/posts', 'man/man1/bash.1'];

// Two full passes = equal work: 50 match calls total per iteration.
const ROUNDS = 2;

describe('URLGlobPathMatcher.match() — LRU cache vs no-cache', () => {
    bench('with LRU cache (round 1 = miss, round 2 = hit)', () => {
        const matcher = new URLGlobPathMatcher();
        let acc = 0;
        for (let r = 0; r < ROUNDS; r++) {
            for (const pattern of patterns) {
                for (const path of paths) {
                    acc += matcher.match(pattern, path) ? 1 : 0;
                }
            }
        }
        if (acc < 0) throw new Error();
    });

    bench('no cache (compile RegExp on every call)', () => {
        let acc = 0;
        for (let r = 0; r < ROUNDS; r++) {
            for (const pattern of patterns) {
                const re = parseUrlGlob(pattern);
                if (re !== null) {
                    const regex = new RegExp(re);
                    for (const path of paths) {
                        acc += regex.test(path) ? 1 : 0;
                    }
                }
            }
        }
        if (acc < 0) throw new Error();
    });
});
