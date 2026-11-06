/**
 */
import { describe, it, expect } from 'vitest';
import { signal, eventsToSignal, signalToEvents } from '../src/index';
import type { EventSink, EventSource } from '../src/index';

/** A minimal emitter satisfying both structural bridge contracts. */
function fakeEmitter(): EventSource & EventSink & { listenerCount(type: string | symbol): number } {
    const listeners = new Map<string | symbol, Array<(...args: unknown[]) => void>>();
    return {
        on(type, listener) {
            const group = listeners.get(type);
            if (group) {
                group.push(listener);
            } else {
                listeners.set(type, [listener]);
            }
        },
        off(type, listener) {
            const group = listeners.get(type);
            if (group) {
                const index = group.indexOf(listener);
                if (index >= 0) {
                    group.splice(index, 1);
                }
            }
        },
        emit(type, ...data) {
            for (const listener of listeners.get(type) ?? []) {
                listener(...data);
            }
        },
        listenerCount(type) {
            return listeners.get(type)?.length ?? 0;
        },
    };
}

describe('eventsToSignal (AD-09)', () => {
    it('writes the payload of matching events into the signal', () => {
        const emitter = fakeEmitter();
        const target = signal('idle');

        eventsToSignal(emitter, 'status:changed', target);

        emitter.emit('other:event', 'ignored');
        expect(target.value).toBe('idle');

        emitter.emit('status:changed', 'running');
        expect(target.value).toBe('running');

        emitter.emit('status:changed', 'down');
        expect(target.value).toBe('down');
    });

    it('applies the transform when mapping payloads to the signal value', () => {
        const emitter = fakeEmitter();
        const target = signal(0);

        eventsToSignal(emitter, 'tick', target, (payload) => (payload as number) * 2);

        emitter.emit('tick', 21);
        expect(target.value).toBe(42);
    });

    it('stop() unsubscribes — later events do not update the signal', () => {
        const emitter = fakeEmitter();
        const target = signal(0);

        const stop = eventsToSignal(emitter, 'tick', target);
        emitter.emit('tick', 1);
        expect(target.value).toBe(1);

        stop();
        emitter.emit('tick', 2);
        expect(target.value).toBe(1);
        expect(emitter.listenerCount('tick')).toBe(0);
    });
});

describe('signalToEvents (AD-09)', () => {
    it('does not emit on subscribe; emits an occurrence per change', () => {
        const emitter = fakeEmitter();
        const source = signal(5);
        const emitted: unknown[][] = [];

        emitter.on('counter:changed', (...args) => emitted.push(args));
        signalToEvents(source, emitter, 'counter:changed');

        expect(emitted).toEqual([]);

        source.value = 6;
        expect(emitted).toEqual([[6]]);

        source.value = 7;
        source.value = 8;
        expect(emitted).toEqual([[6], [7], [8]]);
    });

    it('emitInitial emits the current value once on subscribe', () => {
        const emitter = fakeEmitter();
        const source = signal(5);
        const emitted: unknown[][] = [];

        emitter.on('counter:changed', (...args) => emitted.push(args));
        signalToEvents(source, emitter, 'counter:changed', { emitInitial: true });

        expect(emitted).toEqual([[5]]);

        source.value = 6;
        expect(emitted).toEqual([[5], [6]]);
    });

    it('applies the transform when shaping the emitted payload', () => {
        const emitter = fakeEmitter();
        const source = signal(3);
        const emitted: unknown[][] = [];

        emitter.on('counter:changed', (...args) => emitted.push(args));
        signalToEvents(source, emitter, 'counter:changed', { transform: (n) => ({ count: n }) });

        source.value = 4;
        expect(emitted).toEqual([[{ count: 4 }]]);
    });

    it('stop() disposes the effect — later writes do not emit', () => {
        const emitter = fakeEmitter();
        const source = signal(5);
        const emitted: unknown[][] = [];

        emitter.on('counter:changed', (...args) => emitted.push(args));
        const stop = signalToEvents(source, emitter, 'counter:changed');

        source.value = 6;
        expect(emitted).toEqual([[6]]);

        stop();
        source.value = 7;
        expect(emitted).toEqual([[6]]);
        expect(emitter.listenerCount('counter:changed')).toBe(1); // the test's own spy
    });
});
