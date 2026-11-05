/**
 * Shared cache-name resolution for the cache managers and `@cached` (DA-9).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@ndigo/factory';
import type { Cache } from './cache';

/**
 * Resolves a cache store name from a string or a typed store token (AD-34
 * D7): a token-identified store uses the token's description as its name.
 * The single validation shared by every name/token entry point.
 *
 * @param nameOrToken - The cache name or typed store token.
 * @param context - Caller name used as the validation error prefix.
 * @returns The non-empty store name.
 * @throws {TypeError} When the resolved name is not a non-empty string.
 */
export function resolveCacheName(nameOrToken: string | ContextToken<Cache<unknown>>, context: string): string {
    const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;
    if (typeof name !== 'string' || name.length === 0) {
        throw new TypeError(`${context}: cache name must be a non-empty string — got ${String(name)}`);
    }
    return name;
}
