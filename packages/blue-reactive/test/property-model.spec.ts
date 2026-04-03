import { describe, expect, it, vi } from 'vitest';

import type { ReadableModel, Unsubscribe } from '../src/model';
import { MutableModel } from '../src/mutable-model';
import { PropertyModel } from '../src/property-model';
import { StaticModel } from '../src/static-model';

describe('PropertyModel', () => {
    it('returns values at simple and nested paths', () => {
        const source = new MutableModel({ name: 'Alice', address: { city: 'NYC' } });
        const nameModel = new PropertyModel(source, 'name');
        const cityModel = new PropertyModel(source, 'address.city');

        expect(nameModel.get()).toBe('Alice');
        expect(cityModel.get()).toBe('NYC');
    });

    it('returns undefined for missing paths', () => {
        const source = new MutableModel({ name: 'Alice' });
        const model = new PropertyModel(source, 'address.city');

        expect(model.get()).toBeUndefined();
    });

    it('updates the source at the bound path immutably', () => {
        const initial = { name: 'Alice', address: { city: 'NYC' } };
        const source = new MutableModel(initial);
        const model = new PropertyModel(source, 'name');

        model.set('Bob');

        expect(source.get()).toEqual({ name: 'Bob', address: { city: 'NYC' } });
        expect(source.get()).not.toBe(initial);
    });

    it('creates nested structures when setting deep paths', () => {
        const source = new MutableModel({});
        const model = new PropertyModel(source, 'address.city');

        model.set('Paris');

        expect(source.get()).toEqual({ address: { city: 'Paris' } });
    });

    it('is a no-op when the source is not writable', () => {
        const source = new StaticModel({ name: 'Alice' });
        const model = new PropertyModel(source, 'name');

        expect(() => model.set('Bob')).not.toThrow();
        expect(model.get()).toBe('Alice');
    });

    it('updates the property via update()', () => {
        const source = new MutableModel({ count: 1 });
        const model = new PropertyModel(source, 'count');

        model.update((value) => value + 1);

        expect(model.get()).toBe(2);
        expect(source.get().count).toBe(2);
    });

    it('calls subscribers immediately with the current value', () => {
        const source = new MutableModel({ name: 'Alice' });
        const model = new PropertyModel(source, 'name');
        const listener = vi.fn();

        model.subscribe(listener);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith('Alice');
    });

    it('notifies subscribers when the bound path changes', () => {
        const source = new MutableModel({ name: 'Alice', address: { city: 'NYC' } });
        const model = new PropertyModel(source, 'address.city');
        const listener = vi.fn();

        model.subscribe(listener);
        source.set({ name: 'Alice', address: { city: 'Paris' } });

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith('Paris');
    });

    it('does not notify when a different path changes', () => {
        const source = new MutableModel({ name: 'Alice', address: { city: 'NYC' } });
        const model = new PropertyModel(source, 'address.city');
        const listener = vi.fn();

        model.subscribe(listener);
        source.set({ name: 'Bob', address: { city: 'NYC' } });

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('deactivates the source subscription when all subscribers unsubscribe', () => {
        let unsubscribeCalls = 0;
        let notify: ((value: { name: string }) => void) | null = null;

        const source: ReadableModel<{ name: string }> = {
            get: () => ({ name: 'Alice' }),
            subscribe: (listener): Unsubscribe => {
                notify = listener;
                return () => {
                    unsubscribeCalls += 1;
                };
            },
        };

        const model = new PropertyModel(source, 'name');
        const first = model.subscribe(() => {});
        const second = model.subscribe(() => {});

        first();
        expect(unsubscribeCalls).toBe(0);

        second();
        expect(unsubscribeCalls).toBe(1);

        notify?.({ name: 'Bob' });
    });

    it('dispose releases subscriptions and prevents notifications', () => {
        let unsubscribeCalls = 0;
        let notify: ((value: { name: string }) => void) | null = null;

        const source: ReadableModel<{ name: string }> = {
            get: () => ({ name: 'Alice' }),
            subscribe: (listener): Unsubscribe => {
                notify = listener;
                return () => {
                    unsubscribeCalls += 1;
                };
            },
        };

        const model = new PropertyModel(source, 'name');
        const listener = vi.fn();

        model.subscribe(listener);
        model.dispose();

        notify?.({ name: 'Bob' });

        expect(unsubscribeCalls).toBe(1);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('exposes the correct Symbol.toStringTag', () => {
        const source = new MutableModel({ name: 'Alice' });
        const model = new PropertyModel(source, 'name');

        expect(model[Symbol.toStringTag]).toBe('PropertyModel');
        expect(Object.prototype.toString.call(model)).toBe('[object PropertyModel]');
    });
});
