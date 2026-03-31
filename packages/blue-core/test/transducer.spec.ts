import { describe, test, expect } from 'vitest';
import {
    XDelegatingTransformer,
    likeReduced,
    likeTransformer,
    reduce,
    toArray,
    toRecord,
    toMap,
    toSet,
} from '../src/transducer';
import { compose, identity } from '@blue/util/function';
import { into } from '@blue/util/list';

class XDoubleTransformer extends XDelegatingTransformer<any, any, any> {
    ['@@transducer/step'](result: any, input: any): any {
        expect(input).toBeTypeOf('number');
        return this.xf['@@transducer/step'](result, input * 2);
    }
}

class XEvenTransformer extends XDelegatingTransformer<any, any, any> {
    ['@@transducer/step'](result: any, input: any): any {
        expect(input).toBeTypeOf('number');
        return input % 2 === 0 ? this.xf['@@transducer/step'](result, input) : result;
    }
}

const xDouble = (xf: any) => new XDoubleTransformer(xf);
const xEven = (xf: any) => new XEvenTransformer(xf);

describe('XDelegatingTransformer', () => {
    describe('instances', () => {
        test('it should transduce values', () => {
            const result = into([], xDouble, [1, 2, 3, 4]);
            expect(result).toEqual([2, 4, 6, 8]);
        });

        test('it should be composable', () => {
            const result = into([], compose(xEven, xDouble), [1, 2, 3, 4]);
            expect(result).toEqual([4, 8]);
        });
    });
});

describe('likeReduced', () => {
    test('it should identify reduced values', () => {
        expect(likeReduced({})).toBe(false);
        expect(likeReduced({ ['@@transducer/reduced']: 123 })).toBe(true);
    });
});

describe('likeTransformer', () => {
    test('it should identify reduced values', () => {
        expect(likeTransformer({})).toBe(false);
        expect(likeTransformer({ ['@@transducer/step']: function () {} })).toBe(true);
    });
});

describe('reduce', () => {
    test('it should reduce values', () => {
        const reduced = reduce(123);
        expect(reduced).toHaveProperty('@@transducer/reduced');
        expect(reduced).toHaveProperty('@@transducer/value');
        expect(reduced['@@transducer/reduced']).toBe(true);
        expect(reduced['@@transducer/value']).toBe(123);
    });

    test('it should return already reduced values', () => {
        const reduced = {
            ['@@transducer/reduced']: true,
            ['@@transducer/value']: 123,
        };
        expect(reduce(reduced)).toBe(reduced);
    });
});

describe('toArray', () => {
    test('it should return an array', () => {
        const result = into([], toArray(), 'abc');
        expect(result).toEqual(['a', 'b', 'c']);
    });
});

describe('toRecord', () => {
    test('it should return a record', () => {
        const result = into({}, toRecord(identity, identity), 'abc');
        expect(result).toHaveProperty('a', 'a');
        expect(result).toHaveProperty('b', 'b');
        expect(result).toHaveProperty('c', 'c');
    });
});

describe('toMap', () => {
    test('it should return a map', () => {
        const result = into(new Map(), toMap(identity, identity), 'abc');
        expect(Array.from(result.keys())).toEqual(['a', 'b', 'c']);
        expect(Array.from(result.values())).toEqual(['a', 'b', 'c']);
    });
});

describe('toSet', () => {
    test('it should return a set', () => {
        const result = into(new Set(), toSet(), 'abc');
        expect(Array.from(result)).toEqual(['a', 'b', 'c']);
    });
});
