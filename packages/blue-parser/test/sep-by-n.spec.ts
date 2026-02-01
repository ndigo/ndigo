import { describe, it } from 'vitest';
import { expectSuccess, expectFailure } from './_expect';
import { char, letter } from 'arcsecond';
import sepByN from '../src/sep-by-n';

describe('sepByN', () => {
    it('should require n matches', () => {
        const atLeast3Separated = sepByN(3);
        const atLeast3SeparatedByCommas = atLeast3Separated(char(','));
        const atLeast3LettersSeparatedByCommas = atLeast3SeparatedByCommas(letter);

        expectSuccess(atLeast3LettersSeparatedByCommas, 'a,b,c', ['a', 'b', 'c']);
        expectFailure(atLeast3LettersSeparatedByCommas, 'a,b');
    });
});
