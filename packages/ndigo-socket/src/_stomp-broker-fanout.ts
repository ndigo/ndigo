/**
 * Local destination fan-out for the STOMP broker.
 */
import type { STOMPBody } from './stomp-frame.js';
import type { STOMPDelivery } from './_stomp-delivery.js';
import type { STOMPLimits } from './_stomp-limits.js';
import type { STOMPSubscriptionRegistry } from './_stomp-subscriptions.js';

/** The broker collaborators local fan-out reads. */
export interface STOMPFanoutHost {
    /** Header/identifier validation. */
    readonly limits: STOMPLimits;
    /** Subscription placement. */
    readonly registry: STOMPSubscriptionRegistry;
    /** Delivery tracking and framing. */
    readonly delivery: STOMPDelivery;
    /** Generates a message id when the caller omits one. */
    nextMessageId(): string;
}

/**
 * Delivers one envelope to every live subscriber of the destination.
 *
 * @param host - The broker collaborators.
 * @param destination - The destination.
 * @param body - The body.
 * @param headers - Pass-through headers.
 * @param messageId - The message id (generated when omitted).
 */
export function fanoutLocal(
    host: STOMPFanoutHost,
    destination: string,
    body: STOMPBody,
    headers: Record<string, string>,
    messageId?: string
): void {
    // Validate before touching subscribers so a peer/programmatic envelope
    // that cannot be framed fails loudly (throws to the caller) instead of
    // being dropped per subscriber.
    host.limits.assertDeliverable(destination, headers);
    const id = messageId ?? host.nextMessageId();
    const subscribers = host.registry.byDestination(destination);
    if (subscribers) {
        for (const subscription of Array.from(subscribers)) {
            if (!subscription.session.isClosed) {
                host.delivery.deliver(subscription, id, destination, body, headers, false);
            }
        }
    }
}
