/**
 * @module blue-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDataSource } from '../src/data-source';
import { column, entity, generated, manyToOne, oneToMany, primaryColumn } from '../src/decorators';
import { InMemoryEntityManager } from '../src/entity-manager';
import { InMemoryDerivedQueryRepository } from '../src/repository';

@entity('rel_authors')
class RelAuthor {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    @oneToMany(() => RelNote, { inverseJoinColumn: 'authorId' })
    notes: RelNote[] = [];

    constructor(name: string) {
        this.name = name;
    }
}

@entity('rel_notes')
class RelNote {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    title: string;

    @column({ nullable: true })
    authorId: number | undefined;

    @manyToOne(() => RelAuthor, { joinColumn: 'authorId' })
    author: RelAuthor | undefined;

    constructor(title: string, authorId: number | undefined) {
        this.title = title;
        this.authorId = authorId;
    }
}

@entity('bad_notes')
class BadRelNote {
    @primaryColumn()
    id: number | undefined;

    @manyToOne(() => RelAuthor, { joinColumn: 'missing' })
    author: RelAuthor | undefined;
}

@entity('loose_notes')
class LooseRelNote {
    @primaryColumn()
    id: number | undefined;

    @manyToOne(() => RelAuthor)
    author: RelAuthor | undefined;
}

class AuthorRepository extends InMemoryDerivedQueryRepository<RelAuthor, number> {}
class NoteRepository extends InMemoryDerivedQueryRepository<RelNote, number> {}
class BadNoteRepository extends InMemoryDerivedQueryRepository<BadRelNote, number> {}
class LooseNoteRepository extends InMemoryDerivedQueryRepository<LooseRelNote, number> {}

describe('relation fetch (Wave 3)', () => {
    let entityManager: InMemoryEntityManager;
    let authors: AuthorRepository;
    let notes: NoteRepository;
    let adaId: number;

    beforeEach(() => {
        const dataSource = new InMemoryDataSource();
        entityManager = new InMemoryEntityManager(dataSource);
        authors = new AuthorRepository(RelAuthor, entityManager);
        notes = new NoteRepository(RelNote, entityManager);

        const ada = new RelAuthor('Ada');
        entityManager.persist(ada);
        adaId = ada.id as number;

        entityManager.persist(new RelNote('First', ada.id));
        entityManager.persist(new RelNote('Second', ada.id));
    });

    it('loads many-to-one eagerly via findById options', () => {
        const note = notes.findById(1, { relations: ['author'] });

        expect(note?.author).toBeInstanceOf(RelAuthor);
        expect(note?.author?.name).toBe('Ada');
    });

    it('loads one-to-many eagerly via findAll options', () => {
        const found = authors.findAll({ relations: ['notes'] });

        expect(found).toHaveLength(1);
        expect(found[0].notes.map((note) => note.title)).toEqual(['First', 'Second']);
    });

    it('loads one-to-many eagerly via findById options', () => {
        const ada = authors.findById(adaId, { relations: ['notes'] });

        expect(ada?.notes.map((note) => note.title)).toEqual(['First', 'Second']);
    });

    it('lazily loads relations with loadRelation, assigning the field', () => {
        const note = notes.findById(1) as RelNote;
        expect(note.author).toBeUndefined();

        const author = notes.loadRelation(note, 'author');
        expect(author).toBeInstanceOf(RelAuthor);
        expect(note.author?.name).toBe('Ada');
    });

    it('returns undefined for unset join values and [] when nothing matches', () => {
        entityManager.persist(new RelNote('Orphan', undefined));

        const orphan = notes.findById(3, { relations: ['author'] }) as RelNote;
        expect(orphan.author).toBeUndefined();

        const grace = new RelAuthor('Grace');
        entityManager.persist(grace);
        const graceWithNotes = authors.findById(grace.id as number, { relations: ['notes'] });
        expect(graceWithNotes?.notes).toEqual([]);
    });

    it('fails loud on unknown relation names', () => {
        expect(() => notes.findById(1, { relations: ['nope'] })).toThrow("declares no relation 'nope'");
    });

    it('fails loud when the join column is not a declared @column', () => {
        const badNotes = new BadNoteRepository(BadRelNote, entityManager);
        const bad = new BadRelNote();
        bad.id = 1;
        entityManager.persist(bad);

        expect(() => badNotes.findById(1, { relations: ['author'] })).toThrow(
            "join column 'missing' is not a declared @column"
        );
    });

    it('fails loud when a relation declares neither join column side', () => {
        const looseNotes = new LooseNoteRepository(LooseRelNote, entityManager);
        const loose = new LooseRelNote();
        loose.id = 1;
        entityManager.persist(loose);

        expect(() => looseNotes.findById(1, { relations: ['author'] })).toThrow(
            'declares neither joinColumn nor inverseJoinColumn'
        );
    });
});
