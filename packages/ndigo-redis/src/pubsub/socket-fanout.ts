/**
 * Redis live socket Pub/Sub adapter.
 */
import { randomUUID } from 'node:crypto';
import { IllegalStateError } from '@ndigo/core';
import type { SocketFanout, SocketFanoutMessage, SocketFanoutScope } from '@ndigo/socket';
import type { AsyncCloseable } from '@ndigo/factory';
import { RedisConnection } from '../connection';

/**
 * Options for the Redis socket fan-out: the borrowed command `connection`, a
 * dedicated `subscriberUrl` for the fan-out's own subscription, the
 * `namespace` isolating applications, and size/timeout bounds for message
 * payloads and connect attempts.
 */
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

/**
 * Decode and validate a wire envelope (REV-006). Rejects anything the
 * receiving broker could not frame into a MESSAGE: a header name
 * containing `:`, CR, LF or NUL, a NUL in a header value or the key. The
 * same validation runs on outgoing `publish` and inbound `subscribe`, so a
 * malformed peer can never blackhole a destination silently.
 *
 * Exported (module-internal, not on the package barrel) so the framing
 * rules are testable without a live Redis.
 *
 * @param wire - The JSON envelope.
 * @param maxBytes - Reject envelopes above this serialized size.
 * @returns The origin id and the message.
 */
export function decodeSocketFanoutEnvelope(
    wire: string,
    maxBytes: number
): { origin: string; message: SocketFanoutMessage } {
    if (Buffer.byteLength(wire) > maxBytes) {
        throw new RangeError('Socket fanout message exceeds maxMessageBytes');
    }
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
        envelope['key'].includes('\0') ||
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
                // These would re-split (:) or forge (CR/LF) a header line,
                // and NUL corrupts the frame — the MESSAGE serializer
                // rejects them, so the peer must not accept them either.
                /[\r\n:\0]/.test(key) ||
                typeof headerValue !== 'string' ||
                headerValue.length > 8192 ||
                headerValue.includes('\0')
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

/** Redis Pub/Sub live fan-out: at-most-once, no replay, reconnect, or offline queue. */
export class RedisSocketFanout implements SocketFanout, AsyncCloseable {
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
    #decodeErrorAt: number | undefined;

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

    /**
     * Most recent error across the subscriber connection, the publisher
     * connection, and inbound malformed-envelope decodes — compared by
     * observation time, so no source permanently masks another. Use
     * {@link lastDecodeError} to observe decode failures directly.
     */
    get lastError(): Error | undefined {
        const candidates: Array<{ at: number; error: Error }> = [];
        if (this.#subscriber.lastError !== undefined && this.#subscriber.lastErrorAt !== undefined) {
            candidates.push({ at: this.#subscriber.lastErrorAt, error: this.#subscriber.lastError });
        }
        if (this.#publisher.lastError !== undefined && this.#publisher.lastErrorAt !== undefined) {
            candidates.push({ at: this.#publisher.lastErrorAt, error: this.#publisher.lastError });
        }
        if (this.#decodeError !== undefined && this.#decodeErrorAt !== undefined) {
            candidates.push({ at: this.#decodeErrorAt, error: this.#decodeError });
        }

        let latest: { at: number; error: Error } | undefined;
        for (const candidate of candidates) {
            // `>=` lets a later-scanned source win same-millisecond ties
            // (subscriber < publisher < decode).
            if (latest === undefined || candidate.at >= latest.at) latest = candidate;
        }
        return latest?.error;
    }

    /** Most recent malformed-envelope decode error; never masked by connection errors. */
    get lastDecodeError(): Error | undefined {
        return this.#decodeError;
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
        if (this.#scopes.has(scope))
            throw new IllegalStateError('RedisSocketFanout already has a consumer for this scope');
        this.#scopes.add(scope);
        let active = true;
        const listener = (wire: string): void => {
            if (this.#closed || !active) return;
            try {
                const decoded = this.#decode(wire);
                if (decoded.origin !== this.#origin) receive(decoded.message);
            } catch (error) {
                this.#decodeError = error instanceof Error ? error : new Error('Invalid socket fanout message');
                this.#decodeErrorAt = Date.now();
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
            throw new IllegalStateError('RedisSocketFanout is closed');
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
        if (this.#closed) throw new IllegalStateError('RedisSocketFanout is closed');
        if (!this.#ready) throw new IllegalStateError('RedisSocketFanout is not ready; await connect()');
    }

    #channel(scope: SocketFanoutScope): string {
        if (scope !== 'path' && scope !== 'room' && scope !== 'topic')
            throw new TypeError('Invalid socket fanout scope');
        return `ndigo:socket:${this.#namespace}:${scope}`;
    }

    #decode(wire: string): { origin: string; message: SocketFanoutMessage } {
        return decodeSocketFanoutEnvelope(wire, this.#maxBytes);
    }
}
