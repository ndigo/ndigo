/** @author opencode */

import { bench, describe } from 'vitest';
import * as R from 'ramda';

const trimInputs = ['  alpha  ', 'beta', '\n gamma\t', 'delta'];
const splitCommaInputs = ['a,b,c', 'single', 'x,y', 'm,n,o,p'];
const splitSlashInputs = ['a/b/c', 'single', 'x/y', 'm/n/o/p'];
const joinInputs = [['a', 'b', 'c'], ['x'], ['one', 'two'], ['left', 'middle', 'right']];
const joinSeparators = [',', '/', '::', ''];
const replaceRegexInputs = ['hello world', 'world world', 'no match here', 'worldwide'];
const replaceStringInputs = ['foo bar', 'bar foo', 'foofoo', 'none'];
const testRegex = /^(foo|bar)\d+$/;
const testInputs = ['foo1', 'bar22', 'baz3', 'foo'];
const caseInputs = ['Alpha', 'BETA', 'MiXeD', 'already-lower'];
let _stringSink = 0;

describe('R.trim(s) vs s.trim()', () => {
    bench('ramda', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = trimInputs[i % trimInputs.length];
            accumulator += R.trim(value).length;
        }

        _stringSink = accumulator;
    });

    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = trimInputs[i % trimInputs.length];
            accumulator += value.trim().length;
        }

        _stringSink = accumulator;
    });
});

describe('R.split(sep, s) vs s.split(sep)', () => {
    bench('ramda', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const commaValue = splitCommaInputs[i % splitCommaInputs.length];
            const slashValue = splitSlashInputs[i % splitSlashInputs.length];
            accumulator += R.split(',', commaValue).length;
            accumulator += R.split('/', slashValue).length;
        }

        _stringSink = accumulator;
    });

    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const commaValue = splitCommaInputs[i % splitCommaInputs.length];
            const slashValue = splitSlashInputs[i % splitSlashInputs.length];
            accumulator += commaValue.split(',').length;
            accumulator += slashValue.split('/').length;
        }

        _stringSink = accumulator;
    });
});

describe('R.join(sep, arr) vs arr.join(sep)', () => {
    bench('ramda', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = joinInputs[i % joinInputs.length];
            const separator = joinSeparators[i % joinSeparators.length];
            accumulator += R.join(separator, value).length;
        }

        _stringSink = accumulator;
    });

    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = joinInputs[i % joinInputs.length];
            const separator = joinSeparators[i % joinSeparators.length];
            accumulator += value.join(separator).length;
        }

        _stringSink = accumulator;
    });
});

describe('R.replace(pattern, replacement, s) vs s.replace(pattern, replacement)', () => {
    bench('ramda', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const regexValue = replaceRegexInputs[i % replaceRegexInputs.length];
            const stringValue = replaceStringInputs[i % replaceStringInputs.length];
            accumulator += R.replace(/world/g, 'planet', regexValue).length;
            accumulator += R.replace('foo', 'baz', stringValue).length;
        }

        _stringSink = accumulator;
    });

    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const regexValue = replaceRegexInputs[i % replaceRegexInputs.length];
            const stringValue = replaceStringInputs[i % replaceStringInputs.length];
            accumulator += regexValue.replace(/world/g, 'planet').length;
            accumulator += stringValue.replace('foo', 'baz').length;
        }

        _stringSink = accumulator;
    });
});

describe('R.test(regex, s) vs regex.test(s)', () => {
    bench('ramda', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = testInputs[i % testInputs.length];
            accumulator += R.test(testRegex, value) ? 1 : 0;
        }

        _stringSink = accumulator;
    });

    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = testInputs[i % testInputs.length];
            accumulator += testRegex.test(value) ? 1 : 0;
        }

        _stringSink = accumulator;
    });
});

describe('R.toLower(s) vs s.toLowerCase()', () => {
    bench('ramda', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = caseInputs[i % caseInputs.length];
            accumulator += R.toLower(value).length;
        }

        _stringSink = accumulator;
    });

    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = caseInputs[i % caseInputs.length];
            accumulator += value.toLowerCase().length;
        }

        _stringSink = accumulator;
    });
});

describe('R.toUpper(s) vs s.toUpperCase()', () => {
    bench('ramda', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = caseInputs[i % caseInputs.length];
            accumulator += R.toUpper(value).length;
        }

        _stringSink = accumulator;
    });

    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = caseInputs[i % caseInputs.length];
            accumulator += value.toUpperCase().length;
        }

        _stringSink = accumulator;
    });
});
