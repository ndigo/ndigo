import braceExpression from './brace-expression';
import cases from './test-cases';
import { expectSuccess } from './_expect';

describe.skip('braceExpression', function () {
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
