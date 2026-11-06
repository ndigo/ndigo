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
        this.#writeVersion(record, next);
        return next;
    }

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

    /** Adds or replaces a record (test/demo setup helper). */
    upsert(record: UserRecord): this {
        this.#byUsername.set(record.username, record);
        this.#byId.set(record.id, record);
        return this;
    }
}
