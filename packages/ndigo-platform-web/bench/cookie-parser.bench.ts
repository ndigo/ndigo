/**
 * Benchmark suite for `parseCookieHeader` (cookie-header) parser throughput.
 *
 * Scenarios:
 *   1. parseCookieHeader – hand-rolled parser        – parse all cookie strings
 *   2. parseCookieHeader – Object.fromEntries baseline – built-in JS split approach
 */

import { test } from 'vitest';
import { parseCookieHeader } from '../src/parser/cookie-parser';

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

test('parseCookieHeader – Cookie header strings', async ({ bench }) => {
    await bench.compare(
        bench('parseCookieHeader', () => {
            let accumulator = 0;
            for (let i = 0; i < 1000; i++) {
                for (const cookie of cookieStrings) {
                    accumulator += Object.keys(parseCookieHeader(cookie)).length > 0 ? 1 : 0;
                }
            }
            _sink = accumulator;
        }),
        bench('Object.fromEntries baseline (split)', () => {
            let accumulator = 0;
            for (let i = 0; i < 1000; i++) {
                for (const cookie of cookieStrings) {
                    const result = splitBaseline(cookie);
                    accumulator += Object.keys(result).length > 0 ? 1 : 0;
                }
            }
            _sink = accumulator;
        })
    );
});
