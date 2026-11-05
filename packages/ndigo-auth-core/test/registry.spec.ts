/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { AuthRegistry } from '../src/registry';
import { AuthAdapter } from '../src/adapter';

function createMockAdapter(id: string): AuthAdapter {
    return {
        id,
        validate: async () => null,
        authenticate: async () => ({ principal: null, token: null, expiresAt: null }),
        refresh: async () => ({ principal: null, token: null, expiresAt: null }),
        logout: async () => {},
    };
}

describe('AuthRegistry', () => {
    beforeEach(() => {
        AuthRegistry.clear();
    });

    test('starts with no adapters', () => {
        expect(AuthRegistry.getAllAdapters()).toEqual([]);
    });

    test('register adds an adapter', () => {
        const adapter = createMockAdapter('test');
        AuthRegistry.register(adapter);
        expect(AuthRegistry.getAllAdapters()).toHaveLength(1);
    });

    test('getAdapter returns the registered adapter', () => {
        const adapter = createMockAdapter('test');
        AuthRegistry.register(adapter);
        expect(AuthRegistry.getAdapter('test')).toBe(adapter);
    });

    test('getAdapter returns undefined for unregistered adapter', () => {
        expect(AuthRegistry.getAdapter('nonexistent')).toBeUndefined();
    });

    test('register overwrites adapter with same id', () => {
        const adapter1 = createMockAdapter('test');
        const adapter2 = createMockAdapter('test');
        AuthRegistry.register(adapter1);
        AuthRegistry.register(adapter2);
        expect(AuthRegistry.getAdapter('test')).toBe(adapter2);
        expect(AuthRegistry.getAllAdapters()).toHaveLength(1);
    });

    test('register multiple adapters with different ids', () => {
        const adapter1 = createMockAdapter('oidc');
        const adapter2 = createMockAdapter('jwt');
        AuthRegistry.register(adapter1);
        AuthRegistry.register(adapter2);
        expect(AuthRegistry.getAllAdapters()).toHaveLength(2);
        expect(AuthRegistry.getAdapter('oidc')).toBe(adapter1);
        expect(AuthRegistry.getAdapter('jwt')).toBe(adapter2);
    });

    test('clear removes all adapters', () => {
        AuthRegistry.register(createMockAdapter('a'));
        AuthRegistry.register(createMockAdapter('b'));
        AuthRegistry.clear();
        expect(AuthRegistry.getAllAdapters()).toEqual([]);
        expect(AuthRegistry.getAdapter('a')).toBeUndefined();
    });

    test('getAllAdapters returns adapters in insertion order', () => {
        const adapter1 = createMockAdapter('first');
        const adapter2 = createMockAdapter('second');
        AuthRegistry.register(adapter1);
        AuthRegistry.register(adapter2);
        const adapters = AuthRegistry.getAllAdapters();
        expect(adapters[0]).toBe(adapter1);
        expect(adapters[1]).toBe(adapter2);
    });
});
