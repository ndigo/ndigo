/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://github.com/samverschueren/decode-uri-component}
 */

import { concat, join, match, reduce, replace, unapply } from 'ramda';

const token = '%[a-f0-9]{2}',
    singleMatcher = new RegExp(token, 'gi'),
    multiMatcher = new RegExp(`(?:${token})+|${token}|.`, 'gi'),
    plusMatcher = /\+/g,
    concatAll = unapply(reduce<string[], string[]>(concat, [])),
    joinOnEmptyString = join('') as (value: string[]) => string,
    matchSingleToken = match(singleMatcher) as (value: string) => RegExpMatchArray,
    replacePlusWithSpace = replace(plusMatcher, ' ');

function decode(input: string): string {
    try {
        return decodeURIComponent(input);
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let tokens = matchSingleToken(input),
            index = 1;

        for (; index < tokens.length; index++) {
            input = joinOnEmptyString(decodeURIComponentList(tokens, index));
            tokens = matchSingleToken(input);
        }

        return input;
    }
}

function decodeURIComponentList(components: string[], index: number = 1): string[] {
    try {
        // Try to decode the entire string first
        return [decodeURIComponent(joinOnEmptyString(components))];
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // Do nothing
    }

    if (components.length === 1) {
        return components;
    }

    // Split the array in 2 parts
    const left = components.slice(0, index),
        right = components.slice(index);

    return concatAll([], decodeURIComponentList(left), decodeURIComponentList(right));
    //return Array.prototype.concat.call( [], decodeURIComponentList( left ), decodeURIComponentList( right ) );
}

function enhancedDecodeURIComponent(input: string): string {
    // Keep track of all the replacements and prefill the map with the
    const replaceMap: { [key: string]: string } = {
        '%FE%FF': '\uFFFD\uFFFD',
        '%FF%FE': '\uFFFD\uFFFD',
    };
    let match: RegExpExecArray | null = multiMatcher.exec(input);

    while (match) {
        try {
            // Decode as big chunks as possible
            replaceMap[match[0]] = decodeURIComponent(match[0]);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const result: string = decode(match[0]);

            if (result !== match[0]) {
                replaceMap[match[0]] = result;
            }
        }
        match = multiMatcher.exec(input);
    }

    // Add  at the end of the map to make sure it does not replace the combinator before everything else
    replaceMap['%C2'] = '\uFFFD';

    const entries = Object.keys(replaceMap),
        length = entries.length;
    let index = 0,
        key: string;

    for (; index < length; index++) {
        // Replace all decoded components
        key = entries[index];
        input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
    }

    return input;
}

/**
 * Enhanced decodeURIComponent
 * - Decodes + to a space.
 * - Converts the BOM to a replacement character �.
 * - Does not throw with invalid encoded input.
 * - Decodes as much of the string as possible.
 * @param {string} value The encoded string
 * @returns {string} The decoded string
 * @category String
 */
export default function (value: string): string {
    try {
        // Try the built in decoder first
        return decodeURIComponent(replacePlusWithSpace(value));
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // Fallback to a more advanced decoder
        return enhancedDecodeURIComponent(value);
    }
}
