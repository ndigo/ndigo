/**
 * Projects dispatcher mappings into MCP tool descriptors. The input schema
 * comes from the same `@parameters` + `validatedBy` metadata that binds the
 * HTTP request — never a second description.
 */
import {
    defaultToolName,
    getToolMapping,
    type HandlerMethodArgumentResolver,
    type RouteHandlerMethod,
    type RouteMappingInfo,
} from '@ndigo/dispatcher';
import { getWhenFeature } from '@ndigo/flags';
import { z } from 'zod';
import { like } from '@ndigo/util';
import { FrameworkError } from '@ndigo/core';

/**
 * A JSON Schema object as carried by MCP `tools/list`.
 *
 * @example
 * ```ts
 * const schema: JSONSchema = { type: 'object', properties: {} };
 * ```
 */
export type JSONSchema = Record<string, unknown>;

/**
 * The client-facing tool descriptor as reported by `tools/list`.
 *
 * @example
 * ```ts
 * const descriptor: ToolDescriptor = { name: 'send_email', inputSchema: { type: 'object', properties: {} } };
 * ```
 */
export interface ToolDescriptor {
    /** Tool name (snake_case). */
    readonly name: string;
    /** One-line description. */
    readonly description?: string;
    /** JSON Schema for the tool arguments. */
    readonly inputSchema: JSONSchema;
    /** Behaviour hints. */
    readonly annotations?: {
        /** The tool only reads state. */
        readonly readOnlyHint?: boolean;
        /** The tool may perform destructive or hard-to-reverse updates. */
        readonly destructiveHint?: boolean;
    };
    /** Protocol metadata (MCP Apps UI presentation). */
    readonly _meta?: {
        /** UI presentation metadata. */
        readonly ui?: {
            /** The `ui://` resource rendered by the host. */
            readonly resourceUri: string;
        };
    };
}

/**
 * A projected tool with the handler needed to invoke it.
 *
 * @example
 * ```ts
 * const tool: RegisteredTool = { descriptor, handlerMethod, info, readOnly: false };
 * ```
 */
export interface RegisteredTool {
    /** The client-facing descriptor. */
    readonly descriptor: ToolDescriptor;
    /** The dispatch handler method. */
    readonly handlerMethod: RouteHandlerMethod;
    /** The mapping that declared it. */
    readonly info: RouteMappingInfo;
    /** `true` when `@toolMapping` declared the tool read-only. */
    readonly readOnly: boolean;
    /** Feature flag gating the tool, when `@whenFeature` is present. */
    readonly feature?: string;
    /** Result field paths redacted before the result leaves the registry. */
    readonly secretFields?: readonly string[];
}

/**
 * One `getMappingEntries()` row.
 *
 * @example
 * ```ts
 * const entry: MappingEntryLike = { mapping, handlerMethod };
 * ```
 */
export interface MappingEntryLike {
    /** The route mapping. */
    readonly mapping: RouteMappingInfo;
    /** The resolved handler method. */
    readonly handlerMethod: RouteHandlerMethod;
}

/**
 * A mapping table exposing the inspect-style read model.
 *
 * @example
 * ```ts
 * const table: MappingTableLike = { getMappingEntries: () => [] };
 * ```
 */
export interface MappingTableLike {
    /** Enumerates registered mappings. */
    getMappingEntries?(): readonly MappingEntryLike[];
}

/**
 * A dispatcher-like source: anything carrying handler mapping objects.
 *
 * @example
 * ```ts
 * const source: DispatcherLike = { handlerMappings: [] };
 * ```
 */
export interface DispatcherLike {
    /** The dispatcher's registered handler mappings. */
    readonly handlerMappings?: readonly unknown[];
    /** The dispatcher's argument-resolver chain, when initialized. */
    readonly argumentResolvers?: readonly HandlerMethodArgumentResolver[];
}

/**
 * Anything that can supply mapping entries to the projector.
 *
 * @example
 * ```ts
 * const source: MappingSource = [];
 * ```
 */
export type MappingSource = DispatcherLike | MappingTableLike | readonly MappingTableLike[];

function likeDispatcher(source: MappingSource): source is DispatcherLike {
    return !Array.isArray(source) && 'handlerMappings' in source;
}

