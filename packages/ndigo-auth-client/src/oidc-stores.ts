/**
 * In-memory default implementations of the OIDC persistence seams.
 */
import type {
    PendingAuthorization,
    PendingAuthorizationStore,
    RefreshTokenBinding,
    RefreshTokenStore,
} from './oidc-types';

/** Upper bound on concurrently pending authorization requests. */
const MAX_PENDING_AUTHORIZATIONS = 20;

/** Upper bound on tracked refresh-token bindings. */
const MAX_REFRESH_BINDINGS = 100;

/**
 * Default {@link PendingAuthorizationStore}: a bounded in-memory map scoped
 * to a single adapter instance.
 *
 * At the cap (20 entries) `set` evicts the oldest entry — the same memory
 * bound the adapter previously applied inline — so a creation flood cannot
 * grow the map without limit. Entries persist until redeemed or evicted.
 */
export class InMemoryPendingAuthorizationStore implements PendingAuthorizationStore {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "InMemoryPendingAuthorizationStore".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object InMemoryPendingAuthorizationStore]"
     */
    get [Symbol.toStringTag](): string {
        return 'InMemoryPendingAuthorizationStore';
    }

    /** Store identifier (`'in-memory'`). */
    readonly kind = 'in-memory';

    readonly #entries = new Map<string, PendingAuthorization>();

    /**
     * Returns the pending request for `state`, or `null` when unknown.
     *
     * @param state - The authorization-state value.
     * @returns The pending request, or `null`.
     */
    async get(state: string): Promise<PendingAuthorization | null> {
        return this.#entries.get(state) ?? null;
    }

    /**
     * Stores `pending` under `state`, evicting the oldest entry at the cap.
     *
     * @param state - The authorization-state value.
     * @param pending - The pending request to store.
     * @returns A promise that resolves once stored.
     */
    async set(state: string, pending: PendingAuthorization): Promise<void> {
        // Bound memory: evict the oldest pending request when full.
        while (this.#entries.size >= MAX_PENDING_AUTHORIZATIONS) {
            const oldestKey = this.#entries.keys().next().value;
            if (oldestKey === undefined) break;
            this.#entries.delete(oldestKey);
        }
        this.#entries.set(state, pending);
    }

    /**
     * Removes the entry for `state`.
     *
     * @param state - The authorization-state value.
     * @returns A promise that resolves once removed.
     */
    async delete(state: string): Promise<void> {
        this.#entries.delete(state);
    }
}

/**
 * Default {@link RefreshTokenStore}: a bounded in-memory map scoped to a
 * single adapter instance.
 *
 * At the cap (100 entries) `set` evicts the oldest binding, so a refresh
 * flood cannot grow the map without limit.
 */
export class InMemoryRefreshTokenStore implements RefreshTokenStore {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "InMemoryRefreshTokenStore".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object InMemoryRefreshTokenStore]"
     */
    get [Symbol.toStringTag](): string {
        return 'InMemoryRefreshTokenStore';
    }

    /** Store identifier (`'in-memory'`). */
    readonly kind = 'in-memory';

    readonly #entries = new Map<string, RefreshTokenBinding>();

    /**
     * Returns the binding for `token`, or `null` when unknown.
     *
     * @param token - The refresh token.
     * @returns The recorded binding, or `null`.
     */
    async get(token: string): Promise<RefreshTokenBinding | null> {
        return this.#entries.get(token) ?? null;
    }

    /**
     * Stores the binding for `token`, evicting the oldest at the cap.
     *
     * @param token - The refresh token.
     * @param binding - The subject binding to record.
     * @returns A promise that resolves once stored.
     */
    async set(token: string, binding: RefreshTokenBinding): Promise<void> {
        // Bound memory: evict the oldest binding when full.
        while (this.#entries.size >= MAX_REFRESH_BINDINGS) {
            const oldestKey = this.#entries.keys().next().value;
            if (oldestKey === undefined) break;
            this.#entries.delete(oldestKey);
        }
        this.#entries.set(token, binding);
    }

    /**
     * Removes the binding for `token`.
     *
     * @param token - The refresh token.
     * @returns A promise that resolves once removed.
     */
    async delete(token: string): Promise<void> {
        this.#entries.delete(token);
    }
}
