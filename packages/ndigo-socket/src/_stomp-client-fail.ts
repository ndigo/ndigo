/**
 * Terminal failure handling for the STOMP client.
 */
import { STOMPProtocolError } from './stomp-frame.js';

/** The session actions a terminal failure performs. */
export interface STOMPFailHost {
    /** Marks the session done and bumps the epoch. */
    endSession(): void;
    /** Aborts a CONNECT handshake in flight. */
    abortHandshake(): void;
    /** Publishes the disconnected state. */
    disconnected(): void;
    /** Rejects every outstanding receipt. */
    settleReceipts(error: Error): void;
    /** Drops buffered sends. */
    drainPending(): void;
    /** Completes every subscription stream. */
    completeSubscriptions(): void;
    /** Completes the closed reader. */
    completeClosed(): void;
    /** Reports through the optional observer. */
    notifyError(message: string): void;
}

/**
 * Fails the STOMP session: rejects outstanding receipts, aborts a handshake
 * in flight, and reports through the observer. The socket may or may not be
 * closing — the caller (or the server's ERROR+close, §1.5) owns transport
 * teardown.
 *
 * @param message - The failure detail.
 * @param host - The session actions.
 */
export function failStompSession(message: string, host: STOMPFailHost): void {
    host.endSession();
    host.abortHandshake();
    host.disconnected();
    host.settleReceipts(new STOMPProtocolError(message));
    host.drainPending();
    // Fail closed: end the subscription streams and the closed reader so no
    // app iterator hangs on a dead session. (The broker closes the transport
    // after ERROR; a CONNECT timeout against a live transport leaves the
    // socket open — the app observes the closed streams and owns teardown.)
    host.completeSubscriptions();
    host.completeClosed();
    host.notifyError(message);
}
