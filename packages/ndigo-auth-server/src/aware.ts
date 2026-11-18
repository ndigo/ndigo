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

export interface AuthServerAware extends Aware {
    setAuthServer(authServer: AuthServer): void;
}
export const AsAuthServerAware = <T extends Constructable>(superclass: T): Constructable<AuthServerAware> & T =>
    class extends AsAware(superclass) implements AuthServerAware {
        authServer: AuthServer | null = null;
        setAuthServer(authServer: AuthServer): void {
            Reflect.defineProperty(this, 'authServer', {
                value: authServer,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };
export const likeAuthServerAware = likeAwareAnd(like({ setAuthServer: Function })) as (
    value: unknown
) => value is AuthServerAware;

export interface PasswordEncoderAware extends Aware {
    setPasswordEncoder(passwordEncoder: PasswordEncoder): void;
}
export const AsPasswordEncoderAware = <T extends Constructable>(
    superclass: T
): Constructable<PasswordEncoderAware> & T =>
    class extends AsAware(superclass) implements PasswordEncoderAware {
        passwordEncoder: PasswordEncoder | null = null;
        setPasswordEncoder(passwordEncoder: PasswordEncoder): void {
            Reflect.defineProperty(this, 'passwordEncoder', {
                value: passwordEncoder,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };
export const likePasswordEncoderAware = likeAwareAnd(like({ setPasswordEncoder: Function })) as (
    value: unknown
) => value is PasswordEncoderAware;

export interface SessionStoreAware extends Aware {
    setSessionStore(sessionStore: SessionStore): void;
}
export const AsSessionStoreAware = <T extends Constructable>(superclass: T): Constructable<SessionStoreAware> & T =>
    class extends AsAware(superclass) implements SessionStoreAware {
        sessionStore: SessionStore | null = null;
        setSessionStore(sessionStore: SessionStore): void {
            Reflect.defineProperty(this, 'sessionStore', {
                value: sessionStore,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };
export const likeSessionStoreAware = likeAwareAnd(like({ setSessionStore: Function })) as (
    value: unknown
) => value is SessionStoreAware;

export interface UserStoreAware extends Aware {
    setUserStore(userStore: UserStore): void;
}
export const AsUserStoreAware = <T extends Constructable>(superclass: T): Constructable<UserStoreAware> & T =>
    class extends AsAware(superclass) implements UserStoreAware {
        userStore: UserStore | null = null;
        setUserStore(userStore: UserStore): void {
            Reflect.defineProperty(this, 'userStore', {
                value: userStore,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };
export const likeUserStoreAware = likeAwareAnd(like({ setUserStore: Function })) as (
    value: unknown
) => value is UserStoreAware;
