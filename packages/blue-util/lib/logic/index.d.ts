/**
 * @author Jeff Rose
 * @module logic
 */
import { allPass, and, anyPass, both, complement, cond, defaultTo, either, ifElse, isEmpty, isNotEmpty, not, or, pathSatisfies, propSatisfies, unless, until, when } from 'ramda';
/**
 * Takes a list of predicates and returns a predicate that returns true for a given list of arguments if every one of the provided predicates is satisfied by those arguments.
 * @category Logic
 * @param {Array} predicates
 * @returns {function}
 */
export { allPass };
/**
 * Returns true if both arguments are true; false otherwise.
 * @category Logic
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export { and };
/**
 * Takes a list of predicates and returns a predicate that returns true for a given list of arguments if at least one of the provided predicates is satisfied by those arguments.
 * @category Logic
 * @param {Array} list
 * @returns {function}
 */
export { anyPass };
/**
 * A function which calls the two provided functions and returns the && of the results.
 * @category Logic
 * @param {function} f
 * @param {function} g
 * @returns {function}
 */
export { both };
/**
 * Takes a function f and returns a function g such that if called with the same arguments when f returns a truthy value, g returns false and when f returns a falsy value g returns true.
 * @category Logic
 * @param {function} pred
 * @returns {function}
 */
export { complement };
/**
 * Returns a function which encapsulates if/else, if/else, ... logic.
 * @category Logic
 * @param {Array} pairs
 * @returns {function}
 */
export { cond };
/**
 * Returns the second argument if it is not null, undefined or NaN; otherwise the first argument is returned.
 * @category Logic
 * @param {*} defaultVal
 * @param {*} val
 * @returns {*}
 */
export { defaultTo };
/**
 * A function wrapping calls to the two functions in an || operation, returning the result of the first function if it is truth-y and the result of the second function otherwise.
 * @category Logic
 * @param {function} f
 * @param {function} g
 * @returns {function}
 */
export { either };
/**
 * Creates a function that will process either the onTrue or the onFalse function depending upon the result of the condition predicate.
 * @category Logic
 * @param {function} condition
 * @param {function} onTrue
 * @param {function} onFalse
 * @returns {function}
 */
export { ifElse };
/**
 * Returns true if the given value is its type's empty value; false otherwise.
 * @category Logic
 * @param {*} x
 * @returns {boolean}
 */
export { isEmpty };
/**
 * Returns false if the given value is its type's empty value; true otherwise.
 * @category Logic
 * @param {*} x
 * @returns {boolean}
 */
export { isNotEmpty };
/**
 * A function that returns the ! of its argument. It will return true when passed false-y value, and false when passed a truth-y one.
 * @category Logic
 * @param {*} a
 * @returns {boolean}
 */
export { not };
/**
 * Returns true if one or both of its arguments are true. Returns false if both arguments are false.
 * @category Logic
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export { or };
/**
 * Returns true if the specified object path satisfies the given predicate; false otherwise.
 * @category Logic
 * @param {function} pred
 * @param {Array} path
 * @param {Object} obj
 * @returns {boolean}
 */
export { pathSatisfies };
/**
 * Returns true if the specified object property satisfies the given predicate; false otherwise.
 * @category Logic
 * @param {function} pred
 * @param {string} name
 * @param {*} obj
 * @returns {boolean}
 */
export { propSatisfies };
/**
 * Tests the final argument by passing it to the given predicate function. If the predicate is not satisfied, the function will return the result of calling the whenFalseFn function with the same argument. If the predicate is satisfied, the argument is returned as is.
 * @category Logic
 * @param {function} pred
 * @param {function} whenFalseFn
 * @param {*} x
 * @returns {*}
 */
export { unless };
/**
 * Takes a predicate, a transformation function, and an initial value, and returns a value of the same type as the initial value. It does so by applying the transformation until the predicate is satisfied, at which point it returns the satisfactory value.
 * @category Logic
 * @param {function} pred
 * @param {function} fn
 * @param {*} init
 * @returns {*}
 */
export { until };
/**
 * Tests the final argument by passing it to the given predicate function. If the predicate is satisfied, the function will return the result of calling the whenTrueFn function with the same argument. If the predicate is not satisfied, the argument is returned as is.
 * @category Logic
 * @param {function} pred
 * @param {function} whenTrueFn
 * @param {*} x
 * @returns {*}
 */
export { when };
declare const _default: {
    allPass: typeof allPass;
    and: typeof and;
    anyPass: typeof anyPass;
    both: typeof both;
    complement: typeof complement;
    cond: typeof cond;
    defaultTo: typeof defaultTo;
    either: typeof either;
    ifElse: typeof ifElse;
    isEmpty: typeof isEmpty;
    isNotEmpty: typeof isNotEmpty;
    not: typeof not;
    or: typeof or;
    pathSatisfies: typeof pathSatisfies;
    propSatisfies: typeof propSatisfies;
    unless: typeof unless;
    until: typeof until;
    when: typeof when;
};
export default _default;
//# sourceMappingURL=index.d.ts.map