/**
 * Server-side authentication: adapters, session stores, and route guards.
 *
 * Provides credentials/JWT adapters, in-memory session/user stores, and
 * route guards for securing server endpoints.
 */
export * from './server';
export * from './route-guard';
export * from './route-matrix-guard';
export * from './jwt-adapter';
export * from './in-memory-session-store';
export * from './in-memory-user-store';
export * from './credentials-auth-adapter';
export * from './aware';
export * from './context-tokens';
export * from './auth-auto-configuration';
