/**
 * @module blue-redis
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createClient, type RedisClientType } from '@redis/client';

/** Standalone node-redis client with default string replies (no keyPrefix). */
export type RedisClient = RedisClientType;

/** Explicit connection configuration; injected ready clients are always borrowed. */
export type RedisConnectionOptions =
    | { url: string; client?: never; connectTimeout?: number }
    | { client: RedisClient; url?: never; connectTimeout?: never };

/**
 * Owns a URL-created client or borrows an already-ready client. Construction
 * never connects. Owned connections fail fast without automatic reconnect or
 * offline queues; call and await connect() before use. Errors are observable
 * through lastError and command rejections, never logged with credentials.
 */
export class RedisConnection {
    readonly #client: RedisClient;
    readonly #owned: boolean;
    readonly #pending = new Set<Promise<unknown>>();
    #connecting: Promise<void> | undefined;
    #closing: Promise<void> | undefined;
    #closed = false;
    #lastError: Error | undefined;
    #lastErrorAt: number | undefined;
    readonly #observeError = (error: Error): void => {
        this.#lastError = error;
        this.#lastErrorAt = Date.now();
    };

    constructor(options: RedisConnectionOptions) {
        if (options.client !== undefined) {
            if (options.url !== undefined || !options.client.isReady) {
                throw new TypeError('RedisConnection: provide only an already-ready client');
            }
            if (options.client.options?.keyPrefix !== undefined) {
                throw new TypeError('RedisConnection: clients with keyPrefix are not supported');
            }
            if (
                options.client.options?.clientSideCache !== undefined ||
                options.client.options?.commandOptions?.typeMapping !== undefined
            ) {
                throw new TypeError('RedisConnection: client-side caching and custom reply mappings are not supported');
            }
            this.#client = options.client;
            this.#owned = false;
        } else {
            let url: URL;
            try {
                url = new URL(options.url);
            } catch {
                throw new TypeError('RedisConnection: an explicit redis:// or rediss:// URL is required');
            }
            if (!['redis:', 'rediss:'].includes(url.protocol) || !url.hostname) {
                throw new TypeError('RedisConnection: an explicit redis:// or rediss:// URL is required');
            }
            const connectTimeout = options.connectTimeout ?? 10_000;
            if (!Number.isSafeInteger(connectTimeout) || connectTimeout <= 0) {
                throw new TypeError('RedisConnection: connectTimeout must be a positive integer');
            }
            this.#client = createClient({
                url: options.url,
                socket: { connectTimeout, reconnectStrategy: false },
                disableOfflineQueue: true,
                commandsQueueMaxLength: 1_024,
            });
            this.#owned = true;
        }
        this.#client.on('error', this.#observeError);
    }

    /** Most recent socket error; retained without logging secrets. */
    get lastError(): Error | undefined {
        return this.#lastError;
    }

    /** `Date.now()` of the most recent observed error; `undefined` before any. */
    get lastErrorAt(): number | undefined {
        return this.#lastErrorAt;
    }

    /** Idempotent explicit connection; failed startup remains a rejected promise. */
    connect(): Promise<void> {
        if (this.#closed) return Promise.reject(new Error('RedisConnection is closed'));
        this.#connecting ??= this.#owned ? this.#client.connect().then(() => undefined) : Promise.resolve();
        return this.#connecting;
    }

    /**
     * Executes one adapter operation and tracks its entire lifetime for close.
     * Borrowed client reconnect/queue policy remains the application's policy;
     * new operations require readiness and never become cache misses on failure.
     */
    async run<T>(operation: (client: RedisClient) => Promise<T>): Promise<T> {
        if (this.#closed) throw new Error('RedisConnection is closed');
        if (!this.#client.isReady) throw new Error('RedisConnection is not ready; await connect()');
        const pending = Promise.resolve().then(() => operation(this.#client));
        this.#pending.add(pending);
        try {
            return await pending;
        } finally {
            this.#pending.delete(pending);
        }
    }

    /** Rejects new work, drains tracked operations, then closes only owned clients. */
    close(): Promise<void> {
        if (this.#closing !== undefined) return this.#closing;
        this.#closed = true;
        this.#closing = (async () => {
            try {
                if (this.#connecting !== undefined) await this.#connecting.catch(() => undefined);
                await Promise.allSettled(this.#pending);
                if (this.#owned && this.#client.isOpen) await this.#client.close();
            } finally {
                this.#client.off('error', this.#observeError);
            }
        })();
        return this.#closing;
    }
}
