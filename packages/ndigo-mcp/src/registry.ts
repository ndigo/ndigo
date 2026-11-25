/**
 * The MCP tool registry: visibility policy (read-only + feature gates),
 * per-call policy (`authorize`/`confirm`), result redaction, and invocation
 * through the same binding pipeline the HTTP route uses.
 */
import { REDACTED_VALUE } from '@ndigo/context';
import { toError } from '@ndigo/util';
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
import { MCPToolDeniedError } from './errors.js';
import {
    projectTools,
    type DispatcherLike,
    type MappingSource,
    type RegisteredTool,
    type ToolDescriptor,
} from './project.js';

/**
 * Per-call context carried from the transport.
 *
 * @example
 * ```ts
 * const context: ToolCallContext = { callId: 'req-1', source: 'http' };
 * ```
 */
export interface ToolCallContext {
    /** The MCP request id, recorded as `gen_ai.tool.call.id`. */
    readonly callId?: string;
    /** The invoking transport, recorded as `gen_ai.tool.call.source`. */
    readonly source?: string;
}

/**
 * One tool call under registry policy evaluation.
 *
 * @example
 * ```ts
 * const call: MCPToolCall = { tool: descriptor, args: {} };
 * ```
 */
export interface MCPToolCall {
    /** The tool's descriptor as reported by `tools/list`. */
    readonly tool: ToolDescriptor;
    /** The call arguments. */
    readonly args: Record<string, unknown>;
    /** The MCP request id, when the transport supplied one. */
    readonly callId?: string;
    /**
     * The person-facing confirmation sentence, present when a `confirm`
     * policy returned one. `authorize` decides whether it is satisfied;
     * without an `authorize`, a confirmed call is refused.
     */
    readonly confirm?: string;
}

/**
 * Policy options for a registry.
 *
 * @example
 * ```ts
 * const options: MCPToolRegistryOptions = { readOnly: true };
 * ```
 */
export interface MCPToolRegistryOptions {
    /** Omit mutating tools from `tools/list` and reject them on call. */
    readonly readOnly?: boolean;
    /**
     * Feature-flag evaluator. A `@whenFeature` tool is omitted unless this
     * returns true; without an evaluator, gated tools stay hidden (fail closed).
     */
    readonly isFeatureEnabled?: (flag: string) => boolean | Promise<boolean>;
    /**
     * Per-call authorization. Return `false` to refuse the call — the refusal
     * is an `isError` tool result, never a protocol failure. Evaluated after
     * the visibility policy and before argument binding; read `call.confirm`
     * when the call requires a person's confirmation.
     */
    readonly authorize?: (call: MCPToolCall) => boolean | Promise<boolean>;
    /**
     * Per-call confirmation. Return a sentence describing what a person must
     * confirm; MCP has no confirmation round-trip, so the call is refused
     * with `Needs a person: <sentence>` unless an `authorize` policy accepts
     * it.
     */
    readonly confirm?: (call: MCPToolCall) => string | undefined | Promise<string | undefined>;
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
 *
 * @example
 * ```ts
 * const registry = await MCPToolRegistry.from(dispatcher, { readOnly: true });
 * const tools = await registry.listTools();
 * ```
 */
export class MCPToolRegistry {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "MCPToolRegistry".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object MCPToolRegistry]"
     */
    get [Symbol.toStringTag](): string {
        return 'MCPToolRegistry';
    }

    readonly #tools: readonly RegisteredTool[];
    readonly #readOnly: boolean;
    readonly #isFeatureEnabled: ((flag: string) => boolean | Promise<boolean>) | undefined;
    readonly #authorize: ((call: MCPToolCall) => boolean | Promise<boolean>) | undefined;
    readonly #confirm: ((call: MCPToolCall) => string | undefined | Promise<string | undefined>) | undefined;

    private constructor(tools: readonly RegisteredTool[], options: MCPToolRegistryOptions) {
        this.#tools = tools;
        this.#readOnly = options.readOnly === true;
        this.#isFeatureEnabled = options.isFeatureEnabled;
        this.#authorize = options.authorize;
        this.#confirm = options.confirm;
    }

