/**
 * @author opencode
 */

import { bench, describe } from 'vitest';
import isNumber from '../src/type/is-number.js';

class RouteData {
    public readonly data: string;

    public constructor(data: string) {
        this.data = data;
    }
}

class QueryData {
    public readonly query: string;

    public constructor(query: string) {
        this.query = query;
    }
}

class HeaderData {
    public readonly header: string;

    public constructor(header: string) {
        this.header = header;
    }
}

class CookieData {
    public readonly cookie: string;

    public constructor(cookie: string) {
        this.cookie = cookie;
    }
}

class BodyData {
    public readonly body: string;

    public constructor(body: string) {
        this.body = body;
    }
}

class BufferData {
    public readonly buffer: ArrayBuffer;

    public constructor(buffer: ArrayBuffer) {
        this.buffer = buffer;
    }
}

class MetaData {
    public readonly meta: string;

    public constructor(meta: string) {
        this.meta = meta;
    }
}

let _sink = 0;

describe('cond (7-branch) vs switch dispatch', () => {
    const inputs = [
        new RouteData('r'),
        new QueryData('q'),
        new HeaderData('h'),
        new CookieData('c'),
        new BodyData('b'),
        new BufferData(new ArrayBuffer(8)),
        new MetaData('m'),
        { raw: true },
        null,
    ];

    bench('native: switch(true) with instanceof', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                switch (true) {
                    case x instanceof RouteData:
                        total += 1;
                        break;
                    case x instanceof QueryData:
                        total += 2;
                        break;
                    case x instanceof HeaderData:
                        total += 3;
                        break;
                    case x instanceof CookieData:
                        total += 4;
                        break;
                    case x instanceof BodyData:
                        total += 5;
                        break;
                    case x instanceof BufferData:
                        total += 6;
                        break;
                    case x instanceof MetaData:
                        total += 7;
                        break;
                    default:
                        total += 0;
                        break;
                }
            }
        }
        _sink += total;
    });
});

describe('allPass vs logical &&', () => {
    const inputs = [3, 0, -1, NaN, Infinity, 12, '7', null, undefined];
    const isPositiveNumberRamda = R.allPass<any>([isNumber, R.gte(R.__, 0)]);

    bench('native: isNumber(x) && x >= 0', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (typeof x === 'number' && !isNaN(x) && isFinite(x) && x >= 0) {
                    count++;
                }
            }
        }
        _sink += count;
    });
});

describe('both vs inline && function', () => {
    const inputs = [5, -3, 0, NaN, '2', undefined, null, 8];
    const lessThanZero = (value: number) => value < 0;
    const bothPredicates = R.both(isNumber, lessThanZero);

    bench('native: x => isNumber(x) && x < 0', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (typeof x === 'number' && !isNaN(x) && isFinite(x) && x < 0) {
                    count++;
                }
            }
        }
        _sink += count;
    });
});

describe('complement vs negation wrapper', () => {
    const inputs = [null, undefined, 0, '', false, {}, [], 'x'];
    const isNotNilRamda = R.complement(R.isNil);

    bench('native: x => !(x == null)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (!(x == null)) {
                    count++;
                }
            }
        }
        _sink += count;
    });
});

describe('ifElse vs ternary', () => {
    const inputs = ['a=1&b=2', { a: 1 }, 'x=9', { x: '9' }, '', null, undefined, 'name=blue'];
    const parseQuery = (value: string) => value.split('&').length;
    const identityLength = (value: unknown) => (value === null || value === undefined ? 0 : 1);
    const ramdaIfElse = R.ifElse(R.is(String), parseQuery, identityLength);

    bench('native: typeof check + ternary', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                total += typeof x === 'string' ? parseQuery(x) : identityLength(x);
            }
        }
        _sink += total;
    });
});

describe('cond (2-branch) vs if/else', () => {
    const inputs = [null, undefined, [], [1, 2], 'x', {}, 0, false];
    const ramdaSmallCond = R.cond<any, number>([
        [R.isNil, () => 1],
        [Array.isArray, () => 2],
    ]);

    bench('native: if/else chain', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            for (const x of inputs) {
                if (x == null) {
                    total += 1;
                } else if (Array.isArray(x)) {
                    total += 2;
                } else {
                    total += 3;
                }
            }
        }
        _sink += total;
    });
});
