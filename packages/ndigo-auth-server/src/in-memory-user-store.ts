/**
 * In-memory {@link UserStore} — the packaged convenience implementation for
 * tests and demos. NOT a production store: user storage is application data
 * (see `@ndigo/auth-core` `UserStore` contract); production apps implement
 * `UserStore` over `ndigo-orm`/Drizzle entities.
 */
import { type UserRecord, type UserStore } from '@ndigo/auth-core';

/**
 * In-memory `UserStore`: users live in two maps (by username and by id) and
 * vanish with the process, which makes it the store for tests and
 * single-process demos. The constructor seeds it in bulk; `upsert` keeps both
 * indexes in step thereafter.
 */
export class InMemoryUserStore implements UserStore {
    readonly #byUsername = new Map<string, UserRecord>();
    readonly #byId = new Map<string, UserRecord>();

    /**
     * Creates the store, optionally seeding it.
     *
     * @param records - Initial user records.
     */
    constructor(records: readonly UserRecord[] = []) {
        for (const record of records) this.upsert(record);
    }

    /**
     * Finds a user by username.
     *
     * @param username - The account username.
     * @returns The user record, or `null`.
     */
    findByUsername(username: string): Promise<UserRecord | null> {
        return Promise.resolve(this.#byUsername.get(username) ?? null);
    }

    /**
     * Finds a user by id.
     *
     * @param id - The account id.
     * @returns The user record, or `null`.
     */
    findById(id: string): Promise<UserRecord | null> {
        return Promise.resolve(this.#byId.get(id) ?? null);
    }

    /**
     * Advances a user's token version.
     *
     * @param id - The account id.
     * @returns The new token version.
     * @throws When the account is unknown.
     */
    async incrementTokenVersion(id: string): Promise<number> {
        const record = this.#byId.get(id);
        if (!record) {
            throw new Error(`User "${id}" not found`);
        }
        const next = (record.tokenVersion ?? 0) + 1;
        this.#writeVersion(record, next);
        return next;
    }

    /**
     * Advances a user's token version only when it still matches `expected`.
     *
     * @param id - The account id.
     * @param expected - The token version the caller observed.
     * @returns The new token version, or `null` when the expectation lost.
     * @throws When the account is unknown.
     */
    async incrementTokenVersionIfCurrent(id: string, expected: number): Promise<number | null> {
        const record = this.#byId.get(id);
        if (!record) {
            throw new Error(`User "${id}" not found`);
        }
        // Check and swap in one synchronous step: no `await` between the read
        // and the write, so a concurrent refresh cannot interleave here
        // (mirrors the atomic conditional UPDATE of a SQL-backed store).
        if ((record.tokenVersion ?? 0) !== expected) {
            return null;
        }
        const next = expected + 1;
        this.#writeVersion(record, next);
        return next;
    }

    #writeVersion(record: UserRecord, next: number): void {
        const updated: UserRecord = { ...record, tokenVersion: next };
        this.#byId.set(record.id, updated);
        this.#byUsername.set(record.username, updated);
    }

    /**
     * Adds or replaces a record (test/demo setup helper).
     *
     * @param record - The user record to store.
     * @returns This store.
     */
    upsert(record: UserRecord): this {
        this.#byUsername.set(record.username, record);
        this.#byId.set(record.id, record);
        return this;
    }
}
