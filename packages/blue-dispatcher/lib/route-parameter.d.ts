/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
import { Serializable, JSONObject, Equatable } from '@blue/core';
export type MethodParameterInfo = {
    name: string;
    mapping: string;
    required?: boolean;
    defaultValue?: string;
};
export declare class MethodParameterType implements Equatable, Serializable {
    static COOKIE: MethodParameterType;
    static MATRIX: MethodParameterType;
    static QUERY: MethodParameterType;
    static fromType(type: string): MethodParameterType;
    readonly type: string;
    get [Symbol.toStringTag](): string;
    constructor(type: string);
    equals(value: any): boolean;
    toJSON(): string;
    toString(): string;
}
export declare const getMethodParameter: (target: Object, propertyKey: string | symbol) => MethodParameter[];
export declare const hasMethodParameter: (target: Object, propertyKey: string | symbol) => boolean;
export declare class MethodParameter implements Serializable {
    readonly name: string;
    readonly type: MethodParameterType;
    readonly required: boolean;
    readonly defaultValue: string;
    constructor(type: MethodParameterType, name: string, required?: boolean, defaultValue?: string);
    toJSON(): JSONObject;
    toString(): string;
}
/**
 * @param {module:dispatcher.MethodParameterInfo} info
 * @param {number} parameterIndex
 * @param {Object} target
 * @param {string|external:symbol} propertyKey
 */
export declare const defineCookieValue: (info: MethodParameterInfo, parameterIndex: number, target: Object, propertyKey: string | symbol) => void;
/**
 * @param {module:dispatcher.MethodParameterInfo} info
 * @param {number} parameterIndex
 * @param {Object} target
 * @param {string|external:symbol} propertyKey
 */
export declare const defineMatrixValue: (info: MethodParameterInfo, parameterIndex: number, target: Object, propertyKey: string | symbol) => void;
/**
 * @param {module:dispatcher.MethodParameterInfo} info
 * @param {number} parameterIndex
 * @param {Object} target
 * @param {string|external:symbol} propertyKey
 */
export declare const defineQueryValue: (info: MethodParameterInfo, parameterIndex: number, target: Object, propertyKey: string | symbol) => void;
/**
 * @param {string|module:dispatcher.MethodParameterInfo} info
 * @returns {ParameterDecorator}
 */
/**
 */
export declare const cookieValue: (infoOrTarget: string | MethodParameterInfo | Object, propertyKey?: string | symbol, parameterIndex?: number) => any;
/**
 * @param {string|module:dispatcher.matrixValueInfo} info
 * @returns {ParameterDecorator}
 */
/**
 */
export declare const matrixValue: (infoOrTarget: string | MethodParameterInfo | Object, propertyKey?: string | symbol, parameterIndex?: number) => any;
/**
 * @param {string|module:dispatcher.MethodParameterInfo} info
 * @returns {ParameterDecorator}
 */
/**
 */
export declare const queryValue: (infoOrTarget: string | MethodParameterInfo | Object, propertyKey?: string | symbol, parameterIndex?: number) => any;
//# sourceMappingURL=route-parameter.d.ts.map