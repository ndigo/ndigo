/**
 * Socket dispatch support: authorization-requirement extraction and
 * async-generator pumping.
 */
import { getSymbolMetadata } from '@ndigo/core';
import { AUTH_REQUIRED_KEY, AUTH_ROLES_KEY, AUTH_SCOPES_KEY } from '@ndigo/auth-core';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-platform-node:node-http-server-adapter');

/**
 * Reads a socket handler's `@authenticated`/`@authorized` metadata — the
 * same `AUTH_REQUIRED_KEY`/`AUTH_ROLES_KEY` contract `AuthRouteGuard`
 * enforces on HTTP requests. Both decorators are class- and
 * method-scoped; the method form writes `${key}:${methodName}` into the
 * class's `Symbol.metadata` record.
 *
 * @param target - The resolved socket handler (controller instance + method name).
 * @returns Whether authentication is required and the roles the principal must hold.
 */
export function socketAuthRequirements(target: { instance: object; method: string }): {
    requiresAuth: boolean;
    requiredRoles: string[];
    requiredScopes: string[];
} {
    const metadata = getSymbolMetadata(target.instance);
    const method = target.method;
    const classRequiresAuth = metadata[AUTH_REQUIRED_KEY] === true;
    const methodRequiresAuth = metadata[`${AUTH_REQUIRED_KEY}:${method}`] === true;
    const classRoles = (metadata[AUTH_ROLES_KEY] as string[] | undefined) ?? [];
    const methodRoles = (metadata[`${AUTH_ROLES_KEY}:${method}`] as string[] | undefined) ?? [];
    const classScopes = (metadata[AUTH_SCOPES_KEY] as string[] | undefined) ?? [];
    const methodScopes = (metadata[`${AUTH_SCOPES_KEY}:${method}`] as string[] | undefined) ?? [];
    return {
        requiresAuth: classRequiresAuth || methodRequiresAuth,
        requiredRoles: [...classRoles, ...methodRoles],
        requiredScopes: [...classScopes, ...methodScopes],
    };
}

/**
 * Drain a socket handler's async generator: each yielded value is sent;
 * the loop ends when the connection closes (the inbound reader completes).
 *
 * @param gen - The handler's async-iterable result.
 * @param session - The session to send/poll.
 */
export async function pumpFunction(
    gen: AsyncGenerator<unknown>,
    session: {
        messages: AsyncIterable<unknown>;
        send(data: unknown): void;
        close(code?: number, reason?: string): void;
    }
): Promise<void> {
    const iterator = gen[Symbol.asyncIterator]();
    try {
        for await (const value of iterator) {
            const outbound = value === undefined ? null : value;
            session.send(outbound);
        }
    } catch (error) {
        // A stream-time failure leaves the session with a dead consumer:
        // close it so the registry drops the session and the inbound
        // queue stops accumulating (the per-yield send tolerance above
        // only applies to individual sends, which send() absorbs).
        logger.error('socket generator error:', (error as Error).message);
        session.close(1011, 'handler error');
    }
}

/**
 * Stops the server gracefully: stop accepting new connections, then wait
 * up to `shutdownTimeoutMs` for in-flight requests to drain before
 * destroying remaining sockets.
 *
 * @returns A promise that resolves once closed.
 */
