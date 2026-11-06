/**
 * Internal utilities for decorator implementation.
 */
/**
 * Extract parameter names from a function signature.
 * Used by decorators to map parameter names to positions.
 *
 * @example
 * ```ts
 * function example(foo: string, bar: number = 10, baz?) {}
 * getFunctionParamNames(example); // ['foo', 'bar', 'baz']
 * ```
 *
 * @param fn - The function to extract parameter names from
 * @returns Array of parameter names in declaration order
 */
export function getFunctionParamNames(fn: Function): string[] {
    const fnStr = fn.toString();

    // Match function parameters - handles:
    // - Regular functions: function foo(a, b) {}
    // - Arrow functions: (a, b) => {}
    // - Methods: foo(a, b) {}
    // - Async functions: async function foo(a, b) {}
    const match = fnStr.match(/(?:function\s*)?[^(]*\(([^)]*)\)/);

    if (!match || !match[1]) {
        return [];
    }

    const params = match[1];

    // Split by comma, then clean up each parameter
    return params
        .split(',')
        .map((param) => {
            // Remove default values: 'foo = 10' -> 'foo'
            // Remove type annotations: 'foo: string' -> 'foo'
            // Remove optional markers: 'foo?' -> 'foo'
            // Remove destructuring and rest operators
            const cleaned = param.trim().split(/[=:?]/)[0].trim();

            // Handle destructuring patterns like {a, b} or [a, b]
            if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
                // Skip destructured parameters - they can't be mapped by name
                return null;
            }

            // Handle rest parameters: ...args
            if (cleaned.startsWith('...')) {
                return cleaned.slice(3);
            }

            return cleaned;
        })
        .filter((param) => param && param.length > 0) as string[];
}

const { defineProperty, getOwnPropertyDescriptor, getPrototypeOf } = Reflect;

/**
 * Makes a decorated method enumerable on the prototype level where it is
 * actually declared.
 *
 * Discovery loops scan prototype levels with `Object.keys`, which reports own
 * enumerable properties only. A base-class-declared method's descriptor lives
 * on the base prototype, not on the instance's immediate prototype, so the
 * previous one-level lookup silently no-opped for subclassed handlers. Walk
 * the chain and upgrade enumerability where the descriptor is found (the same
 * walk ndigo-context applies for `@entry`).
 *
 * @param instance - The decorated instance the method initializer runs on.
 * @param method - The decorated method name.
 */
export function makeMethodEnumerable(instance: object, method: PropertyKey): void {
    let owner: object | null = instance;
    while (owner !== null) {
        const descriptor = getOwnPropertyDescriptor(owner, method);
        if (descriptor) {
            if (!descriptor.enumerable) {
                defineProperty(owner, method, {
                    ...descriptor,
                    enumerable: true,
                });
            }
            return;
        }
        owner = getPrototypeOf(owner) as object | null;
    }
}