function tablesOf(source: MappingSource): readonly MappingTableLike[] {
    if (Array.isArray(source)) return source;
    if (likeDispatcher(source) && source.handlerMappings !== undefined) {
        // A dispatcher exposes its mapping objects (`getHandler()`); the
        // inspect read model is the optional `getMappingEntries()` member.
        return source.handlerMappings.filter(likeMappingTable);
    }
    // `DispatcherLike` has only optional members, so the false branch cannot
    // exclude it structurally; the remaining explicit member is a table.
    return [source as MappingTableLike];
}

/**
 * Whether a dispatcher mapping object exposes the inspect read model.
 *
 * Structural check (`like*`): the object is a mapping table when it carries a
 * callable `getMappingEntries`, not by class identity.
 *
 * @param value - The candidate mapping object.
 * @returns `true` when `getMappingEntries()` is present.
 */
function likeMappingTable(value: unknown): value is MappingTableLike {
    return like({ getMappingEntries: Function })(value);
}

function entriesOf(table: MappingTableLike): readonly MappingEntryLike[] {
    return typeof table.getMappingEntries === 'function' ? table.getMappingEntries() : [];
}

/**
 * Projects every `@toolMapping` handler in the source into a registered tool.
 *
 * @param source - A dispatcher, a mapping table, or an array of tables.
 * @returns The tools, in registration order.
 * @throws When two handlers project to the same tool name.
 *
 * @example
 * ```ts
 * const tools = projectTools(dispatcher);
 * console.log(tools.map((t) => t.descriptor.name));
 * ```
 */
export function projectTools(source: MappingSource): RegisteredTool[] {
    const tools: RegisteredTool[] = [];
    const names = new Set<string>();
    for (const table of tablesOf(source)) {
        for (const entry of entriesOf(table)) {
            const metadata = getToolMapping(entry.handlerMethod.handler, entry.handlerMethod.method);
            if (metadata === undefined) continue;
            const name = metadata.name ?? defaultToolName(entry.handlerMethod.method);
            if (names.has(name)) {
                throw new FrameworkError(`duplicate MCP tool name '${name}' — every @toolMapping must be unique`);
            }
            names.add(name);
            const readOnly = metadata.readOnly === true;
            const feature = getWhenFeature(entry.handlerMethod.handler, entry.handlerMethod.method);
            tools.push({
                descriptor: {
                    name,
                    description: metadata.description ?? describe(entry),
                    inputSchema: inputSchemaOf(entry.handlerMethod),
                    annotations: {
                        readOnlyHint: readOnly,
                        ...(metadata.consequential === undefined ? {} : { destructiveHint: metadata.consequential }),
                    },
                    ...(metadata.ui === undefined ? {} : { _meta: { ui: { resourceUri: metadata.ui } } }),
                },
                handlerMethod: entry.handlerMethod,
                info: entry.mapping,
                readOnly,
                ...(feature === undefined ? {} : { feature }),
                ...(metadata.secret === undefined ? {} : { secretFields: metadata.secret }),
            });
        }
    }
    return tools;
}

function describe(entry: MappingEntryLike): string {
    const method = entry.mapping.methodCondition?.method ?? 'ANY';
    const pattern = [...(entry.mapping.patternsCondition?.patterns ?? [])][0] ?? '';
    return `${method} ${pattern}`.trim();
}

function inputSchemaOf(handlerMethod: RouteHandlerMethod): JSONSchema {
    const properties: Record<string, JSONSchema> = {};
    const required: string[] = [];
    for (const parameter of handlerMethod.parameters ?? []) {
        const key = parameter.parameterName.length > 0 ? parameter.parameterName : parameter.name;
        if (key.length === 0) continue;
        properties[key] = parameter.schema === undefined ? fallbackSchema(parameter) : zodSchema(parameter.schema);
        if (parameter.required) required.push(key);
    }
    return {
        type: 'object',
        properties,
        ...(required.length === 0 ? {} : { required: [...new Set(required)] }),
    };
}

function zodSchema(schema: z.ZodType<unknown>): JSONSchema {
    const converted = z.toJSONSchema(schema, { target: 'draft-2020-12' }) as JSONSchema;
    const { $schema: _schema, ...embedded } = converted;
    return embedded;
}

function fallbackSchema(parameter: { readonly convertType?: { readonly target: unknown } | undefined }): JSONSchema {
    const target = parameter.convertType?.target;
    if (target === Number) return { type: 'number' };
    if (target === Boolean) return { type: 'boolean' };
    if (target === Date) return { type: 'string', format: 'date-time' };
    if (target === Array) return { type: 'array', items: { type: 'string' } };
    return { type: 'string' };
}
