/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://github.com/micromatch/to-regex-range}
 */

import { zip } from 'ramda';
import isNumber from '../type/is-number.js';
import isNumeric, { Numeric } from '../type/is-numeric.js';
import { naturalSort } from '../_natural-sort.js';

type RangeToken = {
    pattern: string;
    count: number[];
    digits: number;
    value?: string;
};

/**
 * Configuration options for `regExpRange`.
 */
export type RegExpRangeInit = {
    capture?: boolean;
    relaxZeros?: boolean;
    shorthand?: boolean;
    strictZeros?: boolean;
    wrap?: boolean;
};

type RegExpRangeState = {
    a: number;
    b: number;
    isPadded?: boolean;
    maxLen?: number;
    min: Numeric;
    max: Numeric;
    negatives?: RangeToken[];
    positives?: RangeToken[];
    result?: string;
};

const { abs, max, min, pow } = Math,
    defaults: RegExpRangeInit = {
        relaxZeros: true,
    },
    paddedNumber = /^-?(0+)\d/,
    collatePatterns = (neg: RangeToken[], pos: RangeToken[]): string => {
        const onlyNegative = filterPatterns(neg, pos, '-', false) || [],
            onlyPositive = filterPatterns(pos, neg, '', false) || [],
            intersected = filterPatterns(neg, pos, '-?', true) || [],
            subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
        return subpatterns.join('|');
    },
    contains = <T = any>(list: T[], key: PropertyKey, value: any): boolean => list.some((item) => item[key] === value),
    countNines = (min: number, len: number): number => Number(String(min).slice(0, -len) + '9'.repeat(len)),
    countZeros = (integer: number, zeros: number): number => integer - (integer % pow(10, zeros)),
    filterPatterns = (
        list: RangeToken[],
        comparison: RangeToken[],
        prefix: string,
        intersection: boolean
    ): string[] => {
        const result: string[] = [];

        for (const item of list) {
            const { value } = item;

            // only push if _both_ are negative...
            if (!intersection && !contains<RangeToken>(comparison, 'value', value)) {
                result.push(`${prefix}${value}`);
            }

            // or _both_ are positive
            if (intersection && contains<RangeToken>(comparison, 'value', value)) {
                result.push(`${prefix}${value}`);
            }
        }

        return result;
    },
    hasPadding = (value: string) => paddedNumber.test(value),
    padZeros = (value: number, state: RegExpRangeState, init: RegExpRangeInit): string => {
        if (!state.isPadded) {
            return String(value);
        }

        const // @ts-ignore
            diff = abs(state?.maxLen - String(value).length),
            relax = init.relaxZeros !== false;

        switch (diff) {
            case 0:
                return '';
            case 1:
                return relax ? '0?' : '0';
            case 2:
                return relax ? '0{0,2}' : '00';
            default:
                return relax ? `0{0,${diff}}` : `0{${diff}}`;
        }
    },
    rangeToPattern = (start: string, stop: string, init: RegExpRangeInit): RangeToken => {
        if (start === stop) {
            return { pattern: start, count: [], digits: 0 };
        }

        const // @ts-ignore
            zipped = zip<string, string>(start, stop),
            digits = zipped.length;
        let pattern = '',
            count = 0;

        for (let index = 0; index < digits; index++) {
            let [startDigit, stopDigit] = zipped[index];

            if (startDigit === stopDigit) {
                pattern += startDigit;
            } else if (startDigit !== '0' || stopDigit !== '9') {
                pattern += toCharacterClass(Number(startDigit), Number(stopDigit));
            } else {
                count++;
            }
        }

        if (count) {
            pattern += init.shorthand === true ? '\\d' : '[0-9]';
        }

        return { pattern, count: [count], digits };
    },
    splitToPatterns = (min: number, max: number, state: RegExpRangeState, init: RegExpRangeInit): RangeToken[] => {
        const ranges = splitToRanges(min, max),
            tokens: RangeToken[] = [];
        let start = min,
            prev: RangeToken;

        for (let index = 0; index < ranges.length; index++) {
            const max = ranges[index],
                obj: RangeToken = rangeToPattern(String(start), String(max), init);
            let zeros = '';

            // @ts-ignore
            if (!state.isPadded && prev && prev.pattern === obj.pattern) {
                if (prev.count.length > 1) {
                    prev.count.pop();
                }

                prev.count.push(obj.count[0]);
                prev.value = `${prev.pattern}${toQuantifier(prev.count)}`;
                start = max + 1;
                continue;
            }

            if (state.isPadded) {
                zeros = padZeros(max, state, init);
            }

            obj.value = `${zeros}${obj.pattern}${toQuantifier(obj.count)}`;
            tokens.push(obj);
            start = max + 1;
            prev = obj;
        }

        return tokens;
    },
    splitToRanges = (min: number, max: number): number[] => {
        let nines = 1,
            zeros = 1,
            stop = countNines(min, nines),
            stops = new Set([max]);

        while (min <= stop && stop <= max) {
            stops.add(stop);
            nines += 1;
            stop = countNines(min, nines);
        }

        stop = countZeros(max + 1, zeros) - 1;

        while (min < stop && stop <= max) {
            stops.add(stop);
            zeros += 1;
            stop = countZeros(max + 1, zeros) - 1;
        }

        return naturalSort([...stops]);
    },
    toCharacterClass = (a: number, b: number): string => `[${a}${b - a === 1 ? '' : '-'}${b}]`,
    toNumber = (value): number => (isNumber(value) ? value : Number(value)),
    toQuantifier = (digits: number[]): string => {
        const [start = 0, stop = ''] = digits;
        if (stop || start > 1) {
            return `{${start + (stop ? ',' + stop : '')}}`;
        }
        return '';
    };

