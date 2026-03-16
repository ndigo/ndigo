import { describe, expect, test, vi } from 'vitest';
import { MethodParameter, MethodParameterType, ParameterConversionError } from '@blue/dispatcher';
import { BrowserCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';
import Cookies from '../src/cookies';

describe('resolver conversion errors', () => {
    test('wraps converter failures in ParameterConversionError', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue('not-a-number');

        const resolver = new BrowserCookieValueMethodArgumentResolver(() => {
            throw new TypeError('conversion failed');
        });

        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'amount', true);

        expect(() => resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any)).toThrow(
            ParameterConversionError
        );

        try {
            resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);
        } catch (error) {
            const conversionError = error as ParameterConversionError;

            expect(conversionError.parameterName).toBe('amount');
            expect(conversionError.parameterType).toBe('cookie:value');
            expect(conversionError.cause).toBeInstanceOf(TypeError);
        }
    });
});
