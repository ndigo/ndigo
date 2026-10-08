/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { describe, test, expect } from 'vitest';
import { getSymbolMetadata } from '../src/metadata';

describe('getSymbolMetadata', () => {
    test('it should return metadata from a class with Symbol.metadata', () => {
        class Sample {}

        const SampleCarrier = Sample as unknown as { [Symbol.metadata]: Record<string, unknown> };
        SampleCarrier[Symbol.metadata] = { key: 'value' };

        expect(getSymbolMetadata(Sample)).toEqual({
            key: 'value',
        });
    });

    test('it should return metadata from an instance via constructor', () => {
        class Sample {}

        const SampleCarrier = Sample as unknown as { [Symbol.metadata]: Record<string, unknown> };
        SampleCarrier[Symbol.metadata] = { key: 'value' };

        const instance = new Sample();

        expect(getSymbolMetadata(instance)).toEqual({
            key: 'value',
        });
    });

    test('it should return empty object for class without metadata', () => {
        class Sample {}

        expect(getSymbolMetadata(Sample)).toEqual({});
    });

    test('it should return empty object for null', () => {
        expect(getSymbolMetadata(null)).toEqual({});
    });

    test('it should return empty object for undefined', () => {
        expect(getSymbolMetadata(undefined)).toEqual({});
    });

    test('it should return empty object for plain object without constructor metadata', () => {
        expect(getSymbolMetadata({})).toEqual({});
    });

    test('it should work with TC39 decorators', () => {
        const decorator =
            (value: string) =>
            (target: Function, context: ClassDecoratorContext): void => {
                context.metadata[value] = true;
            };

        @decorator('flag')
        class Sample {}

        expect(getSymbolMetadata(Sample)).toMatchObject({
            flag: true,
        });
    });
});
