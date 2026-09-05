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

    test('All 5 custom math functions are exported', async () => {
        const math = await import('@blue/util/math');

        // 5 Custom functions
        expect(math.guid).toBeDefined();
        expect(math.rand).toBeDefined();
        expect(math.randHex).toBeDefined();
        expect(math.randInt).toBeDefined();
        expect(math.random).toBeDefined();
    });
});
