/**
 * Type-safe bean handles for the Node platform's shared beans (AD-34 D1).
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@blue/factory';
import type { HTTPServer } from './http-server';
import type { NodeSocketSessionRegistry } from './node-socket-session-registry';
import type { SocketRequestAuthenticator } from './node-http-server-adapter';

/**
 * Token for the managed {@link HTTPServer} bean.
 */
export const HTTP_SERVER = new ContextToken<HTTPServer>('httpServer');

/**
 * Token for the shared WebSocket session registry bean (AD-21).
 */
export const SOCKET_SESSION_REGISTRY = new ContextToken<NodeSocketSessionRegistry>('socketSessionRegistry');

/**
 * Token for the socket upgrade authenticator bean (SEC-3).
 */
export const SOCKET_REQUEST_AUTHENTICATOR = new ContextToken<SocketRequestAuthenticator>('socketRequestAuthenticator');
