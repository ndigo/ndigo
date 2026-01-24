import rangeN from './range-n';

const exact = (actual, expected) => {
    const a = JSON.stringify(actual),
        b = JSON.stringify(expected);
    expect(a).toBe(b);
};

describe('rangeN', function () {
    test('it should curry', function () {
        const rangeThree = rangeN(3);
        exact(rangeThree(2, 10), [2, 5, 8]);
    });

    test('it should increment ranges', function () {
        exact(rangeN(1, 1), []);
        exact(rangeN(1, 1, 1.1), [1]);
        exact(rangeN(1, 1, 1), []);
        exact(rangeN(1, 1, 2), [1]);
        exact(rangeN(1, 1, 10), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        exact(rangeN(1, 1, 3), [1, 2]);
        exact(rangeN(1, 5, 8), [5, 6, 7]);
        exact(rangeN(1, 1, 9), [1, 2, 3, 4, 5, 6, 7, 8]);
    });

    test('it should decrement ranges', function () {
        exact(rangeN(1, -10, 0), [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1]);
        exact(rangeN(1, 0, -5), [0, -1, -2, -3, -4]);
    });

    test('it should handle ranges that are positive and negative:', function () {
        exact(rangeN(1, 9, -4), [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3]);
        exact(rangeN(1, -5, 5), [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4]);
    });

    test('it should handle negative zero', function () {
        exact(rangeN(-1, -5, -0), [-5, -4, -3, -2, -1]);
        exact(rangeN(1, 1, -0), [1]);
        exact(rangeN(0, 1, -0), [1]);
        exact(rangeN(0, 1, -0), [1]);
        exact(rangeN(1, 1, -0), [1]);
        exact(rangeN(1, -0, -0), []);
        exact(rangeN(1, -0, 0), []);
        exact(rangeN(1, -0, 5), [0, 1, 2, 3, 4]);
        exact(rangeN(5, -0, 5.1), [0, 5]);
        exact(rangeN(2, 5, -0), [5, 3, 1]);
        exact(rangeN(2, 0, 5), [0, 2, 4]);
    });

    test('it should increment ranges using the given step', function () {
        exact(rangeN(1, 1, 10), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        exact(rangeN(2, 1, 10), [1, 3, 5, 7, 9]);
        exact(rangeN(200, 0, 1000), [0, 200, 400, 600, 800]);
        exact(rangeN(2, 1, 20), [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
        exact(rangeN(20, 1, 20), [1]);
        exact(rangeN(2, 10, 1), [10, 8, 6, 4, 2]);
        exact(rangeN(-2, 10, 1), [10, 8, 6, 4, 2]);
        exact(rangeN(1, 2, 10), [2, 3, 4, 5, 6, 7, 8, 9]);
        exact(rangeN(2, 2, 10), [2, 4, 6, 8]);
        exact(rangeN(3, 2, 10), [2, 5, 8]);
        exact(rangeN(2, 0, 5), [0, 2, 4]);
        exact(rangeN(2, 5, 0), [5, 3, 1]);
        exact(rangeN(2, 1, 5), [1, 3]);
        exact(rangeN(1, 2, 10), [2, 3, 4, 5, 6, 7, 8, 9]);
        exact(rangeN(2, 2, 10), [2, 4, 6, 8]);
        exact(rangeN(3, 2, 10), [2, 5, 8]);
    });

    test('it should range in negative ranges using the given step', function () {
        exact(rangeN(-2, 0, -10), [0, -2, -4, -6, -8]);
        exact(rangeN(-2, -0, -10), [0, -2, -4, -6, -8]);
        exact(rangeN(-2, -1, -10), [-1, -3, -5, -7, -9]);
        exact(rangeN(2, -1, -10), [-1, -3, -5, -7, -9]);
        exact(rangeN(2, 1, 10), [1, 3, 5, 7, 9]);
        exact(rangeN(2, 1, 20), [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
        exact(rangeN(20, 1, 20), [1]);
        exact(rangeN(-2, 10, 1), [10, 8, 6, 4, 2]);
        exact(rangeN(2, -10, 0), [-10, -8, -6, -4, -2]);
        exact(rangeN(2, -10, -0), [-10, -8, -6, -4, -2]);
        exact(rangeN(0, -0, -10), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]);
        exact(rangeN(-0, 0, -10), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]);
    });

    test('it should range in negative ranges when negative zero is passed', function () {
        exact(rangeN(2, -10, -0), [-10, -8, -6, -4, -2]);
        exact(rangeN(2, -0, -10), [0, -2, -4, -6, -8]);
    });
});
