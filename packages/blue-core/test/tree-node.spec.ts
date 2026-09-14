/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { direct, escalate, indexOf } from '../src/tree-node';

describe('direct', () => {
    const tree = { children: [{ children: [] }, { children: [] }] };
    let directSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        directSpy = vi.fn();
    });

    afterEach(() => {
        directSpy = undefined as unknown as ReturnType<typeof vi.fn>;
    });

    test('it should exclude the root node by default', () => {
        direct(tree, directSpy);
        expect(directSpy).toHaveBeenCalledTimes(2);
    });

    test('it should include the root node', () => {
        direct(tree, directSpy, true);
        expect(directSpy).toHaveBeenCalledTimes(3);
    });
});

describe('escalate', () => {
    const tree = { parent: { parent: { parent: null } } };
    let escalateSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        escalateSpy = vi.fn();
    });

    afterEach(() => {
        escalateSpy = undefined as unknown as ReturnType<typeof vi.fn>;
    });

    test('it should exclude the root node by default', () => {
        escalate(tree, escalateSpy);
        expect(escalateSpy).toHaveBeenCalledTimes(2);
    });

    test('it should include the root node', () => {
        escalate(tree, escalateSpy, true);
        expect(escalateSpy).toHaveBeenCalledTimes(3);
    });
});

describe('indexOf', () => {
    const child = { children: [] };
    const tree = { children: [{ children: [] }, { children: [] }, child] };

    test('it should return the index of', () => {
        expect(indexOf(tree.children, child)).toBe(2);
    });
});
