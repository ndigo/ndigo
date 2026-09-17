/**
 *
 * Benchmark suite for RingBuffer.
 * Compares RingBuffer against a plain Array FIFO baseline.
 *
 * Scenarios:
 *   1. FIFO enqueue+dequeue throughput
 *   2. Burst put – fill to capacity
 *   3. peek – non-destructive front read
 */
import { bench, describe } from 'vitest';
import { RingBuffer } from '../src/ring-buffer';

// module-level instances
const rb = new RingBuffer<number>(16);
const arr: number[] = [];
const circArr = new Array(16).fill(0);

let _sink: unknown = 0;

describe('FIFO enqueue+dequeue – 1000 ops', () => {
    bench('RingBuffer', () => {
        for (let i = 0; i < 1000; i++) {
            rb.put(i);
            _sink = rb.get();
        }
    });

    bench('Array (push/shift)', () => {
        for (let i = 0; i < 1000; i++) {
            arr.push(i);
            _sink = arr.shift();
        }
    });
});

describe('Burst put – fill 16-slot buffer 1000 times', () => {
    bench('RingBuffer', () => {
        for (let i = 0; i < 16000; i++) {
            rb.put(i);
        }
    });

    bench('Circular Array simulation', () => {
        let head = 0;
        for (let i = 0; i < 16000; i++) {
            circArr[head % 16] = i;
            head++;
        }
    });
});

describe('peek front – non-destructive read', () => {
    // pre-fill with 8 items before measuring
    for (let i = 0; i < 8; i++) {
        rb.put(i);
        arr.push(i);
    }

    bench('RingBuffer.peek', () => {
        for (let i = 0; i < 1000; i++) {
            _sink = rb.peek();
        }
    });

    bench('Array[0]', () => {
        for (let i = 0; i < 1000; i++) {
            _sink = arr[0];
        }
    });
});

describe('bounded drop-oldest queue (socket envelope) – 1000 ops at cap', () => {
    // Pre-fill both to the bound; each op enqueues and evicts the oldest —
    // the exact per-message shape of the socket outbound buffers and the
    // broker's /queue backlogs.
    const cappedRb = new RingBuffer<number>(16);
    const cappedArr: number[] = [];
    for (let i = 0; i < 16; i++) {
        cappedRb.put(i);
        cappedArr.push(i);
    }

    bench('RingBuffer (get + put at cap)', () => {
        for (let i = 0; i < 1000; i++) {
            cappedRb.get();
            cappedRb.put(i);
        }
    });

    bench('Array (push + shift at cap)', () => {
        for (let i = 0; i < 1000; i++) {
            cappedArr.push(i);
            cappedArr.shift();
        }
    });
});
