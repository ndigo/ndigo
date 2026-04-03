/**
 * @author opencode
 */

import { bench, describe } from 'vitest';
import * as R from 'ramda';
import isNumber from '../src/type/is-number.js';
import isString from '../src/type/is-string.js';

let _sink = 0;

describe('is(String) vs typeof', () => {
    const inputs = ['hello', 42, null, {}, true, 'world', undefined, [], new String('x'), () => {}];

    bench('ramda: is(String, x)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (R.is(String, x)) {
                    count++;
                }
            }
        }
        _sink += count;
    });

    bench('native: typeof x === "string"', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (typeof x === 'string') {
                    count++;
                }
            }
        }
        _sink += count;
    });
});

describe('is(Number) vs typeof', () => {
    const inputs = [1, new Number(2), '3', 4, NaN, Infinity, null, {}, -5];

    bench('ramda: is(Number, x)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (R.is(Number, x)) {
                    count++;
                }
            }
        }
        _sink += count;
    });

    bench('native: typeof x === "number"', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (typeof x === 'number') {
                    count++;
                }
            }
        }
        _sink += count;
    });
});

describe('is(Function) vs typeof', () => {
    class ExampleClass {}
    const inputs = [
        () => 1,
        function namedFunction() {
            return 2;
        },
        ExampleClass,
        42,
        {},
        null,
        'fn',
    ];

    bench('ramda: is(Function, x)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (R.is(Function, x)) {
                    count++;
                }
            }
        }
        _sink += count;
    });

    bench('native: typeof x === "function"', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (typeof x === 'function') {
                    count++;
                }
            }
        }
        _sink += count;
    });
});

describe('is(ArrayBuffer) vs instanceof', () => {
    const inputs = [new ArrayBuffer(8), new ArrayBuffer(16), {}, [], 'buffer', null, undefined, 8];

    bench('ramda: is(ArrayBuffer, x)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (R.is(ArrayBuffer, x)) {
                    count++;
                }
            }
        }
        _sink += count;
    });

    bench('native: x instanceof ArrayBuffer', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (x instanceof ArrayBuffer) {
                    count++;
                }
            }
        }
        _sink += count;
    });
});

describe('isNil vs x == null', () => {
    const inputs = [null, undefined, 0, '', false, {}, [], NaN, 'value'];

    bench('ramda: isNil(x)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (R.isNil(x)) {
                    count++;
                }
            }
        }
        _sink += count;
    });

    bench('native: x == null', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (x == null) {
                    count++;
                }
            }
        }
        _sink += count;
    });
});

describe('isString wrapper vs typeof', () => {
    const inputs = ['blue', new String('util'), 123, '', {}, null, undefined, true, ['x']];

    bench('custom: isString(x)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (isString(x)) {
                    count++;
                }
            }
        }
        _sink += count;
    });

    bench('native: typeof x === "string"', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (typeof x === 'string') {
                    count++;
                }
            }
        }
        _sink += count;
    });
});

describe('isNumber wrapper vs native finite-number check', () => {
    const inputs = [1, -1, 0, 3.14, NaN, Infinity, new Number(2), '4', null, undefined, {}, false];

    bench('custom: isNumber(x)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (isNumber(x)) {
                    count++;
                }
            }
        }
        _sink += count;
    });

    bench('native: typeof + !isNaN + isFinite', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (typeof x === 'number' && !isNaN(x) && isFinite(x)) {
                    count++;
                }
            }
        }
        _sink += count;
    });
});
