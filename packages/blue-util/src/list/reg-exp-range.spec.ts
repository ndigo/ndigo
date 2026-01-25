import { describe, test, expect } from 'vitest';

import { range } from 'ramda';
import regExpRange from './reg-exp-range';

const inRange = (min, max, num) => min <= num && max >= num,
    toBoundRegExp = (value) => new RegExp(`^${value}$`),
    regExpRangeRegex = (min, max, options) => toBoundRegExp(regExpRange(min, max, { wrap: true, ...options })),
    matcher = (...args) => {
        const regex = regExpRangeRegex(...(args as [any, any, any]));
        return (num) => regex.test(String(num));
    },
    matchRange = (min, max, expected, match, notMatch) => {
        if (max - min >= 1000000) {
            throw new RangeError('range is too big');
        }

        const actual = regExpRange(min, max); //,
        //msg = actual + ' => ' + expected;

        // test expected string
        expect(actual).toBe(expected /*, msg*/);

        let re = toBoundRegExp(actual);
        for (let i = 0; i < match.length; i++) {
            expect(re.test(match[i])).toBe(true);
        }

        if (!Array.isArray(notMatch)) return;
        for (let j = 0; j < notMatch.length; j++) {
            expect(re.test(notMatch[j])).toBe(false);
        }
    },
    verifyRange = (min, max, from, to) => {
        const isMatch = matcher(min, max),
            minNum = Math.min(min, max),
            maxNum = Math.max(min, max);
        let num = from - 1;
        while (++num < to) {
            const n = Number(num);
            if (inRange(minNum, maxNum, n)) {
                expect(isMatch(num)).toBe(true);
            } else {
                expect(isMatch(num)).toBe(false);
            }
        }
    },
    verifyZeros = (min, max, from, to) => {
        const list = range(Number(from), Number(to)),
            length = list.length,
            isMatch = matcher(min, max),
            minNum = Math.min(min, max),
            maxNum = Math.max(min, max);
        let index = -1;

        while (++index < length) {
            const num = list[index],
                n = Number(num);
            if (inRange(minNum, maxNum, n)) {
                expect(isMatch(num)).toBe(true);
            } else {
                expect(isMatch(num)).toBe(false);
            }
        }
    };

