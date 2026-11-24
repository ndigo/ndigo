/**
 * STOMP subscription registry: the per-session map, destination/user fan-out
 * indexes, and the delivery-tracking accounting (ack index, byte bounds).
 */
import type { SocketSession } from './socket-session';
import type { StompBody } from './stomp-frame';
import { materialOctets } from './message-store';
import type { SessionState, StoredMessage, Subscription } from './_stomp-broker-types';

/** The delivery bounds the registry enforces. */
export interface StompSubscriptionLimits {
    /** Maximum tracked unacked messages per subscription; `0` disables. */
    readonly maxUnacked: number;
    /** Maximum tracked unacked octets per subscription; `0` disables. */
    readonly maxUnackedBytes: number;
    /** Maximum tracked unacked octets per session; `0` disables. */
    readonly maxUnackedSessionBytes: number;
}

/**
 * Owns subscription placement and delivery accounting. The broker creates the
 * {@link Subscription} (including its `RingBuffer`) and delegates every index
 * mutation and ack-budget decision here.
 *
 * @example
 * ```ts
 * const registry = new StompSubscriptionRegistry({ maxUnacked: 1000, maxUnackedBytes: 0, maxUnackedSessionBytes: 0 });
 * registry.add(subscription);
 * ```
 */
export class StompSubscriptionRegistry {
    readonly #limits: StompSubscriptionLimits;
    /** Per-session subscription map: session → subId → subscription. */
    readonly #subscriptions = new Map<SocketSession, Map<string, Subscription>>();
    /** Fan-out index: destination → subscriptions (user scopes excluded). */
    readonly #byDestination = new Map<string, Subscription[]>();
    /** User scopes (D10): user → destination-suffix → subscriptions. */
    readonly #byUser = new Map<string, Map<string, Subscription[]>>();
    /** Per-session delivery accounting: ack index + the byte budgets. */
    readonly #sessionState = new Map<SocketSession, SessionState>();
    /** Monotonic delivery tag — makes the oldest tracked delivery knowable. */
    #deliverySeq = 0;

    /**
     * @param limits - The delivery-tracking bounds.
     */
    constructor(limits: StompSubscriptionLimits) {
        this.#limits = limits;
    }

    /** Total subscription count across all sessions (observability). */
    get count(): number {
        let count = 0;
        for (const bySubId of this.#subscriptions.values()) {
            count += bySubId.size;
        }
        return count;
    }

    /** Total delivered-but-unacked messages across all subscriptions. */
    get unackedMessages(): number {
        let total = 0;
        for (const bySubId of this.#subscriptions.values()) {
            for (const subscription of bySubId.values()) {
                total += subscription.unacked.length;
            }
        }
        return total;
    }

    /**
     * Per-session delivery accounting, created on first use.
     *
     * @param session - The session.
     * @returns The session's delivery state.
     */
    stateFor(session: SocketSession): SessionState {
        let state = this.#sessionState.get(session);
        if (state === undefined) {
            state = { messageIds: new Map(), unackedBytes: 0, replayBytes: 0 };
            this.#sessionState.set(session, state);
        }
        return state;
    }

    /**
     * Looks up one subscription.
     *
     * @param session - The owning session.
     * @param subId - The subscription id.
     * @returns The subscription, or `undefined`.
     */
    get(session: SocketSession, subId: string): Subscription | undefined {
        return this.#subscriptions.get(session)?.get(subId);
    }

    /**
     * Whether a session already uses a subscription id.
     *
     * @param session - The owning session.
     * @param subId - The subscription id.
     * @returns `true` when the id is in use.
     */
    has(session: SocketSession, subId: string): boolean {
        return this.#subscriptions.get(session)?.has(subId) ?? false;
    }

    /**
     * Number of subscriptions owned by a session.
     *
     * @param session - The owning session.
     * @returns The count.
     */
    countForSession(session: SocketSession): number {
        return this.#subscriptions.get(session)?.size ?? 0;
    }

    /**
     * Subscriptions bound to a non-user destination.
     *
     * @param destination - The destination.
     * @returns The subscriber list, or `undefined`.
     */
    byDestination(destination: string): readonly Subscription[] | undefined {
        return this.#byDestination.get(destination);
    }

