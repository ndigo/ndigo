/**
 * Aware mixins for `@ndigo/auth-server` entries.
 */
import { Constructable } from '@ndigo/core';
import { Aware, AsAware, likeAwareAnd } from '@ndigo/factory';
import { like } from '@ndigo/util/types';
import type { AuthServer } from './server';
import type { PasswordEncoder } from '@ndigo/auth-core';
import type { SessionStore } from '@ndigo/auth-core';
import type { UserStore } from '@ndigo/auth-core';

/**
 * Marks an object that can receive an {@link AuthServer}.
 */
export interface AuthServerAware extends Aware {
    /**
     * Sets the auth server used by the receiver.
     *
     * @param authServer - The auth server to attach.
     */
    setAuthServer(authServer: AuthServer): void;
}

/**
 * Mixes auth-server awareness into a base class.
 *
 * @param superclass - Base class to extend.
 * @returns A subclass that can receive an auth server.
 */
export const AsAuthServerAware = <T extends Constructable>(superclass: T): Constructable<AuthServerAware> & T =>
    class extends AsAware(superclass) implements AuthServerAware {
        authServer: AuthServer | null = null;

        /**
         * Attaches an auth server to the instance.
         *
         * @param authServer - The auth server to store.
         */
        setAuthServer(authServer: AuthServer): void {
            Reflect.defineProperty(this, 'authServer', {
                value: authServer,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

/**
 * Tests whether a value looks like auth-server-aware state.
 *
 * @param value - The candidate value.
 * @returns Whether the value can receive an auth server.
 */
export const likeAuthServerAware = likeAwareAnd(like({ setAuthServer: Function })) as (
    value: unknown
) => value is AuthServerAware;

/**
 * Marks an object that can receive a {@link PasswordEncoder}.
 */
export interface PasswordEncoderAware extends Aware {
    /**
     * Sets the password encoder used by the receiver.
     *
     * @param passwordEncoder - The password encoder to attach.
     */
    setPasswordEncoder(passwordEncoder: PasswordEncoder): void;
}

/**
 * Mixes password-encoder awareness into a base class.
 *
 * @param superclass - Base class to extend.
 * @returns A subclass that can receive a password encoder.
 */
export const AsPasswordEncoderAware = <T extends Constructable>(superclass: T): Constructable<PasswordEncoderAware> & T =>
    class extends AsAware(superclass) implements PasswordEncoderAware {
        passwordEncoder: PasswordEncoder | null = null;

        /**
         * Attaches a password encoder to the instance.
         *
         * @param passwordEncoder - The password encoder to store.
         */
        setPasswordEncoder(passwordEncoder: PasswordEncoder): void {
            Reflect.defineProperty(this, 'passwordEncoder', {
                value: passwordEncoder,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

/**
 * Tests whether a value looks like password-encoder-aware state.
 *
 * @param value - The candidate value.
 * @returns Whether the value can receive a password encoder.
 */
export const likePasswordEncoderAware = likeAwareAnd(like({ setPasswordEncoder: Function })) as (
    value: unknown
) => value is PasswordEncoderAware;

/**
 * Marks an object that can receive a {@link SessionStore}.
 */
export interface SessionStoreAware extends Aware {
    /**
     * Sets the session store used by the receiver.
     *
     * @param sessionStore - The session store to attach.
     */
    setSessionStore(sessionStore: SessionStore): void;
}

/**
 * Mixes session-store awareness into a base class.
 *
 * @param superclass - Base class to extend.
 * @returns A subclass that can receive a session store.
 */
export const AsSessionStoreAware = <T extends Constructable>(superclass: T): Constructable<SessionStoreAware> & T =>
    class extends AsAware(superclass) implements SessionStoreAware {
        sessionStore: SessionStore | null = null;

        /**
         * Attaches a session store to the instance.
         *
         * @param sessionStore - The session store to store.
         */
        setSessionStore(sessionStore: SessionStore): void {
            Reflect.defineProperty(this, 'sessionStore', {
                value: sessionStore,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

/**
 * Tests whether a value looks like session-store-aware state.
 *
 * @param value - The candidate value.
 * @returns Whether the value can receive a session store.
 */
export const likeSessionStoreAware = likeAwareAnd(like({ setSessionStore: Function })) as (
    value: unknown
) => value is SessionStoreAware;

/**
 * Marks an object that can receive a {@link UserStore}.
 */
export interface UserStoreAware extends Aware {
    /**
     * Sets the user store used by the receiver.
     *
     * @param userStore - The user store to attach.
     */
    setUserStore(userStore: UserStore): void;
}

/**
 * Mixes user-store awareness into a base class.
 *
 * @param superclass - Base class to extend.
 * @returns A subclass that can receive a user store.
 */
export const AsUserStoreAware = <T extends Constructable>(superclass: T): Constructable<UserStoreAware> & T =>
    class extends AsAware(superclass) implements UserStoreAware {
        userStore: UserStore | null = null;

        /**
         * Attaches a user store to the instance.
         *
         * @param userStore - The user store to store.
         */
        setUserStore(userStore: UserStore): void {
            Reflect.defineProperty(this, 'userStore', {
                value: userStore,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

/**
 * Tests whether a value looks like user-store-aware state.
 *
 * @param value - The candidate value.
 * @returns Whether the value can receive a user store.
 */
export const likeUserStoreAware = likeAwareAnd(like({ setUserStore: Function })) as (
    value: unknown
) => value is UserStoreAware;