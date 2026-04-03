import { describe, expect, it, vi } from 'vitest';

import { LoadableModel } from '../src/loadable-model';

const flushPromises = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
};

const createDeferred = <T>() => {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((innerResolve, innerReject) => {
        resolve = innerResolve;
        reject = innerReject;
    });

    return { promise, resolve, reject };
};

describe('LoadableModel', () => {
    it('starts in the idle state', () => {
        const loadFn = vi.fn(async () => 'value');
        const model = new LoadableModel(loadFn);

        expect(model.status).toBe('idle');
        expect(model.get()).toBeUndefined();
    });

    it('returns undefined on initial get and triggers load', async () => {
        const deferred = createDeferred<string>();
        const loadFn = vi.fn(() => deferred.promise);
        const model = new LoadableModel(loadFn);

        expect(model.get()).toBeUndefined();
        expect(loadFn).toHaveBeenCalledTimes(1);

        deferred.resolve('loaded');
        await flushPromises();

        expect(model.status).toBe('loaded');
        expect(model.get()).toBe('loaded');
    });

    it('notifies subscribers with the loaded value', async () => {
        const deferred = createDeferred<string>();
        const loadFn = vi.fn(() => deferred.promise);
        const model = new LoadableModel(loadFn);
        const listener = vi.fn();

        model.subscribe(listener);
        deferred.resolve('data');
        await flushPromises();

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith('data');
    });

    it('tracks status transitions through subscribeStatus', async () => {
        const deferred = createDeferred<string>();
        const loadFn = vi.fn(() => deferred.promise);
        const model = new LoadableModel(loadFn);
        const listener = vi.fn();

        model.subscribeStatus(listener);
        model.get();
        deferred.resolve('data');
        await flushPromises();

        expect(listener).toHaveBeenCalledTimes(3);
        expect(listener).toHaveBeenNthCalledWith(1, 'idle');
        expect(listener).toHaveBeenNthCalledWith(2, 'loading');
        expect(listener).toHaveBeenNthCalledWith(3, 'loaded');
    });

    it('sets error status and error property on failure', async () => {
        const deferred = createDeferred<string>();
        const loadFn = vi.fn(() => deferred.promise);
        const model = new LoadableModel(loadFn);
        const error = new Error('boom');

        model.get();
        deferred.reject(error);
        await flushPromises();

        expect(model.status).toBe('error');
        expect(model.error).toBe(error);
    });

    it('reload clears cached value and triggers a fresh load', async () => {
        const first = createDeferred<string>();
        const second = createDeferred<string>();
        const loadFn = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
        const model = new LoadableModel(loadFn);

        model.get();
        first.resolve('first');
        await flushPromises();

        model.reload();
        expect(model.status).toBe('loading');
        expect(loadFn).toHaveBeenCalledTimes(2);

        second.resolve('second');
        await flushPromises();

        expect(model.get()).toBe('second');
        expect(model.status).toBe('loaded');
    });

    it('detach clears the value, resets status, and notifies subscribers', async () => {
        const deferred = createDeferred<string>();
        const loadFn = vi.fn(() => deferred.promise);
        const model = new LoadableModel(loadFn);
        const listener = vi.fn();
        const statusListener = vi.fn();

        model.subscribe(listener);
        model.subscribeStatus(statusListener);

        deferred.resolve('data');
        await flushPromises();

        model.detach();

        expect(model.status).toBe('idle');
        expect(listener).toHaveBeenLastCalledWith(undefined);
        expect(statusListener).toHaveBeenLastCalledWith('idle');
    });

    it('subscribe on idle triggers loading', () => {
        const deferred = createDeferred<string>();
        const loadFn = vi.fn(() => deferred.promise);
        const model = new LoadableModel(loadFn);

        model.subscribe(() => {});

        expect(loadFn).toHaveBeenCalledTimes(1);
        expect(model.status).toBe('loading');
    });

    it('dispose prevents future loads and notifications', async () => {
        const deferred = createDeferred<string>();
        const loadFn = vi.fn(() => deferred.promise);
        const model = new LoadableModel(loadFn);
        const listener = vi.fn();

        model.subscribe(listener);
        model.dispose();

        deferred.resolve('data');
        await flushPromises();

        model.get();

        expect(loadFn).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('ignores repeated load calls while loading', () => {
        const deferred = createDeferred<string>();
        const loadFn = vi.fn(() => deferred.promise);
        const model = new LoadableModel(loadFn);

        model.load();
        model.load();
        model.load();

        expect(loadFn).toHaveBeenCalledTimes(1);
        expect(model.status).toBe('loading');
    });

    it('exposes the correct Symbol.toStringTag', () => {
        const loadFn = vi.fn(async () => 'value');
        const model = new LoadableModel(loadFn);

        expect(model[Symbol.toStringTag]).toBe('LoadableModel');
        expect(Object.prototype.toString.call(model)).toBe('[object LoadableModel]');
    });
});
