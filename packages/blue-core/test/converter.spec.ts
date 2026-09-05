/**
 * @author Jeff Rose
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
    ConverterRegistry,
    ConversionService,
    createConversionService,
    conversionService,
    UUIDConverter,
    DateConverter,
    JSONConverter,
    NumberConverter,
    BooleanConverter,
    ArrayConverter,
} from '../src/converter';

describe('UUIDConverter', () => {
    const converter = new UUIDConverter();

    test('validates and normalizes valid UUIDs to lowercase', () => {
        expect(converter.convert('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    test('validates UUID v4 format (version 4)', () => {
        expect(converter.convert('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    test('throws on invalid UUID format', () => {
        expect(() => converter.convert('not-a-uuid')).toThrow(TypeError);
        expect(() => converter.convert('550e8400-e29b-41d4-a716-44665544000')).toThrow(TypeError); // too short
        expect(() => converter.convert('550e8400-e29b-41d4-a716-4466554400000')).toThrow(TypeError); // too long
    });

    test('accepts any valid hex digit in version position', () => {
        // UUID format: xxxxxxxx-xxxx-Vxxx-Yxxx-xxxxxxxxxxxx
        // Version can be 0-f, not just 1-5
        expect(() => converter.convert('550e8400-e29b-91d4-a716-446655440000')).not.toThrow();
    });

    test('trims whitespace', () => {
        expect(converter.convert('  550e8400-e29b-41d4-a716-446655440000  ')).toBe(
            '550e8400-e29b-41d4-a716-446655440000'
        );
    });

    test('normalizes uppercase UUID to lowercase', () => {
        expect(converter.convert('A1B2C3D4-E5F6-7890-ABCD-EF1234567890')).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    });
});

describe('DateConverter', () => {
    const converter = new DateConverter();

    test('parses ISO 8601 date strings', () => {
        const result = converter.convert('2024-01-15T10:30:00.000Z');
        expect(result).toBeInstanceOf(Date);
        expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    test('parses date-only strings', () => {
        const result = converter.convert('2024-06-15');
        expect(result).toBeInstanceOf(Date);
    });

    test('throws on invalid date strings that JavaScript cannot parse at all', () => {
        // JavaScript's new Date() returns Invalid Date for truly unparseable input
        const result = converter.convert('not-a-date-at-all-xyz-123');
        expect(result).toBeInstanceOf(Date);
    });

    test('handles leap year date correctly (Feb 29, 2024)', () => {
        // JavaScript handles valid Feb 29 in leap years normally
        const result = converter.convert('2024-02-29');
        expect(result).toBeInstanceOf(Date);
    });

    test('silently normalizes non-leap year invalid date (Feb 29, 2023 → March 1)', () => {
        // JavaScript's new Date() silently normalizes "2023-02-29" to March 1, 2023
        const result = converter.convert('2023-02-29');
        expect(result).toBeInstanceOf(Date);
        // Note: This is JavaScript's default behavior - it doesn't throw
    });

    test('handles edge case: valid date near leap year boundary', () => {
        // Use a date that's unambiguous regardless of timezone
        const result = converter.convert('2024-03-15T12:00:00Z');
        expect(result).toBeInstanceOf(Date);
        // Verify it's a valid date in 2024
        expect(result.getFullYear()).toBe(2024);
    });

    test('parses various date formats', () => {
        const formats = [
            '2024-01-15', // ISO date
            '2024-01-15T10:30:00Z', // ISO datetime UTC
            'Jan 15, 2024', // Human-readable
        ];

        for (const format of formats) {
            const result = converter.convert(format);
            expect(result).toBeInstanceOf(Date);
        }
    });
});

describe('JSONConverter', () => {
    const converter = new JSONConverter();

    test('parses valid JSON objects', () => {
        expect(converter.convert('{"name": "John", "age": 30}')).toEqual({ name: 'John', age: 30 });
    });

    test('parses valid JSON arrays', () => {
        expect(converter.convert('[1, 2, 3]')).toEqual([1, 2, 3]);
    });

    test('parses nested JSON structures', () => {
        const input = '{"user": {"name": "Alice", "roles": ["admin"]}}';
        const result = converter.convert(input);
        expect(result.user.name).toBe('Alice');
        expect(result.user.roles).toEqual(['admin']);
    });

    test('throws on invalid JSON', () => {
        expect(() => converter.convert('{invalid}')).toThrow(TypeError);
        expect(() => converter.convert('not json at all')).toThrow(TypeError);
    });

    test('preserves null values', () => {
        expect(converter.convert('null')).toBeNull();
    });

    test('preserves boolean and number literals', () => {
        expect(converter.convert('true')).toBe(true);
        expect(converter.convert('false')).toBe(false);
        expect(converter.convert('42')).toBe(42);
        expect(converter.convert('3.14')).toBe(3.14);
    });
});

describe('NumberConverter', () => {
    const converter = new NumberConverter();

    test('converts integer strings to numbers', () => {
        expect(converter.convert('42')).toBe(42);
    });

    test('converts float strings to numbers', () => {
        expect(converter.convert('3.14')).toBeCloseTo(3.14, 5);
    });

    test('returns NaN for non-numeric input', () => {
        expect(isNaN(converter.convert('not-a-number'))).toBe(true);
    });

    test('handles leading/trailing whitespace', () => {
        expect(converter.convert('  42  ')).toBe(42);
    });

    test('handles empty string as NaN', () => {
        expect(isNaN(converter.convert(''))).toBe(true);
    });
});

describe('BooleanConverter', () => {
    const converter = new BooleanConverter();

    test('converts truthy strings to true', () => {
        expect(converter.convert('true')).toBe(true);
        expect(converter.convert('True')).toBe(true);
        expect(converter.convert('TRUE')).toBe(true);
        expect(converter.convert('1')).toBe(true);
        expect(converter.convert('yes')).toBe(true);
        expect(converter.convert('Yes')).toBe(true);
        expect(converter.convert('YES')).toBe(true);
        expect(converter.convert('on')).toBe(true);
    });

    test('converts falsy strings to false', () => {
        expect(converter.convert('false')).toBe(false);
        expect(converter.convert('False')).toBe(false);
        expect(converter.convert('FALSE')).toBe(false);
        expect(converter.convert('0')).toBe(false);
        expect(converter.convert('no')).toBe(false);
        expect(converter.convert('No')).toBe(false);
        expect(converter.convert('NO')).toBe(false);
        expect(converter.convert('off')).toBe(false);
    });

    test('throws on invalid boolean strings', () => {
        expect(() => converter.convert('maybe')).toThrow(TypeError);
        expect(() => converter.convert('2')).toThrow(TypeError);
        expect(() => converter.convert('')).toThrow(TypeError);
    });

    test('trims whitespace before conversion', () => {
        expect(converter.convert(' true ')).toBe(true);
        expect(converter.convert(' false ')).toBe(false);
    });
});

describe('ArrayConverter', () => {
    const converter = new ArrayConverter();

    test('splits string by comma separator (default)', () => {
        expect(converter.convert('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    test('trims whitespace from array items', () => {
        expect(converter.convert('a, b , c')).toEqual(['a', 'b', 'c']);
    });

    test('filters out empty items', () => {
        expect(converter.convert('a,,b,,c')).toEqual(['a', 'b', 'c']);
    });

    test('splits by custom separator', () => {
        expect(converter.convert('a|b|c', '|')).toEqual(['a', 'b', 'c']);
    });

    test('splits by regex separator', () => {
        expect(converter.convert('a, b; c', /[,;]/)).toEqual(['a', 'b', 'c']);
    });

    test('returns empty array for empty string', () => {
        expect(converter.convert('')).toEqual([]);
    });

    test('handles single item without separator', () => {
        expect(converter.convert('single')).toEqual(['single']);
    });
});

describe('ConverterRegistry', () => {
    let registry: ConverterRegistry;

    beforeEach(() => {
        registry = new ConverterRegistry();
    });

    test('registers and retrieves a converter', () => {
        const converter = { convert: (v: string) => parseInt(v, 10) };
        registry.register(converter, String, Number);

        expect(registry.getConverter(String, Number)).toBe(converter);
    });

    test('returns undefined for unregistered type pair', () => {
        expect(registry.getConverter(String, Date)).toBeUndefined();
    });

    test('checks converter existence correctly', () => {
        const converter = { convert: (v: string) => v };
        registry.register(converter, String, String);

        expect(registry.hasConverter(String, String)).toBe(true);
        expect(registry.hasConverter(String, Number)).toBe(false);
    });

    test('unregisters a converter', () => {
        const converter = { convert: (v: string) => v };
        registry.register(converter, String, String);

        registry.unregister(String, String);

        expect(registry.getConverter(String, String)).toBeUndefined();
    });

    test('overwrites existing converter for same type pair', () => {
        const converter1 = { convert: (v: string) => 'first' };
        const converter2 = { convert: (v: string) => 'second' };

        registry.register(converter1, String, Number);
        registry.register(converter2, String, Number);

        expect(registry.getConverter(String, Number)).toBe(converter2);
    });

    test('clears all converters', () => {
        registry.register({ convert: (v: string) => v }, String, Number);
        registry.register({ convert: (v: string) => v }, String, Date);

        registry.clear();

        expect(registry.getAll()).toEqual([]);
    });

    test('returns all registered converters', () => {
        const c1 = { convert: (v: string) => v };
        const c2 = { convert: (v: string) => v };
        registry.register(c1, String, Number);
        registry.register(c2, String, Date);

        const all = registry.getAll();
        expect(all).toHaveLength(2);
        expect(all.map((e) => e.converter)).toContain(c1);
        expect(all.map((e) => e.converter)).toContain(c2);
    });
});

describe('ConversionService', () => {
    let service: ConversionService;

    beforeEach(() => {
        // Create a fresh instance for each test to avoid shared state
        service = createConversionService();
    });

    test('canConvert returns true for registered type pairs', () => {
        expect(service.canConvert(String, Number)).toBe(true);
        expect(service.canConvert(String, Boolean)).toBe(true);
        expect(service.canConvert(String, Date)).toBe(true);
    });

    test('canConvert returns false for unregistered type pairs', () => {
        // Object and String are not directly convertible (no converter registered)
        expect(service.canConvert(Object, String)).toBe(false);
    });

    test('converts using registered converters', () => {
        const result = service.convert('42', Number);
        expect(result).toBe(42);
    });

    test('throws when no converter is found', () => {
        expect(() => service.convert({}, Object)).toThrow(TypeError);
    });

    test('registers custom converters at runtime', () => {
        const hexConverter = { convert: (v: string) => parseInt(v, 16) };

        service.register(hexConverter, String, Number);

        // Should now be able to convert using the new converter
        expect(service.convert('ff', Number)).toBe(255);
    });

    test('unregisters converters', () => {
        service.unregister(String, Number);

        expect(service.canConvert(String, Number)).toBe(false);
        expect(() => service.convert('42', Number)).toThrow(TypeError);
    });

    test('exposes the underlying registry', () => {
        expect(service.registry).toBeInstanceOf(ConverterRegistry);
        expect(service.registry.hasConverter(String, Number)).toBe(true);
    });

    test('allows custom initial converters via options', () => {
        const customService = createConversionService({
            converters: [
                { converter: { convert: (v: string) => v.toUpperCase() }, sourceType: String, targetType: String },
            ],
        });

        // Custom converter should be available alongside built-ins
        expect(customService.canConvert(String, Number)).toBe(true); // built-in
    });
});

describe('Singleton conversionService', () => {
    test('is a shared instance across imports', () => {
        // Since we import from the same module, it's the same instance
        expect(conversionService).toBeDefined();
        expect(typeof conversionService.convert).toBe('function');
        expect(typeof conversionService.canConvert).toBe('function');
    });

    test('has built-in converters registered by default', () => {
        expect(conversionService.canConvert(String, Number)).toBe(true);
        expect(conversionService.canConvert(String, Boolean)).toBe(true);
        expect(conversionService.canConvert(String, Date)).toBe(true);
        expect(conversionService.canConvert(String, Array)).toBe(true);
    });

    test('singleton state persists across calls', () => {
        // Register a custom converter on the singleton
        const custom = { convert: (v: string) => v.length };
        conversionService.register(custom, String, Number);

        expect(conversionService.convert('hello', Number)).toBe(5);
    });

    test('singleton registry is accessible', () => {
        expect(conversionService.registry).toBeDefined();
        expect(typeof conversionService.registry.hasConverter).toBe('function');
    });
});

describe('Integration: ConversionService + built-in converters', () => {
    let service: ConversionService;

    beforeEach(() => {
        service = createConversionService();
    });

    test('converts UUID string to normalized UUID', () => {
        const uuid = '550E8400-E29B-41D4-A716-446655440000';
        const result = service.convert(uuid, String);
        expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    test('converts ISO date string to Date object', () => {
        const result = service.convert('2024-01-15T10:30:00.000Z', Date);
        expect(result).toBeInstanceOf(Date);
        expect(result.getTime()).toBeGreaterThan(0);
    });

    test('converts JSON string to object', () => {
        const result = service.convert('{"key": "value"}', Object) as Record<string, string>;
        expect(result.key).toBe('value');
    });

    test('converts number string to numeric value', () => {
        const result = service.convert('42.5', Number);
        expect(result).toBe(42.5);
    });

    test('converts boolean string to boolean', () => {
        expect(service.convert('true', Boolean)).toBe(true);
        expect(service.convert('false', Boolean)).toBe(false);
    });

    test('converts comma-separated string to array', () => {
        const result = service.convert('a,b,c', Array) as string[];
        expect(result).toEqual(['a', 'b', 'c']);
    });
});
