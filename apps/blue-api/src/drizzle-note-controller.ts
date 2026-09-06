import { getMapping, postMapping, routeParams, headerValue, pathValue, bodyValue } from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import { DrizzleDataSource, DrizzleEntityManager } from '@blue/orm-drizzle';
import { DrizzleNote } from './drizzle-note.entity';
import { lookupPrincipal } from './auth-store';

const dataSource = new DrizzleDataSource({ url: ':memory:' });
// Idempotent + async: the first call that awaits init() creates the table;
// subsequent calls short-circuit on #initialized.
let initPromise: Promise<void> | null = null;
function ensureInit(): Promise<void> {
    initPromise ??= dataSource.init([DrizzleNote]);
    return initPromise;
}

/**
 * The demo's Drizzle data source — exported so integration tests can seed the
 * same (in-memory) SQL store the routes read from.
 */
export function getDrizzleDataSource(): DrizzleDataSource {
    return dataSource;
}

/**
 * Drizzle-backed note controller (M2): SQL persistence (read + write) through
 * the framework's async handler support. The in-memory `NoteController`
 * remains the zero-config path; this demonstrates the SQL adapter end-to-end.
 */
@getMapping('/drizzle')
export class DrizzleNoteController {
    readonly #entityManager: DrizzleEntityManager;

    constructor() {
        this.#entityManager = new DrizzleEntityManager(dataSource);
    }

    @getMapping('/notes')
    @routeParams({ token: headerValue('authorization') })
    async list(token: string | undefined) {
        const bearer = token?.replace(/^Bearer\s+/i, '');
        if (!bearer || !lookupPrincipal(bearer)) {
            return ResponseEntity.badRequest({ error: 'Unauthorized' });
        }
        await ensureInit();
        return { notes: await this.#entityManager.findAll(DrizzleNote) };
    }

    @getMapping('/notes/:id')
    @routeParams({ token: headerValue('authorization'), id: pathValue('id') })
    async getById(token: string | undefined, id: string) {
        const bearer = token?.replace(/^Bearer\s+/i, '');
        if (!bearer || !lookupPrincipal(bearer)) {
            return ResponseEntity.badRequest({ error: 'Unauthorized' });
        }
        await ensureInit();
        const note = await this.#entityManager.find(DrizzleNote, Number(id));
        if (!note) {
            return ResponseEntity.notFound();
        }
        return {
            note: { id: note.id, title: note.title, body: note.body, createdAt: note.createdAt },
        };
    }

    @postMapping('/notes')
    @routeParams({ token: headerValue('authorization'), data: bodyValue('*') })
    async create(token: string | undefined, data: Record<string, unknown>) {
        const bearer = token?.replace(/^Bearer\s+/i, '');
        if (!bearer || !lookupPrincipal(bearer)) {
            return ResponseEntity.badRequest({ error: 'Unauthorized' });
        }
        await ensureInit();
        const note = new DrizzleNote();
        note.title = String(data?.['title'] ?? '');
        note.body = String(data?.['body'] ?? '');
        await this.#entityManager.persist(note);
        // Entity fields are decorator-affixed (non-enumerable); return a plain
        // object so JSON serialization carries the values.
        return ResponseEntity.ok({
            note: { id: note.id, title: note.title, body: note.body, createdAt: note.createdAt },
        });
    }
}
