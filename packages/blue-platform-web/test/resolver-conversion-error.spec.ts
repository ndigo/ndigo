import { describe, expect, test, vi } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { BrowserCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';

describe('resolver conversion errors', () => {
    test('resolves cookie values with type-based conversion', () => {
        vi.stubGlobal('document', { cookie: 'count=42' });

        const resolver = new BrowserCookieValueMethodArgumentResolver();
        const parameter = new MethodParameter(MethodParameterType.COOKIE, 'count', false, null, {
            source: String,
            target: Number,
        });

        const value = resolver.resolveArgument(parameter, { data: {}, params: null } as any, {} as any);
        expect(value).toBe(42);
    });
});
