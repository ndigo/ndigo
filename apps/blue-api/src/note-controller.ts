/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getMapping, postMapping, parameters, headerValue, validatedBody, requestMapping } from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import { insertSchemaForEntity, InMemoryDataSource, InMemoryEntityManager } from '@blue/orm';
import { HTTPHeaders } from '@blue/http';
import { Note } from './note.entity';
import { lookupPrincipal } from './auth-store';

const dataSource = new InMemoryDataSource();
dataSource.init();
const entityManager = new InMemoryEntityManager(dataSource);

@requestMapping('/notes')
export class NoteController {
    @getMapping('/')
    @parameters({ token: headerValue('authorization') })
    async list(token: string | undefined) {
        const bearer = HTTPHeaders.AUTHORIZATION.bearerToken(token);
        if (!bearer || !(await lookupPrincipal(bearer))) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
        }
        return { notes: entityManager.findAll(Note) };
    }

    @postMapping('/')
    @parameters({
        token: headerValue('authorization'),
        // Validate the request body against the entity's derived insert
        // schema (AD-7 + Phase 3 dogfood): rejects an empty title with a 400
        // before persist() runs, with the zod constraint declared on the
        // entity column as the single source of truth.
        data: validatedBody(insertSchemaForEntity(Note)),
    })
    async create(token: string | undefined, data: Record<string, unknown>) {
        const bearer = HTTPHeaders.AUTHORIZATION.bearerToken(token);
        if (!bearer || !(await lookupPrincipal(bearer))) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
        }
        const note = new Note();
        note.title = String(data?.['title'] ?? '');
        note.body = String(data?.['body'] ?? '');
        entityManager.persist(note);
        return { note };
    }
}
