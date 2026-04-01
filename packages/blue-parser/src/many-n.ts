/**
 * @author Jeff Rose
 * @see {@link https://github.com/francisrstokes/arcseconds}
 */
// @ts-ignore
import { fail, many, Parser, succeedWith } from 'arcsecond';
import { ifElse, lengthLessThanN } from './_util';

const failWith =
        (n: number) =>
        ({ index }) =>
            fail(`ParseError 'manyN' (position ${index}): Expecting to match at least ${n} value${n > 1 ? 's' : ''}`),
    manyN =
        <T>(n: number) =>
        (parser: Parser<T>): Parser<T> =>
            many(parser).chain(ifElse(lengthLessThanN(n), failWith(n), succeedWith));

/** Creates a repetition parser that enforces a minimum item count. */
export default manyN;
