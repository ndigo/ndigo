/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { FrameworkError } from '@blue/core';
import constraints, { hasConstraint } from './constraints';
import { ConstraintViolationError } from './error';
import { defaultValidationGroup, ValidationGroup } from './group';

/**
 * Defines the validation mode for a constraint.
 * - `blocking`: Throws an error immediately if validation fails.
 * - `non-blocking`: Logs a warning if validation fails, but does not stop execution.
 */
type ValidationMode = 'blocking' | 'non-blocking';

/**
 * Configuration options for validation decorators.
 * @template T - The type of parameters specific to the constraint.
 * @property {T} [params] - Parameters specific to the validation constraint.
 * @property {ValidationMode} [mode='blocking'] - The validation mode to use.
 * @property {string} [message] - Custom error message for validation failure.
 * @property {ValidationGroup[]} [groups] - Validation groups to which this constraint belongs.
 */
type DecoratorConfig<T extends Record<string, unknown> = Record<string, unknown>> = {
    params?: T;
    mode?: ValidationMode;
    message?: string;
    groups?: ValidationGroup[];
};

/**
 * Internal metadata structure for a single validation decorator applied to a field.
 * @template T - The type of parameters specific to the constraint.
 * @property {string} constraint - The name of the constraint (e.g., 'Min', 'Pattern').
 * @property {T} params - Parameters specific to the validation constraint.
 * @property {ValidationMode} mode - The validation mode (blocking or non-blocking).
 * @property {string} [message] - Custom error message for validation failure.
 * @property {ValidationGroup[]} [groups] - Validation groups to which this constraint belongs.
 */
type DecoratorMetadata<T extends Record<string, unknown> = Record<string, unknown>> = {
    constraint: string;
    params: T;
    mode: ValidationMode;
    message?: string;
    groups?: ValidationGroup[];
};

/**
 * A map of field names to an array of `DecoratorMetadata`, representing all validation decorators applied to each field.
 */
type FieldValidationMetadata = Record<string, DecoratorMetadata[]>;

/**
 * Parameters for the `@pattern` decorator.
 * @property {RegExp | string} regex - The regular expression to match against the field's value.
 * @property {string} [flags] - Flags for the regular expression (e.g., 'i' for case-insensitive).
 * @property {ValidationMode} [mode='blocking'] - The validation mode to use.
 * @property {string} [message] - Custom error message for validation failure.
 * @property {ValidationGroup[]} [groups] - Validation groups to which this constraint belongs.
 */
type PatternDecoratorParams = {
    regex: RegExp | string;
    flags?: string;
    mode?: ValidationMode;
    message?: string;
    groups?: ValidationGroup[];
};

/**
 * Parameters for the `@constrained` decorator, allowing dynamic constraint application.
 * @property {string} constraint - The name of the constraint to apply (e.g., 'Min', 'Pattern').
 * @property {Record<string, unknown>} [params] - Parameters specific to the chosen constraint.
 * @property {ValidationMode} [mode='blocking'] - The validation mode to use.
 * @property {string} [message] - Custom error message for validation failure.
 * @property {ValidationGroup[]} [groups] - Validation groups to which this constraint belongs.
 */
type ConstrainedDecoratorParams = {
    constraint: string;
    params?: Record<string, unknown>;
    mode?: ValidationMode;
    message?: string;
    groups?: ValidationGroup[];
};

/**
 * The result object returned by the `validate` method on a class decorated with `@validated`.
 * @property {boolean} isValid - True if all validations passed, false otherwise.
 * @property {Set<string>} failedProperties - A set of property names that failed validation.
 */
export type ClassValidationResult = {
    isValid: boolean;
    failedProperties: Set<string>;
};

/**
 * Options for the `validate` method on a class decorated with `@validated`.
 * @property {ValidationGroup[]} [groups] - Specific validation groups to run. If not provided, all groups associated with the class or default group will be used.
 */
export type ClassValidationOptions = {
    groups?: ValidationGroup[];
};

const validationFieldMetadataKey = 'validate:fields';

const includesAnyGroup = (
    constraintGroups: ValidationGroup[] | undefined,
    activeGroups: ValidationGroup[]
): boolean => {
    if (!Array.isArray(constraintGroups) || !constraintGroups.length) {
        return true;
    }

    return constraintGroups.some((group) => activeGroups.includes(group));
};

