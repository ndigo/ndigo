/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { isFunction, isString } from '@blue/util/types';
import { Serializable, JSONObject, createNull, Equatable, getSymbolMetadata, IllegalStateError } from '@blue/core';
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
    convert: ParameterValueConverterReference | null;
    prefix?: string | null;
};

export interface ParameterValueConversionContext {
    name: string;
    parameter: MethodParameter;
    route: any;
    mapping: any;
}

export type ParameterValueConverter = (value: any, context: ParameterValueConversionContext) => any;
export type ParameterValueConverterReference =
    | ParameterValueConverter
    | string
    | {
          optional?: boolean;
          use: ParameterValueConverter | string;
      };

/**
 * Parameter map for @routeParams decorator
 */
export type RouteParameterMap = Record<string, ParameterExtractor>;

/**
 * Method parameter type enum
 */
export class MethodParameterType implements Equatable, Serializable {
    static COOKIE: MethodParameterType;
    static MODEL: MethodParameterType;
    static MATRIX: MethodParameterType;
    static PATH: MethodParameterType;
    static QUERY: MethodParameterType;
    static STATE: MethodParameterType;
    static SESSION: MethodParameterType;
    static BIND: MethodParameterType;
    static ATTRIBUTE: MethodParameterType;

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
MethodParameterType.MODEL = new MethodParameterType('model:value');
MethodParameterType.MATRIX = new MethodParameterType('matrix:value');
MethodParameterType.PATH = new MethodParameterType('path:value');
MethodParameterType.QUERY = new MethodParameterType('query:value');
MethodParameterType.STATE = new MethodParameterType('state:value');
MethodParameterType.SESSION = new MethodParameterType('session:value');
MethodParameterType.BIND = new MethodParameterType('bind:value');
MethodParameterType.ATTRIBUTE = new MethodParameterType('attribute:value');

/**
 * Method parameter metadata
 */
export class MethodParameter implements Serializable {
    readonly name: string;
    readonly type: MethodParameterType;
    readonly required: boolean;
    readonly defaultValue: string | null;
    readonly convert: ParameterValueConverterReference | null;
    readonly prefix: string | null;

    constructor(
        type: MethodParameterType,
        name: string,
        required: boolean = false,
        defaultValue: string | null = null,
        convert: ParameterValueConverterReference | null = null,
        prefix: string | null = null
    ) {
        if (!isString(name)) {
            throw new TypeError(`"name" must be a string but was ${name}`);
        }
        if (convert !== null && !this._isConverterReference(convert)) {
            throw new TypeError(`"convert" must be a converter reference or null but was ${convert}`);
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
        defineProperty(this, 'convert', {
            value: convert,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'prefix', {
            value: prefix,
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
        json.hasConverter = this.convert !== null;
        json.prefix = this.prefix;
        return json;
    }

    private _isConverterReference(value: any): value is ParameterValueConverterReference {
        if (isFunction(value) || isString(value)) {
            return true;
        }

        if (value && typeof value === 'object') {
            const use = value.use;
            return isFunction(use) || isString(use);
        }

        return false;
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
    options: { required?: boolean; defaultValue?: string; convert?: ParameterValueConverterReference } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.QUERY,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convert: options.convert ?? null,
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
    options: { required?: boolean; defaultValue?: string; convert?: ParameterValueConverterReference } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.PATH,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convert: options.convert ?? null,
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
    options: { required?: boolean; defaultValue?: string; convert?: ParameterValueConverterReference } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.MATRIX,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convert: options.convert ?? null,
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
    options: { required?: boolean; defaultValue?: string; convert?: ParameterValueConverterReference } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.COOKIE,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convert: options.convert ?? null,
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
    options: { required?: boolean; defaultValue?: string; convert?: ParameterValueConverterReference } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.SESSION,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convert: options.convert ?? null,
    };
}

/**
 * Factory function: Create a model parameter extractor
 *
 * @example
 * @routeParams({
 *   profile: modelValue('profile'),
 * })
 */
export function modelValue(
    name: string,
    options: { required?: boolean; defaultValue?: string; convert?: ParameterValueConverterReference } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.MODEL,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convert: options.convert ?? null,
    };
}

/**
 * Factory function: Create a history state parameter extractor
 *
 * @example
 * @routeParams({
 *   token: stateValue('token'),
 * })
 */
export function stateValue(
    name: string,
    options: { required?: boolean; defaultValue?: string; convert?: ParameterValueConverterReference } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.STATE,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convert: options.convert ?? null,
    };
}

/**
 * Factory function: Create a binding parameter extractor.
 * Binds an entire source (e.g. query, state) to an object, optionally filtering by prefix.
 *
 * @example
 * @routeParams({
 *   user: bindValue('query', { prefix: 'user.' })
 * })
 */
export function bindValue(
    source: 'query' | 'state' | 'session' | 'model' | 'cookie' | 'matrix' | 'path',
    options: {
        required?: boolean;
        defaultValue?: any;
        convert?: ParameterValueConverterReference;
        prefix?: string;
    } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.BIND,
        name: source,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convert: options.convert ?? null,
        prefix: options.prefix ?? null,
    };
}

/**
 * Factory function: Create a route attribute parameter extractor.
 *
 * @example
 * @routeParams({
 *   user: attributeValue('user')
 * })
 */
export function attributeValue(
    name: string,
    options: { required?: boolean; defaultValue?: any; convert?: ParameterValueConverterReference } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.ATTRIBUTE,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convert: options.convert ?? null,
    };
}

/**
 * Wraps a parameter extractor to enforce number conversion.
 * @example asNumber(queryValue('age'))
 */
export function asNumber(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convert: 'number' };
}

/**
 * Wraps a parameter extractor to enforce boolean conversion.
 * @example asBoolean(stateValue('isActive'))
 */
export function asBoolean(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convert: 'boolean' };
}

/**
 * Wraps a parameter extractor to enforce Date conversion.
 * @example asDate(cookieValue('lastLogin'))
 */
export function asDate(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convert: 'date' };
}

/**
 * Wraps a parameter extractor to enforce JSON conversion.
 * @example asJson<UserProfile>(modelValue('profile'))
 */
export function asJson(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convert: 'json' };
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
                throw new IllegalStateError(
                    `Parameter "${paramName}" not found in method signature. ` +
                        `Available parameters: ${paramNames.join(', ')}`
                );
            }

            parameters[index] = new MethodParameter(
                extractor.type,
                extractor.name,
                extractor.required,
                extractor.defaultValue,
                extractor.convert,
                extractor.prefix
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
    const metadata = getSymbolMetadata(target);
    return metadata[`method:parameter:${String(propertyKey)}`];
}

/**
 * Check if method has parameters
 */
export function hasMethodParameter(target: any, propertyKey: string | symbol): boolean {
    return getMethodParameter(target, propertyKey) !== undefined;
}
