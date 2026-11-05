/**
 * In-memory todo store on `@ndigo/orm` — the app's only persistence seam.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { InMemoryDataSource, InMemoryEntityManager, InMemoryRepository } from '@ndigo/orm';
import { Todo } from './todo.entity';
import type { CreateTodoInput, UpdateTodoInput } from './todo.dto';

/** The id spelling a todo url can carry (path segments are always strings). */
export type TodoId = string | number;

/** Canonical non-negative integer spelling — `'1'`, never `'1.0'` or `' 1'`. */
const canonicalInteger = /^\d+$/;

/**
 * A `@ndigo/orm` repository over an in-memory data source: the Todo-Backend
 * store needs no migrations, no durability and no relations, so the ORM's
 * in-memory pair (`InMemoryDataSource` + `InMemoryEntityManager`) is wired
 * directly. Swapping in a durable `DataSource` (e.g. the Drizzle/SQLite one
 * `05-ndigo-api` uses) changes only this constructor.
 *
 * Ids are generated numbers unless a client supplied one, but urls carry the
 * id as a **string** path segment, so `find` resolves both spellings:
 * `/todos/1` reaches the row whose id is the number `1`.
 */
export class TodoStore {
    readonly #repository: InMemoryRepository<Todo, TodoId>;

    constructor() {
        const dataSource = new InMemoryDataSource();
        dataSource.init();
        this.#repository = new InMemoryRepository(Todo, new InMemoryEntityManager(dataSource));
    }

    /**
     * All todos, in insertion order (the spec's list order is stable; `order`
     * is a client-owned value the server never re-sorts on).
     *
     * @returns Every stored todo.
     */
    list(): Todo[] {
        return this.#repository.findAll();
    }

    /**
     * Resolves one todo from its url segment: exact key first, then the
     * numeric spelling of a digit-only segment (path segments arrive as
     * strings; generated ids are numbers).
     *
     * @param id - The raw `:id` path segment.
     * @returns The todo, or `undefined` when none matches.
     */
    find(id: TodoId): Todo | undefined {
        const exact = this.#repository.findById(id);
        if (exact !== undefined) {
            return exact;
        }
        return typeof id === 'string' && canonicalInteger.test(id) ? this.#repository.findById(Number(id)) : undefined;
    }

    /**
     * Appends a todo, filling every server-owned default.
     *
     * @param input - The validated `POST /todos` body.
     * @returns The persisted row (with its generated or client-supplied id).
     */
    create(input: CreateTodoInput): Todo {
        const todo = new Todo();
        todo.title = input.title;
        todo.order = input.order ?? this.#nextOrder();
        todo.completed = input.completed ?? false;
        todo.url = input.url ?? null;
        if (input.id !== undefined) {
            todo.id = input.id;
        }
        return this.#repository.save(todo);
    }

    /**
     * Applies the fields a `PUT`/`PATCH` body carries.
     *
     * @param id - The raw `:id` path segment.
     * @param patch - The validated update body.
     * @returns The updated row, or `undefined` when the id does not exist.
     */
    update(id: TodoId, patch: UpdateTodoInput): Todo | undefined {
        const todo = this.find(id);
        if (todo === undefined) {
            return undefined;
        }
        if (patch.title !== undefined) {
            todo.title = patch.title;
        }
        if (patch.order !== undefined) {
            todo.order = patch.order;
        }
        if (patch.completed !== undefined) {
            todo.completed = patch.completed;
        }
        return this.#repository.save(todo);
    }

    /**
     * Deletes one todo.
     *
     * @param id - The raw `:id` path segment.
     * @returns `true` when a row was removed.
     */
    remove(id: TodoId): boolean {
        const todo = this.find(id);
        return todo !== undefined && this.#repository.deleteById(todo.id);
    }

    /**
     * Deletes every todo — the spec's `DELETE /todos` collection reset.
     * Generated ids keep counting up (rows are removed individually rather
     * than clearing the data source), so a url handed out earlier is never
     * silently recycled by a later create.
     */
    removeAll(): void {
        for (const todo of this.#repository.findAll()) {
            this.#repository.deleteById(todo.id);
        }
    }

    /** One past the highest `order` in the store, so new todos append. */
    #nextOrder(): number {
        let highest = 0;
        for (const todo of this.#repository.findAll()) {
            if (todo.order > highest) {
                highest = todo.order;
            }
        }
        return highest + 1;
    }
}
