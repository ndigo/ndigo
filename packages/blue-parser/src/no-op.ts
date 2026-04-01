/**
 * @author Jeff Rose
 * @see {@link https://github.com/francisrstokes/arcsecond}
 * @see {@link https://hackernoon.com/arcsecond-parsing-in-javascript-made-easy-af1894bdcec9}
 */
// @ts-ignore
import { Parser } from 'arcsecond';

const updateResult = (state, result) => ({ ...state, result }),
    noop = new Parser(function (state) {
        if (state.isError) return state;
        return updateResult(state, null);
    });

/** Parser that succeeds without consuming input and yields `null`. */
export default noop;
