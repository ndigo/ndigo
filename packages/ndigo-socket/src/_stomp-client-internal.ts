/**
 * Internal state contracts for the STOMP client collaborators.
 */
import type { AsyncReader } from './async-reader.js';
import type { STOMPAckMode } from './stomp-broker.js';
import type { STOMPMessage } from './stomp-client-types.js';

/** Pending `send()` state: resolved by the matching RECEIPT. */
export interface PendingReceipt {
    resolve: () => void;
    reject: (error: Error) => void;
    /**
     * Whether the SEND frame reached the transport. Only a frame that left
     * the wire can be stranded by a drop — its receipt can never arrive on
     * the new session; a still-buffered frame keeps its promise.
     */
    sent: boolean;
}

/** How a CONNECT handshake ended. */
export type HandshakeOutcome = 'connected' | 'aborted' | 'timeout';

/**
 * One CONNECT handshake: a deferred settled by the CONNECTED frame, by the
 * ERROR/abort paths, or by a single timeout timer. `#onOpen` awaits this
 * instead of polling the signals.
 */
export interface Handshake {
    /** The session epoch this handshake belongs to (superseded → ignored). */
    epoch: number;
    /** Settled exactly once per outcome. */
    promise: Promise<HandshakeOutcome>;
    /** Settle the deferred and clear {@link Handshake.timer}. Idempotent. */
    settle(outcome: HandshakeOutcome): void;
    /** The timeout timer; `null` once settled. */
    timer: number | NodeJS.Timeout | null;
}

/** A registered subscription before teardown. */
export interface SubscriptionEntry {
    destination: string;
    /** The requested ack mode — replayed verbatim on every SUBSCRIBE. */
    ack: STOMPAckMode;
    reader: AsyncReader<STOMPMessage>;
    /** `pending` — not yet sent on this connection; `live` — SUBSCRIBEd. */
    state: 'pending' | 'live';
}
