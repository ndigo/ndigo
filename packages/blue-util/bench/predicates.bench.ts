/**
 * @author opencode
 */

import { bench, describe } from 'vitest';
import isNumber from '../src/type/is-number.js';
import isString from '../src/type/is-string.js';

let _sink = 0;

describe('typeof', () => {
    const inputs = ['hello', 42, null, {}, true, 'world', undefined, [], new String('x'), () => {}];

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

describe('typeof', () => {
    const inputs = [1, new Number(2), '3', 4, NaN, Infinity, null, {}, -5];

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

describe('typeof', () => {
    const inputs = [
        () => 1,
        function namedFunction() {
            return 2;
        },
        class ExampleClass {},
        42,
        {},
        null,
        'fn',
    ];

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

describe('instanceof', () => {
    const inputs = [new ArrayBuffer(8), new ArrayBuffer(16), {}, [], 'buffer', null, undefined, 8];

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

describe('x == null', () => {
    const inputs = [null, undefined, 0, '', false, {}, [], NaN, 'value'];

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

describe('typeof', () => {
    const inputs = ['blue', new String('util'), 123, '', {}, null, undefined, true, ['x']];

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

describe('typeof + !isNaN + isFinite', () => {
    const inputs = [1, -1, 0, 3.14, NaN, Infinity, new Number(2), '4', null, undefined, {}, false];

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
