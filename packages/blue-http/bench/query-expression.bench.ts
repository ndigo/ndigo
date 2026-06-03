/**
 * Benchmark suite for `queryExpression` parser throughput.
 *
 * Scenarios:
 *   1. queryExpression – arcsecond parser        – parse all query strings
 *   2. queryExpression – URLSearchParams baseline – built-in JS parser
 */

import { bench, describe } from 'vitest';
import { queryExpression } from '../src/parsers/query-expression';

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

describe('queryExpression – URL query strings', () => {
    bench('arcsecond parser', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            for (const qs of queryStrings) {
                const result = queryExpression.run(qs);
                accumulator += result.isError ? 0 : 1;
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
