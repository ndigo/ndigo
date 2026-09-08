/**
 * Integration tests for the full conversion pipeline:
 * ParameterExtractor → resolveConverter() → ConversionService → actual conversion
 */

import { describe, test, expect } from 'vitest';
import { conversionService } from '@blue/core';
import {
    queryValue,
    pathVariable,
    asUUID,
    asNumber,
    asBoolean,
    asDate,
    asJson,
    asArray,
    withConversion,
    MethodParameter,
    MethodParameterType,
} from '@blue/dispatcher';
import { resolveConverter, ArgumentValueConversionContext } from '@blue/platform-web';

describe('Conversion Pipeline Integration', () => {
    describe('ParameterExtractor → resolveConverter() → ConversionService', () => {
        test('asUUID() wrapper produces correct convertType', () => {
            const extractor = asUUID(pathVariable('userId'));
            expect(extractor.convertType).toEqual({ source: String, target: String });
        });

        test('asNumber() wrapper produces correct convertType', () => {
            const extractor = asNumber(queryValue('count'));
            expect(extractor.convertType).toEqual({ source: String, target: Number });
        });

        test('asBoolean() wrapper produces correct convertType', () => {
            const extractor = asBoolean(queryValue('active'));
            expect(extractor.convertType).toEqual({ source: String, target: Boolean });
        });

        test('asDate() wrapper produces correct convertType', () => {
            const extractor = asDate(queryValue('createdAt'));
            expect(extractor.convertType).toEqual({ source: String, target: Date });
        });

        test('asJson() wrapper produces correct convertType', () => {
            const extractor = asJson(queryValue('data'));
            expect(extractor.convertType).toEqual({ source: String, target: Object });
        });

        test('asArray() wrapper produces correct convertType', () => {
            const extractor = asArray(queryValue('tags'));
            expect(extractor.convertType).toEqual({ source: String, target: Array });
        });

        test('withConversion() sets custom convertType', () => {
            const extractor = withConversion(queryValue('id'), { source: String, target: Number });
            expect(extractor.convertType).toEqual({ source: String, target: Number });
        });
    });

    describe('MethodParameter → convertType propagation', () => {
        test('MethodParameter preserves convertType', () => {
            const extractor = asUUID(pathVariable('userId'));
            const parameter = new MethodParameter(
                extractor.type,
                extractor.name,
                extractor.required,
                extractor.defaultValue,
                extractor.convertType,
                extractor.prefix
            );
            expect(parameter.convertType).toEqual({ source: String, target: String });
        });

        test('resolveConverter receives convertType from MethodParameter', () => {
            const extractor = asNumber(queryValue('count'));
            const parameter = new MethodParameter(
                extractor.type,
                extractor.name,
                extractor.required,
                extractor.defaultValue,
                extractor.convertType
            );

            // resolveConverter should find the Number converter via ConversionService
            const converter = resolveConverter(parameter.convertType);
            expect(converter).toBeDefined();
            expect(typeof converter).toBe('function');
        });
    });

    describe('End-to-end conversion through resolveConverter', () => {
        test('converts UUID string via ConversionService', () => {
            const parameter = new MethodParameter(MethodParameterType.PATH, 'id', false, null, {
                source: String,
                target: String,
            });

            const converter = resolveConverter(parameter.convertType);
            const context: ArgumentValueConversionContext = {
                name: 'id',
                parameter,
                route: {} as any,
                mapping: {} as any,
            };

            const result = converter('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', context);
            expect(result).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        });

        test('converts number string via ConversionService', () => {
            const parameter = new MethodParameter(MethodParameterType.QUERY, 'count', false, null, {
                source: String,
                target: Number,
            });

            const converter = resolveConverter(parameter.convertType);
            const context: ArgumentValueConversionContext = {
                name: 'count',
                parameter,
                route: {} as any,
                mapping: {} as any,
            };

            const result = converter('42', context);
            expect(result).toBe(42);
        });

        test('converts boolean string via ConversionService', () => {
            const parameter = new MethodParameter(MethodParameterType.QUERY, 'active', false, null, {
                source: String,
                target: Boolean,
            });

            const converter = resolveConverter(parameter.convertType);
            const context: ArgumentValueConversionContext = {
                name: 'active',
                parameter,
                route: {} as any,
                mapping: {} as any,
            };

            const resultTrue = converter('true', context);
            expect(resultTrue).toBe(true);

            const resultFalse = converter('false', context);
            expect(resultFalse).toBe(false);
        });

        test('converts date string via ConversionService', () => {
            const parameter = new MethodParameter(MethodParameterType.QUERY, 'createdAt', false, null, {
                source: String,
                target: Date,
            });

            const converter = resolveConverter(parameter.convertType);
            const context: ArgumentValueConversionContext = {
                name: 'createdAt',
                parameter,
                route: {} as any,
                mapping: {} as any,
            };

            const result = converter('2024-01-15T10:30:00.000Z', context);
            expect(result).toBeInstanceOf(Date);
        });

        test('converts JSON string via ConversionService', () => {
            const parameter = new MethodParameter(MethodParameterType.QUERY, 'data', false, null, {
                source: String,
                target: Object,
            });

            const converter = resolveConverter(parameter.convertType);
            const context: ArgumentValueConversionContext = {
                name: 'data',
                parameter,
                route: {} as any,
                mapping: {} as any,
            };

            const result = converter('{"key":"value"}', context);
            expect(result).toEqual({ key: 'value' });
        });

        test('converts array string via ConversionService', () => {
            const parameter = new MethodParameter(MethodParameterType.QUERY, 'tags', false, null, {
                source: String,
                target: Array,
            });

            const converter = resolveConverter(parameter.convertType);
            const context: ArgumentValueConversionContext = {
                name: 'tags',
                parameter,
                route: {} as any,
                mapping: {} as any,
            };

            const result = converter('one,two,three', context);
            expect(result).toEqual(['one', 'two', 'three']);
        });
    });

    describe('Custom converters via ConversionService', () => {
        test('can register and use custom converter', () => {
            // Register a hex converter on top of built-ins
            conversionService.registry.register({ convert: (v: string) => parseInt(v, 16) }, String, Number);

            const parameter = new MethodParameter(MethodParameterType.QUERY, 'hex', false, null, {
                source: String,
                target: Number,
            });

            const converter = resolveConverter(parameter.convertType);
            const context: ArgumentValueConversionContext = {
                name: 'hex',
                parameter,
                route: {} as any,
                mapping: {} as any,
            };

            const result = converter('ff', context);
            expect(result).toBe(255);
        });
    });

    describe('Error handling', () => {
        test('throws on invalid UUID format', () => {
            const parameter = new MethodParameter(MethodParameterType.PATH, 'id', false, null, {
                source: String,
                target: String,
            });

            const converter = resolveConverter(parameter.convertType);
            const context: ArgumentValueConversionContext = {
                name: 'id',
                parameter,
                route: {} as any,
                mapping: {} as any,
            };

            expect(() => converter('not-a-uuid', context)).toThrow(TypeError);
        });

        test('throws on invalid boolean string', () => {
            const parameter = new MethodParameter(MethodParameterType.QUERY, 'flag', false, null, {
                source: String,
                target: Boolean,
            });

            const converter = resolveConverter(parameter.convertType);
            const context: ArgumentValueConversionContext = {
                name: 'flag',
                parameter,
                route: {} as any,
                mapping: {} as any,
            };

            expect(() => converter('maybe', context)).toThrow(TypeError);
        });

        test('throws on invalid JSON', () => {
            const parameter = new MethodParameter(MethodParameterType.QUERY, 'json', false, null, {
                source: String,
                target: Object,
            });

            const converter = resolveConverter(parameter.convertType);
            const context: ArgumentValueConversionContext = {
                name: 'json',
                parameter,
                route: {} as any,
                mapping: {} as any,
            };

            expect(() => converter('{invalid}', context)).toThrow(TypeError);
        });
    });

    describe('Singleton conversionService is used by default', () => {
        test('built-in converters are available on singleton', () => {
            expect(conversionService.canConvert(String, Number)).toBe(true);
            expect(conversionService.canConvert(String, Boolean)).toBe(true);
            expect(conversionService.canConvert(String, Date)).toBe(true);
            expect(conversionService.canConvert(String, Array)).toBe(true);
        });
    });
});
