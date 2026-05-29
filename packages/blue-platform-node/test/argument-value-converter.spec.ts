import { describe, test, expect } from 'vitest';
import {
    identityArgumentValueConverter,
    toNumberValue,
    toBooleanValue,
    toDateValue,
    toJSONStringValue,
    createStringSplitConverter,
    createOptionalConverter,
    argumentValueConverters,
    resolveConverter
} from '../src/argument-value-converter';

describe('argument-value-converter', () => {
    describe('identityArgumentValueConverter', () => {
        test('should return the value unchanged', () => {
            expect(identityArgumentValueConverter('test')).toBe('test');
            expect(identityArgumentValueConverter(123)).toBe(123);
            expect(identityArgumentValueConverter(null)).toBeNull();
            expect(identityArgumentValueConverter(undefined)).toBeUndefined();
        });
    });

    describe('toNumberValue', () => {
        test('should convert string numbers to numbers', () => {
            expect(toNumberValue('42')).toBe(42);
            expect(toNumberValue('3.14')).toBe(3.14);
            expect(toNumberValue('-5')).toBe(-5);
        });

        test('should handle non-numeric strings', () => {
            // Note: Number() converts 'not-a-number' to NaN, but '' to 0
            expect(toNumberValue('')).toBe(0);
        });

        test('should pass through numbers unchanged', () => {
            expect(toNumberValue(42)).toBe(42);
            expect(toNumberValue(3.14)).toBe(3.14);
        });

        test('should handle special values', () => {
            // Note: Number(null) returns 0, not null
            expect(toNumberValue(null)).toBe(0);
            // Note: Number(undefined) returns NaN
            expect(toNumberValue(undefined)).toBeNaN();
        });
    });

    describe('toBooleanValue', () => {
        test('should convert truthy strings to true', () => {
            expect(toBooleanValue('true')).toBe(true);
            expect(toBooleanValue('1')).toBe(true);
            expect(toBooleanValue('yes')).toBe(true);
            expect(toBooleanValue('on')).toBe(true);
        });

        test('should convert falsy strings to false', () => {
            expect(toBooleanValue('false')).toBe(false);
            expect(toBooleanValue('0')).toBe(false);
            expect(toBooleanValue('no')).toBe(false);
            expect(toBooleanValue('off')).toBe(false);
        });

        test('should use Boolean() for other values', () => {
            expect(toBooleanValue('test')).toBe(true);
            expect(toBooleanValue('')).toBe(false);
            expect(toBooleanValue('0')).toBe(false); // This is the key difference - '0' is falsy
        });

        test('should pass through booleans unchanged', () => {
            expect(toBooleanValue(true)).toBe(true);
            expect(toBooleanValue(false)).toBe(false);
        });

        test('should handle special values', () => {
            // Note: Boolean(null) returns false, not null
            expect(toBooleanValue(null)).toBe(false);
            // Note: Boolean(undefined) returns false, not undefined
            expect(toBooleanValue(undefined)).toBe(false);
        });
    });

    describe('toDateValue', () => {
        test('should convert valid date strings to Date objects', () => {
            const dateStr = '2023-01-01';
            const result = toDateValue(dateStr);
            expect(result).toBeInstanceOf(Date);
            expect(result.toISOString()).toMatch(/^2023-01-01/);
        });

        test('should handle invalid date strings', () => {
            // Note: new Date('invalid-date') returns Invalid Date, not NaN
            const result = toDateValue('invalid-date');
            expect(result.toString()).toBe('Invalid Date');
        });

        test('should pass through Date objects unchanged', () => {
            const date = new Date('2023-01-01');
            // Note: Using toStrictEqual for object comparison
            expect(toDateValue(date)).toStrictEqual(date);
        });

        test('should handle special values', () => {
            // Note: new Date(null) returns 1970-01-01, not null
            expect(toDateValue(null).toString()).toBe(new Date(null).toString());
            // Note: new Date(undefined) returns Invalid Date, not undefined
            expect(toDateValue(undefined).toString()).toBe('Invalid Date');
        });
    });

    describe('toJSONStringValue', () => {
        test('should parse JSON strings', () => {
            expect(toJSONStringValue('{"name":"test"}')).toEqual({ name: 'test' });
            expect(toJSONStringValue('[1,2,3]')).toEqual([1, 2, 3]);
        });

        test('should parse primitive JSON values', () => {
            expect(toJSONStringValue('"hello"')).toBe('hello');
            expect(toJSONStringValue('42')).toBe(42);
            expect(toJSONStringValue('true')).toBe(true);
        });

        test('should parse null JSON value', () => {
            // JSON.parse('null') === null; JSON.parse(null) coerces to JSON.parse('null')
            expect(toJSONStringValue('null')).toBeNull();
        });

        test('should throw SyntaxError for invalid JSON', () => {
            expect(() => toJSONStringValue('invalid json')).toThrow(SyntaxError);
            expect(() => toJSONStringValue(undefined)).toThrow(SyntaxError);
        });
    });

    describe('createStringSplitConverter', () => {
        test('should split strings by delimiter', () => {
            const converter = createStringSplitConverter(',');
            expect(converter('a,b,c')).toEqual(['a', 'b', 'c']);
            expect(converter('one;two;three')).toEqual(['one;two;three']); // No match
        });

        test('should handle empty strings', () => {
            const converter = createStringSplitConverter(',');
            expect(converter('')).toEqual(['']);
        });

        test('should handle single values', () => {
            const converter = createStringSplitConverter(',');
            expect(converter('single')).toEqual(['single']);
        });
    });

    describe('createOptionalConverter', () => {
        test('should wrap a converter to make it optional', () => {
            const converter = createOptionalConverter(toNumberValue);
            expect(converter('42')).toBe(42);
            expect(converter(null)).toBeNull();
            expect(converter(undefined)).toBeUndefined();
        });
    });

    describe('argumentValueConverters', () => {
        test('should contain expected converters', () => {
            expect(argumentValueConverters).toHaveProperty('identity');
            expect(argumentValueConverters).toHaveProperty('number');
            expect(argumentValueConverters).toHaveProperty('boolean');
            expect(argumentValueConverters).toHaveProperty('date');
            expect(argumentValueConverters).toHaveProperty('json');
        });

        test('should return correct converter functions', () => {
            // The registry stores wrapper functions; verify by behaviour, not reference
            expect(argumentValueConverters.identity).toBe(identityArgumentValueConverter);
            expect(argumentValueConverters.number('42')).toBe(42);
            expect(argumentValueConverters.boolean('true')).toBe(true);
            expect(argumentValueConverters.date('2023-01-01')).toBeInstanceOf(Date);
            expect(argumentValueConverters.json('{"x":1}')).toEqual({ x: 1 });
        });
    });

    describe('resolveConverter', () => {
        test('should resolve built-in converters by name', () => {
            expect(resolveConverter('identity')).toBe(identityArgumentValueConverter);
            // Built-in converters resolve to functions that produce correct output
            expect(resolveConverter('number')('42')).toBe(42);
            expect(resolveConverter('boolean')('true')).toBe(true);
            expect(resolveConverter('date')('2023-01-01')).toBeInstanceOf(Date);
            expect(resolveConverter('json')('{"a":1}')).toEqual({ a: 1 });
        });

        test('should return identity converter for unknown string without strictNamedLookup', () => {
            const result = resolveConverter('unknown');
            expect(result('hello')).toBe('hello');
        });

        test('should throw TypeError for unknown converter with strictNamedLookup', () => {
            expect(() => resolveConverter('unknown', undefined, { strictNamedLookup: true })).toThrow(TypeError);
            expect(() => resolveConverter('unknown', undefined, { strictNamedLookup: true })).toThrow('Unknown converter reference: unknown');
        });

        test('should accept custom converters when provided', () => {
            const customConverter = (value: any) => `converted-${value}`;
            const result = resolveConverter('custom', { custom: customConverter });
            expect(result).toBe(customConverter);
        });

        test('should throw TypeError for unknown converter with custom registry', () => {
            expect(() => resolveConverter('unknown', { custom: (v: any) => v }, { strictNamedLookup: true })).toThrow(TypeError);
            expect(() => resolveConverter('unknown', { custom: (v: any) => v }, { strictNamedLookup: true })).toThrow('Unknown converter reference: unknown');
        });
    });
});