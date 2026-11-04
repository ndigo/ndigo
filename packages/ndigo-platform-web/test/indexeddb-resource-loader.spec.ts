/**
 * `IndexedDBResourceLoader` lifecycle specs (PWB-REV-008/009): a failed open
 * must not brick the loader, and the connection must respond to
 * `versionchange`/`close`.
 *
 * jsdom has no IndexedDB, so this spec drives a minimal in-memory fake that
 * mirrors the request/transaction shape the loader uses.
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { IndexedDBResourceLoader } from '../src/indexeddb-resource-loader';

type AnyRequest = {
    result?: unknown;
    error?: unknown;
    onsuccess?: (() => void) | null;
    onerror?: (() => void) | null;
    onupgradeneeded?: (() => void) | null;
    onblocked?: (() => void) | null;
};

type AnyTransaction = {
    oncomplete?: (() => void) | null;
    onerror?: (() => void) | null;
    error?: unknown;
    objectStore: (name: string) => unknown;
};

class FakeStore {
    #records = new Map<string, { id: string }>();

    put(record: { id: string }): void {
        this.#records.set(record.id, record);
    }

    get(key: string): AnyRequest {
        const request: AnyRequest = {};
        queueMicrotask(() => {
            request.result = this.#records.get(key);
            request.onsuccess?.();
        });
        return request;
    }

    delete(key: string): void {
        this.#records.delete(key);
    }

    clear(): void {
        this.#records.clear();
    }

    getAllKeys(): AnyRequest {
        const request: AnyRequest = {};
        queueMicrotask(() => {
            request.result = [...this.#records.keys()];
            request.onsuccess?.();
        });
        return request;
    }
}

class FakeDatabase {
    closed = false;
    onversionchange: (() => void) | null = null;
    readonly #stores = new Map<string, FakeStore>();

    get objectStoreNames(): { contains: (name: string) => boolean } {
        return { contains: (name: string) => this.#stores.has(name) };
    }

    createObjectStore(name: string): FakeStore {
        const store = new FakeStore();
        this.#stores.set(name, store);
        return store;
    }

    transaction(name: string): AnyTransaction {
        const store = this.#stores.get(name);
        if (!store) {
            throw new Error(`object store "${name}" not found`);
        }

        const transaction: AnyTransaction = { objectStore: () => store };
        queueMicrotask(() => transaction.oncomplete?.());
        return transaction;
    }

    close(): void {
        this.closed = true;
    }
}

/**
 * Installs a fake IndexedDB whose first `open` can be made to fail.
 *
 * @param failFirstOpen - Whether the first `open` rejects.
 * @returns The databases created so far and the number of open attempts.
 */
function installFakeIndexedDB(failFirstOpen = false): { databases: FakeDatabase[]; attempts: () => number } {
    const databases: FakeDatabase[] = [];
    let attempts = 0;

    vi.stubGlobal('indexedDB', {
        open: (_name: string, _version: number): AnyRequest => {
            attempts += 1;
            const request: AnyRequest = {};
            const currentAttempt = attempts;

            queueMicrotask(() => {
                if (failFirstOpen && currentAttempt === 1) {
                    request.error = new Error('transient open failure');
                    request.onerror?.();
                    return;
                }

                const db = new FakeDatabase();
                databases.push(db);
                request.result = db;
                request.onupgradeneeded?.();
                request.onsuccess?.();
            });

            return request;
        },
    });

    return { databases, attempts: () => attempts };
}

describe('IndexedDBResourceLoader', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('stores and retrieves values through the fake store', async () => {
        installFakeIndexedDB();
        const loader = new IndexedDBResourceLoader();

        await loader.setItem('settings', { theme: 'dark' });
        expect(await loader.getItem('settings')).toEqual({ theme: 'dark' });
        expect(await loader.keys()).toEqual(['settings']);

        await loader.removeItem('settings');
        expect(await loader.getItem('settings')).toBeNull();
    });

    test('recovers after a transient open failure (PWB-REV-008)', async () => {
        const fake = installFakeIndexedDB(true);
        const loader = new IndexedDBResourceLoader();

        await expect(loader.setItem('k', 'v')).rejects.toThrow('transient open failure');
        expect(fake.attempts()).toBe(1);

        // The rejected open promise must not be cached: the next call retries.
        await loader.setItem('k', 'v');
        expect(await loader.getItem('k')).toBe('v');
        expect(fake.attempts()).toBe(2);
    });

    test('close() releases the connection, is idempotent, and allows reopening (PWB-REV-009)', async () => {
        const fake = installFakeIndexedDB();
        const loader = new IndexedDBResourceLoader();

        await loader.setItem('k', 'v');
        expect(fake.databases[0]?.closed).toBe(false);

        loader.close();
        // close() releases the handle asynchronously once the open promise settles.
        await Promise.resolve();
        expect(fake.databases[0]?.closed).toBe(true);

        // Idempotent.
        loader.close();

        // A subsequent operation reopens a fresh connection.
        await loader.setItem('k2', 'v2');
        expect(fake.attempts()).toBe(2);
        expect(await loader.getItem('k2')).toBe('v2');
    });

    test('a versionchange closes the connection so a later upgrade is not blocked (PWB-REV-009)', async () => {
        const fake = installFakeIndexedDB();
        const loader = new IndexedDBResourceLoader();

        await loader.setItem('k', 'v');
        const db = fake.databases[0];
        expect(db).toBeDefined();

        db?.onversionchange?.();
        expect(db?.closed).toBe(true);

        // The next operation reopens rather than reusing the closed handle.
        await loader.setItem('k3', 'v3');
        expect(fake.attempts()).toBe(2);
    });
});
