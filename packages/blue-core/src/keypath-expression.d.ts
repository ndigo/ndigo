/**
 * @author Jeff Rose
 */
import type { Converter } from './converter.js';
/** A token in a parsed keypath — either a string property name or a numeric array index. */
export type KeypathToken = string | number;
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
export declare class KeypathConverter implements Converter<string, KeypathToken[] | null> {
    convert(input: string): KeypathToken[] | null;
}
/** Singleton instance for backward compatibility. */
export declare const parseKeypath: (input: string) => KeypathToken[] | null;
