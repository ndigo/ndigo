import { describe, it, expect } from 'vitest';
import extGlob from '../src/ext-glob';

describe('extGlob', () => {
    const tests: [string, string, boolean][] = [
        ['a', '!(a)', false],
        ['a', '(b)', false],
        ['a', '!(*.a|*.b|*.c)', true],
        ['c.js', '!(*.js)', false],
    ];

    for (const [fixture, pattern, expected] of tests) {
        it(`should${expected ? '' : ' not'} match "${fixture}" with "${pattern}"`, () => {
            const result = extGlob.run(pattern);
            expect(result.isError).toBe(false);
            const parserResult = result as any;
            const regex = new RegExp(`^${String(parserResult.result)}$`);
            const actual = regex.test(fixture);
            expect(actual).toBe(expected);
        });
    }
});
