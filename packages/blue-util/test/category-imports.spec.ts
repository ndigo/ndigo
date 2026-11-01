/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

describe('Category modules - import patterns', () => {
    test('root entry exposes the consumed surface', async () => {
        const util = await import('@blue/util');

        expect(typeof util.getErrorMessage).toBe('function');
        expect(typeof util.delay).toBe('function');
        expect(typeof util.getEnv).toBe('function');
        expect(typeof util.isDevMode).toBe('function');
        expect(typeof util.randomHex).toBe('function');
        expect(typeof util.randomToken).toBe('function');
        expect(typeof util.is).toBe('function');
        expect(typeof util.like).toBe('function');
    }, 20000);

    test('string category - named exports', async () => {
        const string = await import('@blue/util/string');

        expect(typeof string.decodeURIComponent).toBe('function');
        expect(typeof string.encodeURIComponent).toBe('function');
        expect(typeof string.toPascal).toBe('function');
    });

    test('types category - named exports', async () => {
        const types = await import('@blue/util/types');

        expect(typeof types.is).toBe('function');
        expect(typeof types.like).toBe('function');
        expect(typeof types.isString).toBe('function');
        expect(typeof types.isNumber).toBe('function');
        expect(typeof types.isFunction).toBe('function');
        expect(typeof types.isNil).toBe('function');
        expect(typeof types.isNotNil).toBe('function');
    });

    test('no category namespaces or default export remain', async () => {
        const util = await import('@blue/util');

        expect(util.crypto).toBeUndefined();
        expect(util.math).toBeUndefined();
        expect(util.string).toBeUndefined();
        expect(util.types).toBeUndefined();
        expect(util.default).toBeUndefined();
    });
});
