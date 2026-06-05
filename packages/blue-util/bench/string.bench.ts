/** @author opencode */

import { bench, describe } from 'vitest';

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

describe('s.trim()', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = trimInputs[i % trimInputs.length];
            accumulator += value.trim().length;
        }

        _stringSink = accumulator;
    });
});

describe('s.split(sep)', () => {
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

describe('arr.join(sep)', () => {
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

describe('s.replace(pattern, replacement)', () => {
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

describe('regex.test(s)', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = testInputs[i % testInputs.length];
            accumulator += testRegex.test(value) ? 1 : 0;
        }

        _stringSink = accumulator;
    });
});

describe('s.toLowerCase()', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = caseInputs[i % caseInputs.length];
            accumulator += value.toLowerCase().length;
        }

        _stringSink = accumulator;
    });
});

describe('s.toUpperCase()', () => {
    bench('native', () => {
        let accumulator = 0;

        for (let i = 0; i < 1000; i += 1) {
            const value = caseInputs[i % caseInputs.length];
            accumulator += value.toUpperCase().length;
        }

        _stringSink = accumulator;
    });
});
