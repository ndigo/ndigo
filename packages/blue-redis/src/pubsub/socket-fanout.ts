/**
 * Redis live socket Pub/Sub adapter.
 * @module blue-redis
 * @since 1.0.0
 * @author Jeff Rose
 */
import { randomUUID } from 'node:crypto';
import type { SocketFanout, SocketFanoutMessage, SocketFanoutScope } from '@blue/socket';
import { RedisConnection } from '../connection';

export interface RedisSocketFanoutOptions {
    /** Borrowed publisher; never subscribed or closed by this adapter. */
    connection: RedisConnection;
    /** Dedicated owned subscriber URL (never reuse a command connection). */
    subscriberUrl: string;
    /** Application/environment isolation boundary. */
    namespace: string;
    maxMessageBytes?: number;
    connectTimeout?: number;
}

/** Redis Pub/Sub live fan-out: at-most-once, no replay, reconnect, or offline queue. */
export class RedisSocketFanout implements SocketFanout {
    readonly #publisher: RedisConnection;
    readonly #subscriber: RedisConnection;
    readonly #namespace: string;
    readonly #origin = randomUUID();
    readonly #maxBytes: number;
    readonly #subscriptions = new Set<() => Promise<void>>();
    readonly #scopes = new Set<SocketFanoutScope>();
    #connecting: Promise<void> | undefined;
    #closing: Promise<void> | undefined;
    #ready = false;
    #closed = false;
    #decodeError: Error | undefined;

