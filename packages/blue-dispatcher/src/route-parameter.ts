/**
 * @author Jeff Rose
 */

import 'reflect-metadata';
import { complement, either, isString, like, mergeRight, objOf, pipe, when } from '@blue/util';
import { Serializable, JSONObject, createNull, Equatable } from '@blue/core';

export type MethodParameterInfo = {
    name: string;
    mapping: string;
    required?: boolean;
    defaultValue?: string;
};

/**
 * @typedef {external:Object} module:dispatcher.MethodParameterInfo
 */

const METHOD_PARAMETER = 'method:parameter',
    { assign, keys } = Object,
    { defineMetadata, defineProperty, getMetadata, hasMetadata } = Reflect,
    defaultMethodParameterInfo = {
        name: null,
        mapping: null,
        required: false,
        defaultValue: null,
    },
    defineMethodParameter = (
        type: MethodParameterType,
        info: MethodParameterInfo,
        parameterIndex: number,
        target: Object,
        propertyKey: string | symbol
    ): void => {
        const parameters = hasMethodParameter(target, propertyKey) ? getMethodParameter(target, propertyKey) : [];
        parameters[parameterIndex] = new MethodParameter(type, info.name, info.required, info.defaultValue);
        console.log('defineMethodParameter::parameters', parameters);
        defineMetadata(METHOD_PARAMETER, parameters, target, propertyKey);
    },
    likeMethodParameterInfo = like({ name: String, mapping: String, required: Boolean, defaultValue: String }) as (
        value
    ) => value is MethodParameterInfo,
    isStringOrLikeMethodParameterInfo = either(isString, likeMethodParameterInfo),
    isNotString = complement(isString),
    namedObj = objOf('name') as <T = any>(value: T) => { name: T },
    // TODO NEED TO ALLOW FOR DIFFERENT DEFAULT INFO
    toMethodParameterInfo = pipe(when(isString, namedObj), mergeRight(defaultMethodParameterInfo));

export class MethodParameterType implements Equatable, Serializable {
    static COOKIE: MethodParameterType;
    static MATRIX: MethodParameterType;
    static QUERY: MethodParameterType;

    static fromType(type: string): MethodParameterType {
        const types = keys(this),
            length = types.length;

        for (let index = 0; index < length; index++) {
            const key = types[index],
                parameterType: MethodParameterType = MethodParameterType[key];
            if (parameterType.type === type) {
                return parameterType;
            }
        }

        return null;
    }

    readonly type: string;

    get [Symbol.toStringTag](): string {
        return `MethodParameterType:${this.type}`;
    }

