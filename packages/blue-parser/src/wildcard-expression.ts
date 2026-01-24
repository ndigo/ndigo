/**
 * @author Jeff Rose
 * @see {@link https://github.com/francisrstokes/arcsecond}
 */

import { head, pipe, replace } from './_util';
import { anyString, asterisk, bindRegExp } from './_parser';
import sepByN from './sep-by-n';

const replaceAstrisk = replace( /\*/g, '.*?' );

const wildcardExpression = sepByN( 0 )( asterisk )( anyString ).map( pipe( head, replaceAstrisk, bindRegExp ) );

export default wildcardExpression;
