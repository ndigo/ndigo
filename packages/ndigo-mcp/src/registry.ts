/**
 * The MCP tool registry: visibility policy (read-only + feature gates) and
 * invocation through the same binding pipeline the HTTP route uses.
 */
import { randomUUID } from 'node:crypto';
import {
    MethodParameterType,
    ModelAndView,
    RouteHandlerMethod,
    type HandlerMethodArgumentResolver,
} from '@ndigo/dispatcher';
import { NODE_REQUEST_ATTRIBUTE, type NodeRequest } from '@ndigo/platform-node';
import type { Route } from '@ndigo/router';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import {
    projectTools,
    type DispatcherLike,
    type MappingSource,
    type RegisteredTool,
    type ToolDescriptor,
} from './project.js';

/** Per-call context carried from the transport. */
export interface ToolCallContext {
    /** The MCP request id, recorded as `gen_ai.tool.call.id`. */
    readonly callId?: string;
}

/** Policy options for a registry. */
export interface McpToolRegistryOptions {
    /** Omit mutating tools from `tools/list` and reject them on call. */
    readonly readOnly?: boolean;
    /**
     * Feature-flag evaluator. A `@whenFeature` tool is omitted unless this
     * returns true; without an evaluator, gated tools stay hidden (fail closed).
     */
    readonly isFeatureEnabled?: (flag: string) => boolean | Promise<boolean>;
    /**
     * The dispatcher's argument-resolver chain (the `ARGUMENT_RESOLVERS`
     * context entry). Tool calls bind path/query/header/body arguments through
     * the same resolvers as HTTP; without them, tools that declare parameters
     * fail with a clear error.
     */
    readonly argumentResolvers?: readonly HandlerMethodArgumentResolver[];
}

/**
 * Whether a mapping source is a dispatcher (rather than a single table or a
 * table array).
 *
 * @param source - The mapping source.
 * @returns `true` for dispatcher-shaped sources.
 */
function isDispatcherSource(source: MappingSource): source is DispatcherLike {
    return !Array.isArray(source) && 'handlerMappings' in source;
}

/**
 * A registry of tools projected from dispatch metadata.
 */
export class McpToolRegistry {
    readonly #tools: readonly RegisteredTool[];
    readonly #readOnly: boolean;
    readonly #isFeatureEnabled: ((flag: string) => boolean | Promise<boolean>) | undefined;

    private constructor(tools: readonly RegisteredTool[], options: McpToolRegistryOptions) {
        this.#tools = tools;
        this.#readOnly = options.readOnly === true;
        this.#isFeatureEnabled = options.isFeatureEnabled;
    }

    /**
     * Projects tools from a dispatcher or mapping table.
     *
     * @param source - The mapping source.
     * @param options - Read-only and feature policy.
     * @returns The registry.
     */
    static from(source: MappingSource, options: McpToolRegistryOptions = {}): McpToolRegistry {
        const tools = projectTools(source);
        const resolvers =
            options.argumentResolvers ?? (isDispatcherSource(source) ? source.argumentResolvers : undefined);
        if (resolvers !== undefined) {
            for (const tool of tools) {
                tool.handlerMethod.argumentResolvers = [...resolvers];
            }
        }
        return new McpToolRegistry(tools, options);
    }