    constructor(type: string) {
        defineProperty(this, 'type', {
            value: type,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    equals(value: any): boolean {
        return value instanceof MethodParameterType && value.type === this.type;
    }

    toJSON(): string {
        return this.toString();
    }

    toString(): string {
        return this.type;
    }
}

MethodParameterType.COOKIE = new MethodParameterType('cookie:value');
MethodParameterType.MATRIX = new MethodParameterType('matrix:value');
MethodParameterType.QUERY = new MethodParameterType('query:value');

export const getMethodParameter = (target: Object, propertyKey: string | symbol): MethodParameter[] =>
    getMetadata(METHOD_PARAMETER, target, propertyKey);

export const hasMethodParameter = (target: Object, propertyKey: string | symbol): boolean =>
    hasMetadata(METHOD_PARAMETER, target, propertyKey);

export class MethodParameter implements Serializable {
    readonly name: string;
    readonly type: MethodParameterType;
    readonly required: boolean;
    readonly defaultValue: string;

    constructor(type: MethodParameterType, name: string, required: boolean = false, defaultValue: string = null) {
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

    toJSON(): JSONObject {
        const json = createNull();
        json.name = this.name;
        json.type = this.type;
        json.required = this.required;
        json.defaultValue = this.defaultValue;
        return json;
    }

    toString(): string {
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
export const defineCookieValue = (
    info: MethodParameterInfo,
    parameterIndex: number,
    target: Object,
    propertyKey: string | symbol
): void => defineMethodParameter(MethodParameterType.COOKIE, info, parameterIndex, target, propertyKey);

/**
 * @function module:dispatcher.defineMatrixValue
 * @param {module:dispatcher.MethodParameterInfo} info
 * @param {external:number} parameterIndex
 * @param {external:Object} target
 * @param {external:string|external:symbol} propertyKey
 */
export const defineMatrixValue = (
    info: MethodParameterInfo,
    parameterIndex: number,
    target: Object,
    propertyKey: string | symbol
): void => defineMethodParameter(MethodParameterType.MATRIX, info, parameterIndex, target, propertyKey);

/**
 * @function module:dispatcher.defineQueryValue
 * @param {module:dispatcher.MethodParameterInfo} info
 * @param {external:number} parameterIndex
 * @param {external:Object} target
 * @param {external:string|external:symbol} propertyKey
 */
export const defineQueryValue = (
    info: MethodParameterInfo,
    parameterIndex: number,
    target: Object,
    propertyKey: string | symbol
): void => defineMethodParameter(MethodParameterType.QUERY, info, parameterIndex, target, propertyKey);

/**
 * @function module:dispatcher.cookieValue(1)
 * @param {external:string|module:dispatcher.MethodParameterInfo} info
 * @returns {external:ParameterDecorator}
 */

/**
 * @const {external:ParameterDecorator} module:dispatcher.cookieValue(2)
 */
export const cookieValue = (
    infoOrTarget: string | MethodParameterInfo | Object,
    propertyKey?: string | symbol,
    parameterIndex?: number
): any => {
    // Called as Function
    if (isStringOrLikeMethodParameterInfo(infoOrTarget)) {
        const info: MethodParameterInfo = assign({}, defaultMethodParameterInfo, toMethodParameterInfo(infoOrTarget));
        return (target: Object, propertyKey: string | symbol, parameterIndex: number): void => {
            defineCookieValue(info, parameterIndex, target, propertyKey);
            console.log('@cookieValue', info, parameterIndex, target, propertyKey);
        };

        // Called as ParameterDecorator
    } else {
        const info: MethodParameterInfo = assign({}, defaultMethodParameterInfo);
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
export const matrixValue = (
    infoOrTarget: string | MethodParameterInfo | Object,
    propertyKey?: string | symbol,
    parameterIndex?: number
): any => {
    // Called as Function
    if (isStringOrLikeMethodParameterInfo(infoOrTarget)) {
        const info: MethodParameterInfo = assign({}, defaultMethodParameterInfo, toMethodParameterInfo(infoOrTarget));
        return (target: Object, propertyKey: string | symbol, parameterIndex: number): void => {
            defineMatrixValue(info, parameterIndex, target, propertyKey);
            console.log('@matrixValue', info, parameterIndex, target, propertyKey);
        };

        // Called as ParameterDecorator
    } else {
        const info: MethodParameterInfo = assign({}, defaultMethodParameterInfo);
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
export const queryValue = (
    infoOrTarget: string | MethodParameterInfo | Object,
    propertyKey?: string | symbol,
    parameterIndex?: number
): any => {
    // Called as Function
    if (isStringOrLikeMethodParameterInfo(infoOrTarget)) {
        const info: MethodParameterInfo = assign({}, defaultMethodParameterInfo, toMethodParameterInfo(infoOrTarget));
        return (target: Object, propertyKey: string | symbol, parameterIndex: number): void => {
            defineQueryValue(info, parameterIndex, target, propertyKey);
            console.log('@queryValue', info, parameterIndex, target, propertyKey);
        };

        // Called as ParameterDecorator
    } else {
        const info: MethodParameterInfo = assign({}, defaultMethodParameterInfo);
        defineQueryValue(info, parameterIndex, infoOrTarget, propertyKey);
        console.log('@queryValue', info, parameterIndex, infoOrTarget, propertyKey);
    }
};
