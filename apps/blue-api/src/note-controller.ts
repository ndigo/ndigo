import '@tsmetadata/polyfill';
import { getMapping, postMapping, routeParams, headerValue, validatedBody } from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import { insertSchemaForEntity, InMemoryDataSource, InMemoryEntityManager } from '@blue/orm';
import { Note } from './note.entity';
import { lookupPrincipal } from './auth-store';

const dataSource = new InMemoryDataSource();
dataSource.init();
const entityManager = new InMemoryEntityManager(dataSource);

@getMapping('/notes')
export class NoteController {
    @getMapping('/')
    @routeParams({ token: headerValue('authorization') })
    list(token: string | undefined) {
        const bearer = token?.replace(/^Bearer\s+/i, '');
        if (!bearer || !lookupPrincipal(bearer)) {
            return ResponseEntity.badRequest({ error: 'Unauthorized' });
        }
        return { notes: entityManager.findAll(Note) };
    }

    @postMapping('/')
    @routeParams({
        token: headerValue('authorization'),
        // Validate the request body against the entity's derived insert
        // schema (AD-7 + Phase 3 dogfood): rejects an empty title with a 400
        // before persist() runs, with the zod constraint declared on the
        // entity column as the single source of truth.
        data: validatedBody(insertSchemaForEntity(Note)),
    })
    create(token: string | undefined, data: Record<string, unknown>) {
        const bearer = token?.replace(/^Bearer\s+/i, '');
        if (!bearer || !lookupPrincipal(bearer)) {
            return ResponseEntity.badRequest({ error: 'Unauthorized' });
        }
        const note = new Note();
        note.title = String(data?.['title'] ?? '');
        note.body = String(data?.['body'] ?? '');
        entityManager.persist(note);
        return { note };
    }
}
