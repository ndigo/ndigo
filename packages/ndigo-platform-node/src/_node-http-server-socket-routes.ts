/**
 * Socket-handler lookup index for the Node HTTP server adapter.
 */
import { isSocketMapping, type MethodParameter } from '@ndigo/dispatcher';
import type { Route } from '@ndigo/router';
import type { NodeDispatcher } from './node-dispatcher.js';

/** A resolved socket-mapped handler. */
export interface SocketHandlerTarget {
    /** The controller instance. */
    instance: object;
    /** The socket-mapped method name. */
    method: string;
    /** The method's `@parameters` metadata. */
    parameters: MethodParameter[];
    /** Path segments captured by the mapping. */
    pathParams: Record<string, string>;
}

/** Resolves and memoizes socket-mapped handlers by request path. */
export class SocketRouteIndex {
    readonly #dispatcher: NodeDispatcher;
    /** Static-path → has-socket-handler memo (probe cache), cleared on close. */
    #memo: Map<string, boolean> = new Map();

    /**
     * @param dispatcher - The handler-mapping dispatcher.
     */
    constructor(dispatcher: NodeDispatcher) {
        this.#dispatcher = dispatcher;
    }

    /**
     * Whether a path has a socket-mapped handler. Memoized per static path —
     * handler mappings are static for the dispatcher's lifetime, and the
     * HTTP pipeline needs this probe on every request.
     *
     * @param path - The request path.
     * @param parameterized - Whether the matched mapping captured path params.
     * @returns Whether the path resolves to a socket handler.
     */
    has(path: string, parameterized: boolean): boolean {
        if (parameterized) {
            return this.find(path) !== null;
        }
        if (!this.#memo.has(path)) {
            this.#memo.set(path, this.find(path) !== null);
        }
        return this.#memo.get(path) ?? false;
    }

    /**
     * Resolves a controller instance (and its socket method) for a request
     * path, through the dispatcher's handler mapping. The upgrade request's
     * query parameters are parsed into the route's `data` so mapping
     * conditions apply to upgrades exactly as they do to HTTP requests.
     *
     * @param path - The request path (e.g. `/chat/room`).
     * @param query - Parsed query parameters from the upgrade URL.
     * @returns The socket-mapped handler, or `null`.
     */
    find(path: string, query: Record<string, string | string[]> = {}): SocketHandlerTarget | null {
        const route: Route = {
            path,
            raw: path,
            data: query,
            params: null,
            id: crypto.randomUUID(),
            attributes: {},
            length: 0,
        };
        const chain = this.#dispatcher.getHandler(route);
        const handler = chain?.handler;
        if (!handler) return null;
        // The chain's handler wraps the controller instance, the selected
        // method name, and its `@parameters` metadata.
        const candidate = handler as {
            handler: object;
            method: string;
            parameters: MethodParameter[];
        };
        const controller = candidate.handler;
        const methodName = candidate.method;
        if (
            controller &&
            typeof methodName === 'string' &&
            isSocketMapping(Object.getPrototypeOf(controller), methodName)
        ) {
            return {
                instance: controller,
                method: methodName,
                parameters: candidate.parameters ?? [],
                // The mapping mutates the matched route with the path segments.
                pathParams: (route.params as Record<string, string> | null) ?? {},
            };
        }
        return null;
    }

    /** Clears the probe memo (on close). */
    clear(): void {
        this.#memo.clear();
    }
}
