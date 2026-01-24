/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
import { complement, either, isString, like, mergeRight, objOf, pipe, when } from '@blue/util';
import { createNull } from '@blue/core';
/**
 * @typedef {external:Object} module:dispatcher.MethodParameterInfo
 */
const METHOD_PARAMETER = 'method:parameter', { assign, keys } = Object, { defineMetadata, defineProperty, getMetadata, hasMetadata } = Reflect, defaultMethodParameterInfo = {
    name: null,
    mapping: null,
    required: false,
    defaultValue: null,
}, defineMethodParameter = (type, info, parameterIndex, target, propertyKey) => {
    const parameters = hasMethodParameter(target, propertyKey) ? getMethodParameter(target, propertyKey) : [];
    parameters[parameterIndex] = new MethodParameter(type, info.name, info.required, info.defaultValue);
    console.log('defineMethodParameter::parameters', parameters);
    defineMetadata(METHOD_PARAMETER, parameters, target, propertyKey);
}, likeMethodParameterInfo = like({ name: String, mapping: String, required: Boolean, defaultValue: String }), isStringOrLikeMethodParameterInfo = either(isString, likeMethodParameterInfo), isNotString = complement(isString), namedObj = objOf('name'), 
// TODO NEED TO ALLOW FOR DIFFERENT DEFAULT INFO
toMethodParameterInfo = pipe(when(isString, namedObj), mergeRight(defaultMethodParameterInfo));
export class MethodParameterType {
    static COOKIE;
    static MATRIX;
    static QUERY;
    static fromType(type) {
        const types = keys(this), length = types.length;
        for (let index = 0; index < length; index++) {
            const key = types[index], parameterType = MethodParameterType[key];
            if (parameterType.type === type) {
                return parameterType;
            }
        }
        return null;
    }
    type;
    get [Symbol.toStringTag]() {
        return `MethodParameterType:${this.type}`;
    }
    constructor(type) {
        defineProperty(this, 'type', {
            value: type,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    equals(value) {
        return value instanceof MethodParameterType && value.type === this.type;
    }
    toJSON() {
        return this.toString();
    }
    toString() {
        return this.type;
    }
}
MethodParameterType.COOKIE = new MethodParameterType('cookie:value');
MethodParameterType.MATRIX = new MethodParameterType('matrix:value');
MethodParameterType.QUERY = new MethodParameterType('query:value');
export const getMethodParameter = (target, propertyKey) => getMetadata(METHOD_PARAMETER, target, propertyKey);
export const hasMethodParameter = (target, propertyKey) => hasMetadata(METHOD_PARAMETER, target, propertyKey);
export class MethodParameter {
    name;
    type;
    required;
    defaultValue;
    constructor(type, name, required = false, defaultValue = null) {
        if (isNotString(name)) {
            throw new TypeError(`"name" must be a string but was ${name}`);
        }
        defineProperty(this, 'type', {
            value: type,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'required', {
            value: required,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'defaultValue', {
            value: defaultValue,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    toJSON() {
        const json = createNull();
        json.name = this.name;
        json.type = this.type;
        json.required = this.required;
        json.defaultValue = this.defaultValue;
        return json;
    }
    toString() {
        return this.name;
    }
}
/**
 * @function module:dispatcher.defineCookieValue
 * @param {module:dispatcher.MethodParameterInfo} info
 * @param {external:number} parameterIndex
 * @param {external:Object} target
 * @param {external:string|external:symbol} propertyKey
 */
export const defineCookieValue = (info, parameterIndex, target, propertyKey) => defineMethodParameter(MethodParameterType.COOKIE, info, parameterIndex, target, propertyKey);
/**
 * @function module:dispatcher.defineMatrixValue
 * @param {module:dispatcher.MethodParameterInfo} info
 * @param {external:number} parameterIndex
 * @param {external:Object} target
 * @param {external:string|external:symbol} propertyKey
 */
export const defineMatrixValue = (info, parameterIndex, target, propertyKey) => defineMethodParameter(MethodParameterType.MATRIX, info, parameterIndex, target, propertyKey);
/**
 * @function module:dispatcher.defineQueryValue
 * @param {module:dispatcher.MethodParameterInfo} info
 * @param {external:number} parameterIndex
 * @param {external:Object} target
 * @param {external:string|external:symbol} propertyKey
 */
export const defineQueryValue = (info, parameterIndex, target, propertyKey) => defineMethodParameter(MethodParameterType.QUERY, info, parameterIndex, target, propertyKey);
/**
 * @function module:dispatcher.cookieValue(1)
 * @param {external:string|module:dispatcher.MethodParameterInfo} info
 * @returns {external:ParameterDecorator}
 */
/**
 * @const {external:ParameterDecorator} module:dispatcher.cookieValue(2)
 */
export const cookieValue = (infoOrTarget, propertyKey, parameterIndex) => {
    // Called as Function
    if (isStringOrLikeMethodParameterInfo(infoOrTarget)) {
        const info = assign({}, defaultMethodParameterInfo, toMethodParameterInfo(infoOrTarget));
        return (target, propertyKey, parameterIndex) => {
            defineCookieValue(info, parameterIndex, target, propertyKey);
            console.log('@cookieValue', info, parameterIndex, target, propertyKey);
        };
        // Called as ParameterDecorator
    }
    else {
        const info = assign({}, defaultMethodParameterInfo);
        defineCookieValue(info, parameterIndex, infoOrTarget, propertyKey);
        console.log('@cookieValue', info, parameterIndex, infoOrTarget, propertyKey);
    }
};
/**
 * @function module:dispatcher.matrixValue(1)
 * @param {external:string|module:dispatcher.matrixValueInfo} info
 * @returns {external:ParameterDecorator}
 */
/**
 * @const {external:ParameterDecorator} module:dispatcher.matrixValue(2)
 */
export const matrixValue = (infoOrTarget, propertyKey, parameterIndex) => {
    // Called as Function
    if (isStringOrLikeMethodParameterInfo(infoOrTarget)) {
        const info = assign({}, defaultMethodParameterInfo, toMethodParameterInfo(infoOrTarget));
        return (target, propertyKey, parameterIndex) => {
            defineMatrixValue(info, parameterIndex, target, propertyKey);
            console.log('@matrixValue', info, parameterIndex, target, propertyKey);
        };
        // Called as ParameterDecorator
    }
    else {
        const info = assign({}, defaultMethodParameterInfo);
        defineMatrixValue(info, parameterIndex, infoOrTarget, propertyKey);
        console.log('@matrixValue', info, parameterIndex, infoOrTarget, propertyKey);
    }
};
/**
 * @function module:dispatcher.queryValue(1)
 * @param {external:string|module:dispatcher.MethodParameterInfo} info
 * @returns {external:ParameterDecorator}
 */
/**
 * @const {external:ParameterDecorator} module:dispatcher.queryValue(2)
 */
export const queryValue = (infoOrTarget, propertyKey, parameterIndex) => {
    // Called as Function
    if (isStringOrLikeMethodParameterInfo(infoOrTarget)) {
        const info = assign({}, defaultMethodParameterInfo, toMethodParameterInfo(infoOrTarget));
        return (target, propertyKey, parameterIndex) => {
            defineQueryValue(info, parameterIndex, target, propertyKey);
            console.log('@queryValue', info, parameterIndex, target, propertyKey);
        };
        // Called as ParameterDecorator
    }
    else {
        const info = assign({}, defaultMethodParameterInfo);
        defineQueryValue(info, parameterIndex, infoOrTarget, propertyKey);
        console.log('@queryValue', info, parameterIndex, infoOrTarget, propertyKey);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtcGFyYW1ldGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlLXBhcmFtZXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sa0JBQWtCLENBQUM7QUFDMUIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDL0YsT0FBTyxFQUE0QixVQUFVLEVBQWEsTUFBTSxZQUFZLENBQUM7QUFTN0U7O0dBRUc7QUFFSCxNQUFNLGdCQUFnQixHQUFHLGtCQUFrQixFQUN2QyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQ3pCLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBTyxFQUN0RSwwQkFBMEIsR0FBRztJQUN6QixJQUFJLEVBQUUsSUFBSTtJQUNWLE9BQU8sRUFBRSxJQUFJO0lBQ2IsUUFBUSxFQUFFLEtBQUs7SUFDZixZQUFZLEVBQUUsSUFBSTtDQUNyQixFQUNELHFCQUFxQixHQUFHLENBQ3BCLElBQXlCLEVBQ3pCLElBQXlCLEVBQ3pCLGNBQXNCLEVBQ3RCLE1BQWMsRUFDZCxXQUE0QixFQUN4QixFQUFFO0lBQ04sTUFBTSxVQUFVLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUMxRyxVQUFVLENBQUMsY0FBYyxDQUFDLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDcEcsT0FBTyxDQUFD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