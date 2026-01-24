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
 * @function module:dispatcher.defineCookieValue
 * @param {module:dispatcher.MethodParameterInfo} info
 * @param {external:number} parameterIndex
 * @param {external:Object} target
 * @param {external:string|external:symbol} propertyKey
 */
export declare const defineCookieValue: (info: MethodParameterInfo, parameterIndex: number, target: Object, propertyKey: string | symbol) => void;
/**
 * @function module:dispatcher.defineMatrixValue
 * @param {module:dispatcher.MethodParameterInfo} info
 * @param {external:number} parameterIndex
 * @param {external:Object} target
 * @param {external:string|external:symbol} propertyKey
 */
export declare const defineMatrixValue: (info: MethodParameterInfo, parameterIndex: number, target: Object, propertyKey: string | symbol) => void;
/**
 * @function module:dispatcher.defineQueryValue
 * @param {module:dispatcher.MethodParameterInfo} info
 * @param {external:number} parameterIndex
 * @param {external:Object} target
 * @param {external:string|external:symbol} propertyKey
 */
export declare const defineQueryValue: (info: MethodParameterInfo, parameterIndex: number, target: Object, propertyKey: string | symbol) => void;
/**
 * @function module:dispatcher.cookieValue(1)
 * @param {external:string|module:dispatcher.MethodParameterInfo} info
 * @returns {external:ParameterDecorator}
 */
/**
 * @const {external:ParameterDecorator} module:dispatcher.cookieValue(2)
 */
export declare const cookieValue: (infoOrTarget: string | MethodParameterInfo | Object, propertyKey?: string | symbol, parameterIndex?: number) => any;
/**
 * @function module:dispatcher.matrixValue(1)
 * @param {external:string|module:dispatcher.matrixValueInfo} info
 * @returns {external:ParameterDecorator}
 */
/**
 * @const {external:ParameterDecorator} module:dispatcher.matrixValue(2)
 */
export declare const matrixValue: (infoOrTarget: string | MethodParameterInfo | Object, propertyKey?: string | symbol, parameterIndex?: number) => any;
/**
 * @function module:dispatcher.queryValue(1)
 * @param {external:string|module:dispatcher.MethodParameterInfo} info
 * @returns {external:ParameterDecorator}
 */
/**
 * @const {external:ParameterDecorator} module:dispatcher.queryValue(2)
 */
export declare const queryValue: (infoOrTarget: string | MethodParameterInfo | Object, propertyKey?: string | symbol, parameterIndex?: number) => any;
//# sourceMappingURL=route-parameter.d.ts.map