/**
 * Request validation schemas and the Todo-Backend wire shape.
 */
import { z } from 'zod';
import type { Todo } from './todo.entity';

/**
 * Body of `POST /todos`.
 *
 * `title` is the only required field. `order`, `completed`, `url` and `id` are
 * client-owned: a client that supplies a `url`/`id` gets it back verbatim
 * (round-trip contract), and a client that omits `order` gets the next
 * append position.
 */
export const createTodoSchema = z.object({
    title: z.string().min(1),
    order: z.number().optional(),
    completed: z.boolean().optional(),
    id: z.union([z.string().min(1), z.number()]).optional(),
    url: z.string().min(1).optional(),
});

/**
 * Body of `PUT`/`PATCH /todos/:id`.
 *
 * Every field is optional — the app applies whichever fields the request
 * carries and leaves the rest untouched (a `PATCH`-style merge for both verbs;
 * the Todo-Backend spec never defines an "absent field" contract for PUT, and
 * the official runner only ever PATCHes).
 */
export const updateTodoSchema = z.object({
    title: z.string().min(1).optional(),
    order: z.number().optional(),
    completed: z.boolean().optional(),
});

/** Validated `POST /todos` body. */
export type CreateTodoInput = z.infer<typeof createTodoSchema>;

/** Validated `PUT`/`PATCH /todos/:id` body. */
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

/**
 * The wire shape of one todo — exactly the five documented fields.
 */
export interface TodoJSON {
    /** Stable identifier; also the trailing segment of `url`. */
    id: number | string;
    /** The todo text. */
    title: string;
    /** Client-owned sort key. */
    order: number;
    /** Completion flag. */
    completed: boolean;
    /** Absolute url of the todo resource. */
    url: string;
}

/**
 * Projects a stored todo onto the wire shape.
 *
 * A client-supplied `url` is returned unchanged (round-trip); otherwise the
 * todo's url is the request origin plus `/todos/<id>`, built per request so
 * the url always names the host the client actually reached.
 *
 * @param todo - The stored row.
 * @param origin - The request's absolute origin (e.g. `http://localhost:3030`).
 * @returns The five-field wire object.
 */
export function toWireTodo(todo: Todo, origin: string): TodoJSON {
    return {
        id: todo.id,
        title: todo.title,
        order: todo.order,
        completed: todo.completed,
        url: todo.url ?? `${origin}/todos/${todo.id}`,
    };
}
