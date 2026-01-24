import { expectSuccess, expectFailure } from './_expect';
import { char, letter } from 'arcsecond';
import sepByN from './sep-by-n';

describe('sepByN', function () {
    test('it should require n matches', function () {
        const atLeast3Separated = sepByN(3),
            atLeast3SeparatedByCommas = atLeast3Separated(char(',')),
            atLeast3LettersSeparatedByCommas = atLeast3SeparatedByCommas(letter);

        expectSuccess(atLeast3LettersSeparatedByCommas, 'a,b,c', ['a', 'b', 'c']);
        expectFailure(atLeast3LettersSeparatedByCommas, 'a,b');
    });
});
