import { describe, expect, it, vi } from 'vitest';

import { MutableModel } from '../src/mutable-model';

describe('MutableModel', () => {
    it('returns the initial value from get()', () => {
        const model = new MutableModel('start');

        expect(model.get()).toBe('start');
    });

    it('updates the value via set()', () => {
        const model = new MutableModel(1);

        model.set(2);

        expect(model.get()).toBe(2);
    });

    it('notifies subscribers when the value changes', () => {
        const model = new MutableModel('a');
        const listener = vi.fn();

        model.subscribe(listener);
        model.set('b');

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith('b');
    });

    it('does not notify when the value is unchanged (Object.is equality)', () => {
        const model = new MutableModel(5);
        const listener = vi.fn();

        model.subscribe(listener);
        model.set(5);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('treats NaN as equal using Object.is', () => {
        const model = new MutableModel(Number.NaN);
        const listener = vi.fn();

        model.subscribe(listener);
        model.set(Number.NaN);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('updates value via update()', () => {
        const model = new MutableModel(10);

        model.update((value) => value + 5);

        expect(model.get()).toBe(15);
    });

    it('calls subscribers immediately upon subscription', () => {
        const model = new MutableModel('ready');
        const listener = vi.fn();

        model.subscribe(listener);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith('ready');
    });

    it('notifies all subscribers', () => {
        const model = new MutableModel('initial');
        const first = vi.fn();
        const second = vi.fn();

        model.subscribe(first);
        model.subscribe(second);
        model.set('next');

        expect(first).toHaveBeenCalledTimes(2);
        expect(second).toHaveBeenCalledTimes(2);
        expect(first).toHaveBeenLastCalledWith('next');
        expect(second).toHaveBeenLastCalledWith('next');
    });

    it('unsubscribes listeners correctly', () => {
        const model = new MutableModel('before');
        const listener = vi.fn();

        const unsubscribe = model.subscribe(listener);
        unsubscribe();
        model.set('after');

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('dispose prevents future notifications', () => {
        const model = new MutableModel('before');
        const listener = vi.fn();

        model.subscribe(listener);
        model.dispose();
        model.set('after');

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('uses a custom equality function when provided', () => {
        const equals = vi.fn((left: string, right: string) => left.toLowerCase() === right.toLowerCase());
        const model = new MutableModel('Hello', { equals });
        const listener = vi.fn();

        model.subscribe(listener);
        model.set('hello');

        expect(equals).toHaveBeenCalled();
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('exposes the correct Symbol.toStringTag', () => {
        const model = new MutableModel('tag');

        expect(model[Symbol.toStringTag]).toBe('MutableModel');
        expect(Object.prototype.toString.call(model)).toBe('[object MutableModel]');
    });
});
