/**
 * Fan-out backend wiring for the STOMP broker: the backend subscription is
 * bridged into the local subscriber index, and local topic publishes are sent
 * to the backend when one is configured.
 */
import type { SocketFanout } from './socket-fanout';
import type { StompBody } from './stomp-frame';

/**
 * Construction seams for {@link StompFanout}.
 */
export interface StompFanoutOptions {
    /** The application-owned backend, or `undefined` for local-only fan-out. */
    readonly fanout: SocketFanout | undefined;
    /** Reads the broker's closed flag at delivery time (not at construction). */
    readonly isClosed: () => boolean;
    /** Delivers one backend message to the broker's local subscribers. */
    readonly onLocal: (destination: string, body: StompBody, headers: Record<string, string>) => void;
}

/**
 * Owns the optional cross-node fan-out backend: subscription readiness,
 * backend publishing, and orderly unsubscribe.
 *
 * @example
 * ```ts
 * const fanout = new StompFanout({ fanout: backend, isClosed: () => false, onLocal: deliver });
 * await fanout.connect();
 * ```
 */
export class StompFanout {
    readonly #fanout: SocketFanout | undefined;
    readonly #isClosed: () => boolean;
    readonly #onLocal: (destination: string, body: StompBody, headers: Record<string, string>) => void;
    #ready = false;
    #connecting: Promise<void> | undefined;
    #unsubscribe: (() => Promise<void>) | undefined;
    #closing: Promise<void> | undefined;

    /**
     * @param options - The backend and the broker's local delivery seams.
     */
    constructor(options: StompFanoutOptions) {
        this.#fanout = options.fanout;
        this.#isClosed = options.isClosed;
        this.#onLocal = options.onLocal;
    }

    /**
     * Whether the broker may accept protocol traffic: a configured backend is
     * connected, or no backend is configured.
     */
    get isReady(): boolean {
        return this.#fanout === undefined || this.#ready;
    }

    /**
     * Subscribes to the backend once and resolves when it is ready.
     *
     * @returns A promise that resolves once the backend subscription is live.
     */
    connect(): Promise<void> {
        this.#connecting ??= (async () => {
            if (this.#fanout) {
                this.#unsubscribe = await this.#fanout.subscribe('topic', (message) => {
                    if (!this.#isClosed() && message.key.startsWith('/topic/')) {
                        this.#onLocal(message.key, message.body, message.headers ?? {});
                    }
                });
            }
            this.#ready = true;
        })();
        return this.#connecting;
    }

    /**
     * Waits for a pending connect and unsubscribes from the backend.
     *
     * @returns A promise that resolves once the backend subscription is gone.
     */
    close(): Promise<void> {
        if (this.#closing) return this.#closing;
        this.#closing = (async () => {
            if (this.#connecting) await this.#connecting.catch(() => undefined);
            await this.#unsubscribe?.();
        })();
        return this.#closing;
    }

    /**
     * Publishes a topic message to the backend, if one is configured.
     *
     * @param destination - The `/topic/…` destination.
     * @param body - The serialized body.
     * @param headers - Application headers.
     * @throws When the backend exists but has not been connected yet.
     */
    async publish(destination: string, body: StompBody, headers: Record<string, string>): Promise<void> {
        if (!this.#fanout || !destination.startsWith('/topic/')) {
            return;
        }
        if (!this.#ready) {
            throw new Error('StompBroker is not ready; await connect()');
        }
        await this.#fanout.publish('topic', { key: destination, body, headers });
    }
}
