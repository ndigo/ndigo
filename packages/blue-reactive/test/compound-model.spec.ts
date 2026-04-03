import { describe, expect, it, vi } from 'vitest';

import { CompoundModel } from '../src/compound-model';
import { MutableModel } from '../src/mutable-model';

describe('CompoundModel', () => {
    it('returns the full source value from get()', () => {
        const source = new MutableModel({ name: 'Alice' });
        const model = new CompoundModel(source);

        expect(model.get()).toEqual({ name: 'Alice' });
    });

    it('delegates subscribe to the source model', () => {
        const source = new MutableModel({ name: 'Alice' });
        const model = new CompoundModel(source);
        const listener = vi.fn();

        model.subscribe(listener);
        source.set({ name: 'Bob' });

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith({ name: 'Bob' });
    });

    it('returns cached child models for the same path', () => {
        const source = new MutableModel({ name: 'Alice' });
        const model = new CompoundModel(source);

        const first = model.getChildModel('name');
        const second = model.getChildModel('name');

        expect(first).toBe(second);
    });

    it('returns child models that read and write to the source', () => {
        const source = new MutableModel({ name: 'Alice' });
        const model = new CompoundModel(source);
        const child = model.getChildModel<string>('name');

        expect(child.get()).toBe('Alice');

        child.set('Bob');

        expect(source.get()).toEqual({ name: 'Bob' });
    });

    it('notifies child model subscribers when the source changes', () => {
        const source = new MutableModel({ name: 'Alice' });
        const model = new CompoundModel(source);
        const child = model.getChildModel<string>('name');
        const listener = vi.fn();

        child.subscribe(listener);
        source.set({ name: 'Bob' });

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith('Bob');
    });

    it('disposes cached child models', () => {
        const source = new MutableModel({ name: 'Alice' });
        const model = new CompoundModel(source);
        const child = model.getChildModel<string>('name');
        const listener = vi.fn();

        child.subscribe(listener);
        model.dispose();
        source.set({ name: 'Bob' });

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('exposes the correct Symbol.toStringTag', () => {
        const source = new MutableModel({ name: 'Alice' });
        const model = new CompoundModel(source);

        expect(model[Symbol.toStringTag]).toBe('CompoundModel');
        expect(Object.prototype.toString.call(model)).toBe('[object CompoundModel]');
    });
});
