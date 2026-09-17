/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { RingBuffer } from '../src/ring-buffer';

const toString = Object.prototype.toString;

describe('RingBuffer', () => {
    let rb: RingBuffer<string | number>;

    test('it should initialize with no arguments', () => {
        rb = new RingBuffer<string | number>();
        expect(rb).toBeInstanceOf(RingBuffer);
        expect(rb).toHaveProperty('capacity', RingBuffer.MIN_CAPACITY);
        expect(rb).toHaveProperty('length', 0);
    });

    test('it should initialize with a capacity argument', () => {
        rb = new RingBuffer<string | number>(6);
        expect(rb).toHaveProperty('capacity', RingBuffer.MIN_CAPACITY);
        expect(rb).toHaveProperty('length', 0);

        rb = new RingBuffer<string | number>(20);
        expect(rb).toHaveProperty('capacity', 32);

        rb = new RingBuffer<string | number>(64);
        expect(rb).toHaveProperty('capacity', 64);
    });

    test('it should initialize with an array argument', () => {
        rb = new RingBuffer([]);
        expect(rb).not.toHaveProperty('0');
        expect(rb).toHaveProperty('length', 0);

        rb = new RingBuffer([1, 2, 3]);
        expect(rb).toHaveProperty('0', 1);
        expect(rb).toHaveProperty('1', 2);
        expect(rb).toHaveProperty('2', 3);
        expect(rb).toHaveProperty('length', 3);
    });

    describe('instances', () => {
        beforeEach(() => {
            rb = new RingBuffer<string | number>();
        });
        afterEach(() => {
            rb = undefined as unknown as RingBuffer<string | number>;
        });

        describe('put', () => {
            test('it should doing nothing if no items are provided', () => {
                const size = rb.put();
                expect(size).toBe(rb.length);
                expect(rb.length).toEqual(0);
                expect(rb).toHaveProperty('isEmpty', true);
                expect(rb).toHaveProperty('isFull', false);
            });

            test('it should add a single item when under capacity', () => {
                expect(rb).toHaveProperty('isEmpty', true);
                expect(rb).toHaveProperty('isFull', false);
                const size = rb.put(1);
                expect(size).toBe(rb.length);
                expect(rb.length).toEqual(1);
                expect(rb).toHaveProperty('0', 1);
                expect(rb).toHaveProperty('isEmpty', false);
                expect(rb).toHaveProperty('isFull', false);
            });

            test('it should add a single item when at capacity', () => {
                const chars = 'abcdefghijklmno'.split('');
                rb = new RingBuffer(chars);
                expect(rb).toHaveProperty('isEmpty', false);
                expect(rb).toHaveProperty('isFull', false);
                const size = rb.put('p');
                expect(size).toBe(rb.length);
                expect(rb.length).toEqual(16);
                expect(rb).toHaveProperty('15', 'p');
                expect(rb).toHaveProperty('isEmpty', false);
                expect(rb).toHaveProperty('isFull', true);
            });

            test('it should add a single item when over capacity', () => {
                const chars = 'abcdefghijklmnop'.split('');
                rb = new RingBuffer(chars);
                const size = rb.put('q');
                expect(size).toBe(rb.length);
                expect(rb.length).toEqual(16);
                expect(rb).toHaveProperty('0', 'q');
                expect(rb).toHaveProperty('isEmpty', false);
                expect(rb).toHaveProperty('isFull', true);
            });

            test('it should add multiple items when under capacity', () => {
                expect(rb).toHaveProperty('isEmpty', true);
                expect(rb).toHaveProperty('isFull', false);
                const size = rb.put('a', 'b');
                expect(size).toBe(rb.length);
                expect(rb.length).toEqual(2);
                expect(rb).toHaveProperty('0', 'a');
                expect(rb).toHaveProperty('1', 'b');
                expect(rb).toHaveProperty('isEmpty', false);
                expect(rb).toHaveProperty('isFull', false);
            });

            test('it should add multiple items when at capacity', () => {
                const chars = 'abcdefghijklmn'.split('');
                rb = new RingBuffer(chars);
                expect(rb).toHaveProperty('isEmpty', false);
                expect(rb).toHaveProperty('isFull', false);
                const size = rb.put('o', 'p');
                expect(size).toBe(rb.length);
                expect(rb.length).toEqual(16);
                expect(rb).toHaveProperty('14', 'o');
                expect(rb).toHaveProperty('15', 'p');
                expect(rb).toHaveProperty('isEmpty', false);
                expect(rb).toHaveProperty('isFull', true);
            });

            test('it should add multiple items when over capacity', () => {
                const chars = 'abcdefghijklmno'.split('');
                rb = new RingBuffer(chars);
                const size = rb.put('p', 'q');
                expect(size).toBe(rb.length);
                expect(rb.length).toEqual(16);
                expect(rb).toHaveProperty('0', 'q');
                expect(rb).toHaveProperty('isEmpty', false);
                expect(rb).toHaveProperty('isFull', true);
            });
        });

        describe('get', () => {
            test('it should return undefined when empty', () => {
                const item = rb.get();
                expect(item).toBeUndefined();
            });

            test('it should return items', () => {
                let item;

                rb.put('a', 'b', 'c');
                expect(rb.length).toBe(3);

                item = rb.get();
                expect(item).toBe('a');
                expect(rb.length).toBe(2);
                expect(rb).toHaveProperty('0', undefined);
                expect(rb).toHaveProperty('1', 'b');
                expect(rb).toHaveProperty('2', 'c');

                item = rb.get();
                expect(item).toBe('b');
                expect(rb.length).toBe(1);

                item = rb.get();
                expect(item).toBe('c');
                expect(rb.length).toBe(0);

                item = rb.get();
                expect(item).toBeUndefined();
                expect(rb.length).toBe(0);
            });
        });

        test('it should be serializable', () => {
            rb.put('a', 'b', 'c');
            expect(rb.toJSON()).toEqual(['a', 'b', 'c']);
            expect(rb.toString()).toBe('a,b,c');
            expect(toString.call(rb)).toBe('[object RingBuffer]');
        });

        test('it should be iterable', () => {
            const result: (string | number)[] = [];
            rb.put('a', 'b', 'c');
            for (const item of rb) {
                result.push(item);
            }
            expect(result).toEqual(['a', 'b', 'c']);
        });

        test('iteration and serialization survive a head wrap, oldest first', () => {
            const wrapped = new RingBuffer<number>(4);
            wrapped.put(1, 2, 3);
            wrapped.get(); // tail advances — next puts wrap the head
            wrapped.get();
            wrapped.put(4, 5, 6);
            // The old numeric slot walk visited only positions 0..length-1
            // and dropped the elements past the wrap.
            expect([...wrapped]).toEqual([3, 4, 5, 6]);
            expect(wrapped.toJSON()).toEqual([3, 4, 5, 6]);
            expect(wrapped.toString()).toBe('3,4,5,6');
            expect(wrapped.get()).toBe(3);
            expect(wrapped.get()).toBe(4);
            expect(wrapped.get()).toBe(5);
            expect(wrapped.get()).toBe(6);
            expect(wrapped.isEmpty).toBe(true);
        });

        test('it should only allow numeric capacity', () => {
            (rb as { capacity: unknown }).capacity = 'a';
            expect(rb.capacity).toBe(RingBuffer.MIN_CAPACITY);
        });

        describe('peek / peekHead', () => {
            test('peek() should return undefined on empty buffer', () => {
                expect(rb.peek()).toBeUndefined();
            });

            test('peek() should return first element put (without changing length)', () => {
                rb.put('a', 'b', 'c');
                const result = rb.peek();
                expect(result).toBe('a');
                expect(rb.length).toBe(3);
            });

            test('peek() should return correct element after get() advances the tail', () => {
                rb.put('a', 'b', 'c');
                rb.get(); // Remove 'a'
                const result = rb.peek();
                expect(result).toBe('b');
                expect(rb.length).toBe(2);
            });

            test('peek() should return correct element when buffer is full (wraps)', () => {
                const chars = 'abcdefghijklmnop'.split('');
                rb = new RingBuffer(chars);
                const result = rb.peek();
                expect(result).toBe('a');
                expect(rb.length).toBe(16);
            });

            test('peekHead() should return undefined on empty buffer', () => {
                expect(rb.peekHead()).toBeUndefined();
            });

            test('peekHead() should return the last element added (without changing length)', () => {
                rb.put('a', 'b', 'c');
                const result = rb.peekHead();
                expect(result).toBe('c');
                expect(rb.length).toBe(3);
            });

            test('peekHead() should return different value from peek() when multiple elements present', () => {
                rb.put('a', 'b', 'c');
                const peekResult = rb.peek();
                const peekHeadResult = rb.peekHead();
                expect(peekResult).toBe('a');
                expect(peekHeadResult).toBe('c');
                expect(peekResult).not.toBe(peekHeadResult);
                expect(rb.length).toBe(3);
            });

            test('peekHead() should reflect newest after put() adds more items', () => {
                rb.put('a', 'b');
                const initialPeekHead = rb.peekHead();
                expect(initialPeekHead).toBe('b');

                rb.put('c');
                const newPeekHead = rb.peekHead();
                expect(newPeekHead).toBe('c');
                expect(rb.length).toBe(3);
            });
        });
    });
});
