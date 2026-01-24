import { describe, test, expect } from 'vitest';
import { Null } from '@blue/core';
import { Level, AsLevelComparator } from '../src/level';

const ONE = new Level('one', 100);
const TWO = new Level('two', 200);
const THREE = new Level('three', 300);

describe('Level', () => {
    test('it should be a function', () => {
        expect(Level).toBeInstanceOf(Function);
    });

    test('it should create levels', () => {
        expect(ONE).toBeInstanceOf(Level);
    });

    test('it should be comparable', () => {
        expect(ONE.compareTo(TWO)).toBe(-1);
        expect(ONE.compareTo(ONE)).toBe(0);
        expect(THREE.compareTo(TWO)).toBe(1);

        expect(() => ONE.compareTo('two' as any)).toThrow(TypeError);
    });

    test('it should be serializable', () => {
        expect(ONE.toString()).toBe('one');
        expect(ONE.toJSON()).toBe('one');
        expect(Object.prototype.toString.call(ONE)).toBe('[object Level:one]');
    });
});

describe('AsLevelComparator', () => {
    const TestComparator = AsLevelComparator(Null);

    test('it should compare levels', () => {
        const comparator = new TestComparator();
        expect(comparator.compare(ONE, TWO)).toBe(-1);
        expect(comparator.compare(ONE, ONE)).toBe(0);
        expect(comparator.compare(THREE, TWO)).toBe(1);

        expect(() => comparator.compare('one' as any, TWO)).toThrow(TypeError);
        expect(() => comparator.compare(ONE, 'two' as any)).toThrow(TypeError);
    });
});
