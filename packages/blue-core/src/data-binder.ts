/**
 * @author Jeff Rose
 */

import { FrameworkError, IllegalStateError } from './error';
import { MutablePropertyValues, PropertyValues } from './property-value';
import { keypathExpression } from '@blue/parser';
import { assocPath } from '@blue/util/object';

const { keys } = Object;

/**
 * Represents an error that occurs during data binding operations.
 * @extends FrameworkError
 */
export class BindError extends FrameworkError {}

/**
 * Binds data from property values to a target object, supporting keypath expressions.
 */
export class DataBinder {
    #name: string;
    #target;
    #result;

    #requiredFields: Set<string>;

    /**
     * Gets the list of required fields for data binding.
     * @returns An array of required field names.
     */
    get requiredFields(): string[] {
        if (!this.#requiredFields) {
            this.#requiredFields = new Set<string>();
        }
        return [...this.#requiredFields];
    }

    /**
     * Sets the list of required fields for data binding.
     * @param fields - An array of field names that must be present.
     */
    set requiredFields(fields: string[]) {
        this.#requiredFields = new Set<string>();
        if (fields) {
            const length = fields.length;
            if (length) {
                for (let index = 0; index < length; index++) {
                    this.#requiredFields.add(fields[index]);
                }
            }
        }
    }

    /**
     * The name of the data binder.
     */
    get name() {
        return this.#name;
    }

    /**
     * The result of the data binding operation.
     */
    get result() {
        return this.#result;
    }

    /**
     * The target object to which data is being bound.
     */
    get target() {
        return this.#target;
    }

    /**
     * Creates an instance of DataBinder.
     * @param target - The object to bind data to.
     * @param name - The name of the data binder (defaults to 'target').
     */
    constructor(target, name = 'target') {
        this.#target = target;
        this.#name = name;
    }

    /**
     * Binds the provided property values to the target object.
     * @param properties - The property values to bind.
     * @throws {FrameworkError} If a required field is missing.
     */
    bind(properties: PropertyValues) {
        const mpv = properties instanceof MutablePropertyValues ? properties : new MutablePropertyValues(properties);
        this._checkRequiredFields(mpv);
        this._applyPropertyValues(mpv);
    }

    /**
     * Validates the current state of the data binder.
     * @throws {IllegalStateError} If no target object is set.
     */
    validate() {
        if (!this.target) {
            throw new IllegalStateError('No target to validate');
        }
    }

    /**
     * Applies the given property values to the target object.
     * @protected
     * @param properties - The mutable property values to apply.
     */
    protected _applyPropertyValues(properties: MutablePropertyValues): void {
        const length = properties.length;
        if (length) {
            let result = this.#result || this.#target;
            const propertyKeys = keys(properties);
            for (let index = 0; index < length; index++) {
                const key = propertyKeys[index],
                    property = properties[key],
                    parseResult = keypathExpression.run(property.name);
                if (!parseResult.isError) {
                    // Type narrowing: parseResult is Ok<T, D> here
                    const keypath = (parseResult as { isError: false; result: any; index: number; data: any }).result;
                    if (keypath) {
                        result = assocPath(keypath, property.value, result);
                    }
                }
            }
            this.#result = result;
        }
    }

    /**
     * Checks if all required fields are present in the provided property values.
     * @protected
     * @param properties - The mutable property values to check.
     * @throws {FrameworkError} If a required field is missing.
     */
    protected _checkRequiredFields(properties: MutablePropertyValues): void {
        if (this.#requiredFields?.size) {
            const propertyKeys = keys(properties);
            for (const field of this.#requiredFields) {
                if (propertyKeys.indexOf(field) === -1) {
                    throw new FrameworkError(`Required field "${field}" is missing`);
                }
            }
        }
    }
}
