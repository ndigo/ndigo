/**
 * @author Jeff Rose
 */

import type { Converter } from './converter.js';

/** A token in a parsed keypath — either a string property name or a numeric array index. */
export type KeypathToken = string | number;

function isIdentStart(ch: string): boolean {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || ch === '$';
}

function isIdentPart(ch: string): boolean {
    return isIdentStart(ch) || (ch >= '0' && ch <= '9');
}

/**
 * Parses a dotted and bracketed property-access expression into an ordered array of path tokens.
 *
 * Returns `null` for invalid input — callers treat an unparseable keypath as "no match"
 * rather than an error condition.
 *
 * @param input - A keypath string such as `user.address.street` or `items[0].name`.
 * @returns An array of {@link KeypathToken} values, or `null` if the input is not a valid keypath.
 *
 * @example
 * parseKeypath('user.name')        // ['user', 'name']
 * parseKeypath('items[0].title')   // ['items', 0, 'title']
 * parseKeypath('a["key"]')         // ['a', 'key']
 * parseKeypath('')                 // null
 * parseKeypath('123invalid')       // null
 */
export class KeypathConverter implements Converter<string, KeypathToken[] | null> {
    convert(input: string): KeypathToken[] | null {
        const tokens: KeypathToken[] = [];
        let i = 0;
        const len = input.length;

        // First token must be an identifier
        if (i >= len || !isIdentStart(input[i])) return null;
        let start = i++;
        while (i < len && isIdentPart(input[i])) i++;
        tokens.push(input.slice(start, i));

        // Subsequent tokens: .identifier | ['string'] | ["string"] | [number]
        while (i < len) {
            const ch = input[i];
            if (ch === '.') {
                i++;
                if (i >= len || !isIdentStart(input[i])) return null;
                start = i++;
                while (i < len && isIdentPart(input[i])) i++;
                tokens.push(input.slice(start, i));
            } else if (ch === '[') {
                i++; // skip '['
                if (i >= len) return null;
                const quote = input[i];
                if (quote === "'" || quote === '"') {
                    i++; // skip opening quote
                    start = i;
                    while (i < len && input[i] !== quote) i++;
                    if (i >= len) return null; // unterminated string
                    tokens.push(input.slice(start, i));
                    i++; // skip closing quote
                    if (i >= len || input[i] !== ']') return null;
                    i++; // skip ']'
                } else {
                    // numeric literal
                    start = i;
                    while (i < len && input[i] !== ']') i++;
                    if (i >= len) return null; // no closing bracket
                    const raw = input.slice(start, i);
                    const num = parseInt(raw, 10);
                    tokens.push(isNaN(num) ? raw : num);
                    i++; // skip ']'
                }
            } else {
                break; // stop at any unrecognised character
            }
        }

        return tokens.length === 0 ? null : tokens;
    }
}

/** Singleton instance for backward compatibility. */
export const parseKeypath: (input: string) => KeypathToken[] | null = new KeypathConverter().convert.bind(new KeypathConverter());
