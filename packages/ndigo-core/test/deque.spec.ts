import { describe, it, expect } from 'vitest';
import { Deque } from '../src/deque';

describe('Deque', () => {
    it('push/shift FIFO', () => {
        const d = new Deque<number>();
        d.push(1).push(2).push(3);
        expect(d.shift()).toBe(1);
        expect(d.shift()).toBe(2);
        expect(d.shift()).toBe(3);
        expect(d.shift()).toBeUndefined();
    });

    it('unshift/pop LIFO-ish', () => {
        const d = new Deque<number>();
        d.unshift(1).unshift(2);
        expect(d.pop()).toBe(1);
        expect(d.pop()).toBe(2);
    });

    it('grows beyond initial capacity', () => {
        const d = new Deque<number>(2);
        for (let i = 0; i < 100; i++) d.push(i);
        expect(d.length).toBe(100);
        expect(d.get(0)).toBe(0);
        expect(d.get(99)).toBe(99);
    });

    it('exact cap eviction via shift', () => {
        const d = new Deque<number>(4);
        const cap = 3;
        for (let i = 1; i <= 5; i++) {
            d.push(i);
            if (d.length > cap) d.shift();
        }
        expect(d.toArray()).toEqual([3, 4, 5]);
    });

    it('iterates and serializes', () => {
        const d = new Deque<number>();
        d.push(1).push(2);
        expect([...d]).toEqual([1, 2]);
        expect(d.toJSON()).toEqual([1, 2]);
    });
});
