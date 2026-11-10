/**
 * WebMCP tool declaration for browser components: feature-detected
 * `document.modelContext.registerTool`, AbortSignal lifecycle, and schema
 * projection from the same `@parameters` + `validatedBy` metadata the HTTP
 * route and MCP tool use.
 */
import { type Constructable } from '@ndigo/core';
import { type MethodParameter, resolveParameters } from '@ndigo/dispatcher';
import { z } from 'zod';

/** Safety hints understood by WebMCP hosts. */
export interface WebMcpToolAnnotations {
    /** The tool only reads state. */
    readonly readOnlyHint?: boolean;
    /** The output contains third-party/user content. */
    readonly untrustedContentHint?: boolean;
    /** The action is significant or hard to reverse. */
    readonly consequentialHint?: boolean;
    /** The tool exists for developer tooling only. */
    readonly debugging?: boolean;
}

/** A tool registered with the browser's model context. */
export interface WebMcpTool {
    /** Tool name (unique per document origin). */
    readonly name: string;
    /** What the tool does and when to use it. */
    readonly description: string;
    /** JSON Schema for the arguments. */
    readonly inputSchema: Record<string, unknown>;
    /** Executes the tool; the second argument carries the cancellation signal. */
    readonly execute: (
        args: Record<string, unknown>,
        context: { readonly signal: AbortSignal }
    ) => unknown | Promise<unknown>;
    /** Safety hints. */
    readonly annotations?: WebMcpToolAnnotations;
    /** Origins allowed to see and execute the tool (secure origins only). */
    readonly exposedTo?: readonly string[];
}

/** Registration outcome. `supported` is false when the browser lacks WebMCP. */
export interface WebMcpRegistration {
    /** Whether `document.modelContext` was available. */
    readonly supported: boolean;
    /** Unregisters the tools (aborts the internal controller). */
    dispose(): void;
}

/** Options for {@link provideWebMcpTools}. */
export interface WebMcpOptions {
    /** External cancellation signal; when supplied, `dispose` cannot abort it. */
    readonly signal?: AbortSignal;
}

interface ModelContextTool {
    readonly name: string;
    readonly description: string;
    readonly inputSchema: Record<string, unknown>;
    readonly execute: WebMcpTool['execute'];
    readonly annotations?: WebMcpToolAnnotations;
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
 */
export async function declareWebMcpTool(tool: WebMcpTool, options: WebMcpOptions = {}): Promise<WebMcpRegistration> {
    return provideWebMcpTools([tool], options);
}

/**
 * Registers a set of WebMCP tools under one AbortController.
 *
 * @param tools - The tools to register.
 * @param options - Optional external cancellation signal.
 * @returns The registration handle; `dispose()` aborts the internal signal.
 */
export async function provideWebMcpTools(
    tools: readonly WebMcpTool[],
    options: WebMcpOptions = {}
): Promise<WebMcpRegistration> {
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

/** Options for {@link webMcpToolForHandler}. */
export interface WebMcpHandlerToolOptions {
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
    readonly annotations?: WebMcpToolAnnotations;
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
 */
export function webMcpToolForHandler(options: WebMcpHandlerToolOptions): WebMcpTool {
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
                const value = key === '' ? undefined : args[key];
                return parameter.convert === undefined ? value : parameter.convert(value);
            });
            return (method as (...args: unknown[]) => unknown).apply(options.handler, values);
        },
    };
}

/**
 * The element base contract the WebMCP mixin requires: a host element with the
 * optional custom-element lifecycle callbacks the mixin chains into.
 */
export interface WebMcpElementBase extends HTMLElement {
    /** Custom-element connect hook, when the base class defines one. */
    connectedCallback?(): void;
    /** Custom-element disconnect hook, when the base class defines one. */
    disconnectedCallback?(): void;
}

/**
 * Mixin that registers an element's WebMCP tools on connect and aborts them on
 * disconnect. Subclasses implement {@link WebMcpElement.webMcpTools}; they can
 * read dependencies from `this.applicationContext` on `AbstractWebComponent`.
 *
 * @param superclass - The element base class.
 * @returns A subclass with the WebMCP lifecycle.
 */

export function AsWebMcpElement<T extends Constructable<WebMcpElementBase>>(
    superclass: T
): T & Constructable<WebMcpElementBase & WebMcpElement> {
    return class extends superclass implements WebMcpElement {
        #registration: WebMcpRegistration | undefined;

        /** The tools this element exposes while connected. */
        webMcpTools(): readonly WebMcpTool[] {
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

/** The element contract added by {@link AsWebMcpElement}. */
export interface WebMcpElement {
    /** The tools this element exposes while connected. */
    webMcpTools(): readonly WebMcpTool[];
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
