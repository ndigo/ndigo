/**
 * Context tokens for `@ndigo/socket`.
 */
import { ContextToken } from '@ndigo/factory';
import type { SocketSessionRegistry } from './socket-session-registry';

/**
 * Token for the application's shared {@link SocketSessionRegistry} entry.
 * `NodeAutoConfiguration` registers the platform implementation under the
 * matching `'socketSessionRegistry'` description; consumers resolve it with
 * `context.getValue(SOCKET_SESSION_REGISTRY)` (or receive it via
 * `SocketSessionRegistryAware`).
 */
export const SOCKET_SESSION_REGISTRY = new ContextToken<SocketSessionRegistry>('socketSessionRegistry');
