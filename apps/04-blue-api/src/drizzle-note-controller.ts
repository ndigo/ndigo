/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { z } from 'zod';
import {
    getMapping,
    postMapping,
    parameters,
    headerValue,
    pathVariable,
    validatedBody,
    requestMapping,
} from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import { apiDocs } from '@blue/openapi';
import { insertSchemaForEntity } from '@blue/orm';
import { DrizzleDataSource, DrizzleEntityManager } from '@blue/orm-drizzle';
import { HTTPHeaders } from '@blue/http';
import { DrizzleNote } from './drizzle-note.entity';
import { conversionService, noteDtoSchema, noteResponseSchema } from './note.dto';
import { lookupPrincipal } from './auth-store';

/** Insert shape validated against the Drizzle entity's derived schema. */
const noteInsertSchema = insertSchemaForEntity(DrizzleNote);

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
    @apiDocs({ responses: { '200': noteResponseSchema } })
    async list(token: string | undefined) {
        const bearer = HTTPHeaders.AUTHORIZATION.bearerToken(token);
        if (!bearer || !(await lookupPrincipal(bearer))) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
        }
        await ensureInit();
        return {
            notes: conversionService.convert(await this.#entityManager.findAll(DrizzleNote), noteDtoSchema.array()),
        };
    }

    @getMapping('/notes/:id')
    @parameters({ token: headerValue('authorization'), id: pathVariable('id') })
    @apiDocs({ summary: 'Get one note', responses: { '200': noteResponseSchema } })
    async getById(token: string | undefined, id: string) {
        const bearer = HTTPHeaders.AUTHORIZATION.bearerToken(token);
        if (!bearer || !(await lookupPrincipal(bearer))) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
        }
        await ensureInit();
        const note = await this.#entityManager.find(DrizzleNote, Number(id));
        if (!note) {
            return ResponseEntity.notFound();
        }
        return { note: conversionService.convert(note, noteDtoSchema) };
    }

    @postMapping('/notes')
    @parameters({
        token: headerValue('authorization'),
        // Request-body validation derived from the entity (Phase 3 dogfood):
        // the Drizzle entity's column constraint rejects an empty title with
        // a 400 before the SQL write.
        data: validatedBody(insertSchemaForEntity(DrizzleNote)),
    })
    @apiDocs({ responses: { '200': noteResponseSchema } })
    async create(token: string | undefined, data: z.infer<typeof noteInsertSchema>) {
        const bearer = HTTPHeaders.AUTHORIZATION.bearerToken(token);
        if (!bearer || !(await lookupPrincipal(bearer))) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
        }
        await ensureInit();
        // The validated body is already entity-shaped: instantiate and copy
        // (documented request→entity pattern, AD-38 D-6); @prePersist fills
        // createdAt.
        const note = new DrizzleNote();
        Object.assign(note, data);
        await this.#entityManager.persist(note);
        // AD-38: convert back through the DTO schema — the response is a
        // plain object (fields are decorator-affixed non-enumerable on the
        // entity itself) and matches the GET shape exactly.
        return ResponseEntity.ok({ note: conversionService.convert(note, noteDtoSchema) });
    }
}
