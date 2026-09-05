import { bench, describe } from 'vitest';

const consume = (...values: unknown[]): void => {
    void values;
};

describe('pipe vs manual chain', () => {
    const add1 = (x: number) => x + 1;
    const double = (x: number) => x * 2;
    const square = (x: number) => x * x;
    const manual = (x: number) => square(double(add1(x)));

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

    const manual = (input: Record<string, number>) =>
        Object.keys(input).sort(sortAsc).map(toTagged).filter(keepWithA).join(';');

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
    const manual = (x: number) => square(double(add1(x)));

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
    const nativeCurried = (a: number) => (b: number) => (c: number) => tri(a, b, c);

    bench('native: (a)=>(b)=>(c)=>fn(a,b,c)', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += nativeCurried(i)(i + 1)(i + 2);
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
    const manualCurried = (object: Record<string, number>) => (key: string) => getOrNil(object, key);
    const object = {
        a: 1,
        b: 2,
        c: 3,
    };
    const keys = ['a', 'b', 'c', 'z'];

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
    const manualAlways = () => value;

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
    const manualTrue = () => true;

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
    const nativeIdentity = (x: number) => x;

    bench('native: (x) => x', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += nativeIdentity(i);
        }
        consume(sum);
    });
});
