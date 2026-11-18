/**
 * Context tokens for `@ndigo/auth-server`.
 */
import { ContextToken } from '@ndigo/factory';
import type { AuthServer } from './server';
import type { PasswordEncoder } from '@ndigo/auth-core';
import type { SessionStore } from '@ndigo/auth-core';
import type { UserStore } from '@ndigo/auth-core';

/**
 * Token for the application's shared {@link AuthServer} entry.
 */
export const AUTH_SERVER = new ContextToken<AuthServer>('authServer');

/**
 * Token for the application's shared {@link PasswordEncoder} entry.
 */
export const PASSWORD_ENCODER = new ContextToken<PasswordEncoder>('passwordEncoder');

/**
 * Token for the application's shared {@link SessionStore} entry.
 */
export const SESSION_STORE = new ContextToken<SessionStore>('sessionStore');

/**
 * Token for the application's shared {@link UserStore} entry.
 */
export const USER_STORE = new ContextToken<UserStore>('userStore');
