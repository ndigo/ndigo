/**
 * Resource loader that persists data to `localStorage`.
 * * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
export class LocalStorageResourceLoader {
    readonly #prefix: string;

    /**
     * Creates a `localStorage`-backed resource loader.
     *
     * @param prefix - Optional namespace prefix to avoid key collisions.
     *   Defaults to `'blue'`.
     */
    constructor(prefix = 'blue') {
        this.#prefix = prefix;
    }

    /**
     * Returns the namespaced key for storage.
     */
    #key(key: string): string {
        return `${this.#prefix}:${key}`;
    }

    /**
     * Stores a value in `localStorage`.
     *
     * @param key - The storage key.
     * @param value - The value to store. Objects are serialized as JSON.
     */
    setItem(key: string, value: unknown): void {
        try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(this.#key(key), serialized);
        } catch {
            // localStorage may be full or unavailable
        }
    }

    /**
     * Retrieves a value from `localStorage`.
     *
     * @param key - The storage key.
     * @returns The stored value, or `null` when not found.
     */
    getItem(key: string): string | null {
        try {
            return localStorage.getItem(this.#key(key));
        } catch {
            return null;
        }
    }

    /**
     * Retrieves a parsed JSON value from `localStorage`.
     *
     * @param key - The storage key.
     * @returns The parsed value, or `null` when not found or invalid JSON.
     */
    getJSON<T = unknown>(key: string): T | null {
        try {
            const value = this.getItem(key);
            return value ? (JSON.parse(value) as T) : null;
        } catch {
            return null;
        }
    }

    /**
     * Removes a value from `localStorage`.
     *
     * @param key - The storage key to remove.
     */
    removeItem(key: string): void {
        try {
            localStorage.removeItem(this.#key(key));
        } catch {
            // ignore
        }
    }

    /**
     * Removes all items with the configured prefix.
     */
    clear(): void {
        try {
            const keysToRemove: string[] = [];
            const storageLength = localStorage.length;
            for (let i = 0; i < storageLength; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`${this.#prefix}:`)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach((key) => localStorage.removeItem(key));
        } catch {
            // ignore
        }
    }

    /**
     * Returns the number of stored items with the configured prefix.
     */
    get length(): number {
        try {
            let count = 0;
            const storageLength = localStorage.length;
            for (let i = 0; i < storageLength; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`${this.#prefix}:`)) {
                    count++;
                }
            }
            return count;
        } catch {
            return 0;
        }
    }
}