    /**
     * Lists the tools visible under the current policy.
     *
     * @returns The descriptors reported by `tools/list`.
     */
    async listTools(): Promise<ToolDescriptor[]> {
        return (await this.#visibleTools()).map((tool) => tool.descriptor);
    }

    /**
     * Invokes one tool through the handler's normal binding pipeline.
     *
     * @param name - The tool name.
     * @param args - The tool arguments.
     * @param context - Transport context (request id).
     * @returns The normalized handler result.
     * @throws When the tool is unknown, hidden by policy, or the handler fails.
     */
    async call(name: string, args: Record<string, unknown> = {}, context: ToolCallContext = {}): Promise<unknown> {
        const tool = (await this.#visibleTools()).find((candidate) => candidate.descriptor.name === name);
        if (tool === undefined) {
            throw new Error(`unknown or unavailable MCP tool '${name}'`);
        }
        if (
            tool.handlerMethod instanceof RouteHandlerMethod &&
            (tool.handlerMethod.parameters?.length ?? 0) > 0 &&
            tool.handlerMethod.argumentResolvers === undefined
        ) {
            throw new Error(
                `MCP tool '${name}' declares parameters but the registry has no argument resolvers — ` +
                    'pass `argumentResolvers` to McpToolRegistry.from()'
            );
        }
        const tracer = trace.getTracer('@ndigo/mcp');
        return tracer.startActiveSpan(
            `execute_tool ${name}`,
            {
                attributes: {
                    'gen_ai.tool.name': name,
                    ...(context.callId === undefined ? {} : { 'gen_ai.tool.call.id': context.callId }),
                },
            },
            async (span) => {
                try {
                    const route = toolRoute(tool, args);
                    return normalizeResult(await tool.handlerMethod.invoke(route));
                } catch (error) {
                    span.recordException(error instanceof Error ? error : String(error));
                    span.setStatus({ code: SpanStatusCode.ERROR });
                    throw error;
                } finally {
                    span.end();
                }
            }
        );
    }

    async #visibleTools(): Promise<RegisteredTool[]> {
        const evaluated = await Promise.all(
            this.#tools.map(async (tool) => {
                if (this.#readOnly && !tool.readOnly) return null;
                if (tool.feature !== undefined) {
                    const enabled =
                        this.#isFeatureEnabled === undefined ? false : await this.#isFeatureEnabled(tool.feature);
                    if (!enabled) return null;
                }
                return tool;
            })
        );
        return evaluated.filter((tool): tool is RegisteredTool => tool !== null);
    }
}

function toolRoute(tool: RegisteredTool, args: Record<string, unknown>): Route {
    const pattern = [...(tool.info.patternsCondition?.patterns ?? [])][0];
    if (pattern === undefined) {
        throw new Error(`tool '${tool.descriptor.name}' has no route pattern`);
    }
    const params: Record<string, string> = {};
    const path = fillPath(pattern, args, params);
    const headers: Record<string, string | string[]> = {};
    const cookies: Record<string, string> = {};
    let body: Record<string, unknown> = {};

    for (const parameter of tool.handlerMethod.parameters ?? []) {
        const key = parameter.parameterName.length > 0 ? parameter.parameterName : parameter.name;
        const value = args[key];
        if (MethodParameterType.HEADER.equals(parameter.type) && value !== undefined) {
            headers[parameter.name] = String(value);
        } else if (MethodParameterType.COOKIE.equals(parameter.type) && value !== undefined) {
            cookies[parameter.name] = String(value);
        } else if (MethodParameterType.BODY.equals(parameter.type) && typeof value === 'object' && value !== null) {
            body = value as Record<string, unknown>;
        }
    }

    const nodeRequest: NodeRequest = {
        headers,
        body,
        cookies,
        session: {},
        remoteAddress: 'mcp',
    };
    // `Route` is ArrayLike<RouteSegment>; argument resolvers read only
    // `data`, `params`, and `attributes`, so a zero-length route is enough.
    return {
        length: 0,
        id: randomUUID(),
        path,
        raw: path,
        data: args as Record<string, unknown>,
        params,
        method: tool.info.methodCondition?.method,
        attributes: { [NODE_REQUEST_ATTRIBUTE]: nodeRequest },
    } as unknown as Route;
}

function fillPath(pattern: string, args: Record<string, unknown>, params: Record<string, string>): string {
    const substitute = (_match: string, name: string): string => {
        const value = args[name];
        if (value === undefined || value === null) {
            throw new Error(`missing path argument '${name}'`);
        }
        const text = String(value);
        params[name] = text;
        return encodeURIComponent(text);
    };
    const path = pattern.replace(/:([A-Za-z0-9_]+)/gu, substitute).replace(/\{\*([A-Za-z0-9_]+)\}/gu, substitute);
    return path.startsWith('/') ? path : `/${path}`;
}

function normalizeResult(result: unknown): unknown {
    if (result instanceof ModelAndView) return result.model ?? null;
    if (typeof result === 'object' && result !== null && 'status' in result && 'body' in result) {
        const entity = result as { readonly body: unknown }; // validated response-entity shape above
        return entity.body;
    }
    return result ?? null;
}
