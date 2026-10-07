/**
 * The STOMP interop endpoint: `WS /stomp/chat`.
 *
 * The platform's `StompBroker` owns this destination namespace, so a
 * third-party STOMP 1.2 client (e.g. `@stomp/stompjs`) can connect, subscribe
 * to `/topic/chat`, SEND, and receive its own fan-out (room-echo parity) —
 * the transport-agnostic cross-check of the raw `@socketMapping` room. The
 * endpoint carries no auth wiring, so it is exercisable standalone; receipts
 * are the broker's own.
 * @module blue-chat
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { parameters, requestMapping, socketSessionValue, stompMapping, type SocketSession } from '@blue/dispatcher';
import { StompBroker } from '@blue/socket';

/** The destination STOMP chat clients subscribe to. */
export const CHAT_DESTINATION = '/topic/chat';

/**
 * The STOMP chat broker — one `StompBroker` owns the destination namespace for
 * this app.
 */
@requestMapping('/stomp')
export class StompChatController {
    /** The broker serving every `/stomp/chat` connection. */
    readonly broker = new StompBroker();

    /**
     * STOMP endpoint: the broker runs the full protocol for this connection
     * (CONNECT negotiation, SUBSCRIBE/SEND fan-out, receipts).
     *
     * @param session - The upgraded connection's session.
     */
    @stompMapping('/chat')
    @parameters({ session: socketSessionValue('session') })
    async chat(session: SocketSession): Promise<void> {
        await this.broker.handleSocket(session);
    }
}
