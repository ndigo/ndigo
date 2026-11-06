/**
 * Conduit persistence entities — accounts, articles, comments, follows and
 * favorites, mapped through `@ndigo/orm` metadata so the column declarations
 * are also the wire-validation source of truth (AD-07/AD-38).
 *
 * Every relation is stored as an explicit foreign-key column plus its own
 * row entity (a favorite is a row, a follow is a row): the RealWorld API
 * exposes both as collections with counts, which the in-memory manager
 * cannot express as a derived relation.
 */
import '@tsmetadata/polyfill';
import { z } from 'zod';
import { column, entity, generatedColumn, prePersist, preUpdate, primaryColumn } from '@ndigo/orm';

/**
 * A registered Conduit account.
 *
 * `passwordHash` is a PHC-style `{scrypt}…` string produced by
 * `@ndigo/auth-core`'s `DelegatingPasswordEncoder`; the raw password is never
 * stored and never leaves the register/login handlers.
 */
@entity('conduit_users')
export class User {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: z.string().min(1) })
    username!: string;

    @column({ type: 'varchar', schema: z.string().min(1) })
    email!: string;

    @column({ type: 'varchar', schema: z.string().min(1) })
    passwordHash!: string;

    @column({ type: 'text', nullable: true })
    bio!: string | null;

    @column({ type: 'varchar', nullable: true })
    image!: string | null;

    @column({ type: 'varchar' })
    createdAt!: string;

    /** Stamps the creation time on the first persist. */
    @prePersist()
    onPrePersist(): void {
        if (!this.createdAt) {
            this.createdAt = new Date().toISOString();
        }
    }
}

/** A published article. `slug` is derived from `title` and kept unique. */
@entity('conduit_articles')
export class Article {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: z.string().min(1) })
    slug!: string;

    @column({ type: 'varchar', schema: z.string().min(1) })
    title!: string;

    @column({ type: 'text' })
    description!: string;

    @column({ type: 'text' })
    body!: string;

    @column({ type: 'json', schema: z.array(z.string()) })
    tagList!: string[];

    @column({ type: 'int' })
    authorId!: number;

    @column({ type: 'varchar' })
    createdAt!: string;

    @column({ type: 'varchar' })
    updatedAt!: string;

    /** Stamps both timestamps on insert. */
    @prePersist()
    onPrePersist(): void {
        const now = new Date().toISOString();
        if (!this.createdAt) {
            this.createdAt = now;
        }
        if (!this.updatedAt) {
            this.updatedAt = now;
        }
    }

    /** Advances `updatedAt` on every subsequent persist. */
    @preUpdate()
    onPreUpdate(): void {
        this.updatedAt = new Date().toISOString();
    }
}

/** A comment on an article. */
@entity('conduit_comments')
export class Comment {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'text' })
    body!: string;

    @column({ type: 'int' })
    articleId!: number;

    @column({ type: 'int' })
    authorId!: number;

    @column({ type: 'varchar' })
    createdAt!: string;

    @column({ type: 'varchar' })
    updatedAt!: string;

    /** Stamps both timestamps on insert (comments are not editable). */
    @prePersist()
    onPrePersist(): void {
        const now = new Date().toISOString();
        if (!this.createdAt) {
            this.createdAt = now;
        }
        if (!this.updatedAt) {
            this.updatedAt = now;
        }
    }
}

/** One account's favorite of one article (the pair is unique by construction). */
@entity('conduit_favorites')
export class Favorite {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'int' })
    userId!: number;

    @column({ type: 'int' })
    articleId!: number;
}

/** One account following another. */
@entity('conduit_follows')
export class Follow {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'int' })
    followerId!: number;

    @column({ type: 'int' })
    followingId!: number;
}
