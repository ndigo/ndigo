import { describe, expect, it, vi } from 'vitest';

import { StaticModel } from '../src/static-model';

describe('StaticModel', () => {
    it('returns the value passed to the constructor', () => {
        const model = new StaticModel('value');

        expect(model.get()).toBe('value');
    });

    it('calls subscribers immediately and returns a no-op unsubscribe', () => {
        const model = new StaticModel(42);
        const listener = vi.fn();

        const unsubscribe = model.subscribe(listener);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(42);
        expect(typeof unsubscribe).toBe('function');
        expect(() => unsubscribe()).not.toThrow();
    });

    it('handles a variety of value types', () => {
        const objectValue = { name: 'blue' };
        const arrayValue = [1, 2, 3];
        const values = ['text', 123, null, undefined, objectValue, arrayValue];

        for (const value of values) {
            const model = new StaticModel(value);

            expect(model.get()).toBe(value);
        }
    });

    it('exposes the correct Symbol.toStringTag', () => {
        const model = new StaticModel('tag');

        expect(model[Symbol.toStringTag]).toBe('StaticModel');
        expect(Object.prototype.toString.call(model)).toBe('[object StaticModel]');
    });
});
