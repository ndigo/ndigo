import { describe, test, expect } from 'vitest';

describe('Category modules - import patterns', () => {
    test('math category - namespace access', async () => {
        const util = await import('@blue/util');
        expect(util.math).toBeDefined();
        expect(typeof util.math.add).toBe('function');
        expect(util.math.add(2, 3)).toBe(5);
    });

    test('logic category - namespace access', async () => {
        const util = await import('@blue/util');
        expect(util.logic).toBeDefined();
        expect(typeof util.logic.and).toBe('function');
    });

    test('list category - namespace access', async () => {
        const util = await import('@blue/util');
        expect(util.list).toBeDefined();
        expect(typeof util.list.map).toBe('function');
    });

    test('function category - namespace access', async () => {
        const util = await import('@blue/util');
        expect(util.fn).toBeDefined();
        expect(typeof util.fn.pipe).toBe('function');
    });

    test('object category - namespace access', async () => {
        const util = await import('@blue/util');
        expect(util.object).toBeDefined();
        expect(typeof util.object.keys).toBe('function');
    });

    test('relation category - namespace access', async () => {
        const util = await import('@blue/util');
        expect(util.relation).toBeDefined();
        expect(typeof util.relation.equals).toBe('function');
    });

    test('string category - namespace access', async () => {
        const util = await import('@blue/util');
        expect(util.string).toBeDefined();
        expect(typeof util.string.trim).toBe('function');
    });

    test('types category - default export', async () => {
        const util = await import('@blue/util');
        expect(util.types).toBeDefined();
        expect(typeof util.types.isString).toBe('function');
    });

    test('Direct category imports work', async () => {
        const math = await import('@blue/util/math');
        const logic = await import('@blue/util/logic');
        const list = await import('@blue/util/list');

        expect(math.default).toBeDefined();
        expect(logic.default).toBeDefined();
        expect(list.default).toBeDefined();

        expect(math.default.add(10, 20)).toBe(30);
        expect(typeof logic.default.and).toBe('function');
        expect(typeof list.default.map).toBe('function');
    });
});
