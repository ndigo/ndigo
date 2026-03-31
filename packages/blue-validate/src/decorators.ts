/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { FrameworkError } from '@blue/core';
import constraints, { hasConstraint } from './constraints';
import { ConstraintViolationError } from './error';
import { defaultValidationGroup, ValidationGroup } from './group';

type ValidationMode = 'blocking' | 'non-blocking';

type DecoratorConfig<T extends Record<string, unknown> = Record<string, unknown>> = {
    params?: T;
    mode?: ValidationMode;
    message?: string;
    groups?: ValidationGroup[];
};

type DecoratorMetadata<T extends Record<string, unknown> = Record<string, unknown>> = {
    constraint: string;
    params: T;
    mode: ValidationMode;
    message?: string;
    groups?: ValidationGroup[];
};

type FieldValidationMetadata = Record<string, DecoratorMetadata[]>;

type PatternDecoratorParams = {
    regex: RegExp | string;
    flags?: string;
    mode?: ValidationMode;
    message?: string;
    groups?: ValidationGroup[];
};

type ConstrainedDecoratorParams = {
    constraint: string;
    params?: Record<string, unknown>;
    mode?: ValidationMode;
    message?: string;
    groups?: ValidationGroup[];
};

type ClassValidationResult = {
    isValid: boolean;
    failedProperties: Set<string>;
};

type ClassValidationOptions = {
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

export const min = createConstraintDecorator<{ value: number }>('Min', (params) => ({
    params: {
        value: params.value,
    },
}));

export const max = createConstraintDecorator<{ value: number }>('Max', (params) => ({
    params: {
        value: params.value,
    },
}));

export const range = createConstraintDecorator<{ min?: number; max?: number }>('Range', (params) => ({
    params,
}));

export const length = createConstraintDecorator<{ min?: number; max?: number; value?: number }>('Length', (params) => ({
    params,
}));

export const past = createConstraintDecorator<{ format?: string }>('Past', (params) => ({
    params,
}));

export const future = createConstraintDecorator<{ format?: string }>('Future', (params) => ({
    params,
}));

export const dateRange = createConstraintDecorator<{ min?: string; max?: string; format?: string }>(
    'DateRange',
    (params) => ({
        params,
    })
);

export const digits = createConstraintDecorator<{ integer: number; fraction: number }>('Digits', (params) => ({
    params,
}));

export const enumeration = createConstraintDecorator<{ value: string | string[] }>('Enum', (params) => ({
    params,
}));

export const email = createConstraintDecorator('Email');
export const notBlank = createConstraintDecorator('NotBlank');
export const url = createConstraintDecorator('URL');
export const integer = createConstraintDecorator('Integer');
export const numeric = createConstraintDecorator('Numeric');

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
