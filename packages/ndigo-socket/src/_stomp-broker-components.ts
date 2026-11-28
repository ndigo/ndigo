/**
 * Component construction for the STOMP broker: defaults, validation, and
 * collaborator wiring.
 */
import { InMemoryQueueMessageStore, type QueueMessageStore, type StoredQueueMessage } from './message-store.js';
import type { SocketSession } from './socket-session.js';
import type { STOMPBody } from './stomp-frame.js';
import { STOMPFanout } from './_stomp-fanout.js';
import { STOMPLimits } from './_stomp-limits.js';
import { STOMPTransactionManager } from './_stomp-transactions.js';
import { STOMPSubscriptionRegistry } from './_stomp-subscriptions.js';
import { STOMPEndpoint } from './_stomp-endpoint.js';
import { STOMPDelivery } from './_stomp-delivery.js';
import { controlSend, fail, receipt } from './_stomp-replies.js';
import type { STOMPBrokerOptions } from './stomp-broker-types.js';

/** Default bound on unacked-message tracking per subscription. */
const DEFAULT_MAX_UNACKED = 1000;
/** Default per-destination `/queue` backlog bound. */
const DEFAULT_QUEUE_BACKLOG = 1000;
/** Default cap on subscriptions per session. */
const DEFAULT_MAX_SUBSCRIPTIONS_PER_SESSION = 1000;
/** Default cap on concurrent transactions per session. */
const DEFAULT_MAX_TRANSACTIONS_PER_SESSION = 8;
/** Default cap on buffered operations per transaction. */
const DEFAULT_MAX_TRANSACTION_OPS = 1000;
/** Default cap on buffered octets per transaction. */
const DEFAULT_MAX_TRANSACTION_BYTES = 16 * 1024 * 1024;
/** Default cap on distinct `/queue` backlog destinations. */
const DEFAULT_MAX_BACKLOG_DESTINATIONS = 1000;
/** Default cap on total `/queue` backlog bytes. */
const DEFAULT_MAX_BACKLOG_BYTES = 64 * 1024 * 1024;
/** Default cap on identifier-valued header length. */
const DEFAULT_MAX_IDENTIFIER_LENGTH = 1024;
/** Default cap on the aggregate header block size. */
const DEFAULT_MAX_HEADER_BYTES = 16 * 1024;
/** Default bound on unacked octets per subscription. */
const DEFAULT_MAX_UNACKED_BYTES = 1024 * 1024;
/** Default bound on unacked octets per session. */
const DEFAULT_MAX_UNACKED_SESSION_BYTES = 16 * 1024 * 1024;
/** Default per-session budget for backlog replay + replay-time live buffering. */
const DEFAULT_MAX_REPLAY_BYTES_PER_SESSION = 16 * 1024 * 1024;

/** Callbacks into the owning broker. */
export interface STOMPBrokerCallbacks {
    /** Whether the broker is closed. */
    isClosed(): boolean;
    /** Local fan-out of a published frame. */
    fanoutLocal(destination: string, body: STOMPBody, headers: Record<string, string>): void;
    /** Publishes to a destination (re-entrant from delivery). */
    publish(
        destination: string,
        body: STOMPBody,
        headers: Record<string, string>
    ): Promise<StoredQueueMessage | undefined>;
}

/** The constructed broker collaborators and validated options. */
export interface STOMPBrokerComponents {
    readonly onMessage: STOMPBrokerOptions['onMessage'] | null;
    readonly nextMessageId: () => string;
    readonly resolveUser: NonNullable<STOMPBrokerOptions['resolveUser']>;
    readonly maxUnacked: number;
    readonly verifyCredentials: NonNullable<STOMPBrokerOptions['verifyCredentials']> | null;
    readonly authorize: NonNullable<STOMPBrokerOptions['authorize']> | null;
    readonly queueBacklog: number;
    readonly maxSubscriptionsPerSession: number;
    readonly retention: { ttlMs?: number; maxMessages?: number } | null;
    readonly queueStore: QueueMessageStore | null;
    readonly registry: STOMPSubscriptionRegistry;
    readonly transactions: STOMPTransactionManager;
    readonly delivery: STOMPDelivery;
    readonly endpoint: STOMPEndpoint;
    readonly fanout: STOMPFanout;
    readonly limits: STOMPLimits;
    readonly sessions: Set<SocketSession>;
}

/**
 * Builds the broker collaborators from options, validating retention.
 *
 * @param options - Routing seams and bounds.
 * @param callbacks - Calls back into the owning broker.
 * @returns The constructed components.
 */