    constructor(options: RedisSocketFanoutOptions) {
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(options.namespace)) {
            throw new TypeError('RedisSocketFanout: namespace must be 1–128 safe ASCII characters');
        }
        this.#maxBytes = options.maxMessageBytes ?? 1_048_576;
        if (!Number.isSafeInteger(this.#maxBytes) || this.#maxBytes <= 0) {
            throw new TypeError('RedisSocketFanout: maxMessageBytes must be a positive integer');
        }
        this.#publisher = options.connection;
        this.#subscriber = new RedisConnection({
            url: options.subscriberUrl,
            ...(options.connectTimeout === undefined ? {} : { connectTimeout: options.connectTimeout }),
        });
        this.#namespace = options.namespace;
    }

    get lastError(): Error | undefined {
        return this.#subscriber.lastError ?? this.#publisher.lastError ?? this.#decodeError;
    }

    /** Explicit readiness; construction never opens sockets. */
    connect(): Promise<void> {
        if (this.#closed) return Promise.reject(new Error('RedisSocketFanout is closed'));
        this.#connecting ??= Promise.all([this.#publisher.connect(), this.#subscriber.connect()]).then(() => {
            this.#ready = true;
        });
        return this.#connecting;
    }

    async subscribe(
        scope: SocketFanoutScope,
        receive: (message: SocketFanoutMessage) => void
    ): Promise<() => Promise<void>> {
        this.#assertOpen();
        const channel = this.#channel(scope);
        if (this.#scopes.has(scope)) throw new Error('RedisSocketFanout already has a consumer for this scope');
        this.#scopes.add(scope);
        let active = true;
        const listener = (wire: string): void => {
            if (this.#closed || !active) return;
            try {
                const decoded = this.#decode(wire);
                if (decoded.origin !== this.#origin) receive(decoded.message);
            } catch (error) {
                this.#decodeError = error instanceof Error ? error : new Error('Invalid socket fanout message');
            }
        };
        const subscribed = this.#subscriber.run(async (client) => {
            await client.subscribe(channel, listener);
        });
        let unsubscribing: Promise<void> | undefined;
        const unsubscribe = (): Promise<void> => {
            active = false;
            unsubscribing ??= subscribed
                .then(() =>
                    this.#subscriber.run(async (client) => {
                        await client.unsubscribe(channel, listener);
                    })
                )
                .finally(() => {
                    this.#subscriptions.delete(unsubscribe);
                    this.#scopes.delete(scope);
                });
            return unsubscribing;
        };
        // Register cleanup before the awaited operation so close drains startup too.
        this.#subscriptions.add(unsubscribe);
        try {
            await subscribed;
        } catch (error) {
            this.#subscriptions.delete(unsubscribe);
            this.#scopes.delete(scope);
            throw error;
        }
        if (this.#closed) {
            await unsubscribe();
            throw new Error('RedisSocketFanout is closed');
        }
        return unsubscribe;
    }

    async publish(scope: SocketFanoutScope, message: SocketFanoutMessage): Promise<void> {
        this.#assertOpen();
        const channel = this.#channel(scope);
        const envelope = {
            version: 1,
            origin: this.#origin,
            key: message.key,
            binary: typeof message.body !== 'string',
            body: typeof message.body === 'string' ? message.body : Buffer.from(message.body).toString('base64'),
            headers: message.headers ?? {},
        };
        // Validate outgoing and incoming messages identically before touching Redis.
        const wire = JSON.stringify(envelope);
        this.#decode(wire);
        // A failed subscriber must never silently degrade this node to local-only.
        await this.#subscriber.run(async () => undefined);
        await this.#publisher.run(async (client) => {
            await client.publish(channel, wire);
        });
    }

    /** Unsubscribe all listeners, then close only the dedicated owned subscriber. */
    close(): Promise<void> {
        if (this.#closing) return this.#closing;
        this.#closed = true;
        this.#closing = (async () => {
            if (this.#connecting) await this.#connecting.catch(() => undefined);
            try {
                const results = await Promise.allSettled([...this.#subscriptions].map((unsubscribe) => unsubscribe()));
                const failed = results.find((result) => result.status === 'rejected');
                if (failed?.status === 'rejected') throw failed.reason;
            } finally {
                await this.#subscriber.close();
            }
        })();
        return this.#closing;
    }

    #assertOpen(): void {
        if (this.#closed) throw new Error('RedisSocketFanout is closed');
        if (!this.#ready) throw new Error('RedisSocketFanout is not ready; await connect()');
    }

    #channel(scope: SocketFanoutScope): string {
        if (scope !== 'path' && scope !== 'room' && scope !== 'topic')
            throw new TypeError('Invalid socket fanout scope');
        return `blue:socket:${this.#namespace}:${scope}`;
    }

    #decode(wire: string): { origin: string; message: SocketFanoutMessage } {
        if (Buffer.byteLength(wire) > this.#maxBytes)
            throw new RangeError('Socket fanout message exceeds maxMessageBytes');
        const value: unknown = JSON.parse(wire);
        if (value === null || typeof value !== 'object') throw new TypeError('Invalid socket fanout envelope');
        const envelope = value as Record<string, unknown>;
        if (
            envelope['version'] !== 1 ||
            typeof envelope['origin'] !== 'string' ||
            !/^[a-f0-9-]{36}$/.test(envelope['origin']) ||
            typeof envelope['key'] !== 'string' ||
            envelope['key'].length === 0 ||
            envelope['key'].length > 1024 ||
            typeof envelope['binary'] !== 'boolean' ||
            typeof envelope['body'] !== 'string'
        ) {
            throw new TypeError('Invalid socket fanout envelope');
        }
        const headers = envelope['headers'];
        if (
            headers === null ||
            typeof headers !== 'object' ||
            Array.isArray(headers) ||
            Object.keys(headers).length > 128 ||
            Object.entries(headers).some(
                ([key, headerValue]) =>
                    key.length === 0 ||
                    key.length > 1024 ||
                    typeof headerValue !== 'string' ||
                    headerValue.length > 8192
            )
        ) {
            throw new TypeError('Invalid socket fanout headers');
        }
        const body = envelope['body'];
        if (envelope['binary'] && !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(body)) {
            throw new TypeError('Invalid socket fanout binary body');
        }
        return {
            origin: envelope['origin'],
            message: {
                key: envelope['key'],
                body: envelope['binary'] ? Buffer.from(body, 'base64') : body,
                headers: headers as Record<string, string>,
            },
        };
    }
}
