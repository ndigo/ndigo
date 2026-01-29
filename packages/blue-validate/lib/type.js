/**
 * @author Jeff Rose
 */
import constraints from './constraints';
import { complement } from '@blue/util/logic';
import { equals } from '@blue/util/relation';
import { toString } from '@blue/util/string';
import { is } from '@blue/util/types';
let lang;
const { assign } = Object, { defineProperty } = Reflect, isArray = Array.isArray, isFunction = is(Function), isNotArray = complement(isArray), isNotFunction = complement(isFunction), isString = is(String), isNotString = complement(isString), isUndefined = equals(void 0), 
// language setting optimization
clearLang = function () {
    lang = '';
}, getLang = function () {
    if (!lang) {
        // set language
        lang = /*settings.get( 'language' ) || settings.get( 'contentLanguage' ) ||*/ 'en-us';
        // clear lang once this thread finishes
        setTimeout(clearLang, 0);
    }
    return lang;
};
/**
 * @param {string} name
 * @param {Object} definition
 */
class Type {
    name;
    constraints;
    constructor(name, definition) {
        // Ensure the list of constraints is provided
        if (isNotArray(definition.constraints)) {
            throw new TypeError(`Property "constraints" must be provided for type: ${name}`);
        }
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'constraints', {
            value: definition.constraints,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        // Is this a standard type definition which has constraints
        this.constraints.forEach(function (constraint) {
            if (isUndefined(constraint.type)) {
                throw new TypeError(`Property "type" is undefined for constraints within definition of type "${this.name}"`);
            }
            else if (isUndefined(constraints[constraint.type])) {
                throw new TypeError(`Constraint "${constraint.type}" does not exist, and is being used by type "${this.name}"`);
            }
            else if (isNotFunction(constraints[constraint.type].validate)) {
                throw new TypeError(`Constraint "${constraint.type}" does not have a method "validator", and is being used by type "${this.name}"`);
            }
            // Make sure we always have params defined
            constraint.params = constraint.params || {};
        }, this);
    }
    /**
     * @param value
     * @param params
     */
    validator(value, params) {
        const language = getLang();
        return this.constraints.every(function (constraint) {
            // @note param extension is basic (can not extend two different constraints of the same type, use case is to edgy)
            // @note params extension affect performance
            // @note params will expect to have params specific to the constraint, otherwise it will use the first level params
            return (constraints[constraint.type][language] || constraints[constraint.type]).validate(value, assign({}, constraint.params, params[constraint.type] || params));
        }, this);
    }
    /**
     * @param value
     * @param params
     */
    validate(value, params = {}) {
        isNotArray(value) && isNotString(value) && (value = toString(value) || '');
        // Default to the current type as the constraint in case no constraints were defined but a validator was
        const constraintsConfig = this.constraints, language = getLang();
        // Not running directly through the validator, because it only returns a boolean and we want a more comprehensive object (the list of failed constraints) while validating
        const failedConstraints = constraintsConfig.filter(function (config) {
            // @note params extension is basic (can not extend two different constraints of the same type, use case is to edgy).
            // @note params extension affect performance
            // @note params will expect to have params specific to the constraint, otherwise it will use the first level params
            return !(constraints[config.type][language] || constraints[config.type]).validate(value, assign({}, config.params, params[config.type] || params));
        });
        return {
            value: value,
            isValid: !failedConstraints.length,
            validationName: this.name,
            validationParams: params,
            failedConstraints: failedConstraints,
        };
    }
}
export default Type;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQWN0QyxJQUFJLElBQUksQ0FBQztBQUVULE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQ3JCLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM1QixPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFDdkIsVUFBVSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDekIsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFDaEMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFDdEMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFDckIsV0FBVyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFDbEMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QixnQ0FBZ0M7QUFDaEMsU0FBUyxHQUFHO0lBQ1IsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNkLENBQUMsRUFDRCxPQUFPLEdBQUc7SUFDTixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDUixlQUFlO1FBQ2YsSUFBSSxHQUFHLHNFQUFzRSxDQUFDLE9BQU8sQ0FBQztRQUN0Rix1Q0FBdUM7UUFDdkMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FB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