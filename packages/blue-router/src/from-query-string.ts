/**
 * @author Jeff Rose
 */

import { pipe, replace, split, trim, decodeURIComponent as decode } from '@blue/util';

type Sortable = string[] | { [key: string]: string };

const /*
    bracketMatcher: RegExp = /(\[\])$/,
    indexMatcher: RegExp = /\[(\d*)\]$/,


    // ?foo[0]=bar&foo[1]=baz
    indexArrayParser = ( key: string, value: string, accumulator: JSONValue ): void => {
        const result: RegExpExecArray = indexMatcher.exec( key );
        key = key.replace( indexMatcher, '' );

        if( !result ){
            accumulator[ key ] = value;
        } else {
            if( accumulator[ key ] === undefined ){
                accumulator[ key ] = {};
            }

            accumulator[ key ][ result[ 1 ] ] = value;
        }
    },

    // ?foo[]=bar&foo[]=baz
    bracketArrayParser = ( key: string, value: string, accumulator: JSONValue ): void => {
        const result: RegExpExecArray = bracketMatcher.exec( key );
        key = key.replace( bracketMatcher, '' );

        if( !result ){
            accumulator[ key ] = value;
        } else if( accumulator[ key ] === undefined ){
            accumulator[ key ] = [ value ];
        } else {
            accumulator[ key ] = [].concat( accumulator[ key ], value );
        }
    },
    */

    // ?foo=bar&foo=baz
    defaultArrayParser = (key: string, value: string, accumulator: any): void => {
        if (accumulator[key] === undefined) {
            accumulator[key] = value;
            return;
        }

        accumulator[key] = [].concat(accumulator[key], value);
    };

const isArray = Array.isArray,
    createNull = Object.create.bind(Object, null),
    plusMatcher = /\+/g,
    prefixMatcher = /^[?#&]/,
    removePrefix = replace(prefixMatcher, ''),
    replacePlusWithSpace = replace(plusMatcher, ' '),
    splitOnAmpersand = split('&'),
    splitOnEquals = split('='),
    replacePlusWithSpaceAndSplitOnEquals = pipe(replacePlusWithSpace, splitOnEquals),
    trimAndRemovePrefix = pipe(trim, removePrefix),
    keyCompare = (a: string, b: string): number => Number(a) - Number(b),
    keysSorter = (input: Sortable): string[] => {
        if (isArray(input)) {
            return input.sort();
        } else if (typeof input === 'object') {
            return keysSorter(Object.keys(input))
                .sort(keyCompare)
                .map(function (key: string): string {
                    return input[key];
                });
        }
    },
    /**
     * Parses a query string into an object.
     * @param {string} text The query string
     * @returns {Object} The parsed query string.
     * @category String
     */
    fromQueryString = (text: string): any => {
        const formatter = defaultArrayParser;
        let parsed: any = createNull();

        text = trimAndRemovePrefix(text);

        if (!text) {
            return parsed;
        }

        parsed = splitOnAmpersand(text).reduce(function (accum: any, param: string): any {
            const parts: string[] = replacePlusWithSpaceAndSplitOnEquals(param),
                key: string = decode(parts.shift());

            let value: string = parts.length > 0 ? parts.join('=') : undefined;

            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            value = value === undefined ? null : decode(value);

            formatter(key, value, accum);

            return accum;
        }, parsed);

        const accumulateResult = function (result: any, key: string): any {
            const value: any = parsed[key];

            if (Boolean(value) && typeof value === 'object' && !isArray(value)) {
                // Sort object keys, not values
                result[key] = keysSorter(value);
            } else {
                result[key] = value;
            }

            return result;
        };

        return Object.keys(parsed).sort().reduce(accumulateResult, createNull());
    };

export default fromQueryString;
