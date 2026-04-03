import { describe, expect, it, vi } from 'vitest';

import { DerivedModel } from '../src/derived-model';
import { MutableModel } from '../src/mutable-model';

describe('DerivedModel', () => {
    it('derives values from a single source', () => {
        const source = new MutableModel(2);
        const derived = new DerivedModel([source], (value: number) => value * 3);

        expect(derived.get()).toBe(6);
    });

    it('derives values from multiple sources', () => {
        const first = new MutableModel(2);
        const second = new MutableModel(5);
        const derived = new DerivedModel([first, second], (left: number, right: number) => left + right);

        expect(derived.get()).toBe(7);
    });

    it('recomputes on each get() when unobserved (lazy mode)', () => {
        const source = new MutableModel(1);
        const deriveFn = vi.fn((value: number) => value * 2);
        const derived = new DerivedModel([source], deriveFn);

        derived.get();
        derived.get();

        expect(deriveFn).toHaveBeenCalledTimes(2);
    });

    it('activates eager mode when subscribed and reacts to changes', () => {
        const source = new MutableModel(1);
        const deriveFn = vi.fn((value: number) => value * 2);
        const derived = new DerivedModel([source], deriveFn);
        const listener = vi.fn();

        derived.subscribe(listener);

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenNthCalledWith(1, 2);
        expect(listener).toHaveBeenNthCalledWith(2, 2);
        expect(deriveFn).toHaveBeenCalledTimes(1);

        source.set(2);

        expect(deriveFn).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenCalledTimes(3);
        expect(listener).toHaveBeenLastCalledWith(4);
    });

    it('deactivates when all subscribers unsubscribe (returns to lazy mode)', () => {
        const source = new MutableModel(1);
        const deriveFn = vi.fn((value: number) => value * 2);
        const derived = new DerivedModel([source], deriveFn);

        const unsubscribe = derived.subscribe(() => {});
        unsubscribe();

        derived.get();
        derived.get();

        expect(deriveFn).toHaveBeenCalledTimes(3);
    });

    it('calls subscribers immediately with the current derived value', () => {
        const source = new MutableModel(3);
        const derived = new DerivedModel([source], (value: number) => value + 1);
        const listener = vi.fn();

        derived.subscribe(listener);

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenNthCalledWith(1, 4);
        expect(listener).toHaveBeenNthCalledWith(2, 4);
    });

    it('does not notify if the derived value has not changed', () => {
        const source = new MutableModel(1);
        const derived = new DerivedModel([source], (value: number) => value % 2);
        const listener = vi.fn();

        derived.subscribe(listener);
        source.set(3);

        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('uses a custom equality function when provided', () => {
        const source = new MutableModel('Blue');
        const equals = vi.fn((left: string, right: string) => left.toLowerCase() === right.toLowerCase());
        const derived = new DerivedModel([source], (value: string) => value, { equals });
        const listener = vi.fn();

        derived.subscribe(listener);
        source.set('blue');

        expect(equals).toHaveBeenCalled();
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('dispose unsubscribes from sources and prevents notifications', () => {
        const source = new MutableModel(2);
        const derived = new DerivedModel([source], (value: number) => value * 2);
        const listener = vi.fn();

        derived.subscribe(listener);
        derived.dispose();
        source.set(4);

        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('supports chained derivations', () => {
        const source = new MutableModel(2);
        const doubled = new DerivedModel([source], (value: number) => value * 2);
        const squared = new DerivedModel([doubled], (value: number) => value * value);

        expect(squared.get()).toBe(16);
    });

    it('exposes the correct Symbol.toStringTag', () => {
        const source = new MutableModel(1);
        const derived = new DerivedModel([source], (value: number) => value);

        expect(derived[Symbol.toStringTag]).toBe('DerivedModel');
        expect(Object.prototype.toString.call(derived)).toBe('[object DerivedModel]');
    });
});
