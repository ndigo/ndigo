import { describe, it, expect } from 'vitest';
import { Heap, PriorityQueue } from '../src/heap';
import { numberComparator } from '../src/comparable';

describe('Heap', () => {
    it('min-heap pops ascending', () => {
        const h = new Heap<number>();
        for (const v of [5, 3, 8, 1]) h.push(v);
        expect(h.pop()).toBe(1);
        expect(h.pop()).toBe(3);
        expect(h.pop()).toBe(5);
        expect(h.pop()).toBe(8);
    });

    it('peek does not remove', () => {
        const h = new Heap<number>();
        h.push(7);
        expect(h.peek()).toBe(7);
        expect(h.size).toBe(1);
    });

    it('max-heap via inverted comparator', () => {
        const h = new Heap<number>((a, b) => b - a);
        for (const v of [5, 3, 8, 1]) h.push(v);
        expect(h.pop()).toBe(8);
    });

    it('toSorted', () => {
        const h = new Heap<number>();
        for (const v of [5, 3, 8, 1]) h.push(v);
        expect(h.toSorted()).toEqual([1, 3, 5, 8]);
    });
});

describe('PriorityQueue', () => {
    it('dequeue highest priority first', () => {
        const pq = new PriorityQueue<number>((a, b) => a - b);
        pq.enqueue(5).enqueue(1).enqueue(3);
        expect(pq.dequeue()).toBe(1);
        expect(pq.dequeue()).toBe(3);
    });
});
