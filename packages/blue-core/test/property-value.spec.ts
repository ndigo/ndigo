/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { MutablePropertyValues, PropertyValue, PropertyValues } from '../src/property-value';

describe('PropertyValue', () => {
    test('compares the name as well as the wrapped value', () => {
        const property = new PropertyValue('present', undefined);

        expect(property.equals(property)).toBe(true);
        expect(property.equals(new PropertyValue('present', undefined))).toBe(true);
        expect(property.equals(new PropertyValue('missing', undefined))).toBe(false);
        expect(property.equals(undefined)).toBe(false);
    });

    test('compares arbitrary nested values without serialization', () => {
        const member = {};
        const left = new PropertyValue('options', {
            entries: new Map([[member, [undefined, new Date(123), { enabled: true }]]]),
            members: new Set([member, NaN]),
        });
        const right = new PropertyValue('options', {
            entries: new Map([[member, [undefined, new Date(123), { enabled: true }]]]),
            members: new Set([NaN, member]),
        });
        const different = new PropertyValue('options', {
            entries: new Map([[member, [undefined, new Date(456), { enabled: true }]]]),
            members: new Set([member, NaN]),
        });

        expect(left.equals(right)).toBe(true);
        expect(right.equals(left)).toBe(true);
        expect(left.equals(different)).toBe(false);
        expect(different.equals(left)).toBe(false);
    });

    test('compares nested equatable values by their value semantics', () => {
        class Label {
            constructor(readonly text: string) {}

            equals(value: unknown): boolean {
                return value instanceof Label && this.text.toLowerCase() === value.text.toLowerCase();
            }
        }
        const left = new PropertyValue('labels', [new Label('BLUE')]);
        const right = new PropertyValue('labels', [new Label('blue')]);
        const different = new PropertyValue('labels', [new Label('red')]);

        expect(left.equals(right)).toBe(true);
        expect(right.equals(left)).toBe(true);
        expect(left.equals(different)).toBe(false);
        expect(different.equals(left)).toBe(false);
    });

    test('compares matching cyclic wrapped records', () => {
        const left: { self?: unknown } = {};
        left.self = left;
        const right: { self?: unknown } = {};
        right.self = right;

        expect(new PropertyValue('cycle', left).equals(new PropertyValue('cycle', right))).toBe(true);
    });
});

describe('MutablePropertyValues', () => {
    test('compares identical references and distinct empty collections equally', () => {
        const left = new MutablePropertyValues();
        const right = new MutablePropertyValues();

        expect(left.equals(left)).toBe(true);
        expect(left.equals(right)).toBe(true);
        expect(right.equals(left)).toBe(true);
        expect(left.equals(undefined)).toBe(false);
    });

    test('compares property pairs independently of their order', () => {
        const left = new MutablePropertyValues([new PropertyValue('a', 1), new PropertyValue('b', { nested: [2] })]);
        const right = new MutablePropertyValues([new PropertyValue('b', { nested: [2] }), new PropertyValue('a', 1)]);

        expect(left.equals(right)).toBe(true);
        expect(right.equals(left)).toBe(true);
    });

    test('retains every duplicate pair when reordered', () => {
        const left = new MutablePropertyValues([
            new PropertyValue('a', 1), new PropertyValue('a', 2), new PropertyValue('a', 1),
        ]);
        const right = new MutablePropertyValues([
            new PropertyValue('a', 1), new PropertyValue('a', 1), new PropertyValue('a', 2),
        ]);

        expect(left.equals(right)).toBe(true);
        expect(right.equals(left)).toBe(true);
    });

    test('distinguishes duplicate pair multiplicity at the same collection length', () => {
        const left = new MutablePropertyValues([
            new PropertyValue('a', 1), new PropertyValue('a', 1), new PropertyValue('b', 2),
        ]);
        const right = new MutablePropertyValues([
            new PropertyValue('a', 1), new PropertyValue('b', 2), new PropertyValue('b', 2),
        ]);

        expect(left.equals(right)).toBe(false);
        expect(right.equals(left)).toBe(false);
    });

    test('does not let the first value for a name mask a different duplicate value', () => {
        const left = new MutablePropertyValues([new PropertyValue('a', 1), new PropertyValue('a', 1)]);
        const right = new MutablePropertyValues([new PropertyValue('a', 1), new PropertyValue('a', 2)]);

        expect(left.equals(right)).toBe(false);
        expect(right.equals(left)).toBe(false);
    });

    test('distinguishes a present undefined value from a missing name', () => {
        const left = new MutablePropertyValues([new PropertyValue('present', undefined)]);
        const right = new MutablePropertyValues([new PropertyValue('other', undefined)]);

        expect(left.equals(right)).toBe(false);
        expect(right.equals(left)).toBe(false);
    });

    test('distinguishes collections of different lengths', () => {
        const left = new MutablePropertyValues([new PropertyValue('a', 1)]);
        const right = new MutablePropertyValues([new PropertyValue('a', 1), new PropertyValue('a', 1)]);

        expect(left.equals(right)).toBe(false);
        expect(right.equals(left)).toBe(false);
    });

    test('returns the matching property or null through the collection interface', () => {
        const property = new PropertyValue('present', undefined);
        const properties: PropertyValues = new MutablePropertyValues([property]);
        const missing: PropertyValue | null = properties.getPropertyValue('missing');

        expect(properties.getPropertyValue('present')).toBe(property);
        expect(missing).toBeNull();
    });
});
