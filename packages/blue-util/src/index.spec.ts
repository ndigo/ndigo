import { andThen, hasPath, innerJoin, mergeLeft, mergeRight, o, otherwise, pipeWith, sequence, thunkify } from '.';

describe('index', function () {
    /**
     * Implemented these "ridiculous" tests because at one point the way
     * the exports were handled changed and these values became "undefined".
     */

    describe('hasPath', function () {
        test('it should be a function', function () {
            expect(hasPath).toBeInstanceOf(Function);
        });
    });

    describe('innerJoin', function () {
        test('it should be a function', function () {
            expect(innerJoin).toBeInstanceOf(Function);
        });
    });

    describe('mergeLeft', function () {
        test('it should be a function', function () {
            expect(mergeLeft).toBeInstanceOf(Function);
        });
    });

    describe('mergeRight', function () {
        test('it should be a function', function () {
            expect(mergeRight).toBeInstanceOf(Function);
        });
    });

    describe('o', function () {
        test('it should be a function', function () {
            expect(o).toBeInstanceOf(Function);
        });
    });

    describe('otherwise', function () {
        test('it should be a function', function () {
            expect(otherwise).toBeInstanceOf(Function);
        });
    });

    describe('pipeWith', function () {
        test('it should be a function', function () {
            expect(pipeWith).toBeInstanceOf(Function);
        });
    });

    describe('sequence', function () {
        test('it should be a function', function () {
            expect(sequence).toBeInstanceOf(Function);
        });
    });

    describe('andThen', function () {
        test('it should be a function', function () {
            expect(andThen).toBeInstanceOf(Function);
        });
    });

    describe('thunkify', function () {
        test('it should be a function', function () {
            expect(thunkify).toBeInstanceOf(Function);
        });
    });
});
