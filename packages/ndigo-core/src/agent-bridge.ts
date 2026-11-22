/**
 * The agent-bridge contract: the neutral vocabulary for exposing application
 * tools to an agent host, and the in-page bridge surface a complete adapter
 * provides.
 *
 * The browser implementation today is the WebMCP adapter in
 * `@ndigo/view-webcomponent`; the planned UI SDK adapter implements the same
 * types, so application code written against this contract survives the swap.
 * Adapters map the host's own shapes onto these — the contract stays stable
 * while hosts come and go.
 */

/**
 * Safety hints understood by agent hosts.
 *
 * @example
 * ```ts
 * const annotations: AgentToolAnnotations = { readOnlyHint: true };
 * ```
 */
export interface AgentToolAnnotations {
    /** The tool only reads state. */
    readonly readOnlyHint?: boolean;
    /** The output contains third-party or user content. */
    readonly untrustedContentHint?: boolean;
    /** The action is significant or hard to reverse. */
    readonly consequentialHint?: boolean;
    /** The tool exists for developer tooling only. */
    readonly debugging?: boolean;
}

/**
 * A tool an agent host can call.
 *
 * @example
 * ```ts
 * const tool: AgentTool = {
 *     name: 'search-orders',
 *     description: 'Search orders by customer id',
 *     inputSchema: { type: 'object', properties: { customerId: { type: 'string' } } },
 *     execute: async (args, context) => ({ orders: [] }),
 * };
 * ```
 */
export interface AgentTool {
    /** Tool name (unique per host and origin). */
    readonly name: string;
    /** What the tool does and when to use it. */
    readonly description: string;
    /** JSON Schema for the arguments. */
    readonly inputSchema: Record<string, unknown>;
    /** Executes the tool; the context carries the cancellation signal. */
    readonly execute: (
        args: Record<string, unknown>,
        context: { readonly signal: AbortSignal }
    ) => unknown | Promise<unknown>;
    /** Safety hints. */
    readonly annotations?: AgentToolAnnotations;
    /** Origins allowed to see and execute the tool, when the host scopes them. */
    readonly exposedTo?: readonly string[];
}

/**
 * The outcome of a tool registration; `supported` is false when the host is absent.
 *
 * @example
 * ```ts
 * const registration: AgentToolRegistration = { supported: true, dispose: () => {} };
 * ```
 */
export interface AgentToolRegistration {
    /** Whether the host was available and the tools registered. */
    readonly supported: boolean;
    /** Unregisters the tools (aborts the registration's controller). */
    dispose(): void;
}

/**
 * Options for {@link AgentToolHost.registerTools}.
 *
 * @example
 * ```ts
 * const host = new AgentHost();
 * const registration = await host.registerTools(tools, { signal: controller.signal });
 * ```
 */
export interface AgentToolHostOptions {
    /** External cancellation signal; when supplied, `dispose` cannot abort it. */
    readonly signal?: AbortSignal;
}

/**
 * The host-side registration contract: any agent host an adapter can register
 * tools with — the browser's model context today, a UI SDK bridge later.
 *
 * @example
 * ```ts
 * const host: AgentToolHost = {
 *     registerTools: async (tools) => ({ supported: true, dispose: () => {} }),
 * };
 * ```
 */
export interface AgentToolHost {
    /**
     * Registers the tools with the host.
     *
     * @param tools - The tools to register.
     * @param options - Optional external cancellation signal.
     * @returns The registration handle; `dispose()` unregisters the tools.
     */
    registerTools(tools: readonly AgentTool[], options?: AgentToolHostOptions): Promise<AgentToolRegistration>;
}

/**
 * An entity an agent can see in {@link AgentBridge.snapshot}.
 *
 * @example
 * ```ts
 * const entity: AgentEntity = { ref: 'order:1234', component: 'order-card', label: 'Order 1234' };
 * ```
 */
export interface AgentEntity {
    /** Stable reference used in {@link AgentStep.ref}. */
    readonly ref: string;
    /** Component kind, when known (for example the custom-element tag name). */
    readonly component?: string;
    /** Accessible name. */
    readonly label?: string;
    /** Public value, when the entity exposes one. */
    readonly value?: unknown;
    /** Action names the entity accepts. */
    readonly actions?: readonly string[];
}

/**
 * One step of {@link AgentBridge.act}.
 *
 * @example
 * ```ts
 * const step: AgentStep = { ref: 'order:1234', action: 'cancel', args: ['reason'] };
 * ```
 */
export interface AgentStep {
    /** The entity's ref or unique label. */
    readonly ref: string;
    /** The action name, as listed in the entity's `actions`. */
    readonly action: string;
    /** Positional arguments for the action. */
    readonly args?: readonly unknown[];
}

/**
 * The result of {@link AgentBridge.act}.
 *
 * @example
 * ```ts
 * const result: AgentActResult = { ok: true };
 * ```
 */
export interface AgentActResult {
    /** Whether every step applied. */
    readonly ok: boolean;
    /** Why the failed step failed, when `ok` is false. */
    readonly error?: string;
    /** Zero-based index of the failed step, when `ok` is false. */
    readonly failedStep?: number;
}

/**
 * An item of a closed-choice entity.
 *
 * @example
 * ```ts
 * const item: AgentItem = { value: 'eu-west', label: 'EU West' };
 * ```
 */
export interface AgentItem {
    /** The item's value. */
    readonly value: string;
    /** The human-readable label, when it differs from the value. */
    readonly label?: string;
}

/**
 * A filter for {@link AgentBridge.query}.
 *
 * @example
 * ```ts
 * const query: AgentQuery = { text: 'order', kind: 'order-card' };
 * ```
 */
export interface AgentQuery {
    /** Restrict the matches to the entity with this ref or label. */
    readonly within?: string;
    /** Text to match in labels and item labels (whole words, case-insensitive). */
    readonly text?: string;
    /** Restrict the matches to one component kind. */
    readonly kind?: string;
}

/**
 * A match returned by {@link AgentBridge.query}.
 *
 * @example
 * ```ts
 * const match: AgentQueryMatch = { ref: 'order:1234', label: 'Order 1234' };
 * ```
 */
export interface AgentQueryMatch {
    /** The matched entity's ref. */
    readonly ref: string;
    /** The entity's label, when it has one. */
    readonly label?: string;
    /** The entity's items, when it has a closed set of choices. */
    readonly items?: readonly AgentItem[];
}

/**
 * The in-page agent bridge: what a complete adapter (the planned UI SDK
 * adapter included) provides. The read and act verbs let an agent inspect and
 * operate the page's entities; {@link AgentToolHost.registerTools} exposes the
 * same page as callable tools.
 *
 * @example
 * ```ts
 * const entities = bridge.snapshot();
 * const matches = bridge.query({ text: 'order' });
 * const result = await bridge.act([{ ref: 'order:1234', action: 'cancel' }]);
 * ```
 */
export interface AgentBridge extends AgentToolHost {
    /** Lists the entities an agent can see right now. */
    snapshot(): readonly AgentEntity[];
    /**
     * Finds entities or their items by label, text, or kind.
     *
     * @param query - The filter constraining the search.
     * @returns The matching entities, or an error payload when the query cannot be served.
     */
    query(query: AgentQuery): readonly AgentQueryMatch[] | { readonly error: string };
    /**
     * Applies steps in order through the entities' action APIs.
     *
     * @param steps - The ordered steps to apply.
     * @returns The outcome; `ok` is false when a step failed.
     */
    act(steps: readonly AgentStep[]): Promise<AgentActResult>;
}
