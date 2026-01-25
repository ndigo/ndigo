import { describe, test, expect } from 'vitest';

import random from './random';

describe('random', function () {
    test('it should generate numbers', function () {
        const one = random(),
            two = random(),
            three = random(),
            four = random();

        expect(one).not.toBe(two);
        expect(one).not.toBeUndefined();
        expect(one).not.toBe(Infinity);
        expect(one).not.toBeNaN();
        expect(one).not.toBe(three);
        expect(one).not.toBe(four);
        expect(two).not.toBe(three);
        expect(two).not.toBe(four);
        expect(three).not.toBe(four);

        expect(one).toBeGreaterThan(0);
        expect(one).toBeLessThan(1);
        expect(two).toBeGreaterThan(0);
        expect(two).toBeLessThan(1);
        expect(three).toBeGreaterThan(0);
        expect(three).toBeLessThan(1);
        expect(four).toBeGreaterThan(0);
        expect(four).toBeLessThan(1);
    });
});
