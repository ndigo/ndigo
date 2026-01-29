/**
 * @author Jeff Rose
 * @module function
 */
import { F, T, __, addIndex, addIndexRight, always, andThen, ap, apply, applySpec, applyTo, ascend, ascendNatural, binary, bind, call, comparator, compose, composeWith, construct, constructN, converge, curry, curryN, descend, descendNatural, empty, flip, identity, invoker, juxt, lift, liftN, memoizeWith, nAry, nthArg, o, of, once, otherwise, partial, partialRight, pipe, pipeWith, tap, thunkify, tryCatch, unapply, unary, uncurryN, useWith, } from 'ramda';
/** @category Function */
export { F };
/** @category Function */
export { T };
/** @category Function */
export { __ };
/** @category Function @category List */
export { addIndex };
/** @category Function */
export { addIndexRight };
/** @category Function */
export { always };
/** @category Function */
export { andThen };
/** @category Function */
export { ap };
/** @category Function */
export { apply };
/** @category Function */
export { applySpec };
/** @category Function */
export { applyTo };
/** @category Function */
export { ascend };
/** @category Function */
export { ascendNatural };
/** @category Function */
export { binary };
/** @category Function @category Object */
export { bind };
/** @category Function */
export { call };
/** @category Function */
export { comparator };
/** @category Function */
export { compose };
/** @category Function */
export { composeWith };
/** @category Function */
export { construct };
/** @category Function */
export { constructN };
/** @category Function */
export { converge };
/** @category Function */
export { curry };
/** @category Function */
export { curryN };
/** @category Function */
export { descend };
/** @category Function */
export { descendNatural };
/** @category Function */
export { empty };
/** @category Function */
export { flip };
/** @category Function */
export { identity };
/** @category Function */
export { invoker };
/** @category Function */
export { juxt };
/** @category Function */
export { lift };
/** @category Function */
export { liftN };
/** @category Function */
export { memoizeWith };
/** @category Function */
export { nAry };
/** @category Function */
export { nthArg };
/** @category Function */
export { o };
/** @category Function */
export { of };
/** @category Function */
export { once };
/** @category Function */
export { otherwise };
/** @category Function */
export { partial };
/** @category Function */
export { partialRight };
/** @category Function */
export { pipe };
/** @category Function */
export { pipeWith };
/** @category Function */
export { tap };
/** @category Function */
export { thunkify };
/** @category Function */
export { tryCatch };
/** @category Function */
export { unapply };
/** @category Function */
export { unary };
/** @category Function */
export { uncurryN };
/** @category Function */
export { useWith };
export default {
    F,
    T,
    __,
    addIndex,
    addIndexRight,
    always,
    andThen,
    ap,
    apply,
    applySpec,
    applyTo,
    ascend,
    ascendNatural,
    binary,
    bind,
    call,
    comparator,
    compose,
    composeWith,
    construct,
    constructN,
    converge,
    curry,
    curryN,
    descend,
    descendNatural,
    empty,
    flip,
    identity,
    invoker,
    juxt,
    lift,
    liftN,
    memoizeWith,
    nAry,
    nthArg,
    o,
    of,
    once,
    otherwise,
    partial,
    partialRight,
    pipe,
    pipeWith,
    tap,
    thunkify,
    tryCatch,
    unapply,
    unary,
    uncurryN,
    useWith,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZnVuY3Rpb24vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUNILENBQUMsRUFDRCxDQUFDLEVBQ0QsRUFBRSxFQUNGLFFBQVEsRUFDUixhQUFhLEVBQ2IsTUFBTSxFQUNOLE9BQU8sRUFDUCxFQUFFLEVBQ0YsS0FBSyxFQUNMLFNBQVMsRUFDVCxPQUFPLEVBQ1AsTUFBTSxFQUNOLGFBQWEsRUFDYixNQUFNLEVBQ04sSUFBSSxFQUNKLElBQUksRUFDSixVQUFVLEVBQ1YsT0FBTyxFQUNQLFdBQVcsRUFDWCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFFBQVEsRUFDUixLQUFLLEVBQ0wsTUFBTSxFQUNOLE9BQU8sRUFDUCxjQUFjLEVBQ2QsS0FBSyxFQUNMLElBQUksRUFDSixRQUFRLEVBQ1IsT0FBTyxFQUNQLElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxFQUNMLFdBQVcsRUFDWCxJQUFJLEVBQ0osTUFBTSxFQUNOLENBQUMsRUFDRCxFQUFFLEVBQ0YsSUFBSSxFQUNKLFNBQVMsRUFDVCxPQUFPLEVBQ1AsWUFBWSxFQUNaLElBQUksRUFDSixRQUFRLEVBQ1IsR0FBRyxFQUNILFFBQVEsRUFDUixRQUFRLEVBQ1IsT0FBTyxFQUNQLEtBQUssRUFDTCxRQUFRLEVBQ1IsT0FBTyxHQUNWLE1BQU0sT0FBTyxDQUFDO0FBRWYseUJBQXlCO0FBQ3pCLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNiLHlCQUF5QjtBQUN6QixPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYix5QkFBeUI7QUFDekIsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ2Qsd0NBQXdDO0FBQ3hDLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUNwQix5QkFBeUI7QUFDekIsT0FBTyxFQUFFLGFBQWEsRUFBRSxDQUFDO0FBQ3pCLHlCQUF5QjtBQUN6QixP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