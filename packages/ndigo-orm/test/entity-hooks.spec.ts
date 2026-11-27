/**
 */
import '@tsmetadata/polyfill';
import { describe, test, expect } from 'vitest';
import {
    column,
    entity,
    generatedColumn,
    postLoad,
    prePersist,
    preUpdate,
    postRemove,
    primaryColumn,
} from '../src/decorators';
import { runEntityHooks } from '../src/entity-hooks';

// One runner backs both InMemoryEntityManager and DrizzleEntityManager.
@entity()
class HookedNote {
    @generatedColumn()
    @primaryColumn()
    id: number | undefined;

    @column()
    body = '';

    events: string[] = [];

    @prePersist()
    onFirstPrePersist(): void {
        this.events.push('prePersist:first');
    }

    @prePersist()
    onSecondPrePersist(): void {
        this.events.push('prePersist:second');
    }

    @postLoad()
    onPostLoad(): void {
        this.events.push('postLoad');
    }

    @preUpdate()
    onPreUpdate(): void {
        this.events.push('preUpdate');
    }

    @postRemove()
    onPostRemove(): void {
        this.events.push('postRemove');
    }
}

describe('runEntityHooks', () => {
    test('invokes only the hooks registered for the event, bound to the entity', () => {
        const note = new HookedNote();

        runEntityHooks(note, 'preUpdate');

        expect(note.events).toEqual(['preUpdate']);
    });

    test('runs multiple hooks for one event in declaration order', () => {
        const note = new HookedNote();

        runEntityHooks(note, 'prePersist');

        expect(note.events).toEqual(['prePersist:first', 'prePersist:second']);
    });

    test('keeps each event independent', () => {
        const note = new HookedNote();

        runEntityHooks(note, 'prePersist');
        runEntityHooks(note, 'postLoad');
        runEntityHooks(note, 'postRemove');

        expect(note.events).toEqual(['prePersist:first', 'prePersist:second', 'postLoad', 'postRemove']);
    });

    test('skips a registered hook whose method is missing at runtime', () => {
        const note = new HookedNote();
        Object.defineProperty(note, 'onFirstPrePersist', { value: undefined });

        expect(() => runEntityHooks(note, 'prePersist')).not.toThrow();
        expect(note.events).toEqual(['prePersist:second']);
    });
});
