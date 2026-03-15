/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { complement } from '@blue/util/logic';
import { isString } from '@blue/util/types';
import { Serializable, JSONObject, createNull, Equatable } from '@blue/core';
import { getFunctionParamNames } from './_decorator-util';

const { keys } = Object;
const { defineProperty } = Reflect;

/**
 * Factory function return type - describes a parameter extraction
 */
export type ParameterExtractor = {
    type: MethodParameterType;
    name: string;
    required: boolean;
    defaultValue: string | null;
};

/**
 * Parameter map for @routeParams decorator
 */
export type RouteParameterMap = Record<string, ParameterExtractor>;

/**
 * Helper to get metadata from class constructor
 */
function getMetadata(target: any): Record<string, any> {
    if (typeof target === 'function' && target[Symbol.metadata]) {
        return target[Symbol.metadata];
    }
    if (target && target.constructor && target.constructor[Symbol.metadata]) {
        return target.constructor[Symbol.metadata];
    }
    return {};
}

/**
 * Method parameter type enum
 */
export class MethodParameterType implements Equatable, Serializable {
    static COOKIE: MethodParameterType;
    static MATRIX: MethodParameterType;
    static PATH: MethodParameterType;
    static QUERY: MethodParameterType;
    static SESSION: MethodParameterType;

    static fromType(type: string): MethodParameterType | null {
        const types = keys(this);
        const length = types.length;

        for (let index = 0; index < length; index++) {
            const key = types[index];
            const parameterType: MethodParameterType = MethodParameterType[key];
            if (parameterType && parameterType.type === type) {
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
MethodParameterType.PATH = new MethodParameterType('path:value');
MethodParameterType.QUERY = new MethodParameterType('query:value');
MethodParameterType.SESSION = new MethodParameterType('session:value');

/**
 * Method parameter metadata
 */
export class MethodParameter implements Serializable {
    readonly name: string;
    readonly type: MethodParameterType;
    readonly required: boolean;
    readonly defaultValue: string | null;

    constructor(
        type: MethodParameterType,
        name: string,
        required: boolean = false,
        defaultValue: string | null = null
    ) {
        const isNotString = complement(isString);
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
 * Factory function: Create a query parameter extractor
 *
 * @example
 * @routeParams({
 *   page: queryValue('page'),
 *   limit: queryValue('limit', { required: true, defaultValue: '10' })
 * })
 */
export function queryValue(
    name: string,
    options: { required?: boolean; defaultValue?: string } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.QUERY,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
    };
}

/**
 * Factory function: Create a path parameter extractor
 *
 * @example
 * @routeParams({
 *   userId: pathValue('userId')
 * })
 */
export function pathValue(
    name: string,
    options: { required?: boolean; defaultValue?: string } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.PATH,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
    };
}

/**
 * Factory function: Create a matrix parameter extractor
 *
 * @example
 * @routeParams({
 *   color: matrixValue('color'),
 *   size: matrixValue('size', { required: true })
 * })
 */
export function matrixValue(
    name: string,
    options: { required?: boolean; defaultValue?: string } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.MATRIX,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
    };
}

/**
 * Factory function: Create a cookie parameter extractor
 *
 * @example
 * @routeParams({
 *   session: cookieValue('SESSIONID'),
 *   token: cookieValue('AUTH_TOKEN', { required: true })
 * })
 */
export function cookieValue(
    name: string,
    options: { required?: boolean; defaultValue?: string } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.COOKIE,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
    };
}

/**
 * Factory function: Create a session parameter extractor
 *
 * @example
 * @routeParams({
 *   userId: sessionValue('userId'),
 *   token: sessionValue('AUTH_TOKEN', { required: true })
 * })
 */
export function sessionValue(
    name: string,
    options: { required?: boolean; defaultValue?: string } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.SESSION,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
    };
}

/**
 * @routeParams decorator - Maps parameter names to extractors
 *
 * Replaces legacy parameter decorators with a method-level decorator.
 * Uses function parameter name extraction to map extractors to positions.
 *
 * @example
 * // Old (legacy - not supported in TC39):
 * handleRequest(@queryValue('page') page: string) {}
 *
 * // New (TC39):
 * @routeParams({
 *   page: queryValue('page')
 * })
 * handleRequest(page: string) {}
 */
export function routeParams(paramMap: RouteParameterMap) {
    return function (target: any, context: ClassMethodDecoratorContext): void {
        // Extract parameter names from the method
        const paramNames = getFunctionParamNames(target);

        // Convert paramMap to array indexed by parameter position
        const parameters: MethodParameter[] = [];

        for (const [paramName, extractor] of Object.entries(paramMap)) {
            const index = paramNames.indexOf(paramName);
            if (index === -1) {
                throw new Error(
                    `Parameter "${paramName}" not found in method signature. ` +
                        `Available parameters: ${paramNames.join(', ')}`
                );
            }

            parameters[index] = new MethodParameter(
                extractor.type,
                extractor.name,
                extractor.required,
                extractor.defaultValue
            );
        }

        // Store in metadata
        context.metadata[`method:parameter:${String(context.name)}`] = parameters;
    };
}

/**
 * Get method parameters
 */
export function getMethodParameter(target: any, propertyKey: string | symbol): MethodParameter[] | undefined {
    const metadata = getMetadata(target);
    return metadata[`method:parameter:${String(propertyKey)}`];
}

/**
 * Check if method has parameters
 */
export function hasMethodParameter(target: any, propertyKey: string | symbol): boolean {
    return getMethodParameter(target, propertyKey) !== undefined;
}
