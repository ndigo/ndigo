import { describe, expect, it, vi } from 'vitest';

import { batch, isBatching } from '../src/batch';
import { MutableModel } from '../src/mutable-model';

describe('batch', () => {
    it('defers notifications until after the batch completes', () => {
        const model = new MutableModel(1);
        const listener = vi.fn();

        model.subscribe(listener);

        batch(() => {
            model.set(2);
            expect(listener).toHaveBeenCalledTimes(1);
        });

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith(2);
    });

    it('coalesces multiple sets on the same model', () => {
        const model = new MutableModel(0);
        const listener = vi.fn();

        model.subscribe(listener);

        batch(() => {
            model.set(1);
            model.set(2);
            model.set(3);
        });

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith(3);
    });

    it('flushes notifications for multiple models after batch ends', () => {
        const first = new MutableModel('a');
        const second = new MutableModel('x');
        const firstListener = vi.fn();
        const secondListener = vi.fn();

        first.subscribe(firstListener);
        second.subscribe(secondListener);

        batch(() => {
            first.set('b');
            second.set('y');

            expect(firstListener).toHaveBeenCalledTimes(1);
            expect(secondListener).toHaveBeenCalledTimes(1);
        });

        expect(firstListener).toHaveBeenCalledTimes(2);
        expect(secondListener).toHaveBeenCalledTimes(2);
        expect(firstListener).toHaveBeenLastCalledWith('b');
        expect(secondListener).toHaveBeenLastCalledWith('y');
    });

    it('collapses nested batches and flushes at the outermost boundary', () => {
        const model = new MutableModel(1);
        const listener = vi.fn();

        model.subscribe(listener);

        batch(() => {
            model.set(2);
            batch(() => {
                model.set(3);
            });
            expect(listener).toHaveBeenCalledTimes(1);
        });

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith(3);
    });

    it('does not notify when the value is unchanged within a batch', () => {
        const model = new MutableModel(5);
        const listener = vi.fn();

        model.subscribe(listener);

        batch(() => {
            model.set(5);
        });

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('flushes pending notifications even when the batch throws', () => {
        const model = new MutableModel(1);
        const listener = vi.fn();

        model.subscribe(listener);

        expect(() => {
            batch(() => {
                model.set(2);
                throw new Error('boom');
            });
        }).toThrow('boom');

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith(2);
    });

    it('reports batching state accurately', () => {
        expect(isBatching()).toBe(false);

        batch(() => {
            expect(isBatching()).toBe(true);
        });

        expect(isBatching()).toBe(false);
    });
});
