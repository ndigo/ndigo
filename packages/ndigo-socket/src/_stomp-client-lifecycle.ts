/**
 * Socket-status lifecycle wiring for the STOMP client.
 */
import { effect } from '@ndigo/signals';
import type { SocketStatus } from './socket-client-types.js';

/** The session actions the status watcher drives. */
export interface STOMPLifecycleHost {
    /** The current socket status. */
    readonly status: SocketStatus;
    /** Whether the STOMP session is done. */
    readonly done: boolean;
    /** The configured reconnect policy (`false` disables session reconnects). */
    readonly reconnect: boolean | undefined;
    /** Whether the transport is open and the session still live. */
    shouldOpen(): boolean;
    /** Queues the CONNECT pass for this open. */
    scheduleOpen(): void;
    /** Marks the session for a reconnect and settles wire-sent receipts. */
    reconnecting(): void;
    /** Ends the session on a terminal socket close. */
    closed(): void;
    /** Ends the session without a transport close (reconnect disabled). */
    end(): void;
    /** Ends every stream and the closed reader. */
    sessionEnded(): void;
}

/**
 * Rides the socket status signal (the `/reactivity` idiom, not a poll
 * loop): every transport open is a fresh STOMP session — CONNECT, then
 * re-SUBSCRIBE, then flush.
 *
 * @param getHost - Reads live session state on each status change.
 */
export function watchStompStatus(getHost: () => STOMPLifecycleHost): void {
    effect(() => {
        const host = getHost();
        if (host.status === 'open') {
            if (host.shouldOpen()) {
                host.scheduleOpen();
            }
        } else if (host.status === 'reconnecting') {
            host.reconnecting();
            if (host.reconnect === false) {
                // The STOMP session does not ride reconnects: end it at the
                // drop (the socket may still come back; we are done).
                host.end();
            }
        } else if (host.status === 'closed') {
            host.closed();
        }
    });
}
