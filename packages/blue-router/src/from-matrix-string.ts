/**
 * @author Jeff Rose
 */

import { decodeURIComponent as decode } from '@blue/util';

type ListParser = (key: string, value: string, accumulator: any) => void;

const commaMatcher = /,/,
    plusMatcher = /\+/g,
    prefixMatcher = /^[;]/,
    createNull = Object.create.bind(Object, null),
    formatter = (key: string, value: string, accumulator: any): void => {
        if (commaMatcher.exec(value)) {
            accumulator[key] = value.split(',');
        } else {
            accumulator[key] = value;
        }
    },
    parseParameterList = (parse: ListParser, delimiter: string, text: string): any =>
        text.split(delimiter).reduce(function (accumulator: any, parameter: string): any {
            const parts: string[] = parameter.replace(plusMatcher, ' ').split('='),
                key: string = decode(parts.shift());
            let value: string = parts.length > 0 ? parts.join('=') : undefined;

            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            value = value === undefined ? null : decode(value);

            parse(key, value, accumulator);

            return accumulator;
        }, createNull()),
    /**
     * Parses a matrix string into an object.
     * @function module:router.fromMatrixString
     * @param {external:string} text The matrix string
     * @returns {external:Object} The parsed matrix string.
     * @category String
     */
    fromMatrixString = (text: string): { [key: string]: string } => {
        let parsed: any = createNull();

        text = text.trim().replace(prefixMatcher, '');

        if (!text) {
            return parsed;
        }

        parsed = parseParameterList(formatter, ';', text);

        return Object.keys(parsed).reduce(function (result: any, key: string): any {
            result[key] = parsed[key];
            return result;
        }, createNull());
    };

export default fromMatrixString;
