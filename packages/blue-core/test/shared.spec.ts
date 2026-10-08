/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { describe, test, expect } from 'vitest';
import { shared, isShared, getSharedOptions, SharedOptions } from '../src/shared';

// The production `@shared` decorator's inner function is typed `=> Function`;
// TS requires a class decorator to return `void | typeof Class`, so cast to a
// void-returning decorator here. Runtime behavior is unchanged (it still
// returns the target class and writes Symbol.metadata).
const sharedDecorator = shared as unknown as (
    options?: SharedOptions
) => (target: Function, context: ClassDecoratorContext) => void;

describe('@shared decorator', () => {
    test('it should mark a class as shared with default options', () => {
        @sharedDecorator()
        class MyService {}

        expect(isShared(MyService)).toBe(true);
        expect(getSharedOptions(MyService)).toEqual({ singleton: true });
    });

    test('it should accept custom version', () => {
        @sharedDecorator({ version: '^1.0.0' })
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
        @sharedDecorator({ version: '2.0.0' })
        class MyService {}

        const instance = new MyService();
        expect(isShared(instance)).toBe(true);
    });
});
