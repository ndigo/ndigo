import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { MultiValueMap } from '../src/multi-value-map';

const toString = Object.prototype.toString;

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

    describe('remove', () => {
        test('removes an existing value and returns true', () => {
            map.add('key', 'value1');
            map.add('key', 'value2');
            const result = map.remove('key', 'value1');
            expect(result).toBe(true);
            expect(map.get('key')).toEqual(['value2']);
        });

        test('returns false when value not present', () => {
            map.add('key', 'value1');
            const result = map.remove('key', 'value2');
            expect(result).toBe(false);
            expect(map.get('key')).toEqual(['value1']);
        });

        test('returns false when key not present', () => {
            const result = map.remove('key', 'value1');
            expect(result).toBe(false);
        });

        test('deletes the key when last value is removed', () => {
            map.add('key', 'value1');
            const result = map.remove('key', 'value1');
            expect(result).toBe(true);
            expect(map.has('key')).toBe(false);
            expect(map.size).toBe(0);
        });

        test('removes only the first occurrence when duplicates exist', () => {
            map.add('key', 'value1');
            map.add('key', 'value1');
            const result = map.remove('key', 'value1');
            expect(result).toBe(true);
            expect(map.get('key')).toEqual(['value1']);
        });

        test('does not affect other keys', () => {
            map.add('key1', 'value1');
            map.add('key2', 'value2');
            map.remove('key1', 'value1');
            expect(map.has('key1')).toBe(false);
            expect(map.has('key2')).toBe(true);
            expect(map.get('key2')).toEqual(['value2']);
        });
    });
});
