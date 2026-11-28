/**
 * JWT subject identity and principal projection.
 */
import type { JWTPayload } from 'jose';
import { DefaultPrincipal, readRoles, readScopes, type Principal, type UserStore } from '@ndigo/auth-core';
import { JWTTokenError } from './jwt-adapter-types.js';

/** The account fields a token pair snapshots at issue time. */
export interface JWTIdentity {
    id: string;
    name: string;
    roles: readonly string[];
    scopes: readonly string[];
    tokenVersion: number;
}

/**
 * Loads the account behind `id` for token issuance.
 *
 * @param store - The user store to read.
 * @param id - The account id.
 * @param scopes - Caller-supplied grants; `UserRecord` has no scopes, so
 *   these are preserved rather than silently dropped.
 * @returns The identity snapshot.
 * @throws `JWTTokenError` when the account is unknown or disabled.
 */
export async function storeIdentity(
    store: UserStore,
    id: string,
    scopes: readonly string[] = []
): Promise<JWTIdentity> {
    const user = await store.findById(id);
    if (!user || user.disabled === true) {
        throw new JWTTokenError(`Cannot issue tokens for user "${id}": unknown or disabled`);
    }
    return {
        id: user.id,
        name: user.username,
        roles: user.roles ?? [],
        scopes,
        tokenVersion: user.tokenVersion ?? 0,
    };
}

/**
 * Maps verified JWT claims to a {@link Principal}.
 *
 * Non-string names (objects, numbers) must not leak `"[object Object]"` into
 * logs and UI; prefer the email claim, then a neutral label.
 *
 * @param payload - The verified JWT payload.
 * @returns The principal, or `null` when `sub` is absent or not a non-empty string.
 */
export function principalFromPayload(payload: JWTPayload): Principal | null {
    const sub = payload.sub;
    if (typeof sub !== 'string' || sub.length === 0) {
        return null;
    }
    const roles = readRoles(payload);
    const scopes = readScopes(payload);
    const name =
        (typeof payload.name === 'string' && payload.name) ||
        (typeof payload.email === 'string' && payload.email) ||
        'Unknown';
    return new DefaultPrincipal(sub, name, roles, scopes);
}
