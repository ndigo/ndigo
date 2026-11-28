/**
 * STOMP server broker — endpoint state machine + destination fan-out.
 *
 * A `STOMPBroker` owns a destination namespace: `handleSocket` runs the
 * STOMP 1.2 endpoint protocol over one `SocketSession`, `publish` and
 * `sendToUser` fan out from anywhere, and `closeAll` terminates every
 * tracked connection.
 *
 * Protocol posture, delivery accounting, queue retention, and policy seams
 * are documented on `STOMPBrokerOptions` in `stomp-broker-types.ts`.
 */

import type { QueueMessageStore, StoredQueueMessage } from './message-store.js';
import type { STOMPBody } from './stomp-frame.js';
import type { SocketSession } from './socket-session.js';
import type { STOMPFanout } from './_stomp-fanout.js';
import type { STOMPLimits } from './_stomp-limits.js';
import type { STOMPSubscriptionRegistry } from './_stomp-subscriptions.js';
import type { STOMPEndpoint } from './_stomp-endpoint.js';
import type { STOMPDelivery } from './_stomp-delivery.js';
import { IllegalStateError } from '@ndigo/core';
import { createSTOMPBrokerComponents } from './_stomp-broker-components.js';
import { fanoutLocal, type STOMPFanoutHost } from './_stomp-broker-fanout.js';
import type { STOMPBrokerOptions } from './stomp-broker-types.js';

export * from './stomp-broker-types.js';
/**
 * STOMP 1.2 broker — transport-agnostic, one instance per destination
 * namespace (app-scoped entry).
 *
 * @example
 * ```ts
 * const broker = new STOMPBroker();
 * @requestMapping('/stomp')
 * class ChatController {
 *     @stompMapping('/chat')
 *     @parameters({ session: socketSessionValue('session') })
 *     async chat(session: SocketSession) {
 *         await broker.handleSocket(session);
 *     }
 *     @scheduled('0/3 * * * * *')
 *     tick() { broker.publish('/topic/chat', JSON.stringify({ at: Date.now() })); }
 * }
 * ```
 */
