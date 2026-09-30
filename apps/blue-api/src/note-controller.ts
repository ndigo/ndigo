/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import type { z } from 'zod';
import { getMapping, postMapping, parameters, headerValue, validatedBody, requestMapping } from '@blue/dispatcher';
import { apiDocs } from '@blue/openapi';
import { ResponseEntity } from '@blue/platform-node';
import { insertSchemaForEntity, InMemoryDataSource, InMemoryEntityManager } from '@blue/orm';
import { HTTPHeaders } from '@blue/http';
import { Note } from './note.entity';
import { conversionService, noteDtoSchema, noteResponseSchema } from './note.dto';
import { lookupPrincipal } from './auth-store';

const dataSource = new InMemoryDataSource();
dataSource.init();
const entityManager = new InMemoryEntityManager(dataSource);

/** Insert shape validated against the entity's derived schema. */
const noteInsertSchema = insertSchemaForEntity(Note);

@requestMapping('/notes')
export class NoteController {
    @getMapping('/')
    @parameters({ token: headerValue('authorization') })
    // The response contract is the DTO schema the conversion service converts
    // through (AD-38 D-4): the spec embeds exactly what handlers return.
    @apiDocs({ summary: 'List notes', responses: { '200': noteResponseSchema } })
    async list(token: string | undefined) {
        const bearer = HTTPHeaders.AUTHORIZATION.bearerToken(token);
        if (!bearer || !(await lookupPrincipal(bearer))) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
        }
        // AD-38: entities convert to the DTO shape (pick + computed summary)
        // — raw rows never reach the wire, and decorator-affixed fields
        // serialize because the schema emits plain objects.
        return { notes: conversionService.convert(entityManager.findAll(Note), noteDtoSchema.array()) };
    }

    @postMapping('/')
    @parameters({
        token: headerValue('authorization'),
        // Validate the request body against the entity's derived insert
        // schema (AD-7 + Phase 3 dogfood): rejects an empty title with a 400
        // before persist() runs, with the zod constraint declared on the
        // entity column as the single source of truth.
        data: validatedBody(noteInsertSchema),
    })
    @apiDocs({ responses: { '200': noteResponseSchema } })
    async create(token: string | undefined, data: z.infer<typeof noteInsertSchema>) {
        const bearer = HTTPHeaders.AUTHORIZATION.bearerToken(token);
        if (!bearer || !(await lookupPrincipal(bearer))) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
        }
        // The validated body is already entity-shaped: instantiate and copy
        // (documented request→entity pattern, AD-38 D-6); @prePersist fills
        // createdAt.
        const note = new Note();
        Object.assign(note, data);
        entityManager.persist(note);
        return { note: conversionService.convert(note, noteDtoSchema) };
    }
}
