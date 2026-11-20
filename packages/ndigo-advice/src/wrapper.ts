/**
 * Transparent advice wrappers.
 *
 * An advised method is a wrapper around the declared function, so naive
 * introspection would see the wrapper: `fn.length` becomes `0` and
 * `fn.toString()` reads `(...args) => { … }`. Framework code does introspect
 * methods — the dispatcher resolves `@parameters` names from the function
 * source — so a wrapped method must look exactly like the one it replaced.
 *
 * The wrapper therefore copies `name` and `length` from the original and
 * answers `toString()` with the original's own source. It remains a different
 * function object: `wrapped === declared` is false, which is the point of
 * wrapping.
 */

/**
 * Builds the function that runs an advice chain and then the declared method.
 *
 * @param declared - The function the instance would call without advice.
 * @param invoke - Runs the chain and returns its result.
 * @returns A wrapper that is introspectively identical to `declared`.
 */
export function createAdviceWrapper(declared: Function, invoke: (...args: unknown[]) => unknown): Function {
    // `name` and `length` are configurable own properties of functions, so both
    // can be redefined on the wrapper.
    Object.defineProperty(invoke, 'name', { value: declared.name, configurable: true });
    Object.defineProperty(invoke, 'length', { value: declared.length, configurable: true });

    // `toString` is inherited from Function.prototype, which would print the
    // variadic wrapper. Reading the declared source keeps signature discovery
    // (`@parameters` name resolution) working through advice.
    Object.defineProperty(invoke, 'toString', {
        value: () => Function.prototype.toString.call(declared),
        writable: true,
        configurable: true,
    });

    return invoke;
}
