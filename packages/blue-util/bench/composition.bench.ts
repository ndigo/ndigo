/** @author opencode */

import * as R from 'ramda';
import { bench, describe } from 'vitest';

const consume = (...values: unknown[]): void => {
    void values;
};

describe('pipe vs manual chain', () => {
    const add1 = (x: number) => x + 1;
    const double = (x: number) => x * 2;
    const square = (x: number) => x * x;
    const piped = R.pipe(add1, double, square);
    const manual = (x: number) => square(double(add1(x)));

    bench('ramda: pipe(add1, double, square)', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += piped(i);
        }
        consume(sum);
    });

    bench('native: square(double(add1(x)))', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += manual(i);
        }
        consume(sum);
    });
});

describe('pipe (5 steps) vs manual chaining', () => {
    const source = {
        zebra: 1,
        alpha: 2,
        gamma: 3,
        delta: 4,
        beta: 5,
    };
    const toTagged = (key: string) => `${key}:x`;
    const keepWithA = (value: string) => value.includes('a');
    const sortAsc = (a: string, b: string) => a.localeCompare(b);
    const keysOf = (input: Record<string, number>) => R.keys(input) as string[];

    const piped = R.pipe(keysOf, R.sort(sortAsc), R.map(toTagged), R.filter(keepWithA), R.join(';')) as (
        input: Record<string, number>
    ) => string;

    const manual = (input: Record<string, number>) =>
        Object.keys(input).sort(sortAsc).map(toTagged).filter(keepWithA).join(';');

    bench("ramda: pipe(keys, sort, map, filter, join(';'))", () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += piped(source).length;
        }
        consume(total);
    });

    bench("native: keys().sort().map().filter().join(';')", () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += manual(source).length;
        }
        consume(total);
    });
});

describe('compose vs manual chain', () => {
    const add1 = (x: number) => x + 1;
    const double = (x: number) => x * 2;
    const square = (x: number) => x * x;
    const composed = R.compose(square, double, add1);
    const manual = (x: number) => square(double(add1(x)));

    bench('ramda: compose(square, double, add1)', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += composed(i);
        }
        consume(sum);
    });

    bench('native: square(double(add1(x)))', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += manual(i);
        }
        consume(sum);
    });
});

describe('curry (3 args) partial and full application', () => {
    const tri = (a: number, b: number, c: number) => a + b * c;
    const ramdaCurried = R.curry(tri);
    const nativeCurried = (a: number) => (b: number) => (c: number) => tri(a, b, c);

    bench('ramda: curry(fn)(a)(b)(c)', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += ramdaCurried(i)(i + 1)(i + 2);
        }
        consume(sum);
    });

    bench('native: (a)=>(b)=>(c)=>fn(a,b,c)', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += nativeCurried(i)(i + 1)(i + 2);
        }
        consume(sum);
    });

    bench('ramda: curry(fn) partial application', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            const withA = ramdaCurried(i);
            const withAB = withA(i + 1);
            sum += withAB(i + 2);
        }
        consume(sum);
    });

    bench('native: manual partial application', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            const withA = nativeCurried(i);
            const withAB = withA(i + 1);
            sum += withAB(i + 2);
        }
        consume(sum);
    });
});

describe('curryN(2, fn) vs manual curried function', () => {
    const getOrNil = (object: Record<string, number>, key: string) => object[key] ?? -1;
    const ramdaCurried = R.curryN(2, getOrNil);
    const manualCurried = (object: Record<string, number>) => (key: string) => getOrNil(object, key);
    const object = {
        a: 1,
        b: 2,
        c: 3,
    };
    const keys = ['a', 'b', 'c', 'z'];

    bench('ramda: curryN(2, fn)', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            const getter = ramdaCurried(object);
            sum += getter(keys[i % keys.length]);
        }
        consume(sum);
    });

    bench('native: (object) => (key) => fn(object, key)', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            const getter = manualCurried(object);
            sum += getter(keys[i % keys.length]);
        }
        consume(sum);
    });
});

describe('always(value) vs () => value', () => {
    const value = { answer: 42 };
    const alwaysValue = R.always(value);
    const manualAlways = () => value;

    bench('ramda: always(value)', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            if (alwaysValue().answer === 42) {
                sum++;
            }
        }
        consume(sum);
    });

    bench('native: () => value', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            if (manualAlways().answer === 42) {
                sum++;
            }
        }
        consume(sum);
    });
});

describe('T() vs () => true', () => {
    const alwaysTrue = R.T;
    const manualTrue = () => true;

    bench('ramda: T()', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            if (alwaysTrue()) {
                sum++;
            }
        }
        consume(sum);
    });

    bench('native: () => true', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            if (manualTrue()) {
                sum++;
            }
        }
        consume(sum);
    });
});

describe('identity(x) vs (x) => x', () => {
    const ramdaIdentity = R.identity;
    const nativeIdentity = (x: number) => x;

    bench('ramda: identity(x)', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += ramdaIdentity(i);
        }
        consume(sum);
    });

    bench('native: (x) => x', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += nativeIdentity(i);
        }
        consume(sum);
    });
});
