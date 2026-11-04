/**
 * @module ndigo-jobs
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { DEFAULT_MAX_ATTEMPTS, parseJobPayload, resolveJobRequest, serializeJobPayload } from '../src/request';

const NOW = Date.parse('2026-10-07T10:00:00.000Z');

describe('resolveJobRequest', () => {
    test('resolves defaults: runAt is now, maxAttempts is the default', () => {
        const resolved = resolveJobRequest({ type: 'email.send' }, NOW);

        expect(resolved.runAt).toBe(NOW);
        expect(resolved.maxAttempts).toBe(DEFAULT_MAX_ATTEMPTS);
        expect(resolved.timeoutMs).toBeUndefined();
    });

    test('delayMs resolves to now + delay', () => {
        expect(resolveJobRequest({ type: 'a', delayMs: 5000 }, NOW).runAt).toBe(NOW + 5000);
    });

    test('explicit runAt and options pass through', () => {
        const resolved = resolveJobRequest({ type: 'a', runAt: NOW + 1, maxAttempts: 7, timeoutMs: 250 }, NOW);

        expect(resolved.runAt).toBe(NOW + 1);
        expect(resolved.maxAttempts).toBe(7);
        expect(resolved.timeoutMs).toBe(250);
    });

    test.each([
        ['a non-object request', 'nope'],
        ['an empty type', { type: '  ' }],
        ['delayMs together with runAt', { type: 'a', delayMs: 1, runAt: NOW }],
        ['a negative delayMs', { type: 'a', delayMs: -1 }],
        ['a non-finite runAt', { type: 'a', runAt: Number.POSITIVE_INFINITY }],
        ['a zero maxAttempts', { type: 'a', maxAttempts: 0 }],
        ['a fractional maxAttempts', { type: 'a', maxAttempts: 1.5 }],
        ['a zero timeoutMs', { type: 'a', timeoutMs: 0 }],
    ])('rejects %s', (_label, request) => {
        expect(() => resolveJobRequest(request as never, NOW)).toThrow(TypeError);
    });
});

describe('payload serialization', () => {
    test('round-trips JSON values', () => {
        const payload = { to: 'a@b.c', items: [1, 2, { deep: true }], note: null };

        expect(parseJobPayload(serializeJobPayload(payload))).toEqual(payload);
    });

    test('undefined serializes to null', () => {
        expect(serializeJobPayload(undefined)).toBe('null');
    });

    test('rejects undefined MEMBERS — JSON.stringify would drop them silently (AD72-H3)', () => {
        expect(() => serializeJobPayload({ a: 1, b: undefined })).toThrow(
            /member must not be undefined — JSON would drop it silently; use null/
        );
        expect(() => serializeJobPayload([1, undefined, 3])).toThrow(
            /member must not be undefined — JSON would drop it silently; use null/
        );
    });

    test.each([
        ['a function', { callback: () => undefined }],
        ['a symbol', { token: Symbol('x') }],
        ['a bigint', { count: 10n }],
    ])('rejects %s', (_label, payload) => {
        expect(() => serializeJobPayload(payload)).toThrow(/JSON-serializable/);
    });

    test('rejects circular structures', () => {
        const payload: Record<string, unknown> = {};
        payload['self'] = payload;

        expect(() => serializeJobPayload(payload)).toThrow(TypeError);
    });

    test('parseJobPayload fails loud on invalid JSON', () => {
        expect(() => parseJobPayload('{oops')).toThrow(/not valid JSON/);
    });
});
