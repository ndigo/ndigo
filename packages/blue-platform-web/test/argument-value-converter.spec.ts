import { describe, expect, test } from 'vitest';
import {
    argumentValueConverters,
    createOptionalConverter,
    createStringSplitConverter,
    toBooleanValue,
    toDateValue,
    toJSONStringValue,
    toNumberValue,
} from '../src/argument-value-converter';

describe('argument-value-converter', () => {
    test('toNumberValue converts to number', () => {
        expect(toNumberValue('42')).toBe(42);
    });

    test('toBooleanValue handles common truthy/falsy strings', () => {
        expect(toBooleanValue('true')).toBe(true);
        expect(toBooleanValue('1')).toBe(true);
        expect(toBooleanValue('false')).toBe(false);
        expect(toBooleanValue('0')).toBe(false);
    });

    test('toDateValue converts to Date', () => {
        const value = toDateValue('2026-01-01T00:00:00.000Z');

        expect(value instanceof Date).toBe(true);
        expect(value.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    });

    test('toJSONStringValue parses json strings', () => {
        expect(toJSONStringValue('{"x":1}')).toEqual({ x: 1 });
    });

    test('createStringSplitConverter splits values', () => {
        const converter = createStringSplitConverter(',');

        expect(converter('a,b,c', {} as any)).toEqual(['a', 'b', 'c']);
    });

    test('createOptionalConverter skips nullish values', () => {
        const converter = createOptionalConverter((value) => Number(value));

        expect(converter(null, {} as any)).toBeNull();
        expect(converter(undefined, {} as any)).toBeUndefined();
        expect(converter('10', {} as any)).toBe(10);
    });

    test('argumentValueConverters registry exposes built-ins', () => {
        expect(argumentValueConverters.number('42', null as any)).toBe(42);
        expect(argumentValueConverters.boolean('true', null as any)).toBe(true);
        expect(argumentValueConverters.identity('x', {} as any)).toBe('x');
    });
});
