import { describe, it, expect, test } from 'vitest';
import braceExpression from '../src/brace-expression.parser';
import cases from './test-cases';
import { expectSuccess } from './_expect';

describe('braceExpression', function () {
    cases.forEach(function (testCase) {
        let set = testCase.split('\n'),
            pattern = set.shift();

        set =
            set.length === 1 && set[0] === ''
                ? []
                : set.map(function (s) {
                      return s.replace(/^\[|\]$/g, '');
                  });

        it(`should handle ${pattern}`, function () {
            expectSuccess(braceExpression, pattern, set);
        });
    });
});
