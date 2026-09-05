import '@tsmetadata/polyfill';
import { describe, test, expect } from 'vitest';
import { shared, isShared, getSharedOptions } from '../src/shared';

describe('@shared decorator', () => {
    test('it should mark a class as shared with default options', () => {
        @shared()
        class MyService {}

        expect(isShared(MyService)).toBe(true);
        expect(getSharedOptions(MyService)).toEqual({ singleton: true });
    });

    test('it should accept custom version', () => {
        @shared({ version: '^1.0.0' })
        class MyService {}

        expect(isShared(MyService)).toBe(true);
        expect(getSharedOptions(MyService)).toEqual({ singleton: true, version: '^1.0.0' });
    });

    test('it should return false for a non-shared class', () => {
        class MyService {}

        expect(isShared(MyService)).toBe(false);
        expect(getSharedOptions(MyService)).toBeUndefined();
    });

    test('it should read metadata from an instance', () => {
        @shared({ version: '2.0.0' })
        class MyService {}

        const instance = new MyService();
        expect(isShared(instance)).toBe(true);
    });
});