    /**
     * Subscriptions bound to a user scope suffix.
     *
     * @param user - The resolved principal.
     * @param suffix - The `/user/` destination suffix.
     * @returns The subscriber list, or `undefined`.
     */
    byUser(user: string, suffix: string): readonly Subscription[] | undefined {
        return this.#byUser.get(user)?.get(suffix);
    }

    /**
     * The subscriptions currently tracking a delivered message id.
     *
     * @param session - The owning session.
     * @param messageId - The message id.
     * @returns The owners, or `undefined`.
     */
    ownersOf(session: SocketSession, messageId: string): readonly Subscription[] | undefined {
        return this.#sessionState.get(session)?.messageIds.get(messageId);
    }

    /**
     * Registers a subscription in the session map and its fan-out index.
     *
     * @param subscription - The subscription to add.
     */
    add(subscription: Subscription): void {
        const { session, subId, destination, user } = subscription;
        let bySubId = this.#subscriptions.get(session);
        if (bySubId === undefined) {
            bySubId = new Map();
            this.#subscriptions.set(session, bySubId);
        }
        bySubId.set(subId, subscription);

        if (destination.startsWith('/user/')) {
            if (user !== null) {
                const suffix = destination.slice('/user/'.length);
                let scope = this.#byUser.get(user);
                if (scope === undefined) {
                    scope = new Map();
                    this.#byUser.set(user, scope);
                }
                let listeners = scope.get(suffix);
                if (listeners === undefined) {
                    listeners = [];
                    scope.set(suffix, listeners);
                }
                listeners.push(subscription);
            }
            return;
        }

        const subscribers = this.#byDestination.get(destination);
        if (subscribers === undefined) {
            this.#byDestination.set(destination, [subscription]);
        } else {
            subscribers.push(subscription);
        }
    }