    /**
     * Projects tools from a dispatcher or mapping table.
     *
     * @param source - The mapping source.
     * @param options - Read-only and feature policy.
     * @returns The registry.
     */
    static from(source: MappingSource, options: MCPToolRegistryOptions = {}): MCPToolRegistry {
        const tools = projectTools(source);
        const resolvers =
            options.argumentResolvers ?? (isDispatcherSource(source) ? source.argumentResolvers : undefined);
        if (resolvers !== undefined) {
            for (const tool of tools) {
                tool.handlerMethod.argumentResolvers = [...resolvers];
            }
        }
        return new MCPToolRegistry(tools, options);
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
     * @param context - Transport context (request id and source).
     * @returns The normalized handler result, with declared secret fields redacted.
     * @throws When the tool is unknown, hidden by policy, refused by
     *   `authorize`/`confirm`, or the handler fails.
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
                    'pass `argumentResolvers` to MCPToolRegistry.from()'
            );
        }
        const tracer = trace.getTracer('@ndigo/mcp');
        return tracer.startActiveSpan(
            `execute_tool ${name}`,
            {
                attributes: {
                    'gen_ai.tool.name': name,
                    ...(context.callId === undefined ? {} : { 'gen_ai.tool.call.id': context.callId }),
                    ...(context.source === undefined ? {} : { 'gen_ai.tool.call.source': context.source }),
                },
            },
            async (span) => {
                try {
                    await this.#enforceCallPolicy(tool, args, context);
                    const route = toolRoute(tool, args);
                    return redactSecrets(normalizeResult(await tool.handlerMethod.invoke(route)), tool);
                } catch (error) {
                    if (error instanceof MCPToolDeniedError) {
                        // A policy refusal is an expected outcome, not a fault:
                        // the attribute is the trace signal.
                        span.setAttribute('gen_ai.tool.call.denied', true);
                    } else {
                        span.recordException(toError(error));
                        span.setStatus({ code: SpanStatusCode.ERROR });
                    }
                    throw error;
                } finally {
                    span.end();
                }
            }
        );
    }

    async #enforceCallPolicy(
        tool: RegisteredTool,
        args: Record<string, unknown>,
        context: ToolCallContext
    ): Promise<void> {
        const base: MCPToolCall = {
            tool: tool.descriptor,
            args,
            ...(context.callId === undefined ? {} : { callId: context.callId }),
        };
        let confirm: string | undefined;
        if (this.#confirm !== undefined) {
            const sentence = await this.#confirm(base);
            if (typeof sentence === 'string' && sentence.length > 0) confirm = sentence;
        }
        const evaluated: MCPToolCall = confirm === undefined ? base : { ...base, confirm };
        if (this.#authorize !== undefined) {
            if (!(await this.#authorize(evaluated))) {
                throw new MCPToolDeniedError(tool.descriptor.name);
            }
            return;
        }
        if (confirm !== undefined) {
            throw new MCPToolDeniedError(tool.descriptor.name, { confirm });
        }
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
        // NOTE: bridging to Route — the source type is wider than this consumer's contract.
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

/**
 * Replaces the tool's declared secret result paths with the shared
 * `<redacted>` sentinel — the same value `@ndigo/context` substitutes for a
 * resolved secret in diagnostics.
 *
 * @param result - The normalized tool result.
 * @param tool - The registered tool carrying `secretFields`.
 * @returns The result with secret fields redacted.
 */
function redactSecrets(result: unknown, tool: RegisteredTool): unknown {
    const paths = tool.secretFields;
    if (paths === undefined || paths.length === 0) return result;
    return redactAt(result, paths, '');
}

function redactAt(value: unknown, paths: readonly string[], path: string): unknown {
    if (path !== '' && paths.includes(path)) return REDACTED_VALUE;
    if (Array.isArray(value)) return value.map((item) => redactAt(item, paths, path));
    if (typeof value === 'object' && value !== null) {
        const clone: Record<string, unknown> = {};
        for (const [key, child] of Object.entries(value)) {
            clone[key] = redactAt(child, paths, path === '' ? key : `${path}.${key}`);
        }
        return clone;
    }
    return value;
}
