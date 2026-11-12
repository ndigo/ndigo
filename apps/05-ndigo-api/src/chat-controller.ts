/**
 * WebSocket chat room + scheduler-driven tick — the AD-21 demo gate.
 *
 * Clients on `/ws/chat` join the `room` group; every client message is
 * fanned out to the whole room (including the sender). A `chat-tick` fires
 * into the room every 2 seconds — the scheduler → registry reachability
 * proof (AD-21 D4): zero-wiring `@scheduled` next to the socket endpoint.
 */
import '@tsmetadata/polyfill';
import { $aware } from '@ndigo/factory';
import type { ApplicationContext, ApplicationContextAware } from '@ndigo/context';
import {
    parameters,
    requestMapping,
    socketMapping,
    socketSessionValue,
    type SocketSession,
    type SocketSessionRegistry,
} from '@ndigo/dispatcher';
import { SOCKET_SESSION_REGISTRY } from '@ndigo/platform-node';
import { scheduled } from '@ndigo/scheduler';

/**
 * The chat room controller — sockets (`,`socketMapping`) and scheduled
 * pushes (`,`scheduled`) on one registered entry.
 */
@requestMapping('/ws')
export class ChatController implements ApplicationContextAware {
    #context: ApplicationContext | null = null;

    /**
     * Marks the value as `Aware` for the factory's aware injection, so
     * `setApplicationContext` runs when this entry is registered.
     */
    get [$aware](): boolean {
        return true;
    }

    /**
     * Injects the owning application context.
     *
     * @param context - The application context that owns this controller.
     */
    setApplicationContext(context: ApplicationContext): void {
        this.#context = context;
    }

    /**
     * Lazy registry resolution: the registry entry is owned by
     * `NodeAutoConfiguration`, so entry creation order never matters — the
     * first socket connection (or tick) resolves it.
     *
     * @returns The socket session registry, or `null` when unavailable
     *   (e.g. unit-instantiated controller).
     */
    #registry(): SocketSessionRegistry | null {
        if (!this.#context?.hasValue?.(SOCKET_SESSION_REGISTRY)) {
            return null;
        }
        return this.#context.getValue(SOCKET_SESSION_REGISTRY);
    }

    /**
     * Chat room endpoint: every client joins the `room` group; each message
     * is broadcast to every session in the room (including the sender).
     * Broadcast-style handler: outbound goes through the registry, so the
     * method consumes `session.messages` without yielding.
     */
    @socketMapping('/chat')
    @parameters({ session: socketSessionValue('session') })
    async chat(session: SocketSession) {
        session.join('room');
        // Resolve once per connection, not per message (context lookups on
        // the hot path).
        const registry = this.#registry();
        for await (const message of session.messages) {
            await registry?.broadcastTo('room', { event: 'chat', data: String(message) });
        }
    }

    /**
     * Periodic room tick — the scheduler → registry fan-out path (AD-21 D4).
     */
    @scheduled('*/2 * * * * *')
    async chatTick() {
        await this.#registry()?.broadcastTo('room', { event: 'chat-tick', at: Date.now() });
    }
}
