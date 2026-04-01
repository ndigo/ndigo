/**
 * @author Jeff Rose
 */
// @ts-ignore
import { anyChar, char } from 'arcsecond';
import manyN from './many-n';
import { joinOnEmptyString } from './_util';

/** Matches any single character. */
export { anyChar } from 'arcsecond';

/** Parses text between two boundary parsers. */
export { between } from 'arcsecond';

/** Matches a single literal character. */
export { char } from 'arcsecond';

/** Tries parsers in order until one succeeds. */
export { choice } from 'arcsecond';

/** Builds a parser from generator-style control flow. */
export { coroutine } from 'arcsecond';

/** Chooses between two parsers based on the current input. */
export { either } from 'arcsecond';

/** Succeeds only at the end of input. */
export { endOfInput } from 'arcsecond';

/** Consumes input until another parser succeeds. */
export { everyCharUntil } from 'arcsecond';

/** Retrieves parser state data. */
export { getData } from 'arcsecond';

/** Peeks ahead without consuming input. */
export { lookAhead } from 'arcsecond';

/** Repeats a parser zero or more times. */
export { many } from 'arcsecond';

/** Repeats a parser one or more times. */
export { many1 } from 'arcsecond';

/** Makes a parser optional without failing on absence. */
export { possibly } from 'arcsecond';

/** Creates a parser that can reference itself recursively. */
export { recursiveParser } from 'arcsecond';

/** Matches input using a regular expression parser. */
export { regex } from 'arcsecond';

/** Parses a list separated by another parser. */
export { sepBy } from 'arcsecond';

/** Parses a non-empty list separated by another parser. */
export { sepBy1 } from 'arcsecond';

/** Sequences parsers and returns all results. */
export { sequenceOf } from 'arcsecond';

/** Stores parser state data. */
export { setData } from 'arcsecond';

/** Matches a literal string. */
export { str } from 'arcsecond';

/** Keeps the left result when combining two parsers. */
export { takeLeft } from 'arcsecond';

/** Keeps the right result when combining two parsers. */
export { takeRight } from 'arcsecond';

/** Runs a parser with additional state data. */
export { withData } from 'arcsecond';

/** Matches a literal `*` character. */
export const asterisk = char('*');

/** Parses at least one occurrence of a parser. */
export const atLeastOne = manyN(1);

/** Wraps a glob fragment so it matches the entire string. */
export const bindRegExp = (value: string) => `^${value}$`;

/** Parses zero or more occurrences of a parser. */
export const optional = manyN(0);

/** Parses any string and normalizes the empty case to `''`. */
export const anyString = optional(anyChar).map(joinOnEmptyString);

/** Matches a literal `+` character. */
export const plusSign = char('+');

/** Matches a literal `!` character. */
export const exclamationPoint = char('!');

/** Matches a literal `[` character. */
export const leftBracket = char('[');

/** Matches a literal `]` character. */
export const rightBracket = char(']');
