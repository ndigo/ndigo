/**
 * @author Jeff Rose
 *
 * Benchmark suite for RingBuffer.
 * Compares RingBuffer against Denque (industry FIFO baseline) and plain Array.
 *
 * Scenarios:
 *   1. FIFO enqueue+dequeue throughput
 *   2. Burst put – fill to capacity
 *   3. peek – non-destructive front read
 */
import { bench, describe } from 'vitest';
import { RingBuffer } from '../src/ring-buffer';
import Denque from 'denque';

// module-level instances
const rb = new RingBuffer<number>(16);
const dq = new Denque<number>();
const arr: number[] = [];
const circArr = new Array(16).fill(0);

let _sink: any = 0;

describe('FIFO enqueue+dequeue – 1000 ops', () => {
    bench('RingBuffer', () => {
        for (let i = 0; i < 1000; i++) {
            rb.put(i);
            _sink = rb.get();
        }
    });

    bench('Denque', () => {
        for (let i = 0; i < 1000; i++) {
            dq.push(i);
            _sink = dq.shift();
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

    bench('Denque', () => {
        for (let i = 0; i < 16000; i++) {
            dq.push(i);
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
        dq.push(i);
        arr.push(i);
    }

    bench('RingBuffer.peek', () => {
        for (let i = 0; i < 1000; i++) {
            _sink = rb.peek();
        }
    });

    bench('Denque.peekFront', () => {
        for (let i = 0; i < 1000; i++) {
            _sink = dq.peekFront();
        }
    });

    bench('Array[0]', () => {
        for (let i = 0; i < 1000; i++) {
            _sink = arr[0];
        }
    });
});
