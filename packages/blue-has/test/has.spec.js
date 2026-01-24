import { has, had, defineDetector, defineDetectors, resetDetector } from '../src/has';

describe('has', function () {
    test('it should inherit from had', function () {
        const prototype = Reflect.getPrototypeOf(has);
        expect(prototype).toBe(had);
    });

    test('it should have preset values', function () {
        expect(has).to.have.ownProperty('reflect').that.is.true;
        expect(has).to.have.ownProperty('reflect_defineproperty').that.is.true;
        expect(has).to.have.ownProperty('reflect_deleteproperty').that.is.true;
        expect(has).to.have.ownProperty('reflect_setprototypeof').that.is.true;
    });
});

describe('defineDetector', function () {
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    test('it should define detectors on had', function () {
        defineDetector('test', () => true);
        expect(hasOwnProperty.call(has, 'test')).toBe(false);
        expect(hasOwnProperty.call(had, 'test')).toBe(true);
        expect(has.test).toBe(true);
        expect(hasOwnProperty.call(has, 'test')).toBe(true);
    });
});

describe('defineDetectors', function () {
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    test('it should define detectors on had', function () {
        defineDetectors(function () {
            return { test1: () => true, test2: () => true };
        });
        expect(hasOwnProperty.call(has, 'test1')).toBe(false);
        expect(hasOwnProperty.call(has, 'test2')).toBe(false);
        expect(hasOwnProperty.call(had, 'test1')).toBe(true);
        expect(hasOwnProperty.call(had, 'test2')).toBe(true);
        expect(has.test1).toBe(true);
        expect(has.test2).toBe(true);
        expect(hasOwnProperty.call(has, 'test1')).toBe(true);
        expect(hasOwnProperty.call(has, 'test2')).toBe(true);
    });
});

describe('resetDetector', function () {
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    test('it should define detectors on had', function () {
        defineDetectors(function () {
            return { test3: () => true, test4: () => true };
        });
        expect(hasOwnProperty.call(has, 'test3')).toBe(false);
        expect(hasOwnProperty.call(has, 'test4')).toBe(false);
        expect(hasOwnProperty.call(had, 'test3')).toBe(true);
        expect(hasOwnProperty.call(had, 'test4')).toBe(true);
        expect(has.test3).toBe(true);
        expect(has.test4).toBe(true);
        expect(hasOwnProperty.call(has, 'test3')).toBe(true);
        expect(hasOwnProperty.call(has, 'test4')).toBe(true);
        resetDetector('test3');
        expect(hasOwnProperty.call(has, 'test3')).toBe(false);
        expect(hasOwnProperty.call(had, 'test3')).toBe(true);
    });
});
