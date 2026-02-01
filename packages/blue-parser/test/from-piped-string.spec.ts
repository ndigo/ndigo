import { describe, it, expect } from 'vitest';
import fromPipedString from '../src/from-piped-string';

describe('fromPipedString', () => {
    const pipedList =
        'segg=PHP|zip=43021-8143|ECI=0005354248|RPC=0510,0474,|locale=en_us|pfid=22382446|segment=PHP|AOC=6654,6272,|pm=MMA,HMG,BAC,CHK,ATM,|apc=100,100,010,010,010,010,080,080,070,|empty=|undef|';
    const parsed = fromPipedString(pipedList);

    it('should parse a single value', () => {
        expect(parsed.locale).toBe('en_us');
    });

    it('should parse an undefined value', () => {
        expect(parsed.undef).toBe(undefined);
    });

    it('should parse an empty string value', () => {
        expect(parsed.empty).toBe('');
    });

    it('should parse a list value', () => {
        expect(parsed.AOC).toEqual(['6654', '6272']);
    });
});
