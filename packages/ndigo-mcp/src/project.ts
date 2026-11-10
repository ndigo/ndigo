/**
 * Projects dispatcher mappings into MCP tool descriptors. The input schema
 * comes from the same `@parameters` + `validatedBy` metadata that binds the
 * HTTP request — never a second description.
 */
import { getToolMapping, type RouteHandlerMethod, type RouteMappingInfo } from '@ndigo/dispatcher';
import { getWhenFeature } from '@ndigo/flags';
import { z } from 'zod';

/** A JSON Schema object as carried by MCP `tools/list`. */
export type JSONSchema = Record<string, unknown>;

/** One tool as reported to MCP clients. */
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
    };
}

/** A projected tool with the handler needed to invoke it. */
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
}

/** One `getMappingEntries()` row. */
export interface MappingEntryLike {
    /** The route mapping. */
    readonly mapping: RouteMappingInfo;
    /** The resolved handler method. */
    readonly handlerMethod: RouteHandlerMethod;
}

/** A mapping table exposing the inspect-style read model. */
export interface MappingTableLike {
    /** Enumerates registered mappings. */
    getMappingEntries?(): readonly MappingEntryLike[];
}

/** A dispatcher-like source: anything carrying handler mapping tables. */
export interface DispatcherLike {
    /** The dispatcher's registered mapping tables. */
    readonly handlerMappings?: readonly MappingTableLike[];
}

/** Anything that can supply mapping entries to the projector. */
export type MappingSource = DispatcherLike | MappingTableLike | readonly MappingTableLike[];

function likeDispatcher(source: MappingSource): source is DispatcherLike {
    return !Array.isArray(source) && 'handlerMappings' in source;
}

function tablesOf(source: MappingSource): readonly MappingTableLike[] {
    if (Array.isArray(source)) return source;
    if (likeDispatcher(source) && source.handlerMappings !== undefined) return source.handlerMappings;
    // `DispatcherLike` has only optional members, so the false branch cannot
    // exclude it structurally; the remaining explicit member is a table.
    return [source as MappingTableLike];
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
                throw new Error(`duplicate MCP tool name '${name}' — every @toolMapping must be unique`);
            }
            names.add(name);
            const readOnly = metadata.readOnly === true;
            const feature = getWhenFeature(entry.handlerMethod.handler, entry.handlerMethod.method);
            tools.push({
                descriptor: {
                    name,
                    description: metadata.description ?? describe(entry),
                    inputSchema: inputSchemaOf(entry.handlerMethod),
                    annotations: { readOnlyHint: readOnly },
                },
                handlerMethod: entry.handlerMethod,
                info: entry.mapping,
                readOnly,
                ...(feature === undefined ? {} : { feature }),
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

function defaultToolName(methodName: string): string {
    const name = methodName
        .replace(/([a-z0-9])([A-Z])/gu, '$1_$2')
        .replace(/[^A-Za-z0-9_]/gu, '_')
        .toLowerCase();
    return /^[a-z]/u.test(name) ? name : `tool_${name}`;
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
