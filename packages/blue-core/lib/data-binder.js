/**
 * @author Jeff Rose
 */
import { FrameworkError } from './error';
import { MutablePropertyValues } from './property-value';
import { keypathExpression } from '@blue/parser';
import { assocPath } from '@blue/util/object';
const { keys } = Object;
export class BindError extends FrameworkError {
}
export class DataBinder {
    #name;
    #target;
    #result;
    #requiredFields;
    get requiredFields() {
        if (!this.#requiredFields) {
            this.#requiredFields = new Set();
        }
        return [...this.#requiredFields];
    }
    set requiredFields(fields) {
        this.#requiredFields = new Set();
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
    bind(properties) {
        const mpv = properties instanceof MutablePropertyValues ? properties : new MutablePropertyValues(properties);
        this._checkRequiredFields(mpv);
        this._applyPropertyValues(mpv);
    }
    validate() {
        if (!this.target) {
            throw new Error('No target to validate');
        }
    }
    _applyPropertyValues(properties) {
        const length = properties.length;
        if (length) {
            let result = this.#result || this.#target;
            const propertyKeys = keys(properties);
            for (let index = 0; index < length; index++) {
                const key = propertyKeys[index], property = properties[key], parseResult = keypathExpression.run(property.name);
                if (!parseResult.isError) {
                    // Type narrowing: parseResult is Ok<T, D> here
                    const keypath = parseResult.result;
                    if (keypath) {
                        result = assocPath(keypath, property.value, result);
                    }
                }
            }
            this.#result = result;
        }
    }
    _checkRequiredFields(properties) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1iaW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGF0YS1iaW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxxQkFBcUIsRUFBa0IsTUFBTSxrQkFBa0IsQ0FBQztBQUN6RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDakQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTlDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFFeEIsTUFBTSxPQUFPLFNBQVUsU0FBUSxjQUFjO0NBQUc7QUFFaEQsTUFBTSxPQUFPLFVBQVU7SUFDbkIsS0FBSyxDQUFTO0lBQ2QsT0FBTyxDQUFDO0lBQ1IsT0FBTyxDQUFDO0lBRVIsZUFBZSxDQUFjO0lBRTdCLElBQUksY0FBYztRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQzdDLENBQUM7UUFDRCxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELElBQUksY0FBYyxDQUFDLE1BQWdCO1FBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUN6QyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1QsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUM3QixJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNULEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztvQkFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMs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