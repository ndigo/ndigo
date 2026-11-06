/**
 * The app's composition root.
 *
 * Registered **after** `NodeAutoConfiguration`, so the one entry it redeclares —
 * `socketSessionRegistry` — replaces the platform default (the registry is
 * last-write-wins). That entry hands the HTTP server the backend's registry,
 * which is the only seam that matters for fan-out: the server resolves the bean
 * when it starts, so broadcasts from this node's controllers reach this node's
 * sessions *and*, through the fan-out, every other node's.
 *
 * The backend bean is created once (a field, not per entry call) and returned
 * both from its own entry and to every controller: the container registers
 * exactly one instance, and `context.getValue(FANOUT_BACKEND)` hands out that
 * same one.
 */
import '@tsmetadata/polyfill';
import { configuration, entry } from '@ndigo/context';
import { NodeSocketSessionRegistry, SOCKET_SESSION_REGISTRY } from '@ndigo/platform-node';
import { BoardController } from './board-controller';
import { BoardSocketController } from './board-socket-controller';
import { CacheController } from './cache-controller';
import { FANOUT_BACKEND, FanoutBackend } from './fanout-backend';

/**
 * Wires the backend, the socket registry, and the three controllers.
 */
@configuration
export class RedisFanoutConfiguration {
    readonly #backend = new FanoutBackend();

    /** The backend (mode, cache, registry, resources), addressable as a bean. */
    @entry(FANOUT_BACKEND)
    fanoutBackend(): FanoutBackend {
        return this.#backend;
    }

    /**
     * The socket session registry the HTTP server adopts as its adapter's.
     *
     * Returning the backend's own instance is what connects the server's live
     * sessions to the fan-out — the bean *is* the registry the server registers
     * connections in, so there is no second, disjoint registry to keep in sync.
     *
     * @returns The backend's registry, fan-out included.
     */
    @entry(SOCKET_SESSION_REGISTRY)
    socketSessionRegistry(): NodeSocketSessionRegistry {
        return this.#backend.registry;
    }

    /** `GET /cache/:key` — the shared cache. */
    @entry()
    cacheController() {
        return new CacheController(this.#backend);
    }

    /** `POST /board` — publish without a socket. */
    @entry()
    boardController() {
        return new BoardController(this.#backend);
    }

    /** `WS /ws/board` — the broadcast board. */
    @entry()
    boardSocketController() {
        return new BoardSocketController(this.#backend);
    }
}
