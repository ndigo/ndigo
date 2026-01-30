import { describe, it, expect, test } from 'vitest';
import glob from '../src/glob';

describe('glob', function () {
    const tests = [
        ['a', 'a*', true],
        ['abc', 'a*', true],
        ['abd', 'a*', true],
        ['abe', 'a*', true],
        ['X*', 'X*', true],
        ['bdir/', 'b*/', true],
        ['c', 'c*', true],
        ['ca', 'c*', true],
        ['cb', 'c*', true],
        ['a', '**', true],
        ['b', '**', true],
        ['c', '**', true],
        ['d', '**', true],
        ['abc', '**', true],
        ['abd', '**', true],
        ['abe', '**', true],
        ['bb', '**', true],
        ['bcd', '**', true],
        ['ca', '**', true],
        ['cb', '**', true],
        ['dd', '**', true],
        ['de', '**', true],
        ['bdir/', '**', true],
        ['bdir/cfile', '**', true],
        ['abc', '[a-c]b*', true],
        ['abd', '[a-c]b*', true],
        ['abe', '[a-c]b*', true],
        ['bb', '[a-c]b*', true],
        ['cb', '[a-c]b*', true],
        ['abd', '[a-y]*[!c]', true],
        ['abe', '[a-y]*[!c]', true],
        ['bb', '[a-y]*[!c]', true],
        ['bcd', '[a-y]*[!c]', true],
        ['bdir/', '[a-y]*[!c]', true],
        ['ca', '[a-y]*[!c]', true],
        ['cb', '[a-y]*[!c]', true],
        ['dd', '[a-y]*[!c]', true],
        ['de', '[a-y]*[!c]', true],
        ['abd', 'a*[!c]', true],
        ['abe', 'a*[!c]', true],
        ['a-b', 'a[X-]b', true],
        ['aXb', 'a[X-]b', true],
        ['d', '[!a-c]*', true],
        ['dd', '[!a-c]*', true],
        ['de', '[!a-c]*', true],
        ['a*b/ooo', 'a\\*b/*', true],
        ['a*b/ooo', 'a\\*?/*', true],
        ['abc', 'a[b]c', true],
        ['abc', 'a?c', true],
        ['man/man1/bash.1', '*/man*/bash.*', true],
        ['man/man1/bash.1', 'man/man1/bash.1', true],
        ['abc', 'a***c', true],
        ['abc', 'a*****?c', true],
        ['abc', '?*****??', true],
        ['abc', '*****??', true],
        ['abc', '?*****?c', true],
        ['abc', '?***?****c', true],
        ['abc', '?***?****?', true],
        ['abc', '?***?****', true],
        ['abc', '*******c', true],
        ['abc', '*******?', true],
        ['abcdecdhjk', 'a*cd**?**??k', true],
        ['abcdecdhjk', 'a**?**cd**?**??k', true],
        ['abcdecdhjk', 'a**?**cd**?**??k***', true],
        ['abcdecdhjk', 'a**?**cd**?**??***k', true],
        ['abcdecdhjk', 'a**?**cd**?**??***k**', true],
        ['-', '[-abc]', true],
        ['-', '[abc-]', true],
        ['[', '[[]', true],
        [']', '[]]', true],
        ['[abc', '[*', true],
    ];

    tests.forEach(function (test) {
        if (!Array.isArray(test)) {
            return;
        }
        const [fixture, pattern, expected] = test,
            regex = new RegExp(glob.run(pattern).result),
            actual = regex.test(fixture);

        it(`should${expected ? '' : ' not'} match ${fixture} with ${pattern}`, function () {
            expect(actual).toBe(expected);
        });
    });
});
