import { bench, describe } from 'vitest';

const tiny = Array.from({ length: 10 }, (_, i) => i);
const medium = Array.from({ length: 1000 }, (_, i) => i);
const tinyStrings = tiny.map(String);
const mediumStrings = medium.map(String);
const nested = [
    [1, 2],
    [3, [4, 5]],
    [[6], 7],
    [8, [9, [10]]],
];

const consume = (...values: unknown[]): void => {
    void values;
};

const double = (value: number) => value * 2;
const isEven = (value: number) => value % 2 === 0;
const sum = (acc: number, value: number) => acc + value;
const sortAsc = (a: number, b: number) => a - b;

describe('map', () => {
    describe('tiny (10)', () => {
        bench('native: arr.map(fn)', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += tiny.map(double)[0] ?? 0;
            }
            consume(total);
        });
    });

    describe('medium (1000)', () => {
        bench('native: arr.map(fn)', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += medium.map(double)[0] ?? 0;
            }
            consume(total);
        });
    });
});

describe('filter', () => {
    describe('tiny (10)', () => {
        bench('native: arr.filter(pred)', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += tiny.filter(isEven).length;
            }
            consume(total);
        });
    });

    describe('medium (1000)', () => {
        bench('native: arr.filter(pred)', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += medium.filter(isEven).length;
            }
            consume(total);
        });
    });
});

describe('reduce', () => {
    describe('tiny (10)', () => {
        bench('native: arr.reduce(fn, init)', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += tiny.reduce(sum, 0);
            }
            consume(total);
        });
    });

    describe('medium (1000)', () => {
        bench('native: arr.reduce(fn, init)', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += medium.reduce(sum, 0);
            }
            consume(total);
        });
    });
});

describe('join', () => {
    describe('tiny (10)', () => {
        bench('native: arr.join(sep)', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += tinyStrings.join(',').length;
            }
            consume(total);
        });
    });

    describe('medium (1000)', () => {
        bench('native: arr.join(sep)', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += mediumStrings.join(',').length;
            }
            consume(total);
        });
    });
});

describe('sort', () => {
    describe('tiny (10)', () => {
        bench('native: [...arr].sort(comparator)', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += [...tiny].sort(sortAsc)[0] ?? 0;
            }
            consume(total);
        });
    });

    describe('medium (1000)', () => {
        bench('native: [...arr].sort(comparator)', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += [...medium].sort(sortAsc)[0] ?? 0;
            }
            consume(total);
        });
    });
});

describe('head', () => {
    bench('native: arr[0]', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += medium[0] ?? 0;
        }
        consume(total);
    });
});

describe('length', () => {
    bench('native: arr.length', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += medium.length;
        }
        consume(total);
    });
});

describe('flatten', () => {
    bench('native: arr.flat(Infinity)', () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += nested.flat(Infinity).length;
        }
        consume(total);
    });
});

describe('uniq', () => {
    describe('tiny (10)', () => {
        const tinyWithDuplicates = [1, 1, 2, 2, 3, 4, 5, 5, 6, 6];

        bench('native: [...new Set(arr)]', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += new Set(tinyWithDuplicates).size;
            }
            consume(total);
        });
    });

    describe('medium (1000)', () => {
        const mediumWithDuplicates = Array.from({ length: 1000 }, (_, i) => i % 100);

        bench('native: [...new Set(arr)]', () => {
            let total = 0;
            for (let i = 0; i < 1000; i++) {
                total += new Set(mediumWithDuplicates).size;
            }
            consume(total);
        });
    });
});
