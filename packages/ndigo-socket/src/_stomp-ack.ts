/**
 * STOMP ACK/NACK handler: resolves an acknowledgement to the subscriptions
 * that delivered the message, live or buffered in a transaction.
 */
import { materialOctets } from './message-store';
import type { STOMPFrame } from './stomp-frame';
import type { SocketSession } from './socket-session';
import type { Subscription } from './_stomp-broker-types';
import type { STOMPDelivery } from './_stomp-delivery';
import type { STOMPSubscriptionRegistry } from './_stomp-subscriptions';
import type { STOMPTransactionManager } from './_stomp-transactions';
import { fail, receipt } from './_stomp-replies';

/**
 * The broker-owned seams the ACK/NACK handler needs.
 */
export interface STOMPAckHost {
    readonly maxUnacked: number;
    readonly registry: STOMPSubscriptionRegistry;
    readonly transactions: STOMPTransactionManager;
    readonly delivery: STOMPDelivery;
}

/**
 * Resolves ACK/NACK frames against delivery tracking.
 */
export class STOMPAckHandler {
    readonly #host: STOMPAckHost;

    /**
     * @param host - The broker's registry and transaction seams.
     */
    constructor(host: STOMPAckHost) {
        this.#host = host;
    }

    /**
     * ACK/NACK (STOMP 1.2 §1.4, D9): ack modes `client`/`client-individual`
     * track delivered messages; for `client` an ACK covers everything
     * through the named message, for `client-individual` exactly the named
     * one. NACK removes the same way **and redelivers only the named
     * message** with `redelivered: true`.
     *
     * The `id` header is required and sufficient (COR-4): without a
     * `subscription` header the per-session delivery index resolves the
     * owning subscription. When the `subscription` header *is* present it
     * must name one of the sender's own subscriptions, and an id the
     * subscription no longer tracks (already acked or evicted past the
     * bounds) is a tolerated no-op.
     *
     * An id-only ACK/NACK settles **every** subscription the id is
     * outstanding under (REV-004): one logical message fans out to each
     * subscription of the destination, so two subscriptions of one session
     * can share the id — the second must not fail closed.
     *
     * A `client`/`client-individual` session whose bare `id` resolves to no
     * delivery this session ever made fails closed: the broker cannot know
     * which tracking set the frame settles, and silently discarding it
     * would leave the delivery outstanding forever. The one exception is
     * tracking disabled (`maxUnacked: 0`): no delivery is ever outstanding,
     * so a bare id settles nothing and is a receipted no-op — a STOMP
     * client ACKing the MESSAGE's `ack` header must not be closed out.
     *
     * Allowed inside transactions too (D7): buffered under the same
     * op/byte caps as SEND, applied at COMMIT.
     *
     * @param session - The acking session.
     * @param frame - The ACK/NACK frame.
     * @returns `false` when the frame violates the contract.
     */
    ack(session: SocketSession, frame: STOMPFrame): boolean {
        const messageId = frame.headers['id'];
        if (messageId === undefined) {
            return fail(session, frame, 'ACK/NACK requires an id header');
        }
        const subId = frame.headers['subscription'];
        let owners: Subscription[];
        if (subId === undefined) {
            const tracked = this.#host.registry.ownersOf(session, messageId);
            if (tracked === undefined) {
                if (this.#host.maxUnacked <= 0) {
                    // Tracking disabled: nothing is ever outstanding, so
                    // the id settles nothing — accept and receipt it.
                    return receipt(session, frame);
                }
                return fail(session, frame, `unknown message id: ${messageId}`);
            }
            // REV-004: settle every subscription the id is outstanding
            // under. Snapshot first — a NACK redelivery re-tracks and
            // mutates the owner list.
            owners = [...tracked];
        } else {
            const subscription = this.#host.registry.get(session, subId);
            if (subscription === undefined) {
                return fail(session, frame, `unknown subscription: ${subId}`);
            }
            owners = [subscription];
        }
        const nack = frame.command === 'NACK';
        const txId = frame.headers['transaction'];
        if (txId !== undefined) {
            // COR-10: a buffered ack is as much buffered state as a SEND —
            // it obeys the same op count and byte budget (its identifiers
            // are retained too, so they count toward the bytes).
            const receiptId = frame.headers['receipt'] ?? null;
            for (let index = 0; index < owners.length; index += 1) {
                const target = owners[index] as Subscription;
                // One RECEIPT for the whole ACK/NACK: only the last buffered
                // op carries the receipt id (a per-op receipt would emit
                // duplicates at COMMIT).
                const opReceipt = index === owners.length - 1 ? receiptId : null;
                const octets =
                    materialOctets(messageId) +
                    materialOctets(target.subId) +
                    (opReceipt === null ? 0 : materialOctets(opReceipt));
                const result = this.#host.transactions.append(
                    session,
                    txId,
                    { kind: 'ack', nack, messageId, subId: target.subId, receipt: opReceipt },
                    octets
                );
                if (result === 'unknown') {
                    return fail(session, frame, `unknown transaction id: ${txId}`);
                }
                if (result === 'limit') {
                    return fail(session, frame, 'transaction buffer limit reached');
                }
            }
            return true;
        }
        for (const owner of owners) {
            this.#host.delivery.resolveAck(owner, messageId, nack);
        }
        return receipt(session, frame);
    }
}
