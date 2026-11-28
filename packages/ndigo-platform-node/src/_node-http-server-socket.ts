/**
 * WebSocket upgrade dispatch for the Node HTTP server adapter: parameter
 * binding, authentication, session tracking, and handler pumping.
 */
import type {
    MethodParameter,
    HandlerMethodArgumentResolver,
    SocketRequestSources,
    SocketSession,
} from '@ndigo/dispatcher';
import { ARGUMENT_RESOLVERS, MethodParameterType } from '@ndigo/dispatcher';
import type { WebSocket } from 'ws';
import { getLogger } from '@ndigo/log';
import type { NodeDispatcher } from './node-dispatcher.js';
import { nodeSocketSession, type ResolvedSocketLimits } from './node-socket-session.js';
import type { NodeSocketSessionRegistry } from './node-socket-session-registry.js';
import type { NodeHTTPServerAdapterOptions } from './node-http-server-adapter-options.js';
import { likeRolePrincipal, likeScopePrincipal } from './node-http-server-adapter-options.js';
import { pumpFunction, socketAuthRequirements } from './_node-http-server-socket-support.js';
import type { Route } from '@ndigo/router';
import { ACCEPT_LANGUAGE_ATTRIBUTE, REQUESTED_THEME_ATTRIBUTE } from '@ndigo/router';
import { NODE_REQUEST_ATTRIBUTE } from './node-request.js';
import { HTTPHeaders } from '@ndigo/http';
import { THEME_COOKIE_NAME } from './node-http-server-adapter-options.js';

const logger = getLogger('ndigo-platform-node:node-http-server-adapter');

/** A resolved socket-mapped handler. */
export interface SocketHandlerTarget {
    instance: object;
    method: string;
    parameters: MethodParameter[];
    pathParams: Record<string, string>;
}

/** The adapter state socket dispatch reads and mutates. */
export interface NodeSocketDispatchHost {
    /** The dispatcher (handler mapping and context). */
    readonly dispatcher: NodeDispatcher;
    /** Session registry. */
    readonly socketRegistry: NodeSocketSessionRegistry;
    /** Socket transport bounds. */
    readonly socketLimits: ResolvedSocketLimits;
    /** Upgrade-time identity hook. */
    readonly authenticate: NodeHTTPServerAdapterOptions['authenticate'];
    /** Upgrade-authentication budget in ms. */
    readonly authenticateTimeoutMs: number;
    /** Admitted upgrades (the connection ledger). */
    readonly openConnections: Set<unknown>;
    /** Concurrent-connection cap. */
    readonly maxConnections: number;
    /** Resolves a socket-mapped handler for the path. */
    findSocketHandler(path: string, query?: Record<string, string | string[]>): SocketHandlerTarget | null;
}

/** Dispatches socket-mapped handlers for accepted upgrades. */
export class NodeSocketDispatcher {
    readonly #host: NodeSocketDispatchHost;

    /**
     * @param host - The adapter state dispatch reads.
     */
    constructor(host: NodeSocketDispatchHost) {
        this.#host = host;
    }

