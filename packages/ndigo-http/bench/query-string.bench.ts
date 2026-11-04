/**
 * Benchmark suite for `QueryString.parse` throughput.
 *
 * Scenarios:
 *   1. ndigo-http QueryString.parse  – single-pass native scan
 *   2. URLSearchParams baseline      – built-in JS parser
 *
 * The parser preserves a deliberately conservative contract (see
 * packages/ndigo-http/src/query-string.ts) that `URLSearchParams` cannot
 * express — `;` separators, bare/empty values as `null`, whole-parse
 * rejection of empty segments — so the built-in is a floor, not a target.
 */

import { bench, describe } from 'vitest';
import QueryString from '../src/query-string';

/* ------------------------------------------------------------------ */
/*  Test patterns                                                      */
/* ------------------------------------------------------------------ */

const queryStrings = [
    'foo=bar',
    '?foo=bar&baz=qux',
    'a=1&b=2&c=3',
    '?search=hello%20world&lang=en',
    '?a=1&b=2&c=3&d=4&e=5&f=6',
    '?',
    'key',
];

/* ------------------------------------------------------------------ */
/*  Baselines                                                          */
/* ------------------------------------------------------------------ */

/** Use the built-in URLSearchParams for comparison. */
const parseWithBuiltin = (s: string) => new URLSearchParams(s);

let _sink: unknown = 0;

/* ------------------------------------------------------------------ */
/*  Benchmarks                                                         */
/* ------------------------------------------------------------------ */

describe('QueryString.parse – URL query strings', () => {
    bench('ndigo-http QueryString.parse', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            for (const qs of queryStrings) {
                accumulator += Object.keys(QueryString.parse(qs)).length;
            }
        }
        _sink = accumulator;
    });

    bench('URLSearchParams baseline', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            for (const qs of queryStrings) {
                const params = parseWithBuiltin(qs);
                accumulator += (params.get('foo') ?? '').length >= 0 ? 1 : 0;
            }
        }
        _sink = accumulator;
    });
});
