/**
 * Configuration options for the IndexedDB resource loader.
 */
export interface IndexedDBConfig {
    /** Database name. Defaults to `'ndigo-store'`. */
    dbName?: string;
    /** Object store name. Defaults to `'store'`. */
    storeName?: string;
    /** Database version. Defaults to `1`. */
    version?: number;
}

/**
 * Resource loader that persists data to IndexedDB.
 *
 * Provides async key-value storage backed by the browser's IndexedDB API.
 * Suitable for larger datasets than `localStorage` can handle.
 *
 * @example
 * ```ts
 * const db = new IndexedDBResourceLoader({ dbName: 'my-app' });
 * await db.setItem('settings', { theme: 'dark' });
 * const settings = await db.getItem('settings');
 * ```
 */
export class IndexedDBResourceLoader {
    readonly #dbName: string;
    readonly #storeName: string;
    readonly #version: number;
    #dbPromise: Promise<IDBDatabase> | null;

    constructor(config: IndexedDBConfig = {}) {
        this.#dbName = config.dbName ?? 'ndigo-store';
        this.#storeName = config.storeName ?? 'store';
        this.#version = config.version ?? 1;
        this.#dbPromise = null;
    }

    /**
     * Opens or creates the IndexedDB database.
     *
     * A failed open clears the memoized promise so a later call retries —
     * one transient failure must not brick the loader for its lifetime
     * (PWB-REV-008). A `versionchange` (another tab upgrading) closes this
     * connection and clears the memo so the next call reopens; a `blocked`
     * open is surfaced as an error instead of hanging (PWB-REV-009).
     */
    #openDB(): Promise<IDBDatabase> {
        if (this.#dbPromise) {
            return this.#dbPromise;
        }

        const openPromise = new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(this.#dbName, this.#version);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.#storeName)) {
                    db.createObjectStore(this.#storeName, { keyPath: 'id' });
                }
            };

            request.onsuccess = () => {
                const db = request.result;

                // Another context wants to upgrade: release our connection so
                // it is not blocked, and forget it so the next operation
                // reopens at the new version.
                db.onversionchange = () => {
                    db.close();
                    this.#dbPromise = null;
                };

                resolve(db);
            };
            request.onerror = () => reject(request.error);
            request.onblocked = () =>
                reject(new Error(`IndexedDB open for "${this.#dbName}" is blocked by another connection`));
        });

        this.#dbPromise = openPromise.catch((error: unknown) => {
            this.#dbPromise = null;
            throw error;
        });

        return this.#dbPromise;
    }

    /**
     * Closes the open connection and clears the memoized open promise.
     * Idempotent — a subsequent operation reopens the database.
     */
    close(): void {
        const pending = this.#dbPromise;
        this.#dbPromise = null;
        void pending?.then((db) => db.close()).catch(() => undefined);
    }

    /**
     * Stores a value in IndexedDB.
     *
     * @param key - The storage key.
     * @param value - The value to store.
     * @returns A promise that resolves once written.
     */
    async setItem(key: string, value: unknown): Promise<void> {
        const db = await this.#openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(this.#storeName, 'readwrite');
            const store = tx.objectStore(this.#storeName);
            store.put({ id: key, value, updatedAt: Date.now() });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Retrieves a value from IndexedDB.
     *
     * @param key - The storage key.
     * @returns The stored value, or `null` when not found.
     */
    async getItem<T = unknown>(key: string): Promise<T | null> {
        const db = await this.#openDB();
        return new Promise<T | null>((resolve, reject) => {
            const tx = db.transaction(this.#storeName, 'readonly');
            const store = tx.objectStore(this.#storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? (result.value as T) : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Removes a value from IndexedDB.
     *
     * @param key - The storage key to remove.
     * @returns A promise that resolves once removed.
     */
    async removeItem(key: string): Promise<void> {
        const db = await this.#openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(this.#storeName, 'readwrite');
            const store = tx.objectStore(this.#storeName);
            store.delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Clears all values from the store.
     *
     * @returns A promise that resolves once cleared.
     */
    async clear(): Promise<void> {
        const db = await this.#openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(this.#storeName, 'readwrite');
            const store = tx.objectStore(this.#storeName);
            store.clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Returns all keys in the store.
     *
     * @returns The stored keys.
     */
    async keys(): Promise<string[]> {
        const db = await this.#openDB();
        return new Promise<string[]>((resolve, reject) => {
            const tx = db.transaction(this.#storeName, 'readonly');
            const store = tx.objectStore(this.#storeName);
            const request = store.getAllKeys();

            request.onsuccess = () => resolve(request.result as string[]);
            request.onerror = () => reject(request.error);
        });
    }
}
