/**
 * @author opencode
 */

import '@tsmetadata/polyfill';
import { routeMapping, routeParams, bodyValue, headerValue } from '@blue/dispatcher';
import { InMemoryDataSource, InMemoryEntityManager } from '@blue/orm';
import { Note } from './note.entity';
import { lookupPrincipal } from './auth-store';

const dataSource = new InMemoryDataSource();
dataSource.init();
const entityManager = new InMemoryEntityManager(dataSource);

@routeMapping('/notes')
export class NoteController {
    @routeMapping('/')
    @routeParams({ token: headerValue('authorization') })
    list(token: string | undefined) {
        const bearer = token?.replace(/^Bearer\s+/i, '');
        if (!bearer || !lookupPrincipal(bearer)) {
            return { error: 'Unauthorized' };
        }
        return { notes: entityManager.findAll(Note) };
    }

    @routeMapping('/')
    @routeParams({ token: headerValue('authorization'), data: bodyValue('*') })
    create(token: string | undefined, data: Record<string, unknown>) {
        const bearer = token?.replace(/^Bearer\s+/i, '');
        if (!bearer || !lookupPrincipal(bearer)) {
            return { error: 'Unauthorized' };
        }
        const note = new Note();
        note.title = String(data?.['title'] ?? '');
        note.body = String(data?.['body'] ?? '');
        entityManager.persist(note);
        return { note };
    }
}
