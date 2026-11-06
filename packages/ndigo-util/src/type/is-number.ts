/**
 * Type guard for finite numbers.
 */

/**
 * Determines whether a given value is an actual finite number. The logic differs from `typeof`, which considers `NaN` and `Infinity` to be numbers and instances of `Number` to be objects.
 *
 * @param value - The value to be tested.
 * @returns Whether or not `value` is a number.
 *
 * @example
 * ```ts
 * typeof new Number(1) === 'number'; //=> false
 * isNumber(new Number(1)); //=> true
 * typeof 2 === 'number'; //=> true
 * isNumber(2); //=> true
 * typeof NaN === 'number'; //=> true
 * isNumber(NaN); //=> false
 * typeof Infinity === 'number'; //=> true
 * isNumber(Infinity); //=> false
 * ```
 */
const isNumber = (value: unknown): value is number => {
    const n = typeof value === 'number' ? value : value instanceof Number ? value.valueOf() : NaN;
    return Number.isFinite(n);
};

export default isNumber;
