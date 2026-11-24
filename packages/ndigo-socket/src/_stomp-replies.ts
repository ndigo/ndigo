/**
 * STOMP control replies: the guarded control-frame write plus the
 * fail-closed ERROR-and-close path.
 */
import { serializeStompFrame, type StompFrame } from './stomp-frame';
import type { SocketSession } from './socket-session';

/**
 * Write a control frame, tolerating a session that is already closing.
 *
 * The transport can race to CLOSING between the caller's status check and
 * the write, so `session.send` may throw a mid-close `InvalidStateError`. A
 * control reply (CONNECTED/RECEIPT/ERROR) that cannot be written must not
 * reject `handleSocket` (which its owner may invoke without awaiting): the
 * session is already closing and its close path is authoritative.
 *
 * @param session - The session to write to.
 * @param frame - The control frame.
 */
export function controlSend(session: SocketSession, frame: StompFrame): void {
    if (session.isClosed) {
        return;
    }
    try {
        session.send(serializeStompFrame(frame));
    } catch {
        // Raced close (or an unserializable frame): the session's close path
        // owns the outcome — never reject the read loop.
    }
}

/**
 * Emit a RECEIPT frame when the processed frame asked for one
 * (`receipt:` header, STOMP 1.2 §1.6).
 *
 * @param session - The session to reply to.
 * @param frame - The requesting frame.
 * @returns Always `true` — the connection stays open.
 */
export function receipt(session: SocketSession, frame: StompFrame): boolean {
    if (frame.headers['receipt'] !== undefined) {
        controlSend(session, {
            command: 'RECEIPT',
            headers: { 'receipt-id': frame.headers['receipt'] as string },
            body: '',
        });
    }
    return true;
}

/**
 * Fail closed: send an ERROR frame (with `receipt-id` when the frame asked
 * for one), then close — STOMP 1.2 §1.5 requires the close just after the
 * ERROR. Codes: `1002` protocol (default; includes an over-long identifier),
 * `1008` policy (missing user identity on a `/user` bind/SEND, `authorize`
 * or `verifyCredentials` denial), `1011` `/queue` store fault, `1013`
 * replay-budget exhaustion. The caller's frame has already been rejected —
 * no further frames are processed.
 *
 * @param session - The session.
 * @param frame - The offending frame, or `null` when unparseable (or when
 *   the failure is not attributable to one frame).
 * @param message - Human-readable error detail.
 * @param code - Close status code (default `1002`).
 * @returns Always `false` — the connection ends.
 */
export function fail(session: SocketSession, frame: StompFrame | null, message: string, code: number = 1002): boolean {
    const headers: Record<string, string> = { message };
    if (frame !== null && frame.headers['receipt'] !== undefined) {
        headers['receipt-id'] = frame.headers['receipt'] as string;
    }
    if (!session.isClosed) {
        controlSend(session, { command: 'ERROR', headers, body: '' });
        session.close(code, 'protocol error');
    }
    return false;
}
