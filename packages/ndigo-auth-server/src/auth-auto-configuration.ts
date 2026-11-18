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

@configuration
export class AuthAutoConfiguration extends AsApplicationContextAware(Null) {
    get [Symbol.toStringTag](): string {
        return 'AuthAutoConfiguration';
    }

    readonly applicationContext!: ApplicationContext;

    @entry(SESSION_STORE)
    sessionStore(): InMemorySessionStore {
        return new InMemorySessionStore();
    }

    @entry(USER_STORE)
    userStore(): InMemoryUserStore {
        return new InMemoryUserStore();
    }

    @entry(PASSWORD_ENCODER)
    passwordEncoder(): ScryptPasswordEncoder {
        return new ScryptPasswordEncoder();
    }

    @entry(AUTH_SERVER)
    authServer(): AuthServer {
        return new AuthServer();
    }
}
