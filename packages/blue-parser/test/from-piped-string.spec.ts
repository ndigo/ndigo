import { describe, it, expect, test } from 'vitest';
import fromPipedString from '../src/from-piped-string';

describe('fromPipedString', function () {
    const pipedList =
            'segg=PHP|zip=43021-8143|ECI=0005354248|RPC=0510,0474,|locale=en_us|pfid=22382446|segment=PHP|AOC=6654,6272,|pm=MMA,HMG,BAC,CHK,ATM,|apc=100,100,010,010,010,010,080,080,070,|empty=|undef|',
        parsed = fromPipedString(pipedList);

    test('it should parse a single value', function () {
        expect(parsed.locale).toBe('en_us');
    });

    test('it should parse an undefined value', function () {
        expect(parsed.undef).toBe(undefined);
    });

    test('it should parse an empty string value', function () {
        expect(parsed.empty).toBe('');
    });

    test('it should parse a list value', function () {
        expect(parsed.AOC).toEqual(['6654', '6272']);
    });
});
