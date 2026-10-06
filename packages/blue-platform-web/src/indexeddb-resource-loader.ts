/**
 * Configuration options for the IndexedDB resource loader.
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
export interface IndexedDBConfig {
    /** Database name. Defaults to `'blue-store'`. */
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
        this.#dbName = config.dbName ?? 'blue-store';
        this.#storeName = config.storeName ?? 'store';
        this.#version = config.version ?? 1;
        this.#dbPromise = null;
    }

    /**
     * Opens or creates the IndexedDB database.
     */
    #openDB(): Promise<IDBDatabase> {
        if (this.#dbPromise) {
            return this.#dbPromise;
        }

        this.#dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(this.#dbName, this.#version);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.#storeName)) {
                    db.createObjectStore(this.#storeName, { keyPath: 'id' });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        return this.#dbPromise;
    }

    /**
     * Stores a value in IndexedDB.
     *
     * @param key - The storage key.
     * @param value - The value to store.
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
