/**
 * `@toolMapping` — declarative MCP tool metadata (AD-96 P3).
 *
 * Passive metadata, like `@whenFeature`: a `Symbol.metadata` key and a reader
 * for the MCP tool projector. The same handler remains a REST route; the
 * decorator only opts it into an agent-facing tool surface.
 */
import '@tsmetadata/polyfill';

/**
 * Metadata key for `@toolMapping`; the method name is appended as
 * `${TOOL_MAPPING_KEY}:<methodName>` (one tool per method).
 */
export const TOOL_MAPPING_KEY = 'mcp:toolMapping';

const toolNamePattern = /^[a-z][a-z0-9_]*$/u;

/** Tool metadata declared by {@link toolMapping}. */
export interface ToolMappingMetadata {
    /** MCP tool name (snake_case); defaults to the method name. */
    readonly name?: string;
    /** One-line tool description; defaults to the route summary. */
    readonly description?: string;
    /** Mark the tool read-only (mutating tools are gated by policy). */
    readonly readOnly?: boolean;
}

/**
 * Marks a handler method as an MCP tool.
 *
 * @param options - Optional name, description, and read-only hint.
 * @returns The method decorator.
 * @throws When the name is not snake_case or the decorator targets a
 *   non-method.
 *
 * @example
 * ```ts
 * class OrdersController {
 *     @getMapping('/:id')
 *     @parameters({ id: pathValue() })
 *     @toolMapping({ name: 'get_order', readOnly: true })
 *     getOrder({ id }: { id: string }): { id: string } {
 *         return { id };
 *     }
 * }
 * ```
 */
export function toolMapping(options: ToolMappingMetadata = {}) {
    const name = options.name;
    if (name !== undefined && !toolNamePattern.test(name)) {
        throw new TypeError(
            `@toolMapping name must be snake_case starting with a letter — received '${String(name)}'.`
        );
    }
    return function (target: unknown, context: ClassMethodDecoratorContext): void {
        void target;
        if (context.kind !== 'method') {
            throw new TypeError(`@toolMapping can only be applied to a method — received '${context.kind}'.`);
        }
        context.metadata[`${TOOL_MAPPING_KEY}:${String(context.name)}`] = options;
    };
}

/**
 * Reads the tool metadata recorded by {@link toolMapping}.
 *
 * @param target - The decorated class constructor or instance.
 * @param methodName - The decorated method name.
 * @returns The metadata, or `undefined` when the method is not a tool.
 */
export function getToolMapping(target: unknown, methodName: string): ToolMappingMetadata | undefined {
    const carrier = (typeof target === 'function' ? target : target?.constructor) as
        | { [Symbol.metadata]?: Record<string, unknown> }
        | undefined;
    return carrier?.[Symbol.metadata]?.[`${TOOL_MAPPING_KEY}:${methodName}`] as ToolMappingMetadata | undefined;
}