export class STOMPBroker {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "STOMPBroker".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object STOMPBroker]"
     */
    get [Symbol.toStringTag](): string {
        return 'STOMPBroker';
    }

    readonly #nextMessageId: () => string;
    readonly #queueBacklog: number;
    /** `/queue` history window (ttl + count) — enforced via the store. */
    readonly #retention: { ttlMs?: number; maxMessages?: number } | null;
    /** `/queue` persistence layer — the durable-queue seam. */
    readonly #queueStore: QueueMessageStore | null;
    /** Subscription placement and delivery accounting. */
    readonly #registry: STOMPSubscriptionRegistry;
    /** Per-session transaction buffers. */
    /** Subscription fan-out, delivery tracking, and queue replay. */
    readonly #delivery: STOMPDelivery;
    readonly #endpoint: STOMPEndpoint;
    /** Every session under protocol control (for `closeAll`). */
    readonly #sessions: Set<SocketSession>;
    readonly #fanout: STOMPFanout;
    readonly #limits: STOMPLimits;
    readonly #fanoutHost: STOMPFanoutHost;
    #closed = false;

    /**
     * Creates a broker with the given routing seams and hooks.
     *
     * @param options - Routing seam and test hooks.
     */
    constructor(options: STOMPBrokerOptions = {}) {
        const components = createSTOMPBrokerComponents(options, {
            isClosed: (): boolean => this.#closed,
            fanoutLocal: (destination, body, headers): void =>
                fanoutLocal(this.#fanoutHost, destination, body, headers),
            publish: (destination, body, headers): Promise<StoredQueueMessage | undefined> =>
                this.publish(destination, body, headers),
        });
        this.#nextMessageId = components.nextMessageId;
        this.#queueBacklog = components.queueBacklog;
        this.#retention = components.retention;
        this.#queueStore = components.queueStore;
        this.#registry = components.registry;
        this.#delivery = components.delivery;
        this.#endpoint = components.endpoint;
        this.#fanout = components.fanout;
        this.#limits = components.limits;
        this.#sessions = components.sessions;
        this.#fanoutHost = {
            limits: components.limits,
            registry: components.registry,
            delivery: components.delivery,
            nextMessageId: (): string => this.#nextMessageId(),
        };
    }

    /**
     * Await live topic subscription readiness before accepting traffic.
     *
     * @returns A promise that resolves once the fan-out subscription is ready.
     */
    connect(): Promise<void> {
        if (this.#closed) return Promise.reject(new Error('STOMPBroker is closed'));
        return this.#fanout.connect();
    }

    /**
     * Close sessions and unsubscribe; the application owns transport shutdown.
     *
     * @returns A promise that resolves once the broker is closed.
     */
    close(): Promise<void> {
        if (this.#closed) return this.#fanout.close();
        this.#closed = true;
        this.closeAll();
        return this.#fanout.close();
    }

    /** Total subscription count across all sessions (observability). */
    get subscriptions(): number {
        return this.#registry.count;
    }

    /**
     * Total delivered-but-unacked messages across all subscriptions (D9
     * observability, ack ≠ auto) — the broker-side outstanding-delivery
     * gauge.
     */
    get unackedMessages(): number {
        return this.#registry.unackedMessages;
    }

    /**
     * The `/queue` persistence layer — the durable-queue seam (a libsql or
     * Redis implementation can be swapped in place of the default memory
     * store). The store is the single source of truth for `/queue`
     * retention and replay. `null` when storage is disabled
     * (`queueBacklog: 0` or an explicit `queueStore: null`) — then
     * `/queue` is live fan-out with no replay.
     */
    get queueStore(): QueueMessageStore | null {
        return this.#queueStore;
    }

    /**
     * Read the retained history of a `/queue` destination — the same seam
     * subscribe replay reads from. `limit` is the newest-window (default
     * `queueBacklog`), `afterSeq` resumes past a gap; messages expired by
     * the retention TTL are pruned first. Returns `[]` when storage is
     * disabled or the store is unavailable (the read fails open — a
     * history query must never break an app).
     *
     * @param destination - The `/queue/<name>` destination.
     * @param options - The history window.
     * @returns The stored messages, append-ordered.
     */
    async history(
        destination: string,
        options: { afterSeq?: number; limit?: number } = {}
    ): Promise<StoredQueueMessage[]> {
        if (!destination.startsWith('/queue/')) {
            return [];
        }
        const replay = await this.#delivery.replayQueue(destination, options);
        // The read-only history query keeps its documented fail-open: a
        // store fault reads as "no history" (SUBSCRIBE, which must hand a
        // client an honest answer, fails closed instead — COR-8).
        return replay.ok ? replay.messages : [];
    }

    /**
     * Run the STOMP endpoint protocol for one connection.
     *
     * @param session - The socket session (any transport).
     * @returns A promise that resolves when the session stream ends.
     */
    handleSocket(session: SocketSession): Promise<void> {
        return this.#endpoint.handleSocket(session);
    }

    /**
     * Server-initiated fan-out: send a `MESSAGE` frame to every
     * subscription of `destination`, each carrying the subscriber's own
     * `subscription` id and the same fresh `message-id` per receiving broker
     * (acks and redelivery remain local to that broker). `/queue` destinations persist
     * through the store (the durable-queue seam) before fan-out; the
     * returned value is the stored message — `undefined` for non-`/queue`
     * destinations, disabled storage, or a store failure (the caller
     * decides the failure signal; live fan-out happens either way).
     * Configured `/topic/*` fan-out awaits transport acceptance before local
     * delivery and rejects backend failures; it has no replay or peer acknowledgement.
     *
     * @param destination - The destination (e.g. `/topic/chat`).
     * @param body - The message body (text or bytes — D8).
     * @param headers - Extra headers on the MESSAGE frames (e.g. `content-type`).
     * @returns The stored message for a persisted `/queue` append, else `undefined`.
     */
    async publish(
        destination: string,
        body: STOMPBody,
        headers: Record<string, string> = {}
    ): Promise<StoredQueueMessage | undefined> {
        if (this.#closed) throw new IllegalStateError('STOMPBroker is closed');
        this.#limits.assertDeliverable(destination, headers);
        await this.#fanout.publish(destination, body, headers);
        const messageId = this.#nextMessageId();
        let stored: StoredQueueMessage | undefined;
        if (destination.startsWith('/queue/') && this.#queueBacklog > 0) {
            const store = this.#queueStore;
            if (store !== null) {
                try {
                    stored = await store.append({
                        messageId,
                        destination,
                        body,
                        headers: { ...headers },
                    });
                    const retention = this.#retention;
                    if (retention !== null) {
                        // Keep the durable side within the history window:
                        // fire-and-forget (append success is what receipts
                        // wait on; retention is convergent).
                        void store.prune(destination, retention).catch(() => undefined);
                    }
                } catch {
                    stored = undefined; // store unavailable — see SEND's ERROR path
                }
            }
        }
        if (this.#closed) throw new IllegalStateError('STOMPBroker is closed');
        fanoutLocal(this.#fanoutHost, destination, body, headers, messageId);
        return stored;
    }

    /**
     * Principal-scoped fan-out: deliver to the `resolveUser`-scoped
     * subscriptions of `user` — those bound to `/user/<destination>`
     * (the STOMP convention: subscribe `/user/queue/errors`, then
     * `sendToUser(user, '/queue/errors', …)`). MESSAGE frames carry the
     * `/user/...` destination the client subscribed with.
     *
     * @param user - The target principal.
     * @param destination - The destination suffix (e.g. `/queue/errors`).
     * @param body - The message body (text or bytes — D8).
     * @param headers - Extra headers on the MESSAGE frames.
     */
    sendToUser(user: string, destination: string, body: STOMPBody, headers: Record<string, string> = {}): void {
        const suffix = destination.replace(/^\/+/, '');
        // REV-006: surface an unframeable envelope here rather than letting
        // `deliverNow` swallow the serialization fault per subscriber.
        this.#limits.assertDeliverable(`/user/${suffix}`, headers);
        const scope = this.#registry.byUser(user, suffix);
        if (!scope) {
            return;
        }
        const messageId = this.#nextMessageId();
        const userDestination = `/user/${suffix}`;
        for (const subscription of scope) {
            if (subscription.session.isClosed) {
                continue;
            }
            this.#delivery.deliver(subscription, messageId, userDestination, body, headers, false);
        }
    }

    /**
     * Close every connected session tracked by the broker (graceful
     * shutdown integration; the transport's `closeAll` path remains the
     * registry's job — this closes the STOMP side).
     *
     * @param code - Close status code (default `1001` going away).
     * @param reason - Human-readable close reason.
     */
    closeAll(code: number = 1001, reason: string = 'broker shutdown'): void {
        for (const session of this.#sessions) {
            if (!session.isClosed) {
                session.close(code, reason);
            }
        }
    }
}
