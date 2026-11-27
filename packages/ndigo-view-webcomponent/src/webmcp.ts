/**
 * WebMCP tool declaration for browser components: feature-detected
 * `document.modelContext.registerTool`, AbortSignal lifecycle, and schema
 * projection from the same `@parameters` + `validatedBy` metadata the HTTP
 * route and MCP tool use.
 *
 * The tool shape and safety hints are the neutral agent-bridge contract from
 * `@ndigo/core`; this module is its first host adapter.
 */
import {
    type AgentTool,
    type AgentToolAnnotations,
    type AgentToolHost,
    type AgentToolHostOptions,
    type AgentToolRegistration,
    type Constructable,
} from '@ndigo/core';
import { type MethodParameter, resolveParameters } from '@ndigo/dispatcher';
import { z } from 'zod';

/**
 * Safety hints understood by WebMCP hosts — the neutral
 * {@link AgentToolAnnotations} vocabulary.
 *
 * @example
 * ```ts
 * type _Alias = WebMCPToolAnnotations;
 * ```
 */
export type WebMCPToolAnnotations = AgentToolAnnotations;

/** A tool registered with the browser's model context — the neutral {@link AgentTool} shape. */
export type WebMCPTool = AgentTool;

/**
 * Registration outcome — the neutral {@link AgentToolRegistration} handle.
 * `supported` is false when the browser lacks WebMCP.
 *
 * @example
 * ```ts
 * type _Alias = WebMCPRegistration;
 * ```
 */
export type WebMCPRegistration = AgentToolRegistration;

/** Options for {@link provideWebMcpTools}. */
export type WebMCPOptions = AgentToolHostOptions;

interface ModelContextTool {
    readonly name: string;
    readonly description: string;
    readonly inputSchema: Record<string, unknown>;
    readonly execute: WebMCPTool['execute'];
    readonly annotations?: WebMCPToolAnnotations;
}

interface ModelContextLike {
    registerTool(
        tool: ModelContextTool,
        options?: { readonly signal?: AbortSignal; readonly exposedTo?: readonly string[] }
    ): Promise<void>;
}

function getModelContext(): ModelContextLike | undefined {
    if (typeof document === 'undefined') return undefined;
    const candidate: unknown = document;
    if (typeof candidate !== 'object' || candidate === null || !('modelContext' in candidate)) return undefined;
    const context = candidate.modelContext;
    if (typeof context !== 'object' || context === null || !('registerTool' in context)) return undefined;
    if (typeof context.registerTool !== 'function') return undefined;
    // The WebMCP API is not in lib.dom yet; the shape above matches the spec.
    return context as unknown as ModelContextLike;
}

/**
 * Registers one WebMCP tool. Unsupported browsers return a no-op registration.
 *
 * @param tool - The tool definition.
 * @param options - Optional external cancellation signal.
 * @returns The registration handle.
 *
 * @example
 * ```ts
 * declareWebMcpTool();
 * ```
 */
export async function declareWebMcpTool(tool: WebMCPTool, options: WebMCPOptions = {}): Promise<WebMCPRegistration> {
    return provideWebMcpTools([tool], options);
}

/**
 * Registers a set of WebMCP tools under one AbortController.
 *
 * @param tools - The tools to register.
 * @param options - Optional external cancellation signal.
 * @returns The registration handle; `dispose()` aborts the internal signal.
 *
 * @example
 * ```ts
 * provideWebMcpTools();
 * ```
 */
export async function provideWebMcpTools(
    tools: readonly WebMCPTool[],
    options: WebMCPOptions = {}
): Promise<WebMCPRegistration> {
    const context = getModelContext();
    const controller = options.signal === undefined ? new AbortController() : undefined;
    const signal = options.signal ?? controller?.signal;
    if (context === undefined) {
        return { supported: false, dispose: () => controller?.abort() };
    }
    try {
        await Promise.all(
            tools.map((tool) => {
                const { exposedTo, ...definition } = tool;
                return context.registerTool(definition, {
                    ...(signal === undefined ? {} : { signal }),
                    ...(exposedTo === undefined ? {} : { exposedTo }),
                });
            })
        );
    } catch (error) {
        controller?.abort();
        throw error;
    }
    return { supported: true, dispose: () => controller?.abort() };
}

/**
 * The WebMCP adapter over the neutral {@link AgentToolHost} contract — the
 * first host adapter. Code that registers tools through this binding is
 * host-agnostic: the planned UI SDK adapter implements the same contract, so
 * the swap replaces this object and nothing else.
 */
export const webMcpAgentHost: AgentToolHost = {
    registerTools: (tools, options) => provideWebMcpTools(tools, options),
};

/** Options for {@link webMcpToolForHandler}. */
export interface WebMCPHandlerToolOptions {
    /** The handler instance (or class instance) carrying `@parameters`. */
    readonly handler: object;
    /** The decorated method name. */
    readonly method: string;
    /** WebMCP tool name. */
    readonly name: string;
    /** Tool description. */
    readonly description: string;
    /** Read-only hint. */
    readonly readOnly?: boolean;
    /** Additional safety hints. */
    readonly annotations?: WebMCPToolAnnotations;
    /** Origins allowed to use the tool. */
    readonly exposedTo?: readonly string[];
}

