import { getMapping, postMapping, parameters, headerValue, pathValue, validatedBody, requestMapping } from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import { insertSchemaForEntity } from '@blue/orm';
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
@requestMapping('/drizzle')
export class DrizzleNoteController {
    readonly #entityManager: DrizzleEntityManager;

    constructor() {
        this.#entityManager = new DrizzleEntityManager(dataSource);
    }

    @getMapping('/notes')
    @parameters({ token: headerValue('authorization') })
    async list(token: string | undefined) {
        const bearer = token?.replace(/^Bearer\s+/i, '');
        if (!bearer || !lookupPrincipal(bearer)) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
        }
        await ensureInit();
        return { notes: await this.#entityManager.findAll(DrizzleNote) };
    }

    @getMapping('/notes/:id')
    @parameters({ token: headerValue('authorization'), id: pathValue('id') })
    async getById(token: string | undefined, id: string) {
        const bearer = token?.replace(/^Bearer\s+/i, '');
        if (!bearer || !lookupPrincipal(bearer)) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
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
    @parameters({
        token: headerValue('authorization'),
        // Request-body validation derived from the entity (Phase 3 dogfood):
        // the Drizzle entity's column constraint rejects an empty title with
        // a 400 before the SQL write.
        data: validatedBody(insertSchemaForEntity(DrizzleNote)),
    })
    async create(token: string | undefined, data: Record<string, unknown>) {
        const bearer = token?.replace(/^Bearer\s+/i, '');
        if (!bearer || !lookupPrincipal(bearer)) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
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
