const { expect } = require('chai');
//import { spy } from 'sinon';
import {
    DelegatingTransformer,
    likeReduced,
    likeTransformer,
    reduce,
    toArray,
    toRecord,
    toMap,
    toSet,
} from '../src/transducer';
import { compose, identity, into } from '@blue/util';

class XDoubleTransformer extends DelegatingTransformer {
    ['@@transducer/step'](result, input) {
        expect(input).to.be.a('number');
        return this.xf['@@transducer/step'](result, input * 2);
    }
}

class XEvenTransformer extends DelegatingTransformer {
    ['@@transducer/step'](result, input) {
        expect(input).to.be.a('number');
        return input % 2 === 0 ? this.xf['@@transducer/step'](result, input) : result;
    }
}

const xDouble = (xf) => new XDoubleTransformer(xf);
const xEven = (xf) => new XEvenTransformer(xf);

describe('DelegatingTransformer', function () {
    context('instances', function () {
        test('it should transduce values', function () {
            const result = into([], xDouble, [1, 2, 3, 4]);
            expect(result).toEqual([2, 4, 6, 8]);
        });

        test('it should be composable', function () {
            const result = into([], compose(xEven, xDouble), [1, 2, 3, 4]);
            expect(result).toEqual([4, 8]);
        });
    });
});

describe('likeReduced', function () {
    test('it should identify reduced values', function () {
        expect(likeReduced({})).toBe(false);
        expect(likeReduced({ ['@@transducer/reduced']: 123 })).toBe(true);
    });
});

describe('likeTransformer', function () {
    test('it should identify reduced values', function () {
        expect(likeTransformer({})).toBe(false);
        expect(likeTransformer({ ['@@transducer/step']: function () {} })).toBe(true);
    });
});

describe('reduce', function () {
    test('it should reduce values', function () {
        const reduced = reduce(123);
        expect(reduced).to.have.own.property('@@transducer/reduced');
        expect(reduced).to.have.own.property('@@transducer/value');
        expect(reduced['@@transducer/reduced']).toBe(true);
        expect(reduced['@@transducer/value']).toBe(123);
    });

    test('it should return already reduced values', function () {
        const reduced = {
            ['@@transducer/reduced']: true,
            ['@@transducer/value']: 123,
        };
        expect(reduce(reduced)).toBe(reduced);
    });
});

describe('toArray', function () {
    test('it should return an array', function () {
        const result = into([], toArray(), 'abc');
        expect(result).toEqual(['a', 'b', 'c']);
    });
});

describe('toRecord', function () {
    test('it should return a record', function () {
        const result = into({}, toRecord(identity, identity), 'abc');
        expect(result).toHaveProperty('a', 'a');
        expect(result).toHaveProperty('b', 'b');
        expect(result).toHaveProperty('c', 'c');
    });
});

describe('toMap', function () {
    test('it should return a map', function () {
        const result = into(new Map(), toMap(identity, identity), 'abc');
        expect(Array.from(result.keys())).toEqual(['a', 'b', 'c']);
        expect(Array.from(result.values())).toEqual(['a', 'b', 'c']);
    });
});

describe('toSet', function () {
    test('it should return a set', function () {
        const result = into(new Set(), toSet(), 'abc');
        expect(Array.from(result)).toEqual(['a', 'b', 'c']);
    });
});
