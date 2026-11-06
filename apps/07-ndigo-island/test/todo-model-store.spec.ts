// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { TodoModelStore } from '../src/todo-model-store';

const initial = {
    items: [{ text: 'Server-rendered island', done: true }],
    filter: 'all',
};

describe('TodoModelStore (AD-09 demo)', () => {
    test('get() returns an immutable snapshot', () => {
        const store = new TodoModelStore(initial);
        const snapshot = store.get();
        snapshot.items.push({ text: 'mutated', done: false });
        expect(store.get().items).toHaveLength(1);
    });

    test('update() applies the mutation and notifies subscribers', async () => {
        const store = new TodoModelStore(initial);
        const seen: unknown[] = [];
        store.subscribe(() => {
            seen.push(store.get());
            return Promise.resolve();
        });

        store.update((model) => {
            model.items.push({ text: 'pushed', done: false });
        });
        await Promise.resolve();

        expect(seen).toHaveLength(1);
        expect((seen[0] as { items: Array<{ text: string }> }).items[1].text).toBe('pushed');
        expect(store.get().items).toHaveLength(2);
        expect(store.get().items[0]).toEqual({ text: 'Server-rendered island', done: true });
    });

    test('unsubscribe stops notifications', async () => {
        const store = new TodoModelStore(initial);
        let notified = 0;
        const unsubscribe = store.subscribe(() => {
            notified += 1;
            return Promise.resolve();
        });

        store.update((model) => {
            model.items.push({ text: 'one', done: false });
        });
        unsubscribe();
        store.update((model) => {
            model.items.push({ text: 'two', done: false });
        });
        await Promise.resolve();

        expect(notified).toBe(1);
        expect(store.get().items).toHaveLength(3);
    });

    test('startTicker pushes exactly three updates then stops', async () => {
        const store = new TodoModelStore(initial);
        let updates = 0;
        store.subscribe(() => {
            updates += 1;
            return Promise.resolve();
        });

        store.startTicker();
        await new Promise((resolve) => setTimeout(resolve, 3600));

        expect(updates).toBe(3);
        expect(store.get().items).toHaveLength(4);
        const before = updates;
        await new Promise((resolve) => setTimeout(resolve, 1200));
        expect(updates).toBe(before);
    });

    test('startTicker is idempotent', () => {
        const store = new TodoModelStore(initial);
        store.startTicker();
        store.startTicker();
        store.stopTicker();
    });
});
