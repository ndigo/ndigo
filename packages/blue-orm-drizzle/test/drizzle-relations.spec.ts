/**
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { describe, test, expect } from 'vitest';
import { entity, generated, primaryColumn, column, manyToOne, oneToMany } from '@blue/orm';
import { DrizzleDataSource } from '../src/drizzle-data-source';
import { DrizzleEntityManager } from '../src/drizzle-entity-manager';
import { DrizzleRepository } from '../src/drizzle-repository';

@entity('drizzle_rel_authors')
class DrizzleRelAuthor {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    @oneToMany(() => DrizzleRelNote, { inverseJoinColumn: 'authorId' })
    notes: DrizzleRelNote[] = [];

    constructor(name: string) {
        this.name = name;
    }
}

@entity('drizzle_rel_notes')
class DrizzleRelNote {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    title: string;

    @column({ nullable: true })
    authorId: number | undefined;

    @manyToOne(() => DrizzleRelAuthor, { joinColumn: 'authorId' })
    author: DrizzleRelAuthor | undefined;

    constructor(title: string, authorId: number | undefined) {
        this.title = title;
        this.authorId = authorId;
    }
}

class AuthorRepository extends DrizzleRepository<DrizzleRelAuthor, number> {}
class NoteRepository extends DrizzleRepository<DrizzleRelNote, number> {}

async function seeded(): Promise<{ authors: AuthorRepository; notes: NoteRepository; adaId: number }> {
    const dataSource = new DrizzleDataSource({ url: ':memory:' });
    await dataSource.init([DrizzleRelAuthor, DrizzleRelNote]);
    const entityManager = new DrizzleEntityManager(dataSource);
    const authors = new AuthorRepository(DrizzleRelAuthor, entityManager);
    const notes = new NoteRepository(DrizzleRelNote, entityManager);

    const ada = new DrizzleRelAuthor('Ada');
    await authors.save(ada);

    await notes.save(new DrizzleRelNote('First', ada.id));
    await notes.save(new DrizzleRelNote('Second', ada.id));
    await notes.save(new DrizzleRelNote('Orphan', undefined));

    return { authors, notes, adaId: ada.id as number };
}

describe('DrizzleRepository relation fetch (Wave 3)', () => {
    test('loads many-to-one eagerly via findById options', async () => {
        const { notes } = await seeded();

        const note = await notes.findById(1, { relations: ['author'] });

        expect(note?.author).toBeInstanceOf(DrizzleRelAuthor);
        expect(note?.author?.name).toBe('Ada');
    });

    test('loads one-to-many eagerly via findById and findAll options', async () => {
        const { authors, adaId } = await seeded();

        const ada = await authors.findById(adaId, { relations: ['notes'] });
        expect(ada?.notes.map((note) => note.title)).toEqual(['First', 'Second']);

        const all = await authors.findAll({ relations: ['notes'] });
        expect(all[0].notes.map((note) => note.title)).toEqual(['First', 'Second']);
    });

    test('lazily loads relations with loadRelation, assigning the field', async () => {
        const { authors, adaId } = await seeded();

        const ada = (await authors.findById(adaId)) as DrizzleRelAuthor;
        expect(ada.notes).toEqual([]);

        const notes = await authors.loadRelation(ada, 'notes');
        expect(notes).toBeInstanceOf(Array);
        expect((notes as DrizzleRelNote[]).map((note) => note.title)).toEqual(['First', 'Second']);
        expect(ada.notes.map((note) => note.title)).toEqual(['First', 'Second']);
    });

    test('returns undefined for unset join values and [] when nothing matches', async () => {
        const { authors, notes } = await seeded();

        const orphan = await notes.findById(3, { relations: ['author'] });
        expect(orphan?.author).toBeUndefined();

        const grace = new DrizzleRelAuthor('Grace');
        await authors.save(grace);
        const graceWithNotes = await authors.findById(grace.id as number, { relations: ['notes'] });
        expect(graceWithNotes?.notes).toEqual([]);
    });

    test('fails loud on unknown relation names', async () => {
        const { notes } = await seeded();

        await expect(notes.findById(1, { relations: ['nope'] })).rejects.toThrow("declares no relation 'nope'");
    });
});
