/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { MultiValueMap } from '../src/multi-value-map.js';
import { RingBuffer } from '../src/ring-buffer.js';

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

        test('it should only allow numeric capacity', () => {
            (rb as { capacity: unknown }).capacity = 'a';
            expect(rb.capacity).toBe(RingBuffer.MIN_CAPACITY);
        });
    });
});

describe('MultiValueMap', () => {
    let map: MultiValueMap<string, string>;

    beforeEach(() => {
        map = new MultiValueMap();
    });

    afterEach(() => {
        map = undefined as unknown as MultiValueMap<string, string>;
    });

    test('it should add values to a key', () => {
        map.add('key', 'value1');
        map.add('key', 'value2');
        expect(map.size).toBe(1);
        expect(map.get('key')).toEqual(['value1', 'value2']);
    });

    test('it should be serializable', () => {
        expect(toString.call(map)).toBe('[object MultiValueMap]');
    });
});
