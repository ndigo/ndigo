/**
 * The models the controllers hand to the views.
 *
 * These are the render contracts: a controller builds one of these from the
 * service signals (or the route), and the matching web component renders it.
 * Keeping them in one module means a field cannot be added to a controller and
 * forgotten by its view, or vice versa.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import type {
    ConduitArticle,
    ConduitArticleSummary,
    ConduitComment,
    ConduitErrors,
    ConduitProfile,
} from '../lib/api/conduit-types';
import type { ConduitFeedTab, ConduitProfileTab, ConduitSessionModel } from '../services';

/** The home feed page (`#/`). */
export interface HomeModel extends Record<string, unknown> {
    session: ConduitSessionModel;
    tab: ConduitFeedTab;
    tag: string | null;
    page: number;
    pageCount: number;
    articles: ConduitArticleSummary[];
    tags: string[];
    error: string | null;
}

/** Which form the auth page is showing. */
export type AuthPage = 'login' | 'register';

/** The login and register pages (`#/login`, `#/register`). */
export interface AuthModel extends Record<string, unknown> {
    page: AuthPage;
    session: ConduitSessionModel;
    errors: ConduitErrors | null;
}

/** The settings page (`#/settings`). */
export interface SettingsModel extends Record<string, unknown> {
    session: ConduitSessionModel;
    errors: ConduitErrors | null;
}

/**
 * The editor (`#/editor`, `#/editor/:slug`).
 *
 * `article` is the article being edited (`null` when publishing a new one);
 * `notFound` distinguishes an unknown slug from an empty draft.
 */
export interface EditorModel extends Record<string, unknown> {
    session: ConduitSessionModel;
    slug: string | null;
    article: ConduitArticle | null;
    notFound: boolean;
    errors: ConduitErrors | null;
}

/** The article page (`#/article/:slug`). */
export interface ArticleModel extends Record<string, unknown> {
    session: ConduitSessionModel;
    article: ConduitArticle | null;
    notFound: boolean;
    comments: ConduitComment[];
    commentErrors: ConduitErrors | null;
}

/** The profile page (`#/profile/:username`, `#/profile/:username/favorited`). */
export interface ProfileModel extends Record<string, unknown> {
    session: ConduitSessionModel;
    profile: ConduitProfile | null;
    tab: ConduitProfileTab;
    page: number;
    pageCount: number;
    articles: ConduitArticleSummary[];
    notFound: boolean;
    error: string | null;
}
