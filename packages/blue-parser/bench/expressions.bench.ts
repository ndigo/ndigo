/**
 * @author opencode
 *
 * Benchmark suite for `braceExpression` and `sequenceExpression` parser throughput.
 *
 * Scenarios:
 *   1. braceExpression – arcsecond parser  – parse all 44 test-case patterns
 *   2. braceExpression – regex baseline    – naive /\{[^{}]*\}/ scan (no expansion)
 *   3. sequenceExpression – arcsecond parser, positive sequence   (1..100)
 *   4. sequenceExpression – arcsecond parser, negative sequence   (-10..-1)
 *   5. sequenceExpression – arcsecond parser, padded sequence     (01..100)
 *   6. sequenceExpression – arcsecond parser, stepped sequence    (1..100..10)
 *   7. sequenceExpression – regex baseline                        (/^-?\d+\.\.-?\d+/)
 */

import { bench, describe } from 'vitest';
import { braceExpression, sequenceExpression } from '../src';
import cases from '../test/test-cases';

/* ------------------------------------------------------------------ */
/*  Pre-process test cases (module level – not per-iteration)         */
/* ------------------------------------------------------------------ */

const braceCases = cases.map((testCase) => {
    const set = testCase.split('\n');
    const pattern = set.shift()!;
    const expected = set.length === 1 && set[0] === '' ? [] : set.map((s) => s.replace(/^\[|]$/g, ''));
    return { pattern, expected };
});

/* ------------------------------------------------------------------ */
/*  Regex baselines                                                    */
/* ------------------------------------------------------------------ */

/** Naive scan: find non-nested brace groups (no expansion, just matching overhead). */
const braceRegex = /\{[^{}]*\}/g;

/** Sequence pattern check: validates shape without generating the expansion. */
const sequenceRegex = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/;

let _sink: any = 0;

/* ------------------------------------------------------------------ */
/*  Benchmarks                                                         */
/* ------------------------------------------------------------------ */

describe('braceExpression – all 44 test-case patterns', () => {
    bench('arcsecond parser', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            for (const { pattern } of braceCases) {
                const result = braceExpression.run(pattern);
                accumulator += result.isError ? 0 : 1;
            }
        }
        _sink = accumulator;
    });

    bench('regex baseline (naive brace scan)', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            for (const { pattern } of braceCases) {
                braceRegex.lastIndex = 0;
                accumulator += braceRegex.test(pattern) ? 1 : 0;
            }
        }
        _sink = accumulator;
    });
});

describe('sequenceExpression – positive sequence (1..100)', () => {
    bench('arcsecond parser', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            const result = sequenceExpression.run('1..100');
            accumulator += result.isError ? 0 : 1;
        }
        _sink = accumulator;
    });

    bench('regex baseline', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += sequenceRegex.test('1..100') ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('sequenceExpression – negative sequence (-10..-1)', () => {
    bench('arcsecond parser', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            const result = sequenceExpression.run('-10..-1');
            accumulator += result.isError ? 0 : 1;
        }
        _sink = accumulator;
    });

    bench('regex baseline', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += sequenceRegex.test('-10..-1') ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('sequenceExpression – padded sequence (01..100)', () => {
    bench('arcsecond parser', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            const result = sequenceExpression.run('01..100');
            accumulator += result.isError ? 0 : 1;
        }
        _sink = accumulator;
    });

    bench('regex baseline', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += sequenceRegex.test('01..100') ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('sequenceExpression – stepped sequence (1..100..10)', () => {
    bench('arcsecond parser', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            const result = sequenceExpression.run('1..100..10');
            accumulator += result.isError ? 0 : 1;
        }
        _sink = accumulator;
    });

    bench('regex baseline', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += sequenceRegex.test('1..100..10') ? 1 : 0;
        }
        _sink = accumulator;
    });
});
