import '@tsmetadata/polyfill';
import { getMapping, postMapping, routeParams, bodyValue, headerValue } from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import { InMemoryDataSource, InMemoryEntityManager } from '@blue/orm';
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
    @routeParams({ token: headerValue('authorization'), data: bodyValue('*') })
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
