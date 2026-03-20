import { afterEach, describe, expect, test } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { MethodParameter, MethodParameterType, ParameterConversionError } from '@blue/dispatcher';
import { configureStrictBrowserArgumentResolvers } from '../src/configure-strict-argument-resolvers';
import { argumentValueConverters } from '../src/argument-value-converter';

describe('configureStrictBrowserArgumentResolvers', () => {
    const originalHistory = globalThis.history;

    afterEach(() => {
        Object.defineProperty(globalThis, 'history', {
            configurable: true,
            writable: true,
            value: originalHistory,
        });
    });

    test('enforces strict named converter lookup by default', () => {
        const context = new GenericApplicationContext('test');
        const resolvers = configureStrictBrowserArgumentResolvers(context);
        const stateResolver = resolvers[3];

        Object.defineProperty(globalThis, 'history', {
            configurable: true,
            writable: true,
            value: { state: { token: '77' } },
        });

        const parameter = new MethodParameter(MethodParameterType.STATE, 'token', false, null, 'missingConverter');

        expect(() => stateResolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any)).toThrow(
            ParameterConversionError
        );
    });

    test('registers converter registry when provided', () => {
        const context = new GenericApplicationContext('test');

        configureStrictBrowserArgumentResolvers(context, {
            registerConverterRegistry: {
                toInt: argumentValueConverters.number,
            },
            state: 'toInt',
        });

        expect(context.hasValue('argumentValueConverterRegistry')).toBe(true);
    });

    test('uses registered converter registry in strict mode', () => {
        const context = new GenericApplicationContext('test');
        const resolvers = configureStrictBrowserArgumentResolvers(context, {
            registerConverterRegistry: {
                toInt: argumentValueConverters.number,
            },
            state: 'toInt',
        });

        Object.defineProperty(globalThis, 'history', {
            configurable: true,
            writable: true,
            value: { state: { token: '88' } },
        });

        const stateResolver = resolvers[3];
        const parameter = new MethodParameter(MethodParameterType.STATE, 'token');
        const value = stateResolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);

        expect(value).toBe(88);
    });
});
