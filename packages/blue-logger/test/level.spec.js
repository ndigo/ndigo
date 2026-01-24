import { Null } from '@blue/core';
import { Level, AsLevelComparator } from '../src/level';

const ONE = new Level('one', 100),
    TWO = new Level('two', 200),
    THREE = new Level('three', 300);

describe('Level', function () {
    test('it should be a function', function () {
        expect(Level).toBeInstanceOf(Function);
    });

    test('it should create levels', function () {
        expect(ONE).toBeInstanceOf(Level);
    });

    test('it should be comparable', function () {
        expect(ONE.compareTo(TWO)).toBe(-1);
        expect(ONE.compareTo(ONE)).toBe(0);
        expect(THREE.compareTo(TWO)).toBe(1);

        expect(() => ONE.compareTo('two')).toThrow(TypeError);
    });

    test('it should be serializable', function () {
        expect(ONE.toString()).toBe('one');
        expect(ONE.toJSON()).toBe('one');
        expect(Object.prototype.toString.call(ONE)).toBe('[object Level:one]');
    });
});

describe('AsLevelComparator', function () {
    const TestComparator = AsLevelComparator(Null);

    test('it should compare levels', function () {
        const comparator = new TestComparator();
        expect(comparator.compare(ONE, TWO)).toBe(-1);
        expect(comparator.compare(ONE, ONE)).toBe(0);
        expect(comparator.compare(THREE, TWO)).toBe(1);

        expect(() => comparator.compare('one', TWO)).toThrow(TypeError);
        expect(() => comparator.compare(ONE, 'two')).toThrow(TypeError);
    });
});
