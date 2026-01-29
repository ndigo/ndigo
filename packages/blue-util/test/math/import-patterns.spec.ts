import { describe, test, expect } from 'vitest';

describe('math module - import patterns', () => {
    test('Pattern 2: Category namespace import', async () => {
        const math = await import('@blue/util/math');

        expect(math.default).toBeDefined();
        expect(typeof math.default.add).toBe('function');
        expect(typeof math.default.guid).toBe('function');
        expect(math.default.add(2, 3)).toBe(5);
        expect(math.default.multiply(3, 4)).toBe(12);
    });

    test('Pattern 3: Named exports from category', async () => {
        const { add, multiply, divide, subtract, guid, random } = await import('@blue/util/math');

        expect(typeof add).toBe('function');
        expect(typeof multiply).toBe('function');
        expect(typeof divide).toBe('function');
        expect(typeof subtract).toBe('function');
        expect(typeof guid).toBe('function');
        expect(typeof random).toBe('function');

        expect(add(2, 3)).toBe(5);
        expect(multiply(2, 3)).toBe(6);
        expect(divide(10, 2)).toBe(5);
        expect(subtract(10, 3)).toBe(7);

        const guidValue = guid();
        expect(guidValue).toMatch(/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[ab89][a-f0-9]{3}-[a-f0-9]{12}/);

        const randomValue = random();
        expect(randomValue).toBeGreaterThanOrEqual(0);
        expect(randomValue).toBeLessThan(1);
    });

    test('All 18 math functions are exported', async () => {
        const math = await import('@blue/util/math');

        // 13 Ramda functions
        expect(math.add).toBeDefined();
        expect(math.dec).toBeDefined();
        expect(math.divide).toBeDefined();
        expect(math.inc).toBeDefined();
        expect(math.mathMod).toBeDefined();
        expect(math.mean).toBeDefined();
        expect(math.median).toBeDefined();
        expect(math.modulo).toBeDefined();
        expect(math.multiply).toBeDefined();
        expect(math.negate).toBeDefined();
        expect(math.product).toBeDefined();
        expect(math.subtract).toBeDefined();
        expect(math.sum).toBeDefined();

        // 5 Custom functions
        expect(math.guid).toBeDefined();
        expect(math.rand).toBeDefined();
        expect(math.randHex).toBeDefined();
        expect(math.randInt).toBeDefined();
        expect(math.random).toBeDefined();
    });

    test('Ramda math functions work correctly', async () => {
        const { inc, dec, negate, mean, median, product, sum } = await import('@blue/util/math');

        expect(inc(5)).toBe(6);
        expect(dec(5)).toBe(4);
        expect(negate(5)).toBe(-5);
        expect(mean([1, 2, 3, 4, 5])).toBe(3);
        expect(median([1, 2, 3, 4, 5])).toBe(3);
        expect(product([1, 2, 3, 4])).toBe(24);
        expect(sum([1, 2, 3, 4])).toBe(10);
    });
});
