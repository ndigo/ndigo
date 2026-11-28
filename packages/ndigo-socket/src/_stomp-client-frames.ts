/**
 * Inbound frame draining and routing for the STOMP client.
 */
import { parseStompFrame, STOMPProtocolError, type STOMPFrame } from './stomp-frame.js';

/** The session callbacks a routed frame may trigger. */
export interface STOMPFrameRouter {
    /** A CONNECTED frame arrived. */
    onConnected(): void;
    /** A MESSAGE frame arrived. */
    onMessage(frame: STOMPFrame): void;
    /** A RECEIPT frame arrived. */
    onReceipt(receiptId: string): void;
    /** A protocol/session error occurred (terminal). */
    onError(message: string): void;
}

/**
 * Routes one parsed frame to its session callback.
 *
 * ERROR is terminal (decision D-A): STOMP 1.2 §1.5 requires the server to
 * close the connection just after an ERROR frame, so the client ends the
 * session on the frame instead of waiting for the socket to follow.
 *
 * @param frame - The parsed frame.
 * @param router - The session callbacks.
 */
export function routeStompFrame(frame: STOMPFrame, router: STOMPFrameRouter): void {
    switch (frame.command) {
        case 'CONNECTED':
            router.onConnected();
            break;
        case 'MESSAGE':
            router.onMessage(frame);
            break;
        case 'RECEIPT': {
            const receiptId = frame.headers['receipt-id'];
            if (receiptId !== undefined) {
                router.onReceipt(receiptId);
            }
            break;
        }
        case 'ERROR':
            router.onError(frame.headers['message'] ?? 'server error');
            break;
        default:
            break; // SEND/SUBSCRIBE echoes are not server->client
    }
}

/**
 * Consumes the socket's message stream for the lifetime of the client.
 * Never rejects: parse faults and handler faults surface through
 * `router.onError`, and a closed stream is owned by the status watcher.
 *
 * @param source - The socket message stream.
 * @param router - The session callbacks.
 */
export async function drainStompFrames(source: AsyncIterable<unknown>, router: STOMPFrameRouter): Promise<void> {
    try {
        for await (const raw of source) {
            if (typeof raw !== 'string' && !(raw instanceof Uint8Array) && !(raw instanceof ArrayBuffer)) {
                continue; // not a frame-carrying payload
            }
            let frame: STOMPFrame;
            try {
                frame = parseStompFrame(raw as string);
            } catch (error) {
                router.onError(error instanceof STOMPProtocolError ? error.message : 'malformed STOMP frame');
                continue;
            }
            if (frame.command === '') {
                continue; // server heart-beat ping
            }
            try {
                routeStompFrame(frame, router);
            } catch (error) {
                router.onError((error as Error).message);
            }
        }
    } catch {
        // Socket stream ended (reconnecting or closed); the status watcher
        // owns the lifecycle transitions.
    }
}
