/**
 */
import { isString } from '@ndigo/util/types';
import { Serializable, JSONObject, createNull, Equatable } from '@ndigo/core';
import type { z } from 'zod';

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
    convertType?: { source: unknown; target: unknown };
    prefix?: string | null;
    /** Optional post-bind validator/converter (e.g. Zod via `validatedBy`). */
    convert?: (value: unknown) => unknown;
    /**
     * The Zod schema backing {@link ParameterExtractor.convert}, when the
     * extractor was produced by `validatedBy` (AD-35). Generation-time
     * introspection seam — the OpenAPI generator derives JSON Schema from it;
     * never read by the resolvers (they go through `convert`).
     */
    schema?: z.ZodType<unknown>;
    /** Explicit multipart/form-data client field name, when it differs from the
     *  method-argument name. `fileValue('avatar_url')` sets this so the resolver
     *  reads that part instead of inferring from the argument name. */
    partName?: string;
    /** Optional target constructor for whole-source binding: when set, the
     *  bound result is a real instance of the target (not a plain object).
     *  `dataBinderValue(source, Target)` sets this (D-3). */
    target?: new () => object;
};

/** Options for creating a parameter extractor with type-based conversion support. */
export interface ParameterExtractorOptions {
    required?: boolean;
    defaultValue?: string;
    /** Type-based converter: specifies source and target types for ConversionService lookup. */
    convertType?: { source: unknown; target: unknown };
}

/**
 * Context handed to a `ParameterValueConverter`: the bound parameter name, the
 * `MethodParameter` it came from, and the route/mapping metadata the value is
 * being bound for.
 */
export interface ParameterValueConversionContext {
    name: string;
    parameter: MethodParameter;
    route: unknown;
    mapping: unknown;
}

/**
 * Converts one raw argument value into the type its `MethodParameter` declares.
 * A converter is chosen per source/target type pair (see
 * `ResolverConverterOption`) and may be async.
 */
export type ParameterValueConverter = (value: unknown, context: ParameterValueConversionContext) => unknown;

/**
 * Parameter map for `parameters` decorator
 */
export type ParameterMap = Record<string, ParameterExtractor>;

/**
 * Method parameter type enum
 */
export class MethodParameterType implements Equatable, Serializable {
    static COOKIE: MethodParameterType;
    static MATRIX: MethodParameterType;
    static PATH: MethodParameterType;
    static QUERY: MethodParameterType;
    static HISTORY_STATE: MethodParameterType;
    static REQUEST_SESSION: MethodParameterType;
    static SESSION_STORAGE: MethodParameterType;
    static LOCAL_STORAGE: MethodParameterType;
    static ATTRIBUTE: MethodParameterType;
    static HEADER: MethodParameterType;
    static BODY: MethodParameterType;
    static ROUTE: MethodParameterType;
    static SOCKET_SESSION: MethodParameterType;
    static MULTIPART_FILE: MethodParameterType;
    static REQUEST_PART: MethodParameterType;

    /**
     * Whole-source data-binding types (`data-{source}:value`, D-3).
     *
     * The source is encoded in the type — `dataBinderValue('body')` produces
     * `data-body:value` — and the instances are cached so type-equality via
     * `Set.has` in the `SOURCES_BY_KIND` membership checks holds.
     *
     * @param source - The data source name (`'query'`, `'body'`, `'cookie'`,
     *   `'session-storage'`, `'local-storage'`).
     * @returns The cached type instance for `data-{source}:value`.
     */
    static data(source: string): MethodParameterType {
        return (dataBindingTypes[source] ??= new MethodParameterType(`data-${source}:value`));
    }