describe('regExpRange', function () {
    describe('range', function () {
        /*
        test( 'it should throw an error when the first arg is invalid', function(){
            expect( () => regExpRange() ).toThrow( TypeError );
        } );

        test( 'it should throw an error when the second arg is invalid', function(){
            expect( () => regExpRange( 1, {} ) ).toThrow( TypeError );
        } );
        */

        test('it should match the given numbers', function () {
            const oneFifty = toBoundRegExp(regExpRange(1, 150));
            expect(oneFifty.test('125')).toBe(true);
            expect(oneFifty.test('0')).toBe(false);
            expect(oneFifty.test('1')).toBe(true);
            expect(oneFifty.test('126')).toBe(true);
            expect(oneFifty.test('150')).toBe(true);
            expect(oneFifty.test('151')).toBe(false);

            const oneTwentyFive = toBoundRegExp(regExpRange(1, 125));
            expect(oneTwentyFive.test('125')).toBe(true);
            expect(oneTwentyFive.test('0')).toBe(false);
            expect(oneTwentyFive.test('1')).toBe(true);
            expect(oneTwentyFive.test('126')).toBe(false);
            expect(oneTwentyFive.test('150')).toBe(false);
            expect(oneTwentyFive.test('151')).toBe(false);
        });
    });

    describe('minimum / maximum', function () {
        test('it should reverse `min/max` when the min is larger than the max:', function () {
            expect(regExpRange(55, 10)).toBe('(?:1[0-9]|[2-4][0-9]|5[0-5])');
        });
    });

    describe('ranges', function () {
        test('it should return the number when only one argument is passed:', function () {
            expect(regExpRange(5)).toBe('5');
        });

        test('it should return a single number when both numbers are equal', function () {
            expect(regExpRange('1', '1')).toBe('1');
            expect(regExpRange('65443', '65443')).toBe('65443');
            expect(regExpRange('192', '192')).toBe('192');
            verifyRange(1, 1, 0, 100);
            verifyRange(65443, 65443, 65000, 66000);
            verifyRange(192, 192, 0, 1000);
        });

        test('it should not return a range when both numbers are the same:', function () {
            expect(regExpRange(5, 5)).toBe('5');
        });

        test('it should return regex character classes when both args are less than 10', function () {
            expect(regExpRange(0, 9)).toBe('[0-9]');
            expect(regExpRange(1, 5)).toBe('[1-5]');
            expect(regExpRange(1, 7)).toBe('[1-7]');
            expect(regExpRange(2, 6)).toBe('[2-6]');
        });

        test('it should support string numbers', function () {
            expect(regExpRange('1', '5')).toBe('[1-5]');
            expect(regExpRange('10', '50')).toBe('(?:1[0-9]|[2-4][0-9]|50)');
        });

        test('it should support padded ranges:', function () {
            expect(regExpRange('001', '005')).toBe('0{0,2}[1-5]');
            expect(regExpRange('01', '05')).toBe('0?[1-5]');
            expect(regExpRange('001', '100')).toBe('(?:0{0,2}[1-9]|0?[1-9][0-9]|100)');
            expect(regExpRange('0001', '1000')).toBe('(?:0{0,3}[1-9]|0{0,2}[1-9][0-9]|0?[1-9][0-9]{2}|1000)');
        });

        test('it should work when padding is imbalanced:', function () {
            expect(regExpRange('001', '105')).toBe('(?:0{0,2}[1-9]|0?[1-9][0-9]|10[0-5])');
            expect(regExpRange('01', '105')).toBe('(?:0{0,2}[1-9]|0?[1-9][0-9]|10[0-5])');
            expect(regExpRange('010', '105')).toBe('(?:0?1[0-9]|0?[2-9][0-9]|10[0-5])');
            expect(regExpRange('010', '1005')).toBe('(?:0{0,2}1[0-9]|0{0,2}[2-9][0-9]|0?[1-9][0-9]{2}|100[0-5])');
            expect(regExpRange('0001', '1000')).toBe(regExpRange('001', '1000'));
            expect(regExpRange('0001', '1000')).toBe(regExpRange('01', '1000'));
        });

        test('it should generate regex strings for negative patterns', function () {
            expect(regExpRange(-1, 0)).toBe('(?:-1|0)');
            expect(regExpRange(-1, 1)).toBe('(?:-1|[01])');
            expect(regExpRange(-4, -2)).toBe('-[2-4]');
            expect(regExpRange(-3, 1)).toBe('(?:-[1-3]|[01])');
            expect(regExpRange(-2, 0)).toBe('(?:-[12]|0)');
            expect(regExpRange(-1, 3)).toBe('(?:-1|[0-3])');
            matchRange(-1, -1, '-1', [-1], [-2, 0, 1]);
            matchRange(-1, -10, '(?:-[1-9]|-10)', [-1, -5, -10], [-11, 0]);
            matchRange(-1, 3, '(?:-1|[0-3])', [-1, 0, 1, 2, 3], [-2, 4]);
        });

        test('it should wrap patterns when options.capture is true', function () {
            expect(regExpRange(-1, 0, { capture: true })).toBe('(-1|0)');
            expect(regExpRange(-1, 1, { capture: true })).toBe('(-1|[01])');
            expect(regExpRange(-4, -2, { capture: true })).toBe('(-[2-4])');
            expect(regExpRange(-3, 1, { capture: true })).toBe('(-[1-3]|[01])');
            expect(regExpRange(-2, 0, { capture: true })).toBe('(-[12]|0)');
            expect(regExpRange(-1, 3, { capture: true })).toBe('(-1|[0-3])');
        });

        test('it should generate regex strings for positive patterns', function () {
            expect(regExpRange(1, 1)).toBe('1');
            expect(regExpRange(0, 1)).toBe('(?:0|1)');
            expect(regExpRange(0, 2)).toBe('[0-2]');
            expect(regExpRange(65666, 65667)).toBe('(?:65666|65667)');
            expect(regExpRange(12, 3456)).toBe(
                '(?:1[2-9]|[2-9][0-9]|[1-9][0-9]{2}|[12][0-9]{3}|3[0-3][0-9]{2}|34[0-4][0-9]|345[0-6])'
            );
            expect(regExpRange(1, 3456)).toBe(
                '(?:[1-9]|[1-9][0-9]{1,2}|[12][0-9]{3}|3[0-3][0-9]{2}|34[0-4][0-9]|345[0-6])'
            );
            expect(regExpRange(1, 10)).toBe('(?:[1-9]|10)');
            expect(regExpRange(1, 19)).toBe('(?:[1-9]|1[0-9])');
            expect(regExpRange(1, 99)).toBe('(?:[1-9]|[1-9][0-9])');
            expect(regExpRange(1, 100)).toBe('(?:[1-9]|[1-9][0-9]|100)');
            expect(regExpRange(1, 1000)).toBe('(?:[1-9]|[1-9][0-9]{1,2}|1000)');
            expect(regExpRange(1, 10000)).toBe('(?:[1-9]|[1-9][0-9]{1,3}|10000)');
            expect(regExpRange(1, 100000)).toBe('(?:[1-9]|[1-9][0-9]{1,4}|100000)');
            expect(regExpRange(1, 9999999)).toBe('(?:[1-9]|[1-9][0-9]{1,6})');
            expect(regExpRange(99, 100000)).toBe('(?:99|[1-9][0-9]{2,4}|100000)');

            matchRange(
                99,
                100000,
                '(?:99|[1-9][0-9]{2,4}|100000)',
                [99, 999, 989, 100, 9999, 9899, 10009, 10999, 100000],
                [0, 9, 100001, 100009]
            );
        });

        test('it should optimize regexes', function () {
            expect(regExpRange(-9, 9)).toBe('(?:-[1-9]|[0-9])');
            expect(regExpRange(-19, 19)).toBe('(?:-[1-9]|-?1[0-9]|[0-9])');
            expect(regExpRange(-29, 29)).toBe('(?:-[1-9]|-?[12][0-9]|[0-9])');
            expect(regExpRange(-99, 99)).toBe('(?:-[1-9]|-?[1-9][0-9]|[0-9])');
            expect(regExpRange(-999, 999)).toBe('(?:-[1-9]|-?[1-9][0-9]{1,2}|[0-9])');
            expect(regExpRange(-9999, 9999)).toBe('(?:-[1-9]|-?[1-9][0-9]{1,3}|[0-9])');
            expect(regExpRange(-99999, 99999)).toBe('(?:-[1-9]|-?[1-9][0-9]{1,4}|[0-9])');
        });
    });

    describe('validate ranges', function () {
        test('it should match all numbers in the given range', function () {
            let isMatch = matcher(1, 59);
            for (let i = 0; i < 100; i++) {
                if (i >= 1 && i <= 59) {
                    expect(isMatch(i)).toBe(true);
                } else {
                    expect(isMatch(i)).toBe(false);
                }
            }
        });

        test('it should support negative ranges:', function () {
            verifyRange(-9, -1, -100, 100);
            verifyRange(-99, -1, -1000, 1000);
            verifyRange(-999, -1, -1000, 1000);
            verifyRange(-9999, -1, -10000, 10000);
            verifyRange(-99999, -1, -100999, 100999);
        });

        test('it should support negative-to-positive ranges:', function () {
            verifyRange(-9, 9, -100, 100);
            verifyRange(-99, 99, -1000, 1000);
            verifyRange(-999, 999, -1000, 1000);
            verifyRange(-9999, 9999, -10000, 10000);
            verifyRange(-99999, 99999, -100999, 100999);
        });

        test('it should support large numbers:', function () {
            verifyRange(100019999300000, 100020000300000, 1000199992999900, 100020000200000);
        });

        test('it should support large ranges:', function () {
            verifyRange(1, 100000, 1, 1000);
            verifyRange(1, 100000, 10000, 11000);
            verifyRange(1, 100000, 99000, 100000);
            verifyRange(1, 100000, 1000, 2000);
            verifyRange(1, 100000, 10000, 12000);
            verifyRange(1, 100000, 50000, 60000);
            verifyRange(1, 100000, 99999, 101000);
            verifyRange(10331, 20381, 0, 99999);
        });

        test('it should support repeated digits:', function () {
            verifyRange(111, 222, 0, 999);
            verifyRange(111, 333, 0, 999);
            verifyRange(111, 444, 0, 999);
            verifyRange(111, 555, 0, 999);
            verifyRange(111, 666, 0, 999);
            verifyRange(111, 777, 0, 999);
            verifyRange(111, 888, 0, 999);
            verifyRange(111, 999, 0, 999);
            verifyRange(0, 111, -99, 999);
            verifyRange(0, 222, -99, 999);
            verifyRange(0, 333, -99, 999);
            verifyRange(0, 444, -99, 999);
            verifyRange(0, 555, -99, 999);
            verifyRange(0, 666, -99, 999);
            verifyRange(0, 777, -99, 999);
            verifyRange(0, 888, -99, 999);
            verifyRange(0, 999, -99, 999);
        });

        test('it should support repeated zeros:', function () {
            verifyRange(10031, 20081, 0, 59999);
            verifyRange(10000, 20000, 0, 59999);
        });

        test('it should support zero one:', function () {
            verifyRange(10301, 20101, 0, 99999);
            verifyRange(101010, 101210, 101009, 101300);
        });

        test('it should support repeated ones:', function () {
            verifyRange(1, 11111, 0, 1000);
            verifyRange(1, 1111, 0, 1000);
            verifyRange(1, 111, 0, 1000);
            verifyRange(1, 11, 0, 1000);
            verifyRange(1, 1, 0, 1000);
        });

        test('it should support small diffs:', function () {
            verifyRange(102, 103, 0, 1000);
            verifyRange(102, 110, 0, 1000);
            verifyRange(102, 130, 0, 1000);
        });

        test('it should support random ranges:', function () {
            verifyRange(4173, 7981, 0, 99999);
        });

        test('it should support one digit numbers:', function () {
            verifyRange(3, 7, 0, 99);
        });

        test('it should support one digit at bounds:', function () {
            verifyRange(1, 9, 0, 1000);
        });

        test('it should support power of ten:', function () {
            verifyRange(1000, 8632, 0, 99999);
        });

        test('it should not match the negative of the same number', function () {
            verifyRange(1, 1000, -1000, 1000);
            verifyRange(1, 1000, '-1000', '1000');
        });

        test('it should work with numbers of varying lengths:', function () {
            verifyRange(1030, 20101, 0, 99999);
            verifyRange(13, 8632, 0, 10000);
        });

        test('it should support small ranges:', function () {
            verifyRange(9, 11, 0, 100);
            verifyRange(19, 21, 0, 100);
        });

        test('it should support big ranges:', function () {
            verifyRange(90, 98009, 0, 98999);
            verifyRange(999, 10000, 1, 20000);
        });

        test('it should create valid regex ranges with zero-padding:', function () {
            verifyZeros('001', '100', '001', 100);
            verifyZeros('001', '100', '001', '100');
            verifyZeros('0001', '1000', '01', 1000);
            verifyZeros('0001', '1000', '-01', 1000);
            verifyZeros('0001', '1000', '-099', '1000');
            verifyZeros('0001', '1000', '-010', 1000);
            verifyZeros('0001', '1000', '-010', 1000);
            verifyZeros('0001', '1000', '0001', '1000');
            verifyZeros('01', '1000', '-01', '1000');
            verifyZeros('000000001', '1000', '-010', '1000');
            verifyZeros('00000001', '1000', '-010', '1000');
            verifyZeros('0000001', '1000', '-010', '1000');
            verifyZeros('000001', '1000', '-010', '1000');
            verifyZeros('00001', '1000', '-010', '1000');
            verifyZeros('0001', '1000', '-010', '1000');
            verifyZeros('001', '1000', '-010', '1000');
            verifyZeros('01', '1000', '-010', '1000');
            verifyZeros('0001', '1000', '-010', '1000');
        });

        test('it should create valid regex ranges with negative padding:', function () {
            verifyZeros('-00001', '-1000', -1000, 1000);
            verifyZeros('-0001', '-1000', -1000, 1000);
            verifyZeros('-001', '-1000', -1000, 1000);
            verifyZeros('-01', '-1000', -1000, 1000);
        });

        test('it should create valid ranges with neg && pos zero-padding:', function () {
            verifyZeros('-01', '10', '-1', '01');
            verifyZeros('-1000', '100', -1000, 1000);
            verifyZeros('-1000', '0100', '-010', '1000');
            verifyZeros('-0100', '100', '-01', '100');
            verifyZeros('-010', '100', '-01', '100');
            verifyZeros('-01', '100', '-01', '100');
            verifyZeros('-01000', '1000', '-010', '1000');
            verifyZeros('-0100', '1000', '-010', '1000');
            verifyZeros('-010', '1000', '-010', '1000');
            verifyZeros('-01', '1000', '-010', '1000');
        });
    });
});
