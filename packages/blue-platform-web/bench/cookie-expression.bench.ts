/**
 * Benchmark suite for `cookieExpression` (cookie-header) parser throughput.
 *
 * Scenarios:
 *   1. cookieExpression – arcsecond parser            – parse all cookie strings
 *   2. cookieExpression – Object.fromEntries baseline – built-in JS split approach
 */

import { bench, describe } from 'vitest';
import cookieExpression from '../src/parser/cookie-expression';

/* ------------------------------------------------------------------ */
/*  Test patterns                                                      */
/* ------------------------------------------------------------------ */

const cookieStrings = [
    'name=value',
    'name=value; path=/',
    'session=abc123; lang=en; theme=dark',
    'token=hello%20world; user=jeff',
    'a=1; b=2; c=3; d=4; e=5',
];

/* ------------------------------------------------------------------ */
/*  Baselines                                                          */
/* ------------------------------------------------------------------ */

/** Naive built-in: split on '; ' then '=' — no percent-decoding. */
const splitBaseline = (s: string): Record<string, string> =>
    Object.fromEntries(s.split('; ').map((p) => p.split('=') as [string, string]));

let _sink: unknown = 0;

/* ------------------------------------------------------------------ */
/*  Benchmarks                                                         */
/* ------------------------------------------------------------------ */

describe('cookieExpression – Cookie header strings', () => {
    bench('arcsecond parser', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            for (const cookie of cookieStrings) {
                const result = cookieExpression.run(cookie);
                accumulator += result.isError ? 0 : 1;
            }
        }
        _sink = accumulator;
    });

    bench('Object.fromEntries baseline (split)', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            for (const cookie of cookieStrings) {
                const result = splitBaseline(cookie);
                accumulator += Object.keys(result).length > 0 ? 1 : 0;
            }
        }
        _sink = accumulator;
    });
});