    static fromType(type: string): MethodParameterType | null {
        // data-* types are cached instances, not static fields — resolve them
        // from the source cache so serialized types round-trip.
        if (type.startsWith('data-')) {
            return dataBindingTypes[type.slice('data-'.length, -':value'.length)] ?? null;
        }
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

    equals(value: unknown): boolean {
        return value instanceof MethodParameterType && value.type === this.type;
    }

    toJSON(): string {
        return this.toString();
    }

    toString(): string {
        return this.type;
    }
}

/** Cache of `data-{source}:value` type instances (see {@link MethodParameterType.data}). */
const dataBindingTypes: Record<string, MethodParameterType> = {};

MethodParameterType.COOKIE = new MethodParameterType('cookie:value');
MethodParameterType.MATRIX = new MethodParameterType('matrix:value');
MethodParameterType.PATH = new MethodParameterType('path:variable');
MethodParameterType.QUERY = new MethodParameterType('query:value');
MethodParameterType.HISTORY_STATE = new MethodParameterType('history-state:value');
MethodParameterType.REQUEST_SESSION = new MethodParameterType('request-session:value');
MethodParameterType.SESSION_STORAGE = new MethodParameterType('session-storage:value');
MethodParameterType.LOCAL_STORAGE = new MethodParameterType('local-storage:value');
MethodParameterType.ATTRIBUTE = new MethodParameterType('attribute:value');
MethodParameterType.HEADER = new MethodParameterType('header:value');
MethodParameterType.BODY = new MethodParameterType('body:value');
MethodParameterType.ROUTE = new MethodParameterType('route:value');
MethodParameterType.SOCKET_SESSION = new MethodParameterType('socket-session:value');
MethodParameterType.MULTIPART_FILE = new MethodParameterType('multipart-file:value');
MethodParameterType.REQUEST_PART = new MethodParameterType('request-part:value');

/**
 * Method parameter metadata
 */
export class MethodParameter implements Serializable {
    readonly name!: string;
    readonly type!: MethodParameterType;
    readonly required!: boolean;
    readonly defaultValue!: string | null;
    readonly convertType!: { source: unknown; target: unknown } | undefined;
    readonly prefix!: string | null;
    /**
     * Optional post-bind validator/converter applied to the resolved value.
     * Set by {@link zod-validated-by.validatedBy | validatedBy} (Zod-backed, AD-07).
     */
    readonly convert!: ((value: unknown) => unknown) | undefined;
    /**
     * The Zod schema backing {@link MethodParameter.convert}, when the
     * parameter was validated via `validatedBy` (AD-35). Generation-time
     * introspection seam for API docs; never used by resolution.
     */
    readonly schema!: z.ZodType<unknown> | undefined;
    /**
     * The `@parameters` map key this parameter was declared under. For HTTP
     * and browser mappings this equals the method-argument name (and usually
     * the extractor name); for socket mappings it is the `session.params`
     * key, which may differ from the extractor's source name (e.g.
     * `via: headerValue('x-via')` → `parameterName: 'via'`,
     * `name: 'x-via'`).
     */
    readonly parameterName!: string;
    /**
     * Optional target constructor for whole-source binding. When set, the
     * bound value is a real instance of the target (see
     * {@link ParameterExtractor.target} / `dataBinderValue(source, Target)`).
     */
    readonly target!: (new () => object) | undefined;

    constructor(
        type: MethodParameterType,
        name: string,
        required: boolean = false,
        defaultValue: string | null = null,
        convertType?: { source: unknown; target: unknown },
        prefix: string | null = null,
        convert?: (value: unknown) => unknown,
        parameterName?: string,
        target?: new () => object,
        schema?: z.ZodType<unknown>
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
        this.convert = convert ?? undefined;
        this.parameterName = parameterName ?? name;
        this.target = target;
        this.schema = schema;
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
 * The data sources whole-source binding (`dataBinderValue`) can read from,
 * per platform (D-3):
 *
 * - browser: `query`, `cookie`, `session-storage`, `local-storage`
 * - node: `body`, `cookie`
 *
 * The source is encoded in the resulting type (`data-{source}:value`), and
 * `SOURCES_BY_KIND` validates source-vs-mapping-kind compatibility at
 * registration time.
 */
export type DataBindingSource = 'query' | 'body' | 'cookie' | 'session-storage' | 'local-storage';
