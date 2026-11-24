/**
 * STOMP broker internal contracts.
 */
import type { StoredQueueMessage } from './message-store';
import { RingBuffer } from '@ndigo/core';
import type { SocketSession } from './socket-session';
import type { STOMPBody } from './stomp-frame';
import type { STOMPAckMode } from './stomp-broker';

export interface Subscription {
    session: SocketSession;
    subId: string;
    destination: string;
    /**
     * The principal resolved at SUBSCRIBE time for a `/user/*` binding
     * (REV-005) — the resolved identity is recorded on the subscription so
     * removal cannot re-resolve to a different (or `null`) principal and
     * leak the scope. `null` for non-`/user/` destinations.
     */
    user: string | null;
    ack: STOMPAckMode;
    /** Delivered-but-unacked messages (D9, ack ≠ auto) — head-indexed
     * ring: FIFO eviction at the `maxUnacked` bound is O(1). Created with
     * capacity `maxUnacked + 1` so a full ring never overwrites silently:
     * the count guard evicts at `length > maxUnacked`, and every departure
     * must run through `#untrack` to keep the byte totals and the ack
     * index honest. */
    unacked: RingBuffer<StoredMessage>;
    /** Body octets currently tracked in `unacked` (SEC-5 per-subscription bound). */
    unackedBytes: number;
    /** `true` while a `/queue` backlog replay is in flight (COR-2): live
     * deliveries buffer instead of going out. */
    replaying: boolean;
    /** Live deliveries held during that replay — flushed (deduped against
     * the replay) once it completes. */
    buffered: BufferedDelivery[];
}

/** A live delivery held back while a `/queue` replay is in flight (COR-2). */
export interface BufferedDelivery {
    messageId: string;
    destination: string;
    body: STOMPBody;
    headers: Record<string, string>;
    redelivered: boolean;
}

/** A retained message (queue backlog / unacked tracking). */
export interface StoredMessage {
    messageId: string;
    destination: string;
    body: STOMPBody;
    /** Extra headers (e.g. `content-type`); `subscription` added per send. */
    headers: Record<string, string>;
    /** Body octets, cached for the byte budgets (SEC-5). */
    bytes: number;
    /** Broker-issued monotonic tag — the oldest delivery is knowable (SEC-6). */
    deliverySeq: number;
}

/** Per-session delivery accounting: the ack index + the byte budgets. */
export interface SessionState {
    /**
     * Delivery `message-id` → owning subscriptions (COR-4 id-only acks).
     * A list because one logical message fans out to every subscription of
     * the destination — including two subscriptions of the same session —
     * so the same id can be outstanding under more than one subscription
     * (REV-004); an id-only ACK/NACK settles them all.
     */
    messageIds: Map<string, Subscription[]>;
    /** Tracked unacked body octets across the session's subscriptions (SEC-5). */
    unackedBytes: number;
    /** Replay + replay-buffer octets consumed by this session (SEC-6). */
    replayBytes: number;
}

/** Outcome of a store-backed `/queue` replay: a store fault is
 * distinguishable from an empty window (COR-8/RT-3). */
export type QueueReplay = { ok: true; messages: StoredQueueMessage[] } | { ok: false };

/** A buffered transactional operation (D7). */
export type TransactionOp =
    | { kind: 'send'; destination: string; body: STOMPBody; headers: Record<string, string>; receipt: string | null }
    | { kind: 'ack'; nack: boolean; messageId: string; subId: string; receipt: string | null };

/** One session's transaction buffer: ordered ops + running body-byte total. */
export interface TransactionBuffer {
    ops: TransactionOp[];
    bytes: number;
}

/** Options for {@link STOMPBroker}. */
