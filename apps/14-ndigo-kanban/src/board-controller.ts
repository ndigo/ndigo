/**
 * The REST surface — the only mutation channel.
 *
 * ```
 * GET    /api/boards/:id            → { board: BoardSnapshot }
 * POST   /api/boards/:id/cards      → 201 { card }   (body: { title, columnId?, position? })
 * POST   /api/columns/:columnId/cards → 201 { card } (body: { title, position? })
 * PATCH  /api/cards/:cardId         → 200 { card }   (body: { version, title?, columnId?, position? })
 * DELETE /api/cards/:cardId         → 204
 * ```
 *
 * Bodies are validated by `validatedBody` against `board-model`'s schemas (a
 * violation is the platform's `422` problem document); every handler outcome
 * the service reports as a problem becomes an RFC 9457 `application/problem+json`
 * response at the same status — including the `409` that carries the current
 * card so the client can reconcile without a second round trip.
 *
 * @module ndigo-kanban
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import {
    deleteMapping,
    getMapping,
    parameters,
    patchMapping,
    pathVariable,
    postMapping,
    requestMapping,
    validatedBody,
} from '@ndigo/dispatcher';
import { ResponseStatuses } from '@ndigo/http';
import type { ResponseStatus } from '@ndigo/http';
import { ResponseEntity, problemEntity } from '@ndigo/platform-node';
import type { ProblemDetails } from '@ndigo/platform-node';
import { CreateCardSchema, CreateColumnCardSchema, UpdateCardSchema } from './board-model';
import type { CreateCardInput, CreateColumnCardInput, UpdateCardInput } from './board-model';
import type { BoardProblem, BoardService } from './board-service';
import { notFoundProblem } from './board-service';

/** The status objects a service problem can be rendered at. */
const PROBLEM_STATUSES: Readonly<Record<number, ResponseStatus>> = {
    400: ResponseStatuses.BAD_REQUEST,
    404: ResponseStatuses.NOT_FOUND,
    409: ResponseStatuses.CONFLICT,
};

/**
 * Renders a service problem as an RFC 9457 problem response.
 *
 * @param problem - The problem the service reported.
 * @returns A `ResponseEntity` the response-entity view writes as
 *   `application/problem+json`.
 */
function problemResponse(problem: BoardProblem): ResponseEntity<ProblemDetails> {
    return problemEntity(PROBLEM_STATUSES[problem.status] ?? ResponseStatuses.BAD_REQUEST, problem);
}

/**
 * Boards, columns and cards over HTTP.
 */
@requestMapping('/api')
export class BoardController {
    readonly #boards: BoardService;

    /**
     * @param boards - The board service (the persistence + concurrency seam).
     */
    constructor(boards: BoardService) {
        this.#boards = boards;
    }

    /** `GET /api/boards/:id` — the whole board, columns and cards ordered. */
    @getMapping('/boards/:id')
    @parameters({ id: pathVariable('id') })
    board(id: string) {
        const snapshot = this.#boards.snapshot(id);
        return snapshot === undefined ? problemResponse(notFoundProblem('board', id)) : { board: snapshot };
    }

    /** `POST /api/boards/:id/cards` — create a card (column optional). */
    @postMapping('/boards/:id/cards')
    @parameters({ id: pathVariable('id'), body: validatedBody(CreateCardSchema) })
    async createCard(id: string, body: CreateCardInput) {
        const outcome = await this.#boards.createCard(id, body);
        return outcome.ok
            ? new ResponseEntity({ card: outcome.value }, ResponseStatuses.CREATED)
            : problemResponse(outcome.problem);
    }

    /** `POST /api/columns/:columnId/cards` — create a card in a named column. */
    @postMapping('/columns/:columnId/cards')
    @parameters({ columnId: pathVariable('columnId'), body: validatedBody(CreateColumnCardSchema) })
    async createCardInColumn(columnId: string, body: CreateColumnCardInput) {
        const outcome = await this.#boards.createCardInColumn(columnId, body);
        return outcome.ok
            ? new ResponseEntity({ card: outcome.value }, ResponseStatuses.CREATED)
            : problemResponse(outcome.problem);
    }

    /**
     * `PATCH /api/cards/:cardId` — rename, reorder or move a card.
     *
     * The body's `version` is the concurrency token; a stale value is answered
     * with `409` and the current card.
     */
    @patchMapping('/cards/:cardId')
    @parameters({ cardId: pathVariable('cardId'), body: validatedBody(UpdateCardSchema) })
    async updateCard(cardId: string, body: UpdateCardInput) {
        const outcome = await this.#boards.updateCard(cardId, body);
        return outcome.ok ? { card: outcome.value } : problemResponse(outcome.problem);
    }

    /** `DELETE /api/cards/:cardId` — remove a card. */
    @deleteMapping('/cards/:cardId')
    @parameters({ cardId: pathVariable('cardId') })
    async deleteCard(cardId: string) {
        const outcome = await this.#boards.deleteCard(cardId);
        return outcome.ok ? ResponseEntity.noContent() : problemResponse(outcome.problem);
    }
}
