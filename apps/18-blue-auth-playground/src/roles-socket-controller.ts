/**
 * Mode 3 (socket half) — the same `@authenticated` / `@authorized` contract on a
 * WebSocket endpoint.
 *
 * HTTP gets its authorization from the interceptor chain; sockets are dispatched
 * directly, so `@blue/platform-node` enforces the same metadata at upgrade time
 * against the identity the `socketRequestAuthenticator` bean resolved. The
 * playground's bean validates the handshake credential (`?token=` or
 * `Authorization: Bearer …`) through `AuthServer.validateAny`, so a session id
 * **or** an access token opens this socket.
 *
 * There is no 401/403 on a socket: the denial is the close code. `1008`
 * (“policy violation”) with reason `authentication required` when the handshake
 * carries no valid principal, and `1008` with reason `insufficient role` when it
 * carries one that does not hold `admin`.
 *
 * The handler yields the greeting as its first frame — the socket-side proof
 * that the principal really arrived — then echoes whatever the client sends.
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { authenticated, authorized, type Principal } from '@blue/auth-core';
import { parameters, requestMapping, socketMapping, socketSessionValue, type SocketSession } from '@blue/dispatcher';
import { MODES, principalView } from './api-shape';
import { REQUEST_PRINCIPAL_KEY } from './auth-matrix-guard';

/** The socket's requirement label (also the README's matrix). */
export const SOCKET_REQUIREMENT = '@authenticated + @authorized(admin)';

/** Close code and reasons the socket surface fails closed with. */
export const SOCKET_DENIALS = {
    unauthenticated: { code: 1008, reason: 'authentication required' },
    forbidden: { code: 1008, reason: 'insufficient role' },
} as const;

/**
 * The admin-only socket endpoint: `ws://…/roles/socket?token=<session id | access token>`.
 */
@requestMapping('/roles')
export class RolesSocketController {
    /**
     * `WS /roles/socket` — greeting frame, then echo.
     *
     * @param session - The socket session the adapter built for this connection.
     * @yields The principal greeting, then one frame per inbound message.
     */
    @socketMapping('/socket')
    @authenticated
    @authorized('admin')
    @parameters({ session: socketSessionValue('session') })
    async *socket(session: SocketSession) {
        // The upgrade authenticator's bag lands in `session.attributes`; the
        // adapter only dispatches here after the metadata check passed, so the
        // principal is present by construction.
        const principal = session.attributes[REQUEST_PRINCIPAL_KEY] as Principal | undefined;
        yield {
            mode: MODES.roles,
            surface: 'socket',
            requirement: SOCKET_REQUIREMENT,
            principal: principal === undefined ? null : principalView(principal),
        };
        for await (const message of session.messages) {
            const text = typeof message === 'string' ? message : new TextDecoder().decode(message as Uint8Array);
            yield { echo: text, principalId: principal?.id ?? null };
        }
    }
}
