/**
 * @author Jeff Rose
 */

import { FrameworkError } from './error';
import { MutablePropertyValues, PropertyValues } from './property-value';
import { keypathExpression } from '@blue/parser';
import { assocPath } from '@blue/util';

const { keys } = Object;

export class BindError extends FrameworkError {}

export class DataBinder {
    #name: string;
    #target;
    #result;

    #requiredFields: Set<string>;

    get requiredFields(): string[] {
        if (!this.#requiredFields) {
            this.#requiredFields = new Set<string>();
        }
        return [...this.#requiredFields];
    }

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

    get name() {
        return this.#name;
    }

    get result() {
        return this.#result;
    }

    get target() {
        return this.#target;
    }

    constructor(target, name = 'target') {
        this.#target = target;
        this.#name = name;
    }

    bind(properties: PropertyValues) {
        const mpv = properties instanceof MutablePropertyValues ? properties : new MutablePropertyValues(properties);
        this._checkRequiredFields(mpv);
        this._applyPropertyValues(mpv);
    }

    validate() {
        if (!this.target) {
            throw new Error('No target to validate');
        }
    }

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