const createViolationError = (propertyName: string | symbol, constraintName: string, message?: string) => {
    const defaultMessage = `Constraint "${constraintName}" failed for field "${String(propertyName)}"`;
    return new ConstraintViolationError(message || defaultMessage, new Set([constraintName]));
};

const validateConstraintValue = (
    constraintName: string,
    newValue: unknown,
    params: Record<string, unknown>,
    propertyName: string | symbol,
    mode: ValidationMode,
    message?: string
): void => {
    if (!hasConstraint(constraintName)) {
        throw new TypeError(`Constraint "${constraintName}" does not exist`);
    }

    const isValid = constraints[constraintName].validate(newValue as any, params);

    if (isValid) {
        return;
    }

    const error = createViolationError(propertyName, constraintName, message);

    if (mode === 'non-blocking') {
        console.warn(error.message);
        return;
    }

    throw error;
};

const readFieldMetadata = (target: object): FieldValidationMetadata => {
    const merged: FieldValidationMetadata = {};
    let ctor = (target as any)?.constructor;

    while (ctor) {
        const metadata = ctor?.[Symbol.metadata]?.[validationFieldMetadataKey] as FieldValidationMetadata | undefined;
        if (metadata) {
            Object.keys(metadata).forEach((fieldName) => {
                merged[fieldName] = [...(metadata[fieldName] || []), ...(merged[fieldName] || [])];
            });
        }
        ctor = Object.getPrototypeOf(ctor);
    }

    return merged;
};

const defineFieldValidation = (
    propertyName: string | symbol,
    constraintName: string,
    config: DecoratorConfig,
    context: ClassFieldDecoratorContext
): void => {
    const mode = config.mode || 'blocking';
    const params = (config.params || {}) as Record<string, unknown>;
    const existingFieldMetadata =
        (context.metadata[validationFieldMetadataKey] as FieldValidationMetadata | undefined) || {};
    const existingEntry = existingFieldMetadata[String(propertyName)] || [];

    context.metadata[validationFieldMetadataKey] = {
        ...existingFieldMetadata,
        [String(propertyName)]: [
            ...existingEntry,
            {
                constraint: constraintName,
                params,
                mode,
                message: config.message,
                groups: config.groups,
            },
        ],
    };

    context.addInitializer(function (this: any) {
        const storageSymbol = Symbol(`__validate_${String(propertyName)}`);
        const currentValue = this[propertyName];

        this[storageSymbol] = currentValue;
        delete this[propertyName];

        Object.defineProperty(this, propertyName, {
            get(this: any) {
                return this[storageSymbol];
            },
            set(this: any, newValue: unknown) {
                const metadata = readFieldMetadata(this);
                const constraintsForField = metadata[String(propertyName)] || [];
                const activeGroups = [defaultValidationGroup];

                constraintsForField.forEach((entry) => {
                    if (!includesAnyGroup(entry.groups, activeGroups)) {
                        return;
                    }

                    validateConstraintValue(
                        entry.constraint,
                        newValue,
                        entry.params,
                        propertyName,
                        entry.mode,
                        entry.message
                    );
                });

                this[storageSymbol] = newValue;
            },
            configurable: true,
            enumerable: true,
        });
    });
};

const createConstraintDecorator =
    <T extends Record<string, unknown> = Record<string, unknown>>(
        constraintName: string,
        mapConfig?: (params: T) => DecoratorConfig<T>
    ) =>
    (params: T | DecoratorConfig<T> = {} as DecoratorConfig<T>) =>
    (value: undefined, context: ClassFieldDecoratorContext): void => {
        if (context.kind !== 'field') {
            throw new FrameworkError(`@${constraintName} can only be applied to class fields`);
        }

        const propertyName = context.name;
        const incoming = params as T & DecoratorConfig<T>;
        const isMapped = typeof mapConfig === 'function';

        const config = isMapped ? mapConfig(incoming as T) : (incoming as DecoratorConfig<T>);

        defineFieldValidation(propertyName, constraintName, config, context);
    };

/**
 * TC39 Stage 3 decorator that applies a named validation constraint to a class field.
 * This decorator allows for dynamic application of any registered constraint.
 * @param {ConstrainedDecoratorParams} config - Configuration for the constraint, including its name and parameters.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @constrained({ constraint: 'Min', params: { value: 10 }, message: 'Value must be at least 10' })
 *   myField: number;
 * }
 */
