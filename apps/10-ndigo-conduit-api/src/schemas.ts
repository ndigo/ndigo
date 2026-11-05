/**
 * Request schemas for the Conduit API.
 *
 * These are the framework's Zod validation contracts (AD-07) bound through
 * `validatedBody`/`validatedQuery`: failures never reach a handler, and the
 * app's `ConduitValidationErrorResolver` renders them as the RealWorld
 * `{errors:{field:[…]}}` envelope. Messages are authored here so they match
 * the reference implementation's wording ("can't be blank", "is invalid").
 *
 * Each payload schema mirrors the wire shape (`{user: …}`, `{article: …}`), so
 * the bound handler argument *is* the request body and no re-shaping step
 * exists between validation and use.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { z } from 'zod';

/** The message the RealWorld collection asserts for a missing/blank field. */
const CANNOT_BE_BLANK = "can't be blank";

/** The message used for a present-but-unusable value (bad email, bad paging). */
const IS_INVALID = 'is invalid';

/** A practical email shape check — the spec declares `type: string` only. */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A required string: blank and whitespace-only values fail as `can't be blank`.
 *
 * @returns The field schema.
 */
const requiredText = (): z.ZodString => z.string({ error: CANNOT_BE_BLANK }).trim().min(1, CANNOT_BE_BLANK);

/**
 * A required email address.
 *
 * @returns The field schema.
 */
const requiredEmail = (): z.ZodString => requiredText().regex(emailPattern, IS_INVALID);

/**
 * A nullable, optional free-text field (`bio`, `image`). The spec's own
 * collection pins the normalization: setting either to `""` clears it, so the
 * transform folds empty/whitespace strings to `null` (and `undefined` still
 * means "leave unchanged").
 */
const nullableText = () =>
    z
        .string({ error: CANNOT_BE_BLANK })
        .nullable()
        .optional()
        .transform((value) => (typeof value === 'string' && value.trim() === '' ? null : value));

/**
 * The paging window shared by the article list and the feed. Values arrive as
 * query strings, so coercion runs before the bounds checks; anything
 * non-numeric or out of range reports `is invalid`.
 */
const pagingShape = {
    limit: z.coerce.number({ error: IS_INVALID }).int(IS_INVALID).min(1, IS_INVALID).default(20),
    offset: z.coerce.number({ error: IS_INVALID }).int(IS_INVALID).min(0, IS_INVALID).default(0),
};

/** `POST /api/users` body. */
export const registerUserSchema = z.object({
    user: z.object(
        {
            username: requiredText(),
            email: requiredEmail(),
            password: requiredText(),
        },
        { error: CANNOT_BE_BLANK }
    ),
});

/** `POST /api/users/login` body. */
export const loginUserSchema = z.object({
    user: z.object(
        {
            email: requiredEmail(),
            password: requiredText(),
        },
        { error: CANNOT_BE_BLANK }
    ),
});

/** `PUT /api/user` body — every field is optional (absent = unchanged). */
export const updateUserSchema = z.object({
    user: z.object(
        {
            username: requiredText().optional(),
            email: requiredEmail().optional(),
            password: requiredText().optional(),
            bio: nullableText(),
            image: nullableText(),
        },
        { error: CANNOT_BE_BLANK }
    ),
});

/** `POST /api/articles` body. */
export const newArticleSchema = z.object({
    article: z.object(
        {
            title: requiredText(),
            description: requiredText(),
            body: requiredText(),
            tagList: z.array(z.string()).optional(),
        },
        { error: CANNOT_BE_BLANK }
    ),
});

/** `PUT /api/articles/:slug` body — every field is optional. */
export const updateArticleSchema = z.object({
    article: z.object(
        {
            title: requiredText().optional(),
            description: requiredText().optional(),
            body: requiredText().optional(),
            tagList: z.array(z.string()).optional(),
        },
        { error: CANNOT_BE_BLANK }
    ),
});

/** `POST /api/articles/:slug/comments` body. */
export const newCommentSchema = z.object({
    comment: z.object({ body: requiredText() }, { error: CANNOT_BE_BLANK }),
});

/** `GET /api/articles` query — the tag/author/favorited filters plus paging. */
export const articleFilterSchema = z.object({
    tag: z.string().optional(),
    author: z.string().optional(),
    favorited: z.string().optional(),
    ...pagingShape,
});

/** `GET /api/articles/feed` query — paging only. */
export const feedFilterSchema = z.object({ ...pagingShape });

/** The validated `POST /api/users` body. */
export type RegisterUserBody = z.infer<typeof registerUserSchema>;

/** The validated `POST /api/users/login` body. */
export type LoginUserBody = z.infer<typeof loginUserSchema>;

/** The validated `PUT /api/user` body. */
export type UpdateUserBody = z.infer<typeof updateUserSchema>;

/** The validated `POST /api/articles` body. */
export type NewArticleBody = z.infer<typeof newArticleSchema>;

/** The validated `PUT /api/articles/:slug` body. */
export type UpdateArticleBody = z.infer<typeof updateArticleSchema>;

/** The validated `POST /api/articles/:slug/comments` body. */
export type NewCommentBody = z.infer<typeof newCommentSchema>;

/** The validated `GET /api/articles` query. */
export type ArticleFilter = z.infer<typeof articleFilterSchema>;

/** The validated `GET /api/articles/feed` query. */
export type FeedFilter = z.infer<typeof feedFilterSchema>;
