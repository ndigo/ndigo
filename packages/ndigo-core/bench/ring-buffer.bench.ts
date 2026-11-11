/**
 * RingBuffer throughput against a plain-array FIFO.
 *
 * Each measured iteration performs 1,000 logical operations. The FIFO order is
 * verified on a fresh buffer before timing.
 */
import { test } from 'vitest';
import { RingBuffer } from '../src/ring-buffer';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const CAPACITY = 16;

const ring = new RingBuffer<number>(CAPACITY);
const array: number[] = [];
const retain = sink;

function verifyFifo(): void {
    const fresh = new RingBuffer<number>(8);
    fresh.put(1, 2, 3, 4);
    assertEquivalent('RingBuffer FIFO order', [fresh.get(), fresh.get(), fresh.get(), fresh.get()], [1, 2, 3, 4]);
    assertEquivalent('RingBuffer empty after drain', fresh.isEmpty, true);
}

test('FIFO enqueue + dequeue', async ({ bench }) => {
    verifyFifo();
    await bench.compare(
        bench(benchName('RingBuffer put + get', BATCH), () => {
            for (let i = 0; i < BATCH; i++) {
                ring.put(i);
                retain(ring.get());
            }
        }),
        bench(benchName('Array push + shift', BATCH), () => {
            for (let i = 0; i < BATCH; i++) {
                array.push(i);
                retain(array.shift());
            }
        })
    );
});

test('burst put — 16-slot buffer', async ({ bench }) => {
    const target = new RingBuffer<number>(CAPACITY);
    const circular = new Array<number>(CAPACITY).fill(0);
    await bench.compare(
        bench(benchName('RingBuffer.put', 16_000), () => {
            for (let i = 0; i < 16_000; i++) target.put(i);
            retain(target.length);
        }),
        bench(benchName('Circular array assignment', 16_000), () => {
            for (let i = 0; i < 16_000; i++) circular[i % CAPACITY] = i;
            retain(circular[CAPACITY - 1]);
        })
    );
});

test('peek — non-destructive front read', async ({ bench }) => {
    const target = new RingBuffer<number>(CAPACITY);
    const list: number[] = [];
    for (let i = 0; i < 8; i++) {
        target.put(i);
        list.push(i);
    }
    assertEquivalent('RingBuffer.peek', target.peek(), list[0]);
    await bench.compare(
        bench(benchName('RingBuffer.peek', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(target.peek());
        }),
        bench(benchName('Array[0]', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(list[0]);
        })
    );
});

test('bounded drop-oldest queue at capacity', async ({ bench }) => {
    const target = new RingBuffer<number>(CAPACITY);
    const list: number[] = [];
    for (let i = 0; i < CAPACITY; i++) {
        target.put(i);
        list.push(i);
    }
    await bench.compare(
        bench(benchName('RingBuffer get + put at cap', BATCH), () => {
            for (let i = 0; i < BATCH; i++) {
                retain(target.get());
                target.put(i);
            }
        }),
        bench(benchName('Array push + shift at cap', BATCH), () => {
            for (let i = 0; i < BATCH; i++) {
                list.push(i);
                retain(list.shift());
            }
        })
    );
});
