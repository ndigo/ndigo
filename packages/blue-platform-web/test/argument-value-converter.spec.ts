/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { Route } from '@blue/router';
import {
    MethodParameter,
    MethodParameterType,
    argumentValueConverters,
    createOptionalConverter,
    createStringSplitConverter,
    resolveConverter,
    toBooleanValue,
    toDateValue,
    toJSONStringValue,
    toNumberValue,
    ArgumentValueConversionContext,
} from '@blue/dispatcher';
import { conversionService } from '@blue/core';

/** Context is never read by the built-in converters under test. */
const noContext = (): ArgumentValueConversionContext => ({
    name: 'value',
    parameter: new MethodParameter(MethodParameterType.QUERY, 'value'),
    route: {} as unknown as Route,
    mapping: undefined,
});

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

        expect(converter('a,b,c', noContext())).toEqual(['a', 'b', 'c']);
    });

    test('createOptionalConverter skips nullish values', () => {
        const converter = createOptionalConverter((value) => Number(value));

        expect(converter(null, noContext())).toBeNull();
        expect(converter(undefined, noContext())).toBeUndefined();
        expect(converter('10', noContext())).toBe(10);
    });

    test('argumentValueConverters registry exposes built-ins', () => {
        expect(argumentValueConverters.number('42', noContext())).toBe(42);
        expect(argumentValueConverters.boolean('true', noContext())).toBe(true);
        expect(argumentValueConverters.identity('x', noContext())).toBe('x');
    });

    test('resolveConverter returns identity converter when no convertType', () => {
        const converter = resolveConverter(undefined);
        expect(converter('anything', noContext())).toBe('anything');
    });

    test('resolveConverter uses ConversionService for type-based conversion', () => {
        const converter = resolveConverter({ source: String, target: Number });

        expect(converter('42', noContext())).toBe(42);
    });

    test('resolveConverter supports UUID conversion via ConversionService', () => {
        const converter = resolveConverter({ source: String, target: String });

        // UUID converter normalizes to lowercase
        expect(converter('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', noContext())).toBe(
            'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
        );
    });

    test('resolveConverter supports boolean conversion via ConversionService', () => {
        const converter = resolveConverter({ source: String, target: Boolean });

        expect(converter('true', noContext())).toBe(true);
        expect(converter('false', noContext())).toBe(false);
    });

    test('resolveConverter supports date conversion via ConversionService', () => {
        const converter = resolveConverter({ source: String, target: Date });

        const result = converter('2024-01-15T10:30:00.000Z', noContext());
        expect(result).toBeInstanceOf(Date);
    });

    test('resolveConverter supports JSON conversion via ConversionService', () => {
        const converter = resolveConverter({ source: String, target: Object });

        expect(converter('{"key":"value"}', noContext())).toEqual({ key: 'value' });
    });

    test('resolveConverter supports array conversion via ConversionService', () => {
        const converter = resolveConverter({ source: String, target: Array });

        expect(converter('one,two,three', noContext())).toEqual(['one', 'two', 'three']);
    });

    test('resolveConverter throws on invalid conversion', () => {
        const converter = resolveConverter({ source: String, target: Boolean });

        expect(() => converter('invalid', noContext())).toThrow(TypeError);
    });
});
