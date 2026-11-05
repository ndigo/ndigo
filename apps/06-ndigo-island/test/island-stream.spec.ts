/**
 * APP-D — the SSE push stream coalesces and bounds its pending snapshots.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { modelUpdateStream } from '../src/island-controller';
import { TodoItem, TodoModelStore } from '../src/todo-model-store';

/**
 * The demo's `/events` source emits whole-model snapshots. Because each frame
 * carries the full state, a burst of updates must not queue one frame per
 * update: only the newest pending snapshot is retained (bound 1), so a slow
 * consumer sees the latest state instead of a backlog.
 */
describe('modelUpdateStream — snapshot coalescing (APP-D)', () => {
    test('sends the snapshot on connect, then coalesces a burst to the newest model', async () => {
        const store = new TodoModelStore({
            items: [{ text: 'seed', done: false }],
            filter: 'all',
        });
        const iterator = modelUpdateStream(store)[Symbol.asyncIterator]();

        const snapshot = await iterator.next();
        expect(snapshot.value.data.model.items.map((item: TodoItem) => item.text)).toEqual(['seed']);

        // N rapid updates while the consumer has not yet pulled the next frame.
        for (let index = 1; index <= 50; index++) {
            store.update((model) => {
                model.items.push({ text: `rapid ${index}`, done: false });
            });
        }

        const coalesced = await iterator.next();
        const texts = coalesced.value.data.model.items.map((item: TodoItem) => item.text);
        expect(texts).toHaveLength(51);
        expect(texts[0]).toBe('seed');
        expect(texts.at(-1)).toBe('rapid 50');

        // Bounded (one pending slot): nothing else is queued — the stream parks
        // until the next update instead of replaying the burst.
        const parked = await Promise.race([
            iterator.next().then(() => 'emitted'),
            new Promise((resolve) => {
                setTimeout(() => resolve('parked'), 25);
            }),
        ]);
        expect(parked).toBe('parked');

        // The generator is parked on its coalescing gate; `return()` cannot
        // settle until it resumes, so dispose without awaiting it.
        void iterator.return?.(undefined);
    });
});
