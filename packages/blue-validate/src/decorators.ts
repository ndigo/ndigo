/**
 * @author Jeff Rose
 */

import constraints from './constraints';

type PatternDecoratorParams = {
    regex: RegExp | string;
    flags?: string;
};

/**
 * TC39 Stage 3 decorator that validates property values against a regex pattern.
 *
 * Logs validation errors to console but still allows the value to be set.
 * This is a non-blocking validation decorator for development feedback.
 *
 * Uses per-instance Symbol storage to prevent shared state issues.
 *
 * @param params - Configuration object containing regex pattern and optional flags
 * @returns Field decorator function
 *
 * @example
 * class User {
 *   @pattern({ regex: /^[a-z]+$/ })
 *   username: string;
 * }
 */
export function pattern(params: PatternDecoratorParams) {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        if (context.kind !== 'field') {
            throw new Error('@pattern can only be applied to class fields');
        }

        const propertyName = context.name;

        // Add an initializer that runs after the field is created
        context.addInitializer(function (this: any) {
            // Create a unique symbol for storing the actual value
            const storageSymbol = Symbol(`__pattern_${String(propertyName)}`);

            // Get the current value (already set by the field initializer)
            const currentValue = this[propertyName];

            // Store it in our symbol
            this[storageSymbol] = currentValue;

            // Delete the field property
            delete this[propertyName];

            // Define the property with getter/setter
            Object.defineProperty(this, propertyName, {
                get(this: any) {
                    return this[storageSymbol];
                },
                set(this: any, newValue: any) {
                    // Validate the new value
                    // Note: Pattern validator doesn't handle null/undefined properly,
                    // so we check for them explicitly
                    let isValid: boolean;
                    if (newValue === null || newValue === undefined) {
                        isValid = false;
                    } else {
                        isValid = constraints.Pattern.validate(newValue, {
                            regex: params.regex,
                            flags: params.flags,
                        } as any);
                    }

                    if (!isValid) {
                        console.error('YOU BAD DATA FILE');
                    }

                    // Set the value regardless of validation (non-blocking)
                    this[storageSymbol] = newValue;
                },
                configurable: true,
                enumerable: true,
            });
        });
    };
}
