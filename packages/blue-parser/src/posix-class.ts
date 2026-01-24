/**
 * @author Jeff Rose
 * @see {@link https://github.com/francisrstokes/arcsecond}
 * @see {@link https://hackernoon.com/arcsecond-parsing-in-javascript-made-easy-af1894bdcec9}
 * @see {@link https://en.wikibooks.org/wiki/Regular_Expressions/POSIX_Basic_Regular_Expressions#Character_classes}
 */
// @ts-ignore
import { between, char, choice, errorMapTo, pipeParsers, possibly, sequenceOf, str } from 'arcsecond';
import { joinOnEmptyString, pipe } from './_util';
import { exclamationPoint } from './_parser';

const
    wrapInBrackets = ( value ) => `[${ value }]`,
    joinAndWrap = pipe( joinOnEmptyString, wrapInBrackets ),

    alnum  = str( 'alnum' )                             .map( () => 'a-zA-Z0-9' ),
    alpha  = str( 'alpha' )                             .map( () => 'a-zA-Z' ),
    ascii  = str( 'ascii' )                             .map( () => '\\x00-\\x7F' ),
    blank  = choice( [ str( 'blank' ), char( 'h' ) ] )  .map( () => ' \\t' ),
    cntrl  = str( 'cntrl' )                             .map( () => '\\x00-\\x1F\\x7F' ),
    digit  = choice( [ str( 'digit' ), char( 'd' ) ] )  .map( () => '0-9' ),
    graph  = str( 'graph' )                             .map( () => '\\x21-\\x7E' ),
    lower  = choice( [ str( 'lower' ), char( 'l' ) ] )  .map( () => 'a-z' ),
    print  = str( 'print' )                             .map( () => '\\x20-\\x7E ' ),
    punct  = str( 'punct' )                             .map( () => '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~' ),
    space  = choice( [ str( 'space' ), char( 's' ) ] )  .map( () => ' \\t\\r\\n\\v\\f' ),
    upper  = choice( [ str( 'upper' ), char( 'u' ) ] )  .map( () => 'A-Z' ),
    word   = choice( [ str( 'word' ), char( 'w' ) ] )   .map( () => 'A-Za-z0-9_' ),
    xdigit = str( 'xdigit' )                            .map( () => 'A-Fa-f0-9' ),
    characterClass = choice( [ alnum, alpha, ascii, blank, cntrl, digit, graph, lower, print, punct, space, upper, word, xdigit ] ),
    betweenBrackets = between( str( '[:' ) )( str( ':]' ) ),
    posixError = ( message: string, index: number ): string => `ParseError (position ${ index }): Expecting POSIX character class.`,

    posixClass = pipeParsers( [ betweenBrackets( sequenceOf( [ possibly( exclamationPoint.map( () => '^' ) ), characterClass ] ).map( joinAndWrap ) ), errorMapTo( posixError ) ] );

export default posixClass;
