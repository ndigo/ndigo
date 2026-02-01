/**
 * @author Jeff Rose
 */
// @ts-ignore
import { anyChar, char } from 'arcsecond';
import manyN from './many-n';
import { joinOnEmptyString } from './_util';

export {
    anyChar,
    between,
    char,
    choice,
    coroutine,
    either,
    endOfInput,
    everyCharUntil,
    getData,
    lookAhead,
    many,
    many1,
    recursiveParser,
    regex,
    sepBy,
    sepBy1,
    sequenceOf,
    setData,
    str,
    takeLeft,
    takeRight,
    withData,
} from 'arcsecond';

export const asterisk = char('*');

export const atLeastOne = manyN(1);

export const bindRegExp = (value: string) => `^${value}$`;

export const optional = manyN(0);

export const anyString = optional(anyChar).map(joinOnEmptyString);

export const plusSign = char('+');

export const exclamationPoint = char('!');

export const leftBracket = char('[');

export const rightBracket = char(']');
