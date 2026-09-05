import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { BrowserStateValueMethodArgumentResolver } from '../src/state-argument-resolver';

describe('BrowserStateValueMethodArgumentResolver', () => {
    let resolver: BrowserStateValueMethodArgumentResolver;
    const originalHistory = globalThis.history;

    beforeEach(() => {
        resolver = new BrowserStateValueMethodArgumentResolver();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalHistory) {
            vi.stubGlobal('history', originalHistory);
        }
    });

    test('supports state parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.STATE, 'token');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('does not support non-state parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'token');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('resolves values from browser history state', () => {
        vi.stubGlobal('history', { state: { token: 'abc-123' } });

        const parameter = new MethodParameter(MethodParameterType.STATE, 'token');
        const value = resolver.resolveArgument(parameter, { data: {} } as any, {} as any);

        expect(value).toBe('abc-123');
    });

    test('uses default value when state value is absent', () => {
        vi.stubGlobal('history', { state: {} });

        const parameter = new MethodParameter(MethodParameterType.STATE, 'token', false, 'fallback');
        const value = resolver.resolveArgument(parameter, { data: {} } as any, {} as any);

        expect(value).toBe('fallback');
    });

    test('throws when required state value is absent', () => {
        vi.stubGlobal('history', { state: {} });

        const parameter = new MethodParameter(MethodParameterType.STATE, 'token', true);

        expect(() => resolver.resolveArgument(parameter, { data: {} } as any, {} as any)).toThrow(
            '"token" cannot be undefined or null'
        );
    });

    test('applies type-based conversion when convertType is provided', () => {
        vi.stubGlobal('history', { state: { count: '42' } });

        const parameter = new MethodParameter(MethodParameterType.STATE, 'count', false, null, {
            source: String,
            target: Number,
        });
        const value = resolver.resolveArgument(parameter, { data: {} } as any, {} as any);

        expect(value).toBe(42);
    });

    test('applies boolean conversion when convertType is provided', () => {
        vi.stubGlobal('history', { state: { active: 'true' } });

        const parameter = new MethodParameter(MethodParameterType.STATE, 'active', false, null, {
            source: String,
            target: Boolean,
        });
        const value = resolver.resolveArgument(parameter, { data: {} } as any, {} as any);

        expect(value).toBe(true);
    });
});
