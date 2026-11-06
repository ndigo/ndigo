/**
 * The room WebSocket endpoint: `WS /ws/rooms/{room}`.
 *
 * The room name is bound from the path (`pathVariable('room')`), so a client
 * "joins" simply by connecting to that URL. The handler:
 *
 * - joins the registry room (`session.join`) — fan-out is
 *   `registry.broadcastTo(room, …)`,
 * - replays the room's bounded history to the newcomer only,
 * - broadcasts presence (roster + join/leave) to the room, and
 * - relays `message`/`typing` frames to the room (sender included — room-echo
 *   parity).
 *
 * Slow consumers are handled by the platform's backpressure watermark (a
 * session whose transport buffer exceeds the limit is closed `1013`), so no
 * unbounded per-session buffering exists on this path.
 */
import '@tsmetadata/polyfill';
import type { ApplicationContext, ApplicationContextAware } from '@ndigo/context';
import {
    parameters,
    pathVariable,
    requestMapping,
    socketMapping,
    socketSessionValue,
    type SocketSession,
    type SocketSessionRegistry,
} from '@ndigo/dispatcher';
import { $aware } from '@ndigo/factory';
import { SOCKET_SESSION_REGISTRY } from '@ndigo/platform-node';
import { getLogger } from '@ndigo/log';
import { envelope, MAX_MESSAGE_LENGTH, parseInbound, ROOM_NAME, SERVER } from './protocol';
import type { ChatMessage } from './room-service';
import { RoomService } from './room-service';

const logger = getLogger('ndigo-chat');

/**
 * The per-room socket endpoint — sockets (`@socketMapping`) and the room
 * history/presence bean on one registered controller.
 */
@requestMapping('/ws/rooms')
export class RoomController implements ApplicationContextAware {
    #context: ApplicationContext | null = null;
    readonly #rooms: RoomService;

    /**
     * @param rooms - The shared room history/presence store.
     */
    constructor(rooms: RoomService) {
        this.#rooms = rooms;
    }

    /** Marks this bean for aware injection (the registry is resolved lazily). */
    get [$aware](): boolean {
        return true;
    }

    /**
     * @param context - The application context that owns this controller.
     */
    setApplicationContext(context: ApplicationContext): void {
        this.#context = context;
    }

    /**
     * Lazily resolves the socket registry — the bean is owned by
     * `NodeAutoConfiguration`, so entry creation order never matters.
     *
     * @returns The registry, or `null` when unavailable (unit instantiation).
     */
    #registry(): SocketSessionRegistry | null {
        if (!this.#context?.hasValue?.(SOCKET_SESSION_REGISTRY)) {
            return null;
        }
        return this.#context.getValue(SOCKET_SESSION_REGISTRY);
    }

    /**
     * Reads the display name from the upgrade query (`?user=Alice`),
     * normalizing it to a bounded, printable token.
     *
     * @param session - The live session.
     * @returns The display name, defaulting to `guest`.
     */
    #userOf(session: SocketSession): string {
        const raw = session.query['user'];
        const value = Array.isArray(raw) ? raw[0] : raw;
        const trimmed = typeof value === 'string' ? value.trim() : '';
        const sanitized = trimmed
            .replace(/[^\w .-]/g, '')
            .trim()
            .slice(0, 32);
        return sanitized === '' ? 'guest' : sanitized;
    }

    /**
     * Room endpoint: join, replay history, announce presence, then relay frames
     * until the peer closes.
     *
     * @param session - The connection's session.
     * @param room - The path-bound room name.
     */
    @socketMapping('/{room}')
    @parameters({ session: socketSessionValue('session'), room: pathVariable('room') })
    async room(session: SocketSession, room: string): Promise<void> {
        const registry = this.#registry();
        const parsed = ROOM_NAME.safeParse(room);
        if (!parsed.success || registry === null) {
            session.close(1008, 'invalid room');
            return;
        }
        const name = parsed.data;
        const user = this.#userOf(session);

        session.join(name);
        this.#rooms.join(name, session, user);
        // History replay goes to the newcomer only (the room already has it).
        session.send(envelope('history', { room: name, messages: [...this.#rooms.history(name)] }, SERVER));
        await registry.broadcastTo(
            name,
            envelope('presence', { room: name, users: this.#rooms.users(name), joined: user }, SERVER)
        );
        logger.info(`join room=${name} user=${user} (${this.#rooms.memberCount(name)} present)`);

        try {
            for await (const raw of session.messages) {
                await this.#relay(name, user, session, raw, registry);
            }
        } finally {
            const left = this.#rooms.leave(name, session);
            session.leave(name);
            await registry.broadcastTo(
                name,
                envelope('presence', { room: name, users: this.#rooms.users(name), left }, SERVER)
            );
            logger.info(`leave room=${name} user=${left ?? user}`);
        }
    }

    /**
     * Handles one inbound frame: append + fan out a `message`, fan out a
     * `typing` flag, or answer an unknown event with an `error` frame.
     */
    async #relay(
        room: string,
        user: string,
        session: SocketSession,
        raw: unknown,
        registry: SocketSessionRegistry
    ): Promise<void> {
        const frame = parseInbound(raw);
        if (frame === null) {
            session.send(envelope('error', { reason: 'malformed frame' }, SERVER));
            return;
        }
        switch (frame.event) {
            case 'message': {
                const text = typeof frame.data === 'string' ? frame.data.trim() : '';
                if (text === '' || text.length > MAX_MESSAGE_LENGTH) {
                    session.send(envelope('error', { reason: 'invalid message' }, SERVER));
                    return;
                }
                const message: ChatMessage = { id: crypto.randomUUID(), from: user, text, at: Date.now() };
                this.#rooms.append(room, message);
                await registry.broadcastTo(room, envelope('message', message, user, message.at));
                return;
            }
            case 'typing': {
                await registry.broadcastTo(room, envelope('typing', Boolean(frame.data), user));
                return;
            }
            default: {
                session.send(envelope('error', { reason: `unknown event: ${frame.event}` }, SERVER));
            }
        }
    }
}
