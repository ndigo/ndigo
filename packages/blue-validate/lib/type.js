/**
 * @author Jeff Rose
 */
import constraints from './constraints';
import { complement, equals, is, toString } from '@blue/util';
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
 * @class module:validate.Type
 * @param {external:string} name
 * @param {external:Object} definition
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
     * @function module:validate.Type#validator
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
     * @function module:validate.Type#validate
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFjOUQsSUFBSSxJQUFJLENBQUM7QUFFVCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUNyQixFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDNUIsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQ3ZCLFVBQVUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQ3pCLFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQ2hDLGFBQWEsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQ3RDLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQ3JCLFdBQVcsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQ2xDLFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUIsZ0NBQWdDO0FBQ2hDLFNBQVMsR0FBRztJQUNSLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZCxDQUFDLEVBQ0QsT0FBTyxHQUFHO0lBQ04sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1IsZUFBZTtRQUNmLElBQUksR0FBRyxzRUFBc0UsQ0FBQyxPQUFPLENBQUM7UUFDdEYsdUNBQXVDO1FBQ3ZDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQUVOOzs7O0dBSUc7QUFDSCxNQUFNLElBQUk7SUFDRyxJQUFJLENBQVM7SUFDYixXQUFXLENBQVE7SUFFNUIsWUFBWSxJQUFZLEVBQUUsVUFBMEI7UUFDaEQsNkNB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