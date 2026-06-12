import { describe, test, expect } from 'vitest';

describe('Category modules - import patterns', () => {
    test('math category - namespace access', async () => {
        const util = await import('@blue/util');
        expect(util.math).toBeDefined();
        expect(typeof util.math.add).toBe('function');
        expect(util.math.add(2, 3)).toBe(5);
    }, 20000);

    test('string category - namespace access', async () => {
        const util = await import('@blue/util');
        expect(util.string).toBeDefined();
        expect(typeof util.string.toString).toBe('function');
    });

    test('types category - default export', async () => {
        const util = await import('@blue/util');
        expect(util.types).toBeDefined();
        expect(typeof util.types.isString).toBe('function');
    });

    test('Direct category imports work', async () => {
        const math = await import('@blue/util/math');
        const string = await import('@blue/util/string');

        expect(math.default).toBeDefined();
        expect(string.default).toBeDefined();

        expect(math.default.add(10, 20)).toBe(30);
        expect(typeof string.default.toString).toBe('function');
    });
});
