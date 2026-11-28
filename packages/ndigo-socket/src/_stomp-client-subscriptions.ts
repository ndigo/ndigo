/**
 * Subscription registry and MESSAGE routing for the STOMP client.
 */
import { IllegalStateError } from '@ndigo/core';
import { AsyncReader } from './async-reader.js';
import { bodyAsText, type STOMPFrame } from './stomp-frame.js';
import type { STOMPAckMode } from './stomp-broker.js';
import type { STOMPMessage, STOMPSubscription } from './stomp-client-types.js';
import type { SubscriptionEntry } from './_stomp-client-internal.js';

/** The client state the registry reads and the wire it writes through. */
export interface STOMPSubscriptionHost {
    /** Whether the STOMP session is connected (CONNECTED received). */
    readonly connected: boolean;
    /** Serialize and send one frame through the socket. */
    sendFrame(frame: STOMPFrame): void;
    /** Per-subscription queue bound (`0` = unbounded). */
    readonly maxSubscriptionMessages: number;
}

/**
 * Owns the per-session subscription map: SUBSCRIBE/UNSUBSCRIBE/ACK/NACK
 * framing, reconnect re-subscription, and MESSAGE routing.
 */
export class STOMPSubscriptionRegistry {
    readonly #entries = new Map<string, SubscriptionEntry>();

    /**
     * Registers a subscription and, when connected, subscribes on the wire.
     *
     * @param host - The session state and wire.
     * @param destination - The destination.
     * @param opts - Subscription id and ack mode.
     * @returns The subscription handle.
     * @throws When the session ended or the id is already registered.
     */
    subscribe(
        host: STOMPSubscriptionHost,
        destination: string,
        opts: { id?: string; ack?: STOMPAckMode } = {}
    ): STOMPSubscription {
        const id = opts.id ?? crypto.randomUUID();
        const ack = opts.ack ?? 'auto';
        if (this.#entries.has(id)) {
            // A duplicate id would silently orphan the first subscription's
            // stream (the server routes by id, so the new entry steals its
            // frames) — reject loudly instead.
            throw new IllegalStateError(`duplicate subscription id: ${id}`);
        }
        // Bounded per-subscription queue: a stalled consumer must not pin
        // memory; while full, the newest frame is dropped (the transport
        // overflow posture, mirroring `maxInboundMessages`). `0` = unbounded.
        const maxQueued = host.maxSubscriptionMessages === 0 ? Number.POSITIVE_INFINITY : host.maxSubscriptionMessages;
        const reader = new AsyncReader<STOMPMessage>(maxQueued);
        const entry: SubscriptionEntry = { destination, ack, reader, state: 'pending' };
        this.#entries.set(id, entry);
        if (host.connected) {
            // Connected: the SUBSCRIBE goes out now (never buffered —
            // the resubscribe pass only touches entries still pending).
            this.#submit(host, entry, id);
        }
        const remove = (): void => {
            this.#entries.delete(id);
            reader.complete();
        };
        return {
            id,
            destination,
            messages: reader.iterable(),
            unsubscribe: () => {
                // Remove locally first: the reader completes and the
                // re-CONNECT path skips re-SUBSCRIBing. The wire frame is
                // only valid while connected.
                remove();
                if (host.connected) {
                    host.sendFrame({ command: 'UNSUBSCRIBE', headers: { id }, body: '' });
                }
            },
            ack: (messageId: string) => {
                // Acks are only meaningful for delivery on a live session;
                // a late ack would be a protocol violation — drop it.
                if (host.connected) {
                    host.sendFrame({ command: 'ACK', headers: { id: messageId, subscription: id }, body: '' });
                }
            },
            nack: (messageId: string) => {
                if (host.connected) {
                    host.sendFrame({ command: 'NACK', headers: { id: messageId, subscription: id }, body: '' });
                }
            },
        };
    }

    /**
     * Marks every entry pending for re-subscription on the new connection.
     */
    markPending(): void {
        for (const entry of this.#entries.values()) {
            entry.state = 'pending';
        }
    }

    /**
     * Re-subscribes every pending entry after CONNECTED. Entries whose
     * SUBSCRIBE cannot be framed are dropped and completed so no iterator
     * hangs.
     *
     * @param host - The session state and wire.
     */
    resubscribe(host: STOMPSubscriptionHost): void {
        for (const [id, entry] of this.#entries) {
            if (entry.state !== 'pending') {
                continue;
            }
            try {
                this.#submit(host, entry, id);
            } catch {
                this.#entries.delete(id);
                entry.reader.complete();
            }
        }
    }

    /**
     * Routes a MESSAGE frame to its subscription, when it is live.
     *
     * @param frame - The MESSAGE frame.
     */
    route(frame: STOMPFrame): void {
        const subscription = this.#entries.get(frame.headers['subscription'] ?? '');
        if (subscription === undefined || subscription.state === 'pending') {
            return; // unknown/resubscribe-pending subscription — dropped
        }
        subscription.reader.push({
            destination: frame.headers['destination'] ?? '',
            messageId: frame.headers['message-id'] ?? '',
            subscription: frame.headers['subscription'] ?? '',
            headers: frame.headers,
            body: frame.body,
            json: () => {
                try {
                    return JSON.parse(bodyAsText(frame.body)) as unknown;
                } catch {
                    return null;
                }
            },
        });
    }

    /** Completes every subscription stream and drops the registry. */
    completeAll(): void {
        for (const entry of this.#entries.values()) {
            entry.reader.complete();
        }
        this.#entries.clear();
    }

    /**
     * Registers a subscription on the wire (idempotent per connection).
     *
     * @param host - The session state and wire.
     * @param entry - The subscription entry.
     * @param id - The subscription id.
     */
    #submit(host: STOMPSubscriptionHost, entry: SubscriptionEntry, id: string): void {
        if (entry.state === 'live') {
            return;
        }
        host.sendFrame({
            command: 'SUBSCRIBE',
            headers: { destination: entry.destination, id, ack: entry.ack },
            body: '',
        });
        entry.state = 'live';
    }
}
