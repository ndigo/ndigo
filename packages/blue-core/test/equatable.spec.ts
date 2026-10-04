/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import { equates, likeEquatable } from '../src/equatable';
import type { Equatable } from '../src/equatable';

describe('likeEquatable', () => {
    test('it should return true for objects with an equals method', () => {
        expect(likeEquatable({ equals: () => true })).toBe(true);
    });

    test('it should return false for objects without equals', () => {
        expect(likeEquatable({})).toBe(false);
    });

    test('it should return false for primitives', () => {
        expect(likeEquatable('hello')).toBe(false);
        expect(likeEquatable(42)).toBe(false);
    });

    test('it should return false for null and undefined', () => {
        expect(likeEquatable(null)).toBe(false);
        expect(likeEquatable(undefined)).toBe(false);
    });
});

class SecretValue implements Equatable {
    #value: number;

    constructor(value: number) {
        this.#value = value;
    }

    equals(other: unknown): boolean {
        return other instanceof SecretValue && this.#value === other.#value;
    }
}

class MinimumValue implements Equatable {
    constructor(private readonly minimum: number) {}

    equals(other: unknown): boolean {
        return other instanceof MinimumValue && other.minimum >= this.minimum;
    }
}

describe('equates', () => {
    test('compares value objects by their domain equality, including hidden state', () => {
        expect(equates(new SecretValue(1), new SecretValue(1))).toBe(true);
        expect(equates(new SecretValue(1), new SecretValue(2))).toBe(false);
    });

    test('uses the left value object equality when its domain is directional', () => {
        expect(equates(new MinimumValue(1), new MinimumValue(2))).toBe(true);
        expect(equates(new MinimumValue(2), new MinimumValue(1))).toBe(false);
    });

    test('does not structurally compare a value object with a non-value object', () => {
        const value = new SecretValue(1);
        expect(equates(value, {})).toBe(false);
        expect(equates({}, value)).toBe(false);
        expect(equates(value, value)).toBe(true);
    });

    test('retains strict primitive equality', () => {
        const symbol = Symbol('value');
        expect(equates(42, 42)).toBe(true);
        expect(equates('a', 'a')).toBe(true);
        expect(equates(true, true)).toBe(true);
        expect(equates(42n, 42n)).toBe(true);
        expect(equates(symbol, symbol)).toBe(true);
        expect(equates(null, null)).toBe(true);
        expect(equates(undefined, undefined)).toBe(true);
        expect(equates(0, -0)).toBe(true);
        expect(equates(NaN, NaN)).toBe(false);
        expect(equates(42, 43)).toBe(false);
        expect(equates(42, '42')).toBe(false);
        expect(equates(null, undefined)).toBe(false);
        expect(equates(Symbol('value'), Symbol('value'))).toBe(false);
    });

    test('compares plain records and arrays recursively without casts', () => {
        const left: unknown = { values: [1, { name: 'blue' }] };
        const right: unknown = { values: [1, { name: 'blue' }] };
        expect(equates(left, right)).toBe(true);
        expect(equates(left, { values: [1, { name: 'red' }] })).toBe(false);
        expect(equates([1], [1, 2])).toBe(false);
        expect(equates([], {})).toBe(false);
    });

    test('preserves plain record prototypes', () => {
        const left = Object.assign(Object.create(null), { value: 1 });
        const right = Object.assign(Object.create(null), { value: 1 });
        expect(equates(left, right)).toBe(true);
        expect(equates(left, { value: 1 })).toBe(false);
    });

    test('compares own enumerable string and symbol keys, not inherited keys', () => {
        const key = Symbol('key');
        expect(equates({ [key]: 1 }, { [key]: 1 })).toBe(true);
        expect(equates({ [key]: 1 }, { [key]: 2 })).toBe(false);
        expect(equates({ [key]: 1 }, { [Symbol('key')]: 1 })).toBe(false);
        expect(equates({ toString: Object.prototype.toString }, { other: Object.prototype.toString })).toBe(false);
        expect(equates(Object.defineProperty({}, 'hidden', { value: 1 }), {})).toBe(true);
        const hiddenKey = Object.defineProperty({ other: 1 }, 'value', { value: 1 });
        expect(equates({ value: 1 }, hiddenKey)).toBe(false);
        expect(equates(hiddenKey, { value: 1 })).toBe(false);
    });

    test('distinguishes array holes from present undefined and compares extra enumerable properties', () => {
        expect(equates(new Array(1), [undefined])).toBe(false);
        expect(equates(new Array(1), new Array(1))).toBe(true);
        expect(equates(Object.defineProperty([], '0', { value: undefined }), [undefined])).toBe(true);
        const key = Symbol('label');
        const left = Object.assign([1], { label: 'blue', [key]: 2 });
        expect(equates(left, Object.assign([1], { label: 'blue', [key]: 2 }))).toBe(true);
        expect(equates(left, Object.assign([1], { label: 'red', [key]: 2 }))).toBe(false);
        expect(equates(left, Object.assign([1], { label: 'blue', [key]: 3 }))).toBe(false);
    });

    test('dispatches nested value objects through their domain equality', () => {
        expect(equates({ value: [new SecretValue(1)] }, { value: [new SecretValue(1)] })).toBe(true);
        expect(equates({ value: [new SecretValue(1)] }, { value: [new SecretValue(2)] })).toBe(false);
        expect(equates({ value: new SecretValue(1) }, { value: {} })).toBe(false);
    });

    test('compares Dates by timestamp', () => {
        expect(equates(new Date(1), new Date(1))).toBe(true);
        expect(equates(new Date(1), new Date(2))).toBe(false);
        expect(equates({ date: new Date(1) }, { date: new Date(2) })).toBe(false);
        expect(equates(new Date(NaN), new Date(NaN))).toBe(false);
        expect(equates(new Date(1), {})).toBe(false);
    });

    test('compares Map keys by native identity and values recursively', () => {
        const key = {};
        expect(equates(new Map([[key, { value: 1 }]]), new Map([[key, { value: 1 }]]))).toBe(true);
        expect(equates(new Map([[key, 1]]), new Map([[key, 2]]))).toBe(false);
        expect(equates(new Map([[{}, 1]]), new Map([[{}, 1]]))).toBe(false);
        expect(equates(new Map([['a', undefined]]), new Map([['b', undefined]]))).toBe(false);
        expect(equates(new Map(), new Map([['a', 1]]))).toBe(false);
        expect(
            equates(
                new Map([
                    [NaN, 1],
                    [0, 2],
                ]),
                new Map([
                    [-0, 2],
                    [NaN, 1],
                ])
            )
        ).toBe(true);
        expect(equates(new Map([['a', new SecretValue(1)]]), new Map([['a', new SecretValue(2)]]))).toBe(false);
    });

    test('compares Set members by native membership rather than structural equality', () => {
        const member = {};
        expect(equates(new Set([member, 1]), new Set([1, member]))).toBe(true);
        expect(equates(new Set([1]), new Set([2]))).toBe(false);
        expect(equates(new Set(), new Set([1]))).toBe(false);
        expect(equates(new Set([{}]), new Set([{}]))).toBe(false);
        expect(equates(new Set([NaN, 0]), new Set([-0, NaN]))).toBe(true);
        expect(equates(new Set([new SecretValue(1)]), new Set([new SecretValue(1)]))).toBe(false);
    });

    test('compares corresponding record and array cycles', () => {
        const left: { value: number; next?: unknown } = { value: 1 };
        const right: { value: number; next?: unknown } = { value: 1 };
        left.next = left;
        right.next = right;
        expect(equates(left, right)).toBe(true);
        right.value = 2;
        expect(equates(left, right)).toBe(false);
        const leftArray: unknown[] = [];
        const rightArray: unknown[] = [];
        leftArray.push(leftArray);
        rightArray.push(rightArray);
        expect(equates(leftArray, rightArray)).toBe(true);
    });

    test('rejects different cycle structures in either direction, including shared references', () => {
        const self: { next?: unknown } = {};
        self.next = self;
        const first: { next?: unknown } = {};
        const second = { next: first };
        first.next = second;
        expect(equates(self, first)).toBe(false);
        expect(equates(first, self)).toBe(false);
        const overlapping = { next: self };
        expect(equates(self, overlapping)).toBe(false);
        expect(equates(overlapping, self)).toBe(false);
        const shared: { owner?: unknown } = {};
        const left = { child: shared };
        shared.owner = left;
        const right = { child: shared };
        expect(equates(left, right)).toBe(false);
        expect(equates(right, left)).toBe(false);
    });

    test('compares cyclic Map values and ignores non-cyclic sharing', () => {
        const left = new Map<string, unknown>();
        const right = new Map<string, unknown>();
        left.set('self', left);
        right.set('self', right);
        expect(equates(left, right)).toBe(true);
        right.set('self', new Map([['self', right]]));
        expect(equates(left, right)).toBe(false);
        const shared = { value: 1 };
        expect(equates([shared, shared], [{ value: 1 }, { value: 1 }])).toBe(true);
    });

    test('uses identity for unsupported hidden-state classes and object kinds', () => {
        class HiddenValue {
            #value: number;
            constructor(value: number) {
                this.#value = value;
            }
            value(): number {
                return this.#value;
            }
        }
        const hidden = new HiddenValue(1);
        expect(equates(hidden, hidden)).toBe(true);
        expect(equates(hidden, new HiddenValue(1))).toBe(false);
        expect(equates(hidden, new HiddenValue(2))).toBe(false);
        for (const [left, right] of [
            [/blue/, /blue/],
            [new WeakMap(), new WeakMap()],
            [new WeakSet(), new WeakSet()],
            [Promise.resolve(1), Promise.resolve(1)],
            [() => 1, () => 1],
        ]) {
            expect(equates(left, left)).toBe(true);
            expect(equates(left, right)).toBe(false);
        }
    });

    test('uses identity for subclasses of supported built-ins', () => {
        class CustomDate extends Date {}
        class CustomMap extends Map {}
        class CustomSet extends Set {}
        class CustomArray extends Array {}
        for (const [left, right] of [
            [new CustomDate(1), new CustomDate(1)],
            [new CustomMap(), new CustomMap()],
            [new CustomSet(), new CustomSet()],
            [new CustomArray(), new CustomArray()],
        ]) {
            expect(equates(left, left)).toBe(true);
            expect(equates(left, right)).toBe(false);
        }
    });
});
