/**
 * Event-bridge throughput (Phase 4, ndigo-signals).
 *
 * These benches avoid class field decorators: the decorator lowering path
 * (`scripts/vite-plugin-lower-decorators.mjs`, esbuild) does not deliver the
 * TC39 `ClassFieldDecoratorContext` to `@signal` in the bench lane (context is
 * `undefined`), so decorated-field rows are not measurable yet. The bridges are
 * the remaining shipped wrapper surface in this package; all rows run on the
 * `@preact/signals-core` engine, so no engine claim is made or supported.
 */
import { test } from 'vitest';
import { signal as rawSignal } from '@preact/signals-core';
import { reactive, signal } from '../src/_decorators';
import { eventsToSignal, signalToEvents, type EventSink, type EventSource } from '../src/event-bridge';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;
const raw = rawSignal(1);

class RecordingSource implements EventSource {
    listeners = new Map<string, (...args: unknown[]) => void>();

    on(type: string, listener: (...args: unknown[]) => void): unknown {
        this.listeners.set(type, listener);
        return this;
    }

    off(type: string): unknown {
        this.listeners.delete(type);
        return this;
    }
}

class RecordingSink implements EventSink {
    emitted: unknown[] = [];

    emit(type: string | symbol, ...data: unknown[]): unknown {
        this.emitted.push({ type, data });
        return this;
    }
}

test('signal — decorated field read', async ({ bench }) => {
    @reactive
    class Target {
        @signal value = 1;
    }
    const decorated = new Target();
    if (decorated.value !== 1) throw new Error('bad decorated value: ' + decorated.value);
    await bench.compare(
        bench(benchName('raw signal read', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(raw.value);
        }),
        bench(benchName('decorated signal read', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(decorated.value);
        })
    );
});

test('eventsToSignal — bridge occurrence into signal', async ({ bench }) => {
    const source = new RecordingSource();
    const target = rawSignal<number>(0);
    eventsToSignal(source, 'tick', target);
    source.listeners.get('tick')?.(7);
    assertEquivalent('bridged occurrence', target.value, 7);
    await bench(benchName('eventsToSignal delivery', BATCH), () => {
        const deliver = source.listeners.get('tick') as (...args: unknown[]) => void;
        for (let i = 0; i < BATCH; i++) deliver(i);
        retain(target.value);
    }).run();
});

test('signalToEvents — signal change into occurrences', async ({ bench }) => {
    const source = rawSignal<number>(0);
    const sinkEmitter = new RecordingSink();
    signalToEvents(source, sinkEmitter, 'counter:changed');
    source.value = 5;
    assertEquivalent('bridged occurrence count', sinkEmitter.emitted.length, 1);
    await bench(benchName('signalToEvents delivery', BATCH), () => {
        for (let i = 0; i < BATCH; i++) source.value = i;
        retain(sinkEmitter.emitted.length);
    }).run();
});
