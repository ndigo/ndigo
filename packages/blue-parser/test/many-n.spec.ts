import { describe, it, expect, test } from 'vitest';
import { expectSuccess, expectFailure } from './_expect';
import { digit } from 'arcsecond';
import manyN from '../src/many-n';

describe('manyN', function () {
    test('it should require n matches', function () {
        const atLeast2 = manyN(2),
            atLeast2Digits = atLeast2(digit);

        expectSuccess(atLeast2Digits, '123abc', ['1', '2', '3']);
        expectSuccess(atLeast2Digits, '12abc', ['1', '2']);
        expectFailure(atLeast2Digits, '1abc');
    });
});