    /**
     * Resolve a socket method's `@parameters` against the upgrade request
     * sources, through the same argument resolvers the HTTP path uses.
     *
     * Each declared parameter is resolved by its supporting resolver
     * (`queryValue` → query string, `pathVariable` → path segment, `headerValue`
     * / `cookieValue` → handshake sources) and the value is coerced/validated
     * (including Zod hooks). A missing required parameter closes the socket
     * with `1008` (policy violation) instead of invoking the handler.
     *
     * @param parameters - The socket method's `@parameters`.
     * @param pathParams - Path-segment values captured from the mapping match.
     * @param sources - The upgrade request sources.
     * @returns The resolved param values keyed by extractor name.
     */
    #socketRoute(parameter: MethodParameter, pathParams: Record<string, string>, sources: SocketRequestSources): Route {
        return {
            path: '',
            raw: '',
            data: sources.query,
            params: pathParams,
            id: crypto.randomUUID(),
            attributes: {
                [NODE_REQUEST_ATTRIBUTE]: {
                    headers: sources.headers,
                    body: {},
                    cookies: sources.cookies,
                    session: {},
                },
                [ACCEPT_LANGUAGE_ATTRIBUTE]: HTTPHeaders.ACCEPT_LANGUAGE.get(sources.headers) ?? undefined,
                [REQUESTED_THEME_ATTRIBUTE]: sources.cookies[THEME_COOKIE_NAME],
            },
            length: 0,
        };
    }

    #findResolver(parameter: MethodParameter): HandlerMethodArgumentResolver | undefined {
        const context = this.#host.dispatcher.applicationContext;
        if (!context) return undefined;
        const resolvers =
            (context.hasValue?.(ARGUMENT_RESOLVERS) ? context.getValue(ARGUMENT_RESOLVERS) : undefined) ?? [];
        return resolvers.find((candidate) => candidate.supportsParameter(parameter));
    }

    /**
     * Dispatch an upgraded WebSocket to its socket-mapped handler.
     *
     * Builds a `SocketSession` from the `ws` connection, invokes the handler
     * (an async-iterable producer-consumer), and drains inbound + yields
     * outbound until the connection closes.
     *
     * Fail-closed paths: an upgrade over {@link
     * NodeHTTPServerAdapterOptions.maxConnections} closes `1013`; a missing
     * required `@parameters` value, a rejecting `authenticate` hook, or an
     * unmet `@authenticated`/`@authorized` requirement closes `1008`; a
     * throwing or timing-out hook closes `1011`.
     *
     * @param rawWs - The upgraded `ws` connection.
     * @param path - The socket-mapped request path.
     * @param sources - Query/headers/cookies captured from the handshake.
     */
    async dispatchSocket(rawWs: unknown, path: string, sources: SocketRequestSources): Promise<void> {
        // The `ws` server hands us a `WebSocket` (RFC 6455 connection) which
        // we only partially surface through SocketSession; the structural
        // surface is all we touch, so a boundary cast to the library type is
        // deliberate (the upgrade path is the only wire into this hook).
        const ws = rawWs as WebSocket;
        // The connection cap is counted from the accepted upgrade
        // until the socket closes — sockets still resolving parameters or
        // awaiting authentication hold a slot, which the registry (registered
        // later) does not yet account for.
        if (this.#host.openConnections.size >= this.#host.maxConnections) {
            ws.close(1013, 'connection limit reached');
            return;
        }
        this.#host.openConnections.add(ws);
        ws.once('close', () => this.#host.openConnections.delete(ws));
        const target = this.#host.findSocketHandler(path, sources.query);
        if (!target) {
            ws.close(1011, 'no socket handler');
            return;
        }
        // Bind @parameters positionally (validated, coerced — including Zod):
        // a socketSessionValue() extractor yields the session; the other extractors
        // resolve against the upgrade sources. The handler is invoked with the
        // declared args in signature order — no implicit session injection.
        const args: unknown[] = [];
        let session: SocketSession | null = null;
        if (target.parameters.length > 0) {
            try {
                for (const param of target.parameters) {
                    if (param.type === MethodParameterType.SOCKET_SESSION) {
                        session = nodeSocketSession(
                            ws,
                            path,
                            sources,
                            this.#host.socketRegistry,
                            this.#host.socketLimits
                        );
                        args.push(session);
                    } else {
                        const resolver = this.#findResolver(param);
                        if (resolver)
                            args.push(
                                resolver.resolveArgument(
                                    param,
                                    this.#socketRoute(param, target.pathParams, sources),
                                    null
                                )
                            );
                        else args.push(undefined);
                    }
                }
            } catch {
                ws.close(1008, 'missing required parameter');
                return;
            }
        }
        if (!session)
            session = nodeSocketSession(ws, path, sources, this.#host.socketRegistry, this.#host.socketLimits);
        // Attach the removal listener before any await: a peer closing while
        // authentication is pending must not leave a registry entry for a
        // dead session (remove is idempotent, so this also covers the
        // register below). The close code flows into `remove` for
        // observability (e.g. 1013 backpressure closes) and socket telemetry.
        ws.on('close', (code: number) => this.#host.socketRegistry.remove(session, code));
        // Upgrade-time authentication: the adapter-level hook binds identity
        // before the handler runs (REST gets this via the interceptor chain;
        // sockets are dispatched directly, so this is the auth seam). A null
        // result rejects with 1008; an async hook is awaited under
        // `authenticateTimeoutMs`. A hook that throws must not become
        // an unhandled rejection (this dispatch is fire-and-forget from the
        // connection event — Node ≥15 terminates on unhandled rejections) —
        // close 1011 instead, as does a hook that never settles. Rejected
        // upgrades are never tracked by the registry or observable to the
        // handler.
        const authenticate = this.#host.authenticate;
        if (authenticate) {
            let attributes: Record<string, unknown> | null;
            let timedOut = false;
            let timer: NodeJS.Timeout | undefined;
            const timeout = new Promise<never>((_resolve, reject) => {
                timer = setTimeout(() => {
                    timedOut = true;
                    reject(new Error('authentication timeout'));
                }, this.#host.authenticateTimeoutMs);
                timer.unref?.();
            });
            try {
                attributes = await Promise.race([authenticate(sources), timeout]);
            } catch {
                ws.close(1011, timedOut ? 'authentication timeout' : 'authentication failed');
                return;
            } finally {
                clearTimeout(timer);
            }
            if (attributes === null) {
                ws.close(1008, 'authentication required');
                return;
            }
            Object.assign(session.attributes, attributes);
        }
        if (session.isClosed) {
            // Closed while authentication was pending — the close listener
            // above already removed it from the registry.
            return;
        }
        // SEC-3 (decision D-B): enforce the `@authenticated`/`@authorized`
        // metadata on the socket dispatch path. HTTP requests get this from
        // the interceptor chain (`AuthRouteGuard`); sockets are dispatched
        // directly, so without this check the decorators are inert and every
        // socket endpoint is open by construction. The identity source is
        // the `authenticate` hook / `socketRequestAuthenticator` entry whose
        // bag lands in `session.attributes`. No metadata ⇒ unchanged
        // behavior (a public socket endpoint).
        const { requiresAuth, requiredRoles, requiredScopes } = socketAuthRequirements(target);
        if (requiresAuth || requiredRoles.length > 0 || requiredScopes.length > 0) {
            const principal = session.attributes['principal'];
            if (!likeRolePrincipal(principal)) {
                ws.close(1008, 'authentication required');
                return;
            }
            if (requiredRoles.length > 0 && !requiredRoles.every((role) => principal.hasRole(role))) {
                ws.close(1008, 'insufficient role');
                return;
            }
            if (
                requiredScopes.length > 0 &&
                (!likeScopePrincipal(principal) || !requiredScopes.every((scope) => principal.hasScope(scope)))
            ) {
                ws.close(1008, 'insufficient scope');
                return;
            }
        }
        // Track the session before the handler runs so broadcasts from the
        // handler (or any service with the registry) reach it immediately;
        // the close event drops it from the registry.
        this.#host.socketRegistry.register(session, path, ws);
        const handlerMethod = (target.instance as Record<string, unknown>)[target.method] as unknown;
        if (typeof handlerMethod !== 'function') {
            ws.close(1011, 'socket handler is not a function');
            return;
        }
        try {
            const result: unknown = handlerMethod.call(target.instance, ...args);
            // Async-generator handler: pump inbound → yielded outbound until
            // the stream (connection) ends.
            if (
                result &&
                typeof (result as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === 'function'
            ) {
                await pumpFunction(result as AsyncGenerator<unknown>, session);
            } else if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
                // Broadcast-style handler (e.g. the chat demo's `async`
                // handler that consumes `session.messages` without yielding):
                // a Promise must be awaited and its rejection routed to the
                // session-close path — otherwise it becomes an unhandled
                // rejection and Node ≥15 terminates the process.
                await (result as Promise<unknown>);
            }
        } catch (error) {
            logger.error(`handler failed: ${(error as Error).message}`);
            session.close(1011, 'handler error');
        }
    }
}
