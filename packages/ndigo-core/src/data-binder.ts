/**
 * Data binding from property values to target objects via keypaths.
 */
import { FrameworkError, IllegalStateError } from './error.js';
import { MutablePropertyValues, PropertyValues } from './property-value.js';
import { KeypathConverter } from './keypath-converter.js';
import { setPath } from './keypath.js';

const keypathConverter = new KeypathConverter();
const { keys } = Object;

/**
 * Represents an error that occurs during data binding operations.
 */
export class BindError extends FrameworkError {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "BindError".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object BindError]"
     */
    get [Symbol.toStringTag](): string {
        return 'BindError';
    }
}

/**
 * Binds data from property values to a target object, supporting keypath expressions.
 *
 * @example
 * ```ts
 * const target = { user: { name: '' } };
 * const binder = new DataBinder(target);
 * const values = new MutablePropertyValues();
 * values.addPropertyValue('user.name', 'Ada');
 * binder.bind(values);
 * target.user.name; // 'Ada'
 * ```
 */
export class DataBinder {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "DataBinder".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object DataBinder]"
     */
    get [Symbol.toStringTag](): string {
        return 'DataBinder';
    }

    #name: string;
    #target: unknown;
    #result: unknown;
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
    constructor(target: unknown, name = 'target') {
        this.#target = target;
        this.#name = name;
        this.#requiredFields = new Set<string>();
    }

    /**
     * Binds the provided property values to the target object.
     * @param properties - The property values to bind.
     * @throws If a required field is missing.
     */
    bind(properties: PropertyValues) {
        const mpv = properties instanceof MutablePropertyValues ? properties : new MutablePropertyValues(properties);
        this._checkRequiredFields(mpv);
        this._applyPropertyValues(mpv);
    }

    /**
     * Validates the current state of the data binder.
     * @throws If no target object is set.
     */
    validate() {
        if (!this.target) {
            throw new IllegalStateError('No target to validate');
        }
    }

    /**
     * Applies the given property values to the target object.
     * @param properties - The mutable property values to apply.
     */
    protected _applyPropertyValues(properties: MutablePropertyValues): void {
        const length = properties.length;
        if (length) {
            let result = this.#result || this.#target;
            const propertyKeys = keys(properties);
            for (let index = 0; index < length; index++) {
                const key = propertyKeys[index],
                    property = properties[Number(key)];
                if (property) {
                    const keypath = keypathConverter.convert(property.name);
                    if (keypath) {
                        result = setPath(keypath, property.value, result);
                    }
                }
            }
            this.#result = result;
        }
    }

    /**
     * Checks if all required fields are present in the provided property values.
     * @param properties - The mutable property values to check.
     * @throws If a required field is missing.
     */
    protected _checkRequiredFields(properties: MutablePropertyValues): void {
        if (this.#requiredFields?.size) {
            for (const field of this.#requiredFields) {
                // Compare against the property *names*, not the buffer's numeric
                // slot indices — `keys()` on an ArrayLike returns "0", "1", …,
                // so a name lookup could never succeed (KRN-REV-BINDER-05).
                if (properties.getPropertyValue(field) === null) {
                    throw new FrameworkError(`Required field "${field}" is missing`);
                }
            }
        }
    }
}
