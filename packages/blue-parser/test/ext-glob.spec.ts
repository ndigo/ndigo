import { describe, it, expect, test } from 'vitest';
import extGlob from '../src/ext-glob';

describe('ext-glob', function () {
    const tests = [
        ['a', '!(a)', false],
        ['a', '(b)', false],
        ['a', '!(*.a|*.b|*.c)', true],
        ['c.js', '!(*.js)', false],
    ];

    tests.forEach(function (test) {
        if (!Array.isArray(test)) {
            return;
        }
        const [fixture, pattern, expected] = test,
            result = extGlob.run(pattern),
            regex = new RegExp('^' + result.result + '$'),
            actual = regex.test(fixture);
        it(`should${expected ? '' : ' not'} match "${fixture}" with "${pattern}"`, function () {
            if (actual !== expected) {
                console.log(pattern, result.result);
            }
            expect(actual).toBe(expected);
        });
    });
});
