import { describe, test, expect } from 'vitest';
import shuffle from './shuffle';

describe('shuffle', function () {
    test('it should shuffle', function () {
        const zero = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            one = shuffle(zero),
            two = shuffle(one),
            three = shuffle(two);

        expect(one).not.toEqual(zero);
        expect(two).not.toEqual(one);
        expect(two).not.toEqual(zero);
        expect(three).not.toEqual(two);
        expect(three).not.toEqual(one);
        expect(three).not.toEqual(zero);
    });
});
