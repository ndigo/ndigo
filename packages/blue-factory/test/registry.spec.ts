/**
 * @module blue-factory
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { likeRegistry, RegistryProxyHandler, Registry } from '../src/registry';

const createMockRegistry = () => {
    const store = new Map<string, unknown>();

    return {
        destroyValue: vi.fn((name: string) => {
            store.delete(name);
        }),
        getValue: vi.fn((name: string) => store.get(name)),
        hasValue: vi.fn((name: string) => store.has(name)),
        setValue: vi.fn((name: string, value: unknown) => {
            store.set(name, value);
        }),
    };
};

describe('likeRegistry', () => {
    test('it should return true for objects implementing Registry interface', () => {
        const registry = {
            destroyValue: () => undefined,
            getValue: () => undefined,
            hasValue: () => false,
            setValue: () => undefined,
        };

        expect(likeRegistry(registry)).toBe(true);
    });

    test('it should return false for incomplete objects', () => {
        const registry = {
            destroyValue: () => undefined,
            getValue: () => undefined,
            hasValue: () => false,
        };

        expect(likeRegistry(registry)).toBe(false);
    });

    test('it should return false for non-objects', () => {
        expect(likeRegistry(null)).toBe(false);
        expect(likeRegistry('str')).toBe(false);
    });
});

describe('RegistryProxyHandler', () => {
    let registry: ReturnType<typeof createMockRegistry>;
    let proxy: Registry;

    beforeEach(() => {
        registry = createMockRegistry();
        proxy = new Proxy(registry as unknown as Registry, new RegistryProxyHandler<Registry>());
    });

    test('it should proxy get to getValue', () => {
        Reflect.get(proxy, 'foo');

        expect(registry.getValue).toHaveBeenCalledWith('foo');
    });

    test('it should proxy set to setValue', () => {
        const result = Reflect.set(proxy, 'foo', 'bar');

        expect(result).toBe(true);
        expect(registry.setValue).toHaveBeenCalledWith('foo', 'bar');
    });

    test('it should proxy has to hasValue', () => {
        const result = 'foo' in proxy;

        expect(result).toBe(false);
        expect(registry.hasValue).toHaveBeenCalledWith('foo');
    });

    test('it should proxy deleteProperty to destroyValue', () => {
        const result = Reflect.deleteProperty(proxy, 'foo');

        expect(result).toBe(true);
        expect(registry.destroyValue).toHaveBeenCalledWith('foo');
    });

    test('it should return false from set when setValue throws', () => {
        registry.setValue.mockImplementation(() => {
            throw new Error('boom');
        });

        const result = Reflect.set(proxy, 'foo', 'bar');

        expect(result).toBe(false);
    });

    test('it should return false from deleteProperty when destroyValue throws', () => {
        registry.destroyValue.mockImplementation(() => {
            throw new Error('boom');
        });

        const result = Reflect.deleteProperty(proxy, 'foo');

        expect(result).toBe(false);
    });
});
