/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { isString } from '@blue/util/types';
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
    /** Type-based conversion: { source: SourceConstructor, target: TargetConstructor } */
    convertType?: { source: any; target: any };
    prefix?: string | null;
};

/** Options for creating a parameter extractor with type-based conversion support. */
export interface ParameterExtractorOptions {
    required?: boolean;
    defaultValue?: string;
    /** Type-based converter: specifies source and target types for ConversionService lookup. */
    convertType?: { source: any; target: any };
}

export interface ParameterValueConversionContext {
    name: string;
    parameter: MethodParameter;
    route: any;
    mapping: any;
}

export type ParameterValueConverter = (value: any, context: ParameterValueConversionContext) => any;

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
    static HEADER: MethodParameterType;
    static BODY: MethodParameterType;

    static fromType(type: string): MethodParameterType | null {
        const types = keys(this);
        const length = types.length;

        for (let index = 0; index < length; index++) {
            const key = types[index];
            if (key !== 'fromType') {
                // Skip the static method itself
                const parameterType = MethodParameterType[key as keyof typeof MethodParameterType];
                // Ensure we only work with actual MethodParameterType instances, not methods
                if (parameterType instanceof MethodParameterType && parameterType.type === type) {
                    return parameterType;
                }
            }
        }

        return null;
    }

    readonly type!: string;

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
MethodParameterType.HEADER = new MethodParameterType('header:value');
MethodParameterType.BODY = new MethodParameterType('body:value');

/**
 * Method parameter metadata
 */
export class MethodParameter implements Serializable {
    readonly name!: string;
    readonly type!: MethodParameterType;
    readonly required!: boolean;
    readonly defaultValue!: string | null;
    readonly convertType!: { source: any; target: any } | undefined;
    readonly prefix!: string | null;

    constructor(
        type: MethodParameterType,
        name: string,
        required: boolean = false,
        defaultValue: string | null = null,
        convertType?: { source: any; target: any },
        prefix: string | null = null
    ) {
        if (!isString(name)) {
            throw new TypeError(`"name" must be a string but was ${name}`);
        }
        this.type = type;
        this.name = name;
        this.required = required;
        this.defaultValue = defaultValue;
        this.convertType = convertType ?? undefined;
        this.prefix = prefix;
    }

    toJSON(): JSONObject {
        const json = createNull();
        json.name = this.name;
        json.type = this.type;
        json.required = this.required;
        json.defaultValue = this.defaultValue;
        json.hasConvertType = this.convertType !== undefined;
        json.prefix = this.prefix;
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
export function queryValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.QUERY,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
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
export function pathValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.PATH,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
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
export function matrixValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.MATRIX,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
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
export function cookieValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.COOKIE,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
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
export function sessionValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.SESSION,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
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
export function modelValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.MODEL,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
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
export function stateValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.STATE,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
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
        convertType?: { source: any; target: any };
        prefix?: string;
    } = {}
): ParameterExtractor {
    return {
        type: MethodParameterType.BIND,
        name: source,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
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
export function attributeValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.ATTRIBUTE,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a request-header parameter extractor.
 *
 * @example
 * @routeParams({
 *   contentType: headerValue('content-type'),
 *   authorization: headerValue('authorization', { required: true })
 * })
 */
export function headerValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.HEADER,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Factory function: Create a request-body parameter extractor.
 * Use `name: '*'` to bind the entire parsed body object.
 *
 * @example
 * @routeParams({
 *   user: bodyValue('user'),
 *   payload: bodyValue('*')
 * })
 */
export function bodyValue(name: string, options: ParameterExtractorOptions = {}): ParameterExtractor {
    return {
        type: MethodParameterType.BODY,
        name,
        required: options.required ?? false,
        defaultValue: options.defaultValue ?? null,
        convertType: options.convertType ?? undefined,
    };
}

/**
 * Wraps a parameter extractor to enforce number conversion.
 * @example asNumber(queryValue('age'))
 */
export function asNumber(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Number } };
}

/**
 * Wraps a parameter extractor to enforce boolean conversion.
 * @example asBoolean(stateValue('isActive'))
 */
export function asBoolean(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Boolean } };
}

/**
 * Wraps a parameter extractor to enforce Date conversion.
 * @example asDate(cookieValue('lastLogin'))
 */
export function asDate(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Date } };
}

/**
 * Wraps a parameter extractor to enforce JSON conversion.
 * @example asJson<UserProfile>(modelValue('profile'))
 */
export function asJson<T = any>(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Object } };
}

/**
 * Wraps a parameter extractor to enforce UUID conversion.
 * @example asUUID(pathValue('userId'))
 */
export function asUUID(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: String } };
}

/**
 * Wraps a parameter extractor to enforce array conversion.
 * @example asArray(queryValue('tags'))
 */
export function asArray(extractor: ParameterExtractor): ParameterExtractor {
    return { ...extractor, convertType: { source: String, target: Array } };
}

/**
 * Wraps a parameter extractor to enforce type-based conversion via ConversionService.
 * @example withConversion(queryValue('id'), { source: String, target: UUID })
 */
export function withConversion(
    extractor: ParameterExtractor,
    convertType: { source: any; target: any }
): ParameterExtractor {
    return { ...extractor, convertType };
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

        // Pre-compute name→index map for O(1) lookup instead of O(P) indexOf per parameter.
        const nameToIndex = new Map<string, number>();
        for (let i = 0; i < paramNames.length; i++) {
            nameToIndex.set(paramNames[i], i);
        }

        // Convert paramMap to array indexed by parameter position
        const parameters: MethodParameter[] = [];

        for (const [paramName, extractor] of Object.entries(paramMap)) {
            const index = nameToIndex.get(paramName);
            if (index === undefined) {
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
                extractor.convertType,
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
