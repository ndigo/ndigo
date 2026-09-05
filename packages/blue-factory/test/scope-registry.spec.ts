import { describe, test, expect, beforeEach, vi } from 'vitest';
import { IllegalStateError } from '@blue/core';
import ScopeRegistry from '../src/_scope-registry';

describe('ScopeRegistry', () => {
    let registry: ScopeRegistry;

    beforeEach(() => {
        registry = new ScopeRegistry();
    });

    describe('registerScope + getScope', () => {
        test('it should register and retrieve a scope', () => {
            const scope = {
                destroyValue: vi.fn(),
                getValue: vi.fn(),
            };

            registry.registerScope('singleton', scope);

            expect(registry.getScope('singleton')).toBe(scope);
        });

        test('it should not overwrite an existing scope', () => {
            const scopeA = {
                destroyValue: vi.fn(),
                getValue: vi.fn(),
            };
            const scopeB = {
                destroyValue: vi.fn(),
                getValue: vi.fn(),
            };

            registry.registerScope('singleton', scopeA);
            registry.registerScope('singleton', scopeB);

            expect(registry.getScope('singleton')).toBe(scopeA);
        });
    });

    describe('getScopeNames', () => {
        test('it should return empty array when no scopes registered', () => {
            expect(registry.getScopeNames()).toEqual([]);
        });

        test('it should return all registered scope names', () => {
            const scope = {
                destroyValue: vi.fn(),
                getValue: vi.fn(),
            };

            registry.registerScope('singleton', scope);
            registry.registerScope('prototype', scope);

            expect(registry.getScopeNames()).toEqual(['singleton', 'prototype']);
        });
    });

    describe('getScope error', () => {
        test('it should throw IllegalStateError for unregistered scope', () => {
            expect(() => registry.getScope('unknown')).toThrow(IllegalStateError);
        });
    });

    describe('destroyScopedValue', () => {
        test('it should delegate destroyValue to the correct scope', () => {
            const scope = {
                destroyValue: vi.fn(),
                getValue: vi.fn(),
            };

            registry.registerScope('singleton', scope);

            registry.destroyScopedValue('singleton', 'widget');

            expect(scope.destroyValue).toHaveBeenCalledWith('widget');
        });

        test('it should throw IllegalStateError for unregistered scope', () => {
            expect(() => registry.destroyScopedValue('unknown', 'foo')).toThrow(IllegalStateError);
        });
    });
});
