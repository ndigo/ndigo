/**
 * @author Jeff Rose
 */
import { FrameworkError } from './error.js';
import { MutablePropertyValues, PropertyValues } from './property-value.js';
/**
 * Represents an error that occurs during data binding operations.
 * @extends FrameworkError
 */
export declare class BindError extends FrameworkError {
}
/**
 * Binds data from property values to a target object, supporting keypath expressions.
 */
export declare class DataBinder {
    #private;
    /**
     * Gets the list of required fields for data binding.
     * @returns An array of required field names.
     */
    get requiredFields(): string[];
    /**
     * Sets the list of required fields for data binding.
     * @param fields - An array of field names that must be present.
     */
    set requiredFields(fields: string[]);
    /**
     * The name of the data binder.
     */
    get name(): string;
    /**
     * The result of the data binding operation.
     */
    get result(): any;
    /**
     * The target object to which data is being bound.
     */
    get target(): any;
    /**
     * Creates an instance of DataBinder.
     * @param target - The object to bind data to.
     * @param name - The name of the data binder (defaults to 'target').
     */
    constructor(target: any, name?: string);
    /**
     * Binds the provided property values to the target object.
     * @param properties - The property values to bind.
     * @throws {FrameworkError} If a required field is missing.
     */
    bind(properties: PropertyValues): void;
    /**
     * Validates the current state of the data binder.
     * @throws {IllegalStateError} If no target object is set.
     */
    validate(): void;
    /**
     * Applies the given property values to the target object.
     * @protected
     * @param properties - The mutable property values to apply.
     */
    protected _applyPropertyValues(properties: MutablePropertyValues): void;
    /**
     * Checks if all required fields are present in the provided property values.
     * @protected
     * @param properties - The mutable property values to check.
     * @throws {FrameworkError} If a required field is missing.
     */
    protected _checkRequiredFields(properties: MutablePropertyValues): void;
}
