import { describe, test, expect } from 'vitest';

import empty from './empty';

describe('empty', function () {
    test('dispatches to `empty` method', function () {
        function Nothing() {}
        Nothing.prototype.empty = function () {
            return new Nothing();
        };

        function Just(x) {
            this.value = x;
        }
        Just.prototype.empty = function () {
            return new Nothing();
        };

        expect(empty(new Nothing()).constructor).toEqual(Nothing);
        expect(empty(new Just(123)).constructor).toEqual(Nothing);
    });

    test('dispatches to `empty` function on constructor', function () {
        function Nothing() {}
        Nothing.empty = function () {
            return new Nothing();
        };

        function Just(x) {
            this.value = x;
        }
        Just.empty = function () {
            return new Nothing();
        };

        expect(empty(new Nothing()).constructor).toEqual(Nothing);
        expect(empty(new Just(123)).constructor).toEqual(Nothing);
    });

    test('returns empty array given array', function () {
        expect(empty([1, 2, 3])).toEqual([]);
    });

    test('returns empty typed array of equivalent type given typed array', function () {
        expect(empty(Uint8Array.from('123' as Iterable<number>))).toEqual(Uint8Array.from('' as Iterable<number>));
        expect(empty(Uint8Array.from('123' as Iterable<number>)).constructor.name).toBe('Uint8Array');
        expect(empty(new Float32Array([1, 2, 3]))).toEqual(new Float32Array([]));
        expect(empty(new Float32Array([1, 2, 3])).constructor.name).toBe('Float32Array');
    });

    test('returns empty object given object', function () {
        expect(empty({ x: 1, y: 2 })).toEqual({});
    });

    test('returns empty string given string', function () {
        expect(empty('abc')).toBe('');
        expect(empty(new String('abc'))).toBe('');
    });

    test('returns empty arguments object given arguments object', function () {
        // @ts-ignore
        const x = (function () {
            return arguments;
        })(1, 2, 3);
        expect(empty(x)).toEqual(
            (function () {
                return arguments;
            })()
        );
    });
});
