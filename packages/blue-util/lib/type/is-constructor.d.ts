/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://stackoverflow.com/questions/40922531/how-to-check-if-a-javascript-function-is-a-constructor}
 */
/**
 * Determines whether a given value is a constructor, i.e. creates instances using `new`.
 * @function module:util.isConstructor
 * @param {*} value The value to be tested.
 * @returns {external:boolean} Whether or not `value` is a constructor.
 * @category Type
 */
declare const isConstructor: (value: any) => value is Function;
export default isConstructor;
//# sourceMappingURL=is-constructor.d.ts.map