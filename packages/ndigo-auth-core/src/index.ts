/**
 * Public API of `@ndigo/auth-core` — principals, sessions, and adapters.
 */
export * from './principal';
export * from './state';
export * from './session';
export * from './adapter';
export * from './registry';
export * from './password-encoder';
export * from './delegating-password-encoder';
export * from './user-store';
export * from './session-store';
export {
    authenticated,
    authorized,
    authorizedScopes,
    AUTH_REQUIRED_KEY,
    AUTH_ROLES_KEY,
    AUTH_SCOPES_KEY,
} from './decorators';
