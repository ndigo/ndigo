/**
 * @author Jeff Rose
 */

import { FrameworkError, IllegalStateError } from './error.js';
import { MutablePropertyValues, PropertyValues } from './property-value.js';
import { parseKeypath } from './keypath-expression.js';
import { KeypathToken } from './keypath-expression.js';

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
    #target: any;
    #result: any;
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
    constructor(target: any, name = 'target') {
        this.#target = target;
        this.#name = name;
        this.#requiredFields = new Set<string>();
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
                    property = properties[key as any];
                if (property) {
                    const keypath = parseKeypath(property.name);
                    if (keypath) {
                        result = _assocPath(keypath, property.value, result);
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

/**
 * Creates a new object with the value set at the specified keypath.
 * @param path - The keypath to set the value at
 * @param value - The value to set
 * @param obj - The object to modify
 * @returns A new object with the value set at the keypath
 */
function _assocPath(path: KeypathToken[], value: unknown, obj: unknown): unknown {
    if (path.length === 0) return value;
    const head = path[0];
    const tail = path.slice(1);
    const updatedChild = _assocPath(
        tail,
        value,
        tail.length > 0 && typeof tail[0] === 'number'
            ? (Array.isArray((obj as any)?.[head]) ? (obj as any)[head] : [])
            : ((obj as any)?.[head] ?? {})
    );
    if (typeof head === 'number') {
        const arr = Array.isArray(obj) ? [...(obj as any[])] : [];
        arr[head] = updatedChild;
        return arr;
    }
    return { ...(obj as object), [head]: updatedChild };
}
