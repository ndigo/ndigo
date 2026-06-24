import { describe, test, expect } from 'vitest';
import {
    Principal,
    AnonymousPrincipal,
    isPrincipal,
} from '../src/principal';

describe('AnonymousPrincipal', () => {
    test('has correct default id', () => {
        const subject = new AnonymousPrincipal();
        expect(subject.id).toBe('anonymous');
    });

    test('has correct default name', () => {
        const subject = new AnonymousPrincipal();
        expect(subject.name).toBe('Anonymous');
    });

    test('has empty roles array', () => {
        const subject = new AnonymousPrincipal();
        expect(subject.roles).toEqual([]);
    });

    test('hasRole returns false for any role', () => {
        const subject = new AnonymousPrincipal();
        expect(subject.hasRole('admin')).toBe(false);
        expect(subject.hasRole('user')).toBe(false);
    });

    test('hasAnyRole returns false for any roles', () => {
        const subject = new AnonymousPrincipal();
        expect(subject.hasAnyRole('admin')).toBe(false);
        expect(subject.hasAnyRole('admin', 'user')).toBe(false);
    });
});

describe('isPrincipal', () => {
    test('returns true for AnonymousPrincipal', () => {
        expect(isPrincipal(new AnonymousPrincipal())).toBe(true);
    });

    test('returns true for object with id, name, roles', () => {
        const principal: Principal = {
            id: '1',
            name: 'Test User',
            roles: ['admin'],
            hasRole: () => true,
            hasAnyRole: () => false,
        };
        expect(isPrincipal(principal)).toBe(true);
    });

    test('returns false for null', () => {
        expect(isPrincipal(null)).toBe(false);
    });

    test('returns false for undefined', () => {
        expect(isPrincipal(undefined)).toBe(false);
    });

    test('returns false for primitive values', () => {
        expect(isPrincipal('string')).toBe(false);
        expect(isPrincipal(123)).toBe(false);
        expect(isPrincipal(true)).toBe(false);
    });

    test('returns false for object missing id', () => {
        expect(
            isPrincipal({ name: 'Test', roles: [] }),
        ).toBe(false);
    });

    test('returns false for object missing name', () => {
        expect(
            isPrincipal({ id: '1', roles: [] }),
        ).toBe(false);
    });

    test('returns false for object missing roles', () => {
        expect(
            isPrincipal({ id: '1', name: 'Test' }),
        ).toBe(false);
    });

    test('returns false for empty object', () => {
        expect(isPrincipal({})).toBe(false);
    });
});