export const constrained = (config: ConstrainedDecoratorParams) => {
    return createConstraintDecorator(config.constraint)({
        params: config.params || {},
        mode: config.mode,
        message: config.message,
        groups: config.groups,
    });
};

/**
 * TC39 Stage 3 decorator that validates property values against a regex pattern.
 */
export const pattern = createConstraintDecorator<PatternDecoratorParams>('Pattern', (params) => ({
    params: {
        regex: params.regex,
        flags: params.flags,
    },
    mode: params.mode,
    message: params.message,
    groups: params.groups,
}));

/**
 * TC39 Stage 3 decorator that validates a numeric property to be greater than or equal to a specified minimum value.
 * @param {object} params - Parameters for the min constraint.
 * @param {number} params.value - The minimum allowed value.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @min({ value: 0, message: 'Must be non-negative' })
 *   age: number;
 * }
 */
export const min = createConstraintDecorator<{ value: number }>('Min', (params) => ({
    params: {
        value: params.value,
    },
}));

/**
 * TC39 Stage 3 decorator that validates a numeric property to be less than or equal to a specified maximum value.
 * @param {object} params - Parameters for the max constraint.
 * @param {number} params.value - The maximum allowed value.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @max({ value: 100, message: 'Must be 100 or less' })
 *   score: number;
 * }
 */
export const max = createConstraintDecorator<{ value: number }>('Max', (params) => ({
    params: {
        value: params.value,
    },
}));

/**
 * TC39 Stage 3 decorator that validates a numeric property to be within a specified range (inclusive).
 * @param {object} params - Parameters for the range constraint.
 * @param {number} [params.min] - The minimum allowed value.
 * @param {number} [params.max] - The maximum allowed value.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @range({ min: 1, max: 5, message: 'Must be between 1 and 5' })
 *   level: number;
 * }
 */
export const range = createConstraintDecorator<{ min?: number; max?: number }>('Range', (params) => ({
    params,
}));

/**
 * TC39 Stage 3 decorator that validates the length of a string or array property.
 * @param {object} params - Parameters for the length constraint.
 * @param {number} [params.min] - The minimum allowed length.
 * @param {number} [params.max] - The maximum allowed length.
 * @param {number} [params.value] - An exact allowed length.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @length({ min: 5, max: 20, message: 'Name must be between 5 and 20 characters' })
 *   name: string;
 * }
 */
export const length = createConstraintDecorator<{ min?: number; max?: number; value?: number }>('Length', (params) => ({
    params,
}));

/**
 * TC39 Stage 3 decorator that validates a date property to be in the past.
 * @param {object} [params] - Parameters for the past constraint.
 * @param {string} [params.format] - Optional date format string (e.g., 'YYYY-MM-DD').
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @past({ message: 'Date must be in the past' })
 *   birthDate: Date;
 * }
 */
export const past = createConstraintDecorator<{ format?: string }>('Past', (params) => ({
    params,
}));

/**
 * TC39 Stage 3 decorator that validates a date property to be in the future.
 * @param {object} [params] - Parameters for the future constraint.
 * @param {string} [params.format] - Optional date format string (e.g., 'YYYY-MM-DD').
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @future({ message: 'Date must be in the future' })
 *   dueDate: Date;
 * }
 */
export const future = createConstraintDecorator<{ format?: string }>('Future', (params) => ({
    params,
}));

/**
 * TC39 Stage 3 decorator that validates a date property to be within a specified date range.
 * @param {object} params - Parameters for the date range constraint.
 * @param {string} [params.min] - The minimum allowed date string.
 * @param {string} [params.max] - The maximum allowed date string.
 * @param {string} [params.format] - Optional date format string (e.g., 'YYYY-MM-DD').
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @dateRange({ min: '2023-01-01', max: '2023-12-31', format: 'YYYY-MM-DD' })
 *   eventDate: string;
 * }
 */
export const dateRange = createConstraintDecorator<{ min?: string; max?: string; format?: string }>(
    'DateRange',
    (params) => ({
        params,
    })
);

/**
 * TC39 Stage 3 decorator that validates a numeric property to have a specific number of integer and fraction digits.
 * @param {object} params - Parameters for the digits constraint.
 * @param {number} params.integer - The exact number of integer digits allowed.
 * @param {number} params.fraction - The exact number of fraction digits allowed.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @digits({ integer: 3, fraction: 2, message: 'Must have 3 integer and 2 fraction digits' })
 *   price: number;
 * }
 */
