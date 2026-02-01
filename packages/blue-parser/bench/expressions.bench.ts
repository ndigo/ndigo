import { bench, describe } from 'vitest';
import { braceExpression, sequenceExpression } from '../src';
import { flatten } from '../src/_util';
import cases from '../test/test-cases';

const braceCases = cases.map((testCase) => {
    const set = testCase.split('\n');
    const pattern = set.shift();
    const expected = set.length === 1 && set[0] === '' ? [] : set.map((s) => s.replace(/^\[|]$/g, ''));
    return { pattern, expected };
});

describe('braceExpression', () => {
    bench('complete', () => {
        for (const { pattern } of braceCases) {
            braceExpression.run(pattern);
        }
    });
});

describe('sequenceExpression', () => {
    bench('positive sequence', () => {
        sequenceExpression.run('1..100');
    });

    bench('negative sequence', () => {
        sequenceExpression.run('-10..-1');
    });

    bench('padded sequence', () => {
        sequenceExpression.run('01..100');
    });

    bench('stepped sequence', () => {
        sequenceExpression.run('1..100..10');
    });
});