export function createSTOMPBrokerComponents(
    options: STOMPBrokerOptions,
    callbacks: STOMPBrokerCallbacks
): STOMPBrokerComponents {
    const sessions = new Set<SocketSession>();
    const fanout = new STOMPFanout({
        fanout: options.fanout,
        isClosed: () => callbacks.isClosed(),
        onLocal: (destination, body, headers) => callbacks.fanoutLocal(destination, body, headers),
    });
    const onMessage = options.onMessage ?? null;
    const nextMessageId = options.nextMessageId ?? ((): string => crypto.randomUUID());
    const resolveUser =
        options.resolveUser ??
        ((session: SocketSession): string | null => {
            const user = session.attributes['user'];
            return typeof user === 'string' ? user : null;
        });
    const maxUnacked = options.maxUnacked ?? DEFAULT_MAX_UNACKED;
    const registry = new STOMPSubscriptionRegistry({
        maxUnacked,
        maxUnackedBytes: options.maxUnackedBytes ?? DEFAULT_MAX_UNACKED_BYTES,
        maxUnackedSessionBytes: options.maxUnackedSessionBytes ?? DEFAULT_MAX_UNACKED_SESSION_BYTES,
    });
    const limits = new STOMPLimits({
        maxIdentifierLength: options.maxIdentifierLength ?? DEFAULT_MAX_IDENTIFIER_LENGTH,
        maxHeaderBytes: options.maxHeaderBytes ?? DEFAULT_MAX_HEADER_BYTES,
        maxReplayBytesPerSession: options.maxReplayBytesPerSession ?? DEFAULT_MAX_REPLAY_BYTES_PER_SESSION,
        fail,
        stateFor: (session) => registry.stateFor(session),
    });
    const verifyCredentials = options.verifyCredentials ?? null;
    const authorize = options.authorize ?? null;
    const queueBacklog = options.queueBacklog ?? DEFAULT_QUEUE_BACKLOG;
    const maxSubscriptionsPerSession = options.maxSubscriptionsPerSession ?? DEFAULT_MAX_SUBSCRIPTIONS_PER_SESSION;
    const transactions = new STOMPTransactionManager(
        {
            fail,
            receipt,
            controlSend,
            applySend: (session, frame, op) => delivery.applyBufferedSend(session, frame, op),
            applyAck: (session, op) => delivery.applyBufferedAck(session, op),
        },
        {
            maxTransactionsPerSession: options.maxTransactionsPerSession ?? DEFAULT_MAX_TRANSACTIONS_PER_SESSION,
            maxTransactionOps: options.maxTransactionOps ?? DEFAULT_MAX_TRANSACTION_OPS,
            maxTransactionBytes: options.maxTransactionBytes ?? DEFAULT_MAX_TRANSACTION_BYTES,
        }
    );
    const retentionOption = options.retention;
    let retention: { ttlMs?: number; maxMessages?: number } | null = null;
    if (retentionOption !== undefined) {
        const clean: { ttlMs?: number; maxMessages?: number } = {};
        if (retentionOption.ttlMs !== undefined) {
            if (
                typeof retentionOption.ttlMs !== 'number' ||
                !Number.isFinite(retentionOption.ttlMs) ||
                retentionOption.ttlMs < 0
            ) {
                throw new RangeError(
                    `retentionOption.ttlMs must be a non-negative integer, received ${retentionOption.ttlMs}`
                );
            }
            if (retentionOption.ttlMs > 0) clean.ttlMs = Math.floor(retentionOption.ttlMs);
        }
        if (retentionOption.maxMessages !== undefined) {
            if (
                typeof retentionOption.maxMessages !== 'number' ||
                !Number.isFinite(retentionOption.maxMessages) ||
                retentionOption.maxMessages < 0
            ) {
                throw new RangeError(
                    `retentionOption.maxMessages must be a non-negative integer, received ${retentionOption.maxMessages}`
                );
            }
            if (retentionOption.maxMessages > 0) clean.maxMessages = Math.floor(retentionOption.maxMessages);
        }
        if (clean.ttlMs !== undefined || clean.maxMessages !== undefined) {
            retention = clean;
        }
    }
    // The default persistence layer is an in-memory store built from
    // the legacy backlog caps, so the durable seam sees the same bounds
    // the old live backlog did. `queueBacklog: 0` disables storage (live
    // fan-out only — the documented D11 parity with /topic). The store
    // is the single source of truth for `/queue` retention and replay.
    const queueStore =
        options.queueStore === null || queueBacklog === 0
            ? null
            : (options.queueStore ??
              new InMemoryQueueMessageStore({
                  maxMessagesPerDestination: queueBacklog,
                  maxDestinations: options.maxBacklogDestinations ?? DEFAULT_MAX_BACKLOG_DESTINATIONS,
                  maxBytes: options.maxBacklogBytes ?? DEFAULT_MAX_BACKLOG_BYTES,
              }));
    const delivery = new STOMPDelivery({
        registry,
        limits,
        queueStore,
        retention,
        onMessage,
        resolveUser,
        nextMessageId,
        publish: (destination, body, headers) => callbacks.publish(destination, body, headers),
    });
    const endpoint = new STOMPEndpoint({
        maxSubscriptionsPerSession: maxSubscriptionsPerSession,
        maxUnacked,
        queueBacklog: queueBacklog,
        retention,
        queueStore,
        onMessage,
        verifyCredentials: verifyCredentials,
        authorize: authorize,
        resolveUser,
        nextMessageId,
        limits,
        registry,
        transactions: transactions,
        delivery: delivery,
        sessions: sessions,
        isReady: () => !callbacks.isClosed() && fanout.isReady,
        publish: (destination, body, headers) => callbacks.publish(destination, body, headers),
    });

    return {
        onMessage,
        nextMessageId,
        resolveUser,
        maxUnacked,
        verifyCredentials,
        authorize,
        queueBacklog,
        maxSubscriptionsPerSession,
        retention,
        queueStore,
        registry,
        transactions,
        delivery,
        endpoint,
        fanout,
        limits,
        sessions,
    };
}