    /**
     * Removes a subscription from every index and releases its tracking.
     *
     * @param session - The owning session.
     * @param subscription - The subscription to remove.
     */
    remove(session: SocketSession, subscription: Subscription): void {
        const bySubId = this.#subscriptions.get(session);
        bySubId?.delete(subscription.subId);
        subscription.buffered = [];
        this.extractUnacked(subscription, () => true);

        if (subscription.destination.startsWith('/user/')) {
            // REV-005: use the principal bound at SUBSCRIBE time — a re-resolve
            // here could return a different (or null) principal and strand the
            // subscription in the old scope.
            const user = subscription.user;
            if (user !== null) {
                const suffix = subscription.destination.slice('/user/'.length);
                const scope = this.#byUser.get(user)?.get(suffix);
                if (scope !== undefined) {
                    const index = scope.indexOf(subscription);
                    if (index >= 0) {
                        scope.splice(index, 1);
                    }
                }
                this.#pruneUserScope(user, suffix);
            }
        } else {
            const subscribers = this.#byDestination.get(subscription.destination);
            if (subscribers !== undefined) {
                const index = subscribers.indexOf(subscription);
                if (index >= 0) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    this.#byDestination.delete(subscription.destination);
                }
            }
        }
        if (bySubId?.size === 0 && session.isClosed) {
            this.#subscriptions.delete(session);
        }
    }

    /**
     * Removes every subscription and the delivery state for a session.
     *
     * @param session - The ended session.
     */
    dropSession(session: SocketSession): void {
        const bySubId = this.#subscriptions.get(session);
        if (bySubId !== undefined) {
            // Snapshot: remove mutates the map it walks.
            // oxlint-disable-next-line unicorn/no-useless-spread -- the spread is the snapshot; a live iterator would be invalidated by the removals.
            for (const subscription of [...bySubId.values()]) {
                this.remove(session, subscription);
            }
            this.#subscriptions.delete(session);
        }
        this.#sessionState.delete(session);
    }

    /**
     * Tracks a delivered message for `client`/`client-individual`, enforcing
     * every bound oldest-first.
     *
     * @param subscription - The subscription the MESSAGE went to.
     * @param messageId - The delivered message id.
     * @param destination - The delivered destination.
     * @param body - The delivered body.
     * @param headers - The delivered pass-through headers.
     */
    track(
        subscription: Subscription,
        messageId: string,
        destination: string,
        body: StompBody,
        headers: Record<string, string>
    ): void {
        if (subscription.ack === 'auto' || this.#limits.maxUnacked <= 0) {
            return;
        }
        const bytes = materialOctets(body);
        this.#deliverySeq += 1;
        const stored: StoredMessage = {
            messageId,
            destination,
            body,
            headers: { ...headers },
            bytes,
            deliverySeq: this.#deliverySeq,
        };
        subscription.unacked.put(stored);
        subscription.unackedBytes += bytes;
        const state = this.stateFor(subscription.session);
        // REV-004: one logical message can be outstanding under several of
        // the session's subscriptions — keep every owner.
        const owners = state.messageIds.get(messageId);
        if (owners === undefined) {
            state.messageIds.set(messageId, [subscription]);
        } else if (!owners.includes(subscription)) {
            owners.push(subscription);
        }
        state.unackedBytes += bytes;

        while (subscription.unacked.length > this.#limits.maxUnacked) {
            this.#evictOldest(subscription);
        }
        while (this.#limits.maxUnackedBytes > 0 && subscription.unackedBytes > this.#limits.maxUnackedBytes) {
            this.#evictOldest(subscription);
        }
        while (this.#limits.maxUnackedSessionBytes > 0 && state.unackedBytes > this.#limits.maxUnackedSessionBytes) {
            if (!this.#evictSessionOldest(subscription.session)) {
                break;
            }
        }
    }

    /**
     * Removes tracked entries matching a predicate, keeping the rest ordered.
     *
     * @param subscription - The subscription to edit.
     * @param remove - Predicate selecting the entries to drop.
     * @returns The removed entries, oldest-first.
     */
    extractUnacked(subscription: Subscription, remove: (entry: StoredMessage) => boolean): StoredMessage[] {
        const { unacked } = subscription;
        const kept: StoredMessage[] = [];
        const removed: StoredMessage[] = [];
        while (unacked.length > 0) {
            const entry = unacked.get() as StoredMessage;
            if (remove(entry)) {
                removed.push(entry);
                this.#untrack(subscription, entry);
            } else {
                kept.push(entry);
            }
        }
        for (const entry of kept) {
            unacked.put(entry);
        }
        return removed;
    }

    /** Drops a subscription's oldest tracked delivery. */
    #evictOldest(subscription: Subscription): void {
        const entry = subscription.unacked.get();
        if (entry !== undefined) {
            this.#untrack(subscription, entry);
        }
    }

    /** Drops the session's oldest tracked delivery across its subscriptions. */
    #evictSessionOldest(session: SocketSession): boolean {
        const bySubId = this.#subscriptions.get(session);
        if (bySubId === undefined) {
            return false;
        }
        let victim: { subscription: Subscription; deliverySeq: number } | undefined;
        for (const subscription of bySubId.values()) {
            for (const entry of subscription.unacked) {
                if (victim === undefined || entry.deliverySeq < victim.deliverySeq) {
                    victim = { subscription, deliverySeq: entry.deliverySeq };
                }
            }
        }
        if (victim === undefined) {
            return false;
        }
        const oldestSeq = victim.deliverySeq;
        this.extractUnacked(victim.subscription, (entry) => entry.deliverySeq === oldestSeq);
        return true;
    }

    /** Releases one entry's accounting. */
    #untrack(subscription: Subscription, entry: StoredMessage): void {
        subscription.unackedBytes = Math.max(0, subscription.unackedBytes - entry.bytes);
        const state = this.#sessionState.get(subscription.session);
        if (state === undefined) {
            return;
        }
        state.unackedBytes = Math.max(0, state.unackedBytes - entry.bytes);
        const owners = state.messageIds.get(entry.messageId);
        if (owners !== undefined) {
            const index = owners.indexOf(subscription);
            if (index >= 0) {
                owners.splice(index, 1);
            }
            if (owners.length === 0) {
                state.messageIds.delete(entry.messageId);
            }
        }
    }

    /** Drops a user's now-empty scope (and empty user entry). */
    #pruneUserScope(user: string, suffix: string): void {
        const scopes = this.#byUser.get(user);
        if (scopes === undefined) {
            return;
        }
        if (scopes.get(suffix)?.length === 0) {
            scopes.delete(suffix);
        }
        if (scopes.size === 0) {
            this.#byUser.delete(user);
        }
    }
}
