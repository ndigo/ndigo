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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFjOUQsSUFBSSxJQUFJLENBQUM7QUFFVCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUNyQixFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDNUIsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQ3ZCLFVBQVUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQ3pCLFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQ2hDLGFBQWEsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQ3RDLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQ3JCLFdBQVcsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQ2xDLFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUIsZ0NBQWdDO0FBQ2hDLFNBQVMsR0FBRztJQUNSLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZCxDQUFDLEVBQ0QsT0FBTyxHQUFHO0lBQ04sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1IsZUFBZTtRQUNmLElBQUksR0FBRyxzRUFBc0UsQ0FBQyxPQUFPLENBQUM7UUFDdEYsdUNBQXVDO1FBQ3ZDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQUVOOzs7R0FHRztBQUNILE1BQU0sSUFBSTtJQUNHLElBQUksQ0FBUztJQUNiLFdBQVcsQ0FBUTtJQUU1QixZQUFZLElBQVksRUFBRSxVQUEwQjtRQUNoRCw2Q0FBNkM7UUFDN0MsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7WUFDckMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxxREFBcUQsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNyRixDQUFDO1FBRUQsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDekIsS0FBSyxFQUFFLElBQUk7WUFDWCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7UUFFSCxjQUFjLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNoQyxLQUFLLEVBQUUsVUFBVSxDQUFDLFdBQVc7WUFDN0IsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsMkRBQTJEO1FBQzNELElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsVUFBVTtZQUN6QyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsTUFBTSxJQUFJLFNBQVMsQ0FDZiwyRUFBMkUsSUFBSSxDQUFDLElBQUksR0FBRyxDQUMxRixDQUFDO1lBQ04sQ0FBQztpQkFBTSxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDbkQsTUFBTSxJQUFJLFNBQVMsQ0FDZixlQUFlLFVBQVUsQ0FBQyxJQUFJLGdEQUFnRCxJQUFJLENBQUMsSUFBSSxHQUFHLENBQzdGLENBQUM7WUFDTixDQUFDO2lCQUFNLElBQUksYUFBYSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDOUQsTUFBTSxJQUFJLFNBQVMsQ0FDZixlQUFlLFVBQVUsQ0FBQyxJQUFJLG9FQUFvRSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQ2pILENBQUM7WUFDTixDQUFDO1lBQ0QsMENBQTBDO1lBQzFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDaEQsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTTtRQUNuQixNQUFNLFFBQVEsR0FBRyxPQUFPLEVBQUUsQ0FBQztRQUMzQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFVBQVUsVUFBVTtZQUM5QyxrSEFBa0g7WUFDbEgsNENBQTRDO1lBQzVDLG1IQUFtSDtZQUNuSCxPQUFPLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUNwRixLQUFLLEVBQ0wsTUFBTSxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLENBQ25FLENBQUM7UUFDTixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEdBQUcsRUFBRTtRQUN2QixVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUUzRSx3R0FBd0c7UUFDeEcsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUN0QyxRQUFRLEdBQUcsT0FBTyxFQUFFLENBQUM7UUFFekIsMEtBQTBLO1FBQzFLLE1BQU0saUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFVBQVUsTUFBTTtZQUMvRCxvSEFBb0g7WUFDcEgsNENBQTRDO1lBQzVDLG1IQUFtSDtZQUNuSCxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQzdFLEtBQUssRUFDTCxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FDM0QsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTztZQUNILEtBQUssRUFBRSxLQUFLO1lBQ1osT0FBTyxFQUFFLENBQUMsaUJBQWlCLENBQUMsTUFBTTtZQUNsQyxjQUFjLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDekIsZ0JBQWdCLEVBQUUsTUFBTTtZQUN4QixpQkFBaUIsRUFBRSxpQkFBaUI7U0FDdkMsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQUVELGVBQWUsSUFBSSxDQUFDIn0=