/**
 * Type-safe entry handles for the Node platform's shared entries (AD-34 D1).
 */
import { ContextToken } from '@ndigo/factory';
import type { ConversionService } from '@ndigo/core';
import type { HTTPServer } from './http-server';
import type { NodeSocketSessionRegistry } from './node-socket-session-registry';
import type { SocketRequestAuthenticator } from './node-http-server-adapter';
import type { FlagEvaluationContextResolver } from './flag-context-resolver';

/**
 * Token for the managed {@link HTTPServer} entry.
 */
export const HTTP_SERVER = new ContextToken<HTTPServer>('httpServer');

/**
 * Token for the shared WebSocket session registry entry (AD-21).
 */
export const SOCKET_SESSION_REGISTRY = new ContextToken<NodeSocketSessionRegistry>('socketSessionRegistry');

/**
 * Token for the socket upgrade authenticator entry (SEC-3).
 */
export const SOCKET_REQUEST_AUTHENTICATOR = new ContextToken<SocketRequestAuthenticator>('socketRequestAuthenticator');

/**
 * Token for the flag targeting-context resolver entry (AD-87 companion):
 * the default resolves the session-bag principal, then the client address.
 */
export const FLAG_CONTEXT_RESOLVER = new ContextToken<FlagEvaluationContextResolver>('flagContextResolver');

/**
 * Token for the shared conversion service entry (schema targets included,
 * AD-38) — leaf conversions and schema-driven DTO projection in one entry.
 */
export const CONVERSION_SERVICE = new ContextToken<ConversionService>('conversionService');
