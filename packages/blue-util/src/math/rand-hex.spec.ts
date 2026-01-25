import { describe, test, expect } from 'vitest';

import randHex from './rand-hex';

describe('randHex', function () {
    test('it should generate hexidecimal values', function () {
        const one = randHex(),
            two = randHex();

        expect(one).not.toBe(two);
        expect(one).not.toBeUndefined();
        expect(one).not.toBe(Infinity);
        expect(one).not.toBeNaN();
    });

    test('it should return a 6 char length hex value by default', function () {
        const one = randHex(),
            two = randHex(0);

        expect(one.length).toBe(6);
        expect(two.length).toBe(6);
    });

    test('it should allow custom length', function () {
        expect(randHex(2).length).toBe(2);
        expect(randHex(5).length).toBe(5);
        expect(randHex(10).length).toBe(10);
    });

    test('it should handle negative size', function () {
        expect(randHex(-5).length).toBe(6);
    });
});
