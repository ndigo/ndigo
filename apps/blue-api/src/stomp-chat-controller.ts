/**
 * STOMP chat endpoint + scheduler-driven tick — the AD-23 demo gate.
 *
 * Clients on `/stomp/chat` speak STOMP 1.2 over WebSocket: they subscribe
 * to `/topic/chat`, SEND messages (fanned out to all subscribers,
 * including the sender when subscribed — room-echo parity), and receive a
 * `chat-tick` published into the destination every 2 seconds by the
 * scheduler — the scheduler → broker reachability proof (AD-23 D5,
 * mirroring AD-21 D4's scheduler → registry path). The broker implements
 * the full second wave (transactions, ack tracking + redelivery, binary
 * bodies, `/user` scopes, `/queue` backlogs — AD-23 D7–D11) on the same
 * endpoint; the wire-level gates live in `blue-platform-node`'s stomp
 * integration spec.
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { parameters, requestMapping, stompMapping, socketSession, type SocketSession } from '@blue/dispatcher';
import { StompBroker } from '@blue/socket';
import { scheduled } from '@blue/scheduler';

/** The destination every chat client subscribes to. */
export const CHAT_DESTINATION = '/topic/chat';

/**
 * The STOMP chat broker — sockets (`stompMapping`) and scheduled pushes
 * (`scheduled`) on one registered bean.
 */
@requestMapping('/stomp')
export class StompChatController {
    /** The broker owns the destination namespace for this app (D5). */
    readonly broker = new StompBroker();

    /**
     * STOMP endpoint: the broker runs the protocol for this connection
     * (CONNECT negotiation, subscriptions, SEND fan-out, receipts,
     * transactions, acks/redelivery, `/user` scopes, `/queue` backlogs).
     */
    @stompMapping('/chat')
    @parameters({ session: socketSession('session') })
    async chat(session: SocketSession) {
        await this.broker.handleSocket(session);
    }

    /**
     * Periodic tick — the scheduler → broker fan-out path (AD-23 D5).
     */
    @scheduled('*/2 * * * * *')
    chatTick() {
        this.broker.publish(CHAT_DESTINATION, JSON.stringify({ event: 'chat-tick', at: Date.now() }));
    }
}