// @ts-ignore
/**
 * Generates a regular expression string that matches a range of numbers.
 * This function is useful for creating efficient regexes for numerical ranges,
 * especially when dealing with padded numbers or complex ranges.
 *
 * @category List
 * @param {Numeric} from The starting number of the range (inclusive).
 * @param {Numeric} [to=from] The ending number of the range (inclusive). If omitted, `to` defaults to `from`.
 * @param {RegExpRangeInit} [init=defaults] Configuration options for generating the regex.
 * @param {boolean} [init.capture=false] Whether to wrap the resulting regex in a capturing group.
 * @param {boolean} [init.relaxZeros=true] If `true`, allows optional leading zeros for padded numbers.
 * @param {boolean} [init.shorthand=false] If `true`, uses `\d` instead of `[0-9]` for digit matching.
 * @param {boolean} [init.strictZeros=false] If `true`, enforces strict leading zeros (overrides `relaxZeros`).
 * @param {boolean} [init.wrap=true] Whether to wrap the resulting regex in a non-capturing group `(?:...)` if multiple patterns are generated.
 * @returns {string} A regular expression string matching the specified number range.
 * @throws {TypeError} If `from` or `to` are not numeric values.
 * @example
 * // Basic range
 * regExpRange(1, 5); //=> "(?:1|2|3|4|5)"
 *
 * // Range with padding
 * regExpRange("001", "005"); //=> "(?:001|002|003|004|005)"
 *
 * // Relaxed zeros (default)
 * regExpRange("01", "05"); //=> "(?:0?1|0?2|0?3|0?4|0?5)"
 *
 * // Strict zeros
 * regExpRange("01", "05", { strictZeros: true }); //=> "(?:01|02|03|04|05)"
 *
 * // Capturing group
 * regExpRange(10, 12, { capture: true }); //=> "(10|11|12)"
 *
 * // Shorthand digits
 * regExpRange(1, 9, { shorthand: true }); //=> "\d"
 *
 * // Single number
 * regExpRange(42); //=> "42"
 *
 * // Negative numbers
 * regExpRange(-5, -1); //=> "(?:-1|-2|-3|-4|-5)"
 *
 * // Mixed positive and negative (handles 0 implicitly)
 * regExpRange(-2, 2); //=> "(?:-1|-2|0|1|2)"
 */
const regExpRange = (from: Numeric, to: Numeric = void 0, init: RegExpRangeInit = defaults) => {
    if (isNumeric(from) === false) {
        throw new TypeError('regExpRange: expected the first argument to be a number');
    }

    if (to === void 0 || from === to) {
        return String(from);
    }

    if (isNumeric(to) === false) {
        throw new TypeError('regExpRange: expected the second argument to be a number.');
    }

    if (typeof init.strictZeros === 'boolean') {
        init.relaxZeros = init.strictZeros === false;
    }

    const { capture, relaxZeros, shorthand, wrap } = init,
        cacheKey = `${from}:${to}=${relaxZeros}${shorthand}${capture}${wrap}`;

    if (regExpRange?.cache.has(cacheKey)) {
        return regExpRange?.cache?.get(cacheKey)?.result;
    }

    let f = toNumber(from),
        t = toNumber(to),
        a = min(f, t),
        b = max(f, t);

    if (abs(a - b) === 1) {
        let result = `${from}|${to}`;
        if (capture) {
            return `(${result})`;
        }
        if (wrap === false) {
            return result;
        }
        return `(?:${result})`;
    }

    const isPadded = hasPadding(String(from)) || hasPadding(String(to)),
        state: RegExpRangeState = { min: from, max: to, a, b };
    let positives: RangeToken[] = [],
        negatives: RangeToken[] = [];

    if (isPadded) {
        state.isPadded = isPadded;
        state.maxLen = String(state.max).length;
    }

    if (a < 0) {
        const newMin = b < 0 ? abs(b) : 1;
        negatives = splitToPatterns(newMin, abs(a), state, init);
        a = state.a = 0;
    }

    if (b >= 0) {
        positives = splitToPatterns(a, b, state, init);
    }

    state.negatives = negatives;
    state.positives = positives;
    state.result = collatePatterns(negatives, positives);

    if (capture === true) {
        state.result = `(${state.result})`;
    } else if (wrap !== false && positives.length + negatives.length > 1) {
        state.result = `(?:${state.result})`;
    }

    regExpRange.cache.set(cacheKey, state);
    return state.result;
};

regExpRange.cache = new Map<string, RegExpRangeState>();
regExpRange.clearCache = () => regExpRange.cache.clear();

export { regExpRange };
