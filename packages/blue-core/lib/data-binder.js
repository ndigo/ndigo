/**
 * @author Jeff Rose
 */
import { FrameworkError } from './error';
import { MutablePropertyValues } from './property-value';
import { keypathExpression } from '@blue/parser';
import { assocPath } from '@blue/util';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1iaW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGF0YS1iaW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxxQkFBcUIsRUFBa0IsTUFBTSxrQkFBa0IsQ0FBQztBQUN6RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDakQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUV2QyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDO0FBRXhCLE1BQU0sT0FBTyxTQUFVLFNBQVEsY0FBYztDQUFHO0FBRWhELE1BQU0sT0FBTyxVQUFVO0lBQ25CLEtBQUssQ0FBUztJQUNkLE9BQU8sQ0FBQztJQUNSLE9BQU8sQ0FBQztJQUVSLGVBQWUsQ0FBYztJQUU3QixJQUFJLGNBQWM7UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUM3QyxDQUFDO1FBQ0QsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxJQUFJLGNBQWMsQ0FBQyxNQUFnQjtRQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDekMsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNULE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDN0IsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7b0JBQzFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE1B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