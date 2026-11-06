/**
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MissingParameterError, MethodParameter, MethodParameterType } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { BrowserHistoryStateValueMethodArgumentResolver } from '../src/history-state-argument-resolver';

describe('BrowserHistoryStateValueMethodArgumentResolver', () => {
    let resolver: BrowserHistoryStateValueMethodArgumentResolver;
    const originalHistory = globalThis.history;

    beforeEach(() => {
        resolver = new BrowserHistoryStateValueMethodArgumentResolver();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalHistory) {
            vi.stubGlobal('history', originalHistory);
        }
    });

    test('supports history-state parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.HISTORY_STATE, 'token');

        expect(resolver.supportsParameter(parameter)).toBe(true);
    });

    test('does not support non-history-state parameters', () => {
        const parameter = new MethodParameter(MethodParameterType.QUERY, 'token');

        expect(resolver.supportsParameter(parameter)).toBe(false);
    });

    test('resolves values from browser history state', () => {
        vi.stubGlobal('history', { state: { token: 'abc-123' } });

        const parameter = new MethodParameter(MethodParameterType.HISTORY_STATE, 'token');
        const value = resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {});

        expect(value).toBe('abc-123');
    });

    test('historyStateValue() with no name binds the whole history.state', () => {
        vi.stubGlobal('history', { state: { token: 'abc-123', count: 2 } });

        const parameter = new MethodParameter(MethodParameterType.HISTORY_STATE, '');
        const value = resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {});

        expect(value).toEqual({ token: 'abc-123', count: 2 });
    });

    test('resolves dotted keys by walking history.state (nested-capable, D-2)', () => {
        vi.stubGlobal('history', { state: { user: { name: 'Jeff' } } });

        const parameter = new MethodParameter(MethodParameterType.HISTORY_STATE, 'user.name');
        const value = resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {});

        expect(value).toBe('Jeff');
    });

    test('uses default value when state value is absent', () => {
        vi.stubGlobal('history', { state: {} });

        const parameter = new MethodParameter(MethodParameterType.HISTORY_STATE, 'token', false, 'fallback');
        const value = resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {});

        expect(value).toBe('fallback');
    });

    test('throws when required state value is absent', () => {
        vi.stubGlobal('history', { state: {} });

        const parameter = new MethodParameter(MethodParameterType.HISTORY_STATE, 'token', true);

        expect(() => resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {})).toThrow(
            /parameter 'token' is missing/
        );
    });

    test('applies type-based conversion when convertType is provided', () => {
        vi.stubGlobal('history', { state: { count: '42' } });

        const parameter = new MethodParameter(MethodParameterType.HISTORY_STATE, 'count', false, null, {
            source: String,
            target: Number,
        });
        const value = resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {});

        expect(value).toBe(42);
    });

    test('applies boolean conversion when convertType is provided', () => {
        vi.stubGlobal('history', { state: { active: 'true' } });

        const parameter = new MethodParameter(MethodParameterType.HISTORY_STATE, 'active', false, null, {
            source: String,
            target: Boolean,
        });
        const value = resolver.resolveArgument(parameter, { data: {} } as unknown as Route, {});

        expect(value).toBe(true);
    });
});
