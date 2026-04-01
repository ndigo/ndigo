/**
 * @blue/parser — Integration layer for the arcsecond parser-combinator library.
 * Re-exports arcsecond primitives and provides BlueJS-specific expression parsers.
 */

/** Re-exports parser primitives used across BlueJS. */
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

/** Parser success result type from arcsecond. */
export type { Ok } from 'arcsecond';

/** Parser type from arcsecond. */
export type { Parser } from 'arcsecond';

/** Brace-expression parser for shell-style expansions. */
export { default as braceExpression } from './brace-expression.js';
/** Glob-pattern parser that returns a regular-expression source. */
export { default as glob } from './glob.js';
/** Key-path parser for dotted and bracketed property access. */
export { default as keypathExpression } from './keypath-expression.js';
/** Parser that preserves the current parse state. */
export { default as noop } from './no-op.js';
/** Sequence-expression parser for brace-style numeric and alphabetic ranges. */
export { default as sequenceExpression } from './sequence-expression.js';
/** Wildcard parser that converts glob wildcards into regular expressions. */
export { default as wildcardExpression } from './wildcard-expression.js';
