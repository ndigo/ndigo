/**
 * The socket-side half of "live updates": subscribes to the board service's
 * event stream and fans each accepted write out to the board's room.
 *
 * It is the only component that knows both halves — the domain (the service's
 * events) and the transport (the platform's `SocketSessionRegistry`) — so
 * neither side has to import the other. The registry is read from the
 * application context *at publish time*, because the bean lives in
 * `NodeAutoConfiguration` and may be created after this class.
 *
 * @module blue-kanban
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { AsApplicationContextAware, type ApplicationContext } from '@blue/context';
import type { SocketSessionRegistry } from '@blue/dispatcher';
import { SOCKET_SESSION_REGISTRY } from '@blue/platform-node';
import { getLogger } from '@blue/log';
import type { BoardEvent, BoardService } from './board-service';
import { boardRoom, envelope } from './protocol';

const logger = getLogger('blue-kanban');

/**
 * Fans board events out to the room named after the board.
 *
 * Delivery is **fire-and-forget**: a write is committed and answered over HTTP
 * before the broadcast resolves, so a slow or failing transport can never turn
 * a committed write into an error response. A transport fault is logged; the
 * client's reconnect reconciliation is what repairs a missed event.
 */
export class BoardBroadcaster extends AsApplicationContextAware(Object) {
    /** Injected by the context-aware processor at bean creation. */
    readonly applicationContext!: ApplicationContext;

    /**
     * @param boards - The service whose events are broadcast.
     */
    constructor(boards: BoardService) {
        super();
        boards.onEvent((boardId, event) => {
            void this.#publish(boardId, event);
        });
    }

    /**
     * Sends one event to the board's room.
     *
     * @param boardId - The board the event belongs to.
     * @param event - The event to deliver.
     */
    async #publish(boardId: string, event: BoardEvent): Promise<void> {
        const registry = this.#registry();
        if (registry === null) {
            return;
        }
        try {
            await registry.broadcastTo(boardRoom(boardId), envelope(event.event, event.data, event.at));
        } catch (error) {
            logger.warn(`broadcast failed for ${event.event} on ${boardId}: ${String(error)}`);
        }
    }

    /**
     * @returns The socket registry bean, or `null` when none is configured
     *   (unit instantiation, or a context without the node platform).
     */
    #registry(): SocketSessionRegistry | null {
        const context = this.applicationContext as ApplicationContext | undefined;
        if (context === undefined || !context.hasValue?.(SOCKET_SESSION_REGISTRY)) {
            return null;
        }
        return context.getValue(SOCKET_SESSION_REGISTRY);
    }
}