/**
 * Projects a handler method and its `@parameters`/`validatedBy` metadata into
 * a WebMCP tool. Arguments are validated with the same extractor converters
 * the HTTP route uses, then passed to the method as one object.
 *
 * @param options - Handler, method, and tool description.
 * @returns The WebMCP tool.
 * @throws When the method does not exist.
 *
 * @example
 * ```ts
 * webMcpToolForHandler();
 * ```
 */
export function webMcpToolForHandler(options: WebMCPHandlerToolOptions): WebMCPTool {
    const handler = options.handler as Record<string, unknown>;
    const method = handler[options.method];
    if (typeof method !== 'function') {
        throw new TypeError(`webMcpToolForHandler: '${options.method}' is not a method on the handler.`);
    }
    const parameters = resolveParameters(options.handler, options.method, method as (...args: unknown[]) => unknown);
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const parameter of parameters) {
        const key = parameterKey(parameter);
        if (key === '') continue;
        properties[key] = parameter.schema === undefined ? fallbackSchema(parameter) : jsonSchema(parameter.schema);
        if (parameter.required) required.push(key);
    }
    return {
        name: options.name,
        description: options.description,
        inputSchema: {
            type: 'object',
            properties,
            ...(required.length === 0 ? {} : { required: [...new Set(required)] }),
        },
        annotations: {
            ...options.annotations,
            ...(options.readOnly === undefined ? {} : { readOnlyHint: options.readOnly }),
        },
        ...(options.exposedTo === undefined ? {} : { exposedTo: options.exposedTo }),
        execute: (args) => {
            const values = parameters.map((parameter) => {
                const key = parameterKey(parameter);
                if (key === '') return undefined;
                const value = args[key];
                const converted = parameter.convert === undefined ? value : parameter.convert(value);
                if (parameter.schema === undefined) return converted;
                const result = parameter.schema.safeParse(converted);
                if (result.success) return result.data;
                const issues = result.error.issues
                    .map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`)
                    .join(', ');
                throw new TypeError(`WebMCP argument '${key}' does not match its schema: ${issues}`);
            });
            return (method as (...args: unknown[]) => unknown).apply(options.handler, values);
        },
    };
}

/**
 * The element base contract the WebMCP mixin requires: a host element with the
 * optional custom-element lifecycle callbacks the mixin chains into.
 *
 * @example
 * ```ts
 * const value = {} as WebMCPElementBase;
 * ```
 */
export interface WebMCPElementBase extends HTMLElement {
    /** Custom-element connect hook, when the base class defines one. */
    connectedCallback?(): void;
    /** Custom-element disconnect hook, when the base class defines one. */
    disconnectedCallback?(): void;
}

/**
 * Mixin that registers an element's WebMCP tools on connect and aborts them on
 * disconnect. Subclasses implement {@link WebMCPElement.webMcpTools}; they can
 * read dependencies from `this.applicationContext` on `AbstractWebComponent`.
 *
 * @param superclass - The element base class.
 * @returns A subclass with the WebMCP lifecycle.
 *
 * @example
 * ```ts
 * AsWebMCPElement();
 * ```
 */

export function AsWebMCPElement<T extends Constructable<WebMCPElementBase>>(
    superclass: T
): T & Constructable<WebMCPElementBase & WebMCPElement> {
    return class extends superclass implements WebMCPElement {
        #registration: WebMCPRegistration | undefined;

        /** The tools this element exposes while connected. */
        webMcpTools(): readonly WebMCPTool[] {
            return [];
        }

        override connectedCallback(): void {
            super.connectedCallback?.();
            void this.#register();
        }

        override disconnectedCallback(): void {
            this.#registration?.dispose();
            this.#registration = undefined;
            super.disconnectedCallback?.();
        }

        async #register(): Promise<void> {
            const registration = await provideWebMcpTools(this.webMcpTools());
            if (!this.isConnected) {
                registration.dispose();
                return;
            }
            this.#registration?.dispose();
            this.#registration = registration;
        }
    };
}

/** The element contract added by {@link AsWebMCPElement}. */
export interface WebMCPElement {
    /** The tools this element exposes while connected. */
    webMcpTools(): readonly WebMCPTool[];
}

function parameterKey(parameter: MethodParameter): string {
    return parameter.parameterName.length > 0 ? parameter.parameterName : parameter.name;
}

function jsonSchema(schema: z.ZodType<unknown>): Record<string, unknown> {
    const converted = z.toJSONSchema(schema, { target: 'draft-2020-12' }) as Record<string, unknown>;
    const { $schema: _schema, ...embedded } = converted;
    return embedded;
}

function fallbackSchema(parameter: MethodParameter): Record<string, unknown> {
    const target = parameter.convertType?.target;
    if (target === Number) return { type: 'number' };
    if (target === Boolean) return { type: 'boolean' };
    if (target === Date) return { type: 'string', format: 'date-time' };
    if (target === Array) return { type: 'array', items: { type: 'string' } };
    return { type: 'string' };
}
