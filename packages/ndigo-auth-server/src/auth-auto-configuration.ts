/**
 * Auto-configuration for authentication defaults.
 */
import { configuration, entry, AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { ScryptPasswordEncoder } from '@ndigo/auth-core';
import { InMemorySessionStore } from './in-memory-session-store';
import { InMemoryUserStore } from './in-memory-user-store';
import { AuthServer } from './server';
import { AUTH_SERVER, PASSWORD_ENCODER, SESSION_STORE, USER_STORE } from './context-tokens';

/**
 * Auto-configuration for authentication defaults.
 */
/**
 * AuthAutoConfiguration.
 *
 * @example
 * ```ts
 * const instance = new AuthAutoConfiguration();
 * ```
 */
@configuration
export class AuthAutoConfiguration extends AsApplicationContextAware(Null) {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * @returns The string "AuthAutoConfiguration".
     */
    get [Symbol.toStringTag](): string {
        return 'AuthAutoConfiguration';
    }

    /** The owning application context (container-injected). */
    readonly applicationContext!: ApplicationContext;

    /**
     * Registers the default in-memory session store.
     *
     * @returns The session store.
     */
    @entry(SESSION_STORE)
    sessionStore(): InMemorySessionStore {
        return new InMemorySessionStore();
    }

    /**
     * Registers the default in-memory user store.
     *
     * @returns The user store.
     */
    @entry(USER_STORE)
    userStore(): InMemoryUserStore {
        return new InMemoryUserStore();
    }

    /**
     * Registers the default scrypt password encoder.
     *
     * @returns The password encoder.
     */
    @entry(PASSWORD_ENCODER)
    passwordEncoder(): ScryptPasswordEncoder {
        return new ScryptPasswordEncoder();
    }

    /**
     * Registers the auth server coordinator.
     *
     * @returns The auth server.
     */
    @entry(AUTH_SERVER)
    authServer(): AuthServer {
        return new AuthServer();
    }
}
