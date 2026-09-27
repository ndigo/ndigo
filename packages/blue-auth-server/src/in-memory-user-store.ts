/**
 * In-memory {@link UserStore} — the packaged convenience implementation for
 * tests and demos. NOT a production store: user storage is application data
 * (see `@blue/auth-core` `UserStore` contract); production apps implement
 * `UserStore` over `blue-orm`/Drizzle entities.
 *
 * @module blue-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
import { type UserRecord, type UserStore } from '@blue/auth-core';

export class InMemoryUserStore implements UserStore {
    readonly #byUsername = new Map<string, UserRecord>();
    readonly #byId = new Map<string, UserRecord>();

    constructor(records: readonly UserRecord[] = []) {
        for (const record of records) this.upsert(record);
    }

    findByUsername(username: string): Promise<UserRecord | null> {
        return Promise.resolve(this.#byUsername.get(username) ?? null);
    }

    findById(id: string): Promise<UserRecord | null> {
        return Promise.resolve(this.#byId.get(id) ?? null);
    }

    async incrementTokenVersion(id: string): Promise<number> {
        const record = this.#byId.get(id);
        if (!record) {
            throw new Error(`User "${id}" not found`);
        }
        const next = (record.tokenVersion ?? 0) + 1;
        const updated: UserRecord = { ...record, tokenVersion: next };
        this.#byId.set(id, updated);
        this.#byUsername.set(record.username, updated);
        return next;
    }

    /** Adds or replaces a record (test/demo setup helper). */
    upsert(record: UserRecord): this {
        this.#byUsername.set(record.username, record);
        this.#byId.set(record.id, record);
        return this;
    }
}
