/**
 * @blue/parser — Integration layer for the arcsecond parser-combinator library.
 * Re-exports arcsecond primitives and provides BlueJS-specific expression parsers.
 * @author Jeff Rose
 */

export {
    anyChar,
    anyString,
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
    possibly,
    optional,
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
} from './_parser.js';

export type { Ok, Parser } from 'arcsecond';

export { default as braceExpression } from './brace-expression.js';
export { default as glob } from './glob.js';
export { default as keypathExpression } from './keypath-expression.js';
export { default as noop } from './no-op.js';
export { default as sequenceExpression } from './sequence-expression.js';
export { default as wildcardExpression } from './wildcard-expression.js';
