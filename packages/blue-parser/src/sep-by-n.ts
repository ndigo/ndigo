/**
 * @author Jeff Rose
 * @see {@link https://github.com/francisrstokes/arcseconds}
 */
// @ts-ignore
import { fail, Parser, sepBy, succeedWith } from 'arcsecond';
import { ifElse, lengthLessThanN } from './_util';

const
    failWith = ( n: number ) => ( { index } ) => fail( `ParseError 'sepBy' (position ${ index }): Expecting to match at least ${ n } separated value${ n > 1 ? 's' : '' }` ),
    sepByN = ( n: number ) => ( separator: Parser ) => ( value ) => sepBy( separator )( value ).chain( ifElse( lengthLessThanN( n ), failWith( n ), succeedWith ) );

export default sepByN;