export const digits = createConstraintDecorator<{ integer: number; fraction: number }>('Digits', (params) => ({
    params,
}));

/**
 * TC39 Stage 3 decorator that validates a property's value against a predefined list of allowed values.
 * @param {object} params - Parameters for the enumeration constraint.
 * @param {string | string[]} params.value - A single allowed value or an array of allowed values.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @enumeration({ value: ['red', 'green', 'blue'], message: 'Color must be red, green, or blue' })
 *   color: string;
 * }
 */
export const enumeration = createConstraintDecorator<{ value: string | string[] }>('Enum', (params) => ({
    params,
}));

/**
 * TC39 Stage 3 decorator that validates a string property to be a valid email address.
 * @param {DecoratorConfig} [config] - Optional configuration for the decorator.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @email({ message: 'Invalid email format' })
 *   userEmail: string;
 * }
 */
export const email = createConstraintDecorator('Email');
/**
 * TC39 Stage 3 decorator that validates a string property to not be null, undefined, or an empty string (after trimming).
 * @param {DecoratorConfig} [config] - Optional configuration for the decorator.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @notBlank({ message: 'Field cannot be blank' })
 *   description: string;
 * }
 */
export const notBlank = createConstraintDecorator('NotBlank');
/**
 * TC39 Stage 3 decorator that validates a string property to be a valid URL.
 * @param {DecoratorConfig} [config] - Optional configuration for the decorator.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @url({ message: 'Invalid URL format' })
 *   website: string;
 * }
 */
export const url = createConstraintDecorator('URL');
/**
 * TC39 Stage 3 decorator that validates a numeric property to be an integer.
 * @param {DecoratorConfig} [config] - Optional configuration for the decorator.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @integer({ message: 'Must be an integer' })
 *   quantity: number;
 * }
 */
export const integer = createConstraintDecorator('Integer');
/**
 * TC39 Stage 3 decorator that validates a property to be a numeric value.
 * @param {DecoratorConfig} [config] - Optional configuration for the decorator.
 * @returns {ClassFieldDecorator} A class field decorator function.
 * @example
 * class MyClass {
 *   @numeric({ message: 'Must be a number' })
 *   value: unknown;
 * }
 */
export const numeric = createConstraintDecorator('Numeric');

/**
 * TC39 Stage 3 class decorator that enables validation for a class's fields.
 * When applied, it adds a `validate` method to the class prototype, allowing programmatic validation.
 * @param {object} [config] - Configuration for the class validation.
 * @param {ValidationGroup[]} [config.groups] - Default validation groups to apply when `validate` is called without explicit groups.
 * @returns {ClassDecorator} A class decorator function.
 * @example
 * @validated()
 * class User {
 *   @notBlank()
 *   firstName: string;
 *
 *   @email()
 *   email: string;
 *
 *   validateUser() {
 *     const result = this.validate();
 *     if (!result.isValid) {
 *       console.error('Validation failed for:', result.failedProperties);
 *     }
 *   }
 * }
 */
export const validated =
    (config: { groups?: ValidationGroup[] } = {}) =>
    <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext): T => {
        context.metadata['validate:class'] = {
            groups: config.groups || [],
        };

        Object.defineProperty(target.prototype, 'validate', {
            value: function (options: ClassValidationOptions = {}): ClassValidationResult {
                const metadata = readFieldMetadata(this);
                const failures = new Set<string>();
                const activeGroups =
                    options.groups && options.groups.length
                        ? options.groups
                        : config.groups && config.groups.length
                          ? config.groups
                          : [defaultValidationGroup];

                Object.keys(metadata).forEach((fieldName) => {
                    const fieldConfigList = (metadata[fieldName] || []).filter((entry) =>
                        includesAnyGroup(entry.groups, activeGroups)
                    );
                    const value = this[fieldName];

                    const hasBlockingFailure = fieldConfigList.some((fieldConfig) => {
                        if (fieldConfig.mode === 'non-blocking') {
                            return false;
                        }

                        return !constraints[fieldConfig.constraint].validate(value, fieldConfig.params);
                    });

                    hasBlockingFailure && failures.add(fieldName);
                });

                return {
                    isValid: failures.size === 0,
                    failedProperties: failures,
                };
            },
            configurable: true,
            enumerable: false,
            writable: false,
        });

        return target;
    };
