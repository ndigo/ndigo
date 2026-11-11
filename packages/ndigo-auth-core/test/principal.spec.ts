/**
 */
import { describe, test, expect } from 'vitest';
import { Principal, AnonymousPrincipal, DefaultPrincipal, likePrincipal } from '../src/principal';

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

    test('has empty scopes array', () => {
        const subject = new AnonymousPrincipal();
        expect(subject.scopes).toEqual([]);
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

    test('hasScope returns false for any scope', () => {
        const subject = new AnonymousPrincipal();
        expect(subject.hasScope('tools.read')).toBe(false);
    });

    test('hasAnyScope returns false for any scopes', () => {
        const subject = new AnonymousPrincipal();
        expect(subject.hasAnyScope('tools.read')).toBe(false);
        expect(subject.hasAnyScope('tools.read', 'tools.write')).toBe(false);
    });
});

describe('DefaultPrincipal', () => {
    test('exposes scopes and scope predicates', () => {
        const subject = new DefaultPrincipal('1', 'Test User', ['user'], ['tools.read', 'tools.write']);

        expect(subject.scopes).toEqual(['tools.read', 'tools.write']);
        expect(subject.hasScope('tools.read')).toBe(true);
        expect(subject.hasScope('tools.admin')).toBe(false);
        expect(subject.hasAnyScope('tools.admin', 'tools.write')).toBe(true);
        expect(subject.hasAnyScope('tools.admin')).toBe(false);
    });
});

describe('likePrincipal', () => {
    test('returns true for AnonymousPrincipal', () => {
        expect(likePrincipal(new AnonymousPrincipal())).toBe(true);
    });

    test('returns true for object with id, name, roles, scopes', () => {
        const principal: Principal = {
            id: '1',
            name: 'Test User',
            roles: ['admin'],
            scopes: ['tools.read'],
            hasRole: () => true,
            hasAnyRole: () => false,
            hasScope: () => true,
            hasAnyScope: () => false,
        };
        expect(likePrincipal(principal)).toBe(true);
    });

    test('returns false for null', () => {
        expect(likePrincipal(null)).toBe(false);
    });

    test('returns false for undefined', () => {
        expect(likePrincipal(undefined)).toBe(false);
    });

    test('returns false for primitive values', () => {
        expect(likePrincipal('string')).toBe(false);
        expect(likePrincipal(123)).toBe(false);
        expect(likePrincipal(true)).toBe(false);
    });

    test('returns false for object missing id', () => {
        expect(likePrincipal({ name: 'Test', roles: [] })).toBe(false);
    });

    test('returns false for object missing name', () => {
        expect(likePrincipal({ id: '1', roles: [] })).toBe(false);
    });

    test('returns false for object missing roles', () => {
        expect(likePrincipal({ id: '1', name: 'Test' })).toBe(false);
    });

    test('returns false for object missing scopes', () => {
        expect(likePrincipal({ id: '1', name: 'Test', roles: [] })).toBe(false);
    });

    test('returns false for empty object', () => {
        expect(likePrincipal({})).toBe(false);
    });
});
