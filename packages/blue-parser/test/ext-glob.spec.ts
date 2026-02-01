import { describe, it, expect } from 'vitest';
import extGlob from '../src/ext-glob';
import { expectSuccess } from './_expect';

describe('extGlob', () => {
    const tests = [
        ['a', '!(a)', false],
        ['a', '(b)', false],
        ['a', '!(*.a|*.b|*.c)', true],
        ['c.js', '!(*.js)', false],
    ];

    for (const [fixture, pattern, expected] of tests) {
        it(`should${expected ? '' : ' not'} match "${fixture}" with "${pattern}"`, () => {
            const result = extGlob.run(pattern);
            expectSuccess(result, (res) => {
                const regex = new RegExp(`^${res}$`);
                const actual = regex.test(fixture);
                if (actual !== expected) {
                    console.log(pattern, res);
                }
                expect(actual).toBe(expected);
            });
        });
    }
});
