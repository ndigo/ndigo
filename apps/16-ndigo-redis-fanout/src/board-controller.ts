/**
 * The scripted board route: post a message with plain HTTP, no socket — the
 * same room, the same payload, the same cross-node fan-out the socket endpoint
 * uses, so a `curl` can drive the demo the WebSocket clients observe.
 * @module ndigo-redis-fanout
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { postMapping, parameters, bodyValue, queryValue, requestMapping } from '@ndigo/dispatcher';
import { ResponseStatuses } from '@ndigo/http';
import { ResponseEntity } from '@ndigo/platform-node';
import { z } from 'zod';
import { BOARD_PATH, BOARD_ROOM, BOARD_TEXT_MAX, boardMessage } from './board-message';
import type { FanoutBackend } from './fanout-backend';

/** The `POST /board` body contract: exactly the text to publish. */
const BoardBody = z.object({ text: z.string().min(1).max(BOARD_TEXT_MAX) });

/**
 * `POST /board` — publish a message into the board room.
 */
@requestMapping('/board')
export class BoardController {
    readonly #backend: FanoutBackend;

    /**
     * @param backend - The backend owning the registry (and its fan-out).
     */
    constructor(backend: FanoutBackend) {
        this.#backend = backend;
    }

    /**
     * Publishes `{ text }` into the board room and answers `202`.
     *
     * The text may arrive as a JSON body or as `?text=` (body wins), so the
     * demo needs neither a socket nor a shell quoting dance. Publication goes
     * through the registry's fan-out, so with Redis configured the message
     * reaches sockets connected to *any* instance — `localClients` reports how
     * many are attached to the instance that accepted the request, which is
     * exactly the number that would have received it without Redis.
     *
     * @param body - The parsed request body (when the client sent one).
     * @param text - The `?text=` fallback.
     * @returns `202` with the published message, or a `400` problem document
     *   when neither source carried a usable text.
     */
    @postMapping('/')
    @parameters({ body: bodyValue(), text: queryValue('text') })
    async post(body: unknown, text: string | undefined) {
        // The body's own `text` wins; `?text=` is the fallback a scripted demo
        // can use without a JSON body at all. One validation path for both, so
        // a body carrying a non-string `text` fails rather than falling back.
        const candidate = body !== null && typeof body === 'object' && 'text' in body ? { text: body.text } : { text };
        const parsed = BoardBody.safeParse(candidate);
        if (!parsed.success) {
            return new ResponseEntity(
                {
                    status: ResponseStatuses.BAD_REQUEST.code,
                    title: 'Bad Request',
                    detail: `expected {"text": string} or ?text=, 1–${BOARD_TEXT_MAX} characters`,
                },
                ResponseStatuses.BAD_REQUEST
            );
        }
        const message = boardMessage(this.#backend.instanceId, parsed.data.text);
        await this.#backend.registry.broadcastTo(BOARD_ROOM, message);
        return new ResponseEntity(
            {
                posted: message,
                localClients: this.#backend.registry.count(BOARD_PATH),
                instanceId: this.#backend.instanceId,
                mode: this.#backend.mode,
            },
            ResponseStatuses.ACCEPTED
        );
    }
}
