/**
 * The two vocabularies an interaction travels through, and the map between them.
 *
 * A view is a custom element with no container access: it can only `emit` a DOM
 * event. `DOMElementViewTarget` bridges a *declared* set of those events into
 * application-context events (`setEventMap`), and the service layer listens on
 * the context side. Keeping the two names in one module makes the bridge
 * auditable — {@link CONDUIT_EVENT_MAP} is the complete list of what a view can
 * ask the app to do, and nothing else can cross.
 *
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ConduitFeedTab } from '../services';

/** DOM event names emitted by views. */
export const ACTIONS = {
    authLogin: 'action:auth:login',
    authRegister: 'action:auth:register',
    authLogout: 'action:auth:logout',
    settingsSave: 'action:settings:save',
    feedTab: 'action:feed:tab',
    feedTag: 'action:feed:tag',
    feedPage: 'action:feed:page',
    articleFavorite: 'action:article:favorite',
    articleSave: 'action:article:save',
    articleDelete: 'action:article:delete',
    commentAdd: 'action:comment:add',
    commentRemove: 'action:comment:remove',
    authorFollow: 'action:author:follow',
    profilePage: 'action:profile:page',
} as const;

/** Application-context event names the service layer handles. */
export const CONDUIT_EVENTS = {
    authLogin: 'conduit:auth:login',
    authRegister: 'conduit:auth:register',
    authLogout: 'conduit:auth:logout',
    settingsSave: 'conduit:settings:save',
    feedTab: 'conduit:feed:tab',
    feedTag: 'conduit:feed:tag',
    feedPage: 'conduit:feed:page',
    articleFavorite: 'conduit:article:favorite',
    articleSave: 'conduit:article:save',
    articleDelete: 'conduit:article:delete',
    commentAdd: 'conduit:comment:add',
    commentRemove: 'conduit:comment:remove',
    authorFollow: 'conduit:author:follow',
    profilePage: 'conduit:profile:page',
} as const;

/** The view-event → context-event bridge handed to the view target. */
export const CONDUIT_EVENT_MAP: Record<string, string> = {
    [ACTIONS.authLogin]: CONDUIT_EVENTS.authLogin,
    [ACTIONS.authRegister]: CONDUIT_EVENTS.authRegister,
    [ACTIONS.authLogout]: CONDUIT_EVENTS.authLogout,
    [ACTIONS.settingsSave]: CONDUIT_EVENTS.settingsSave,
    [ACTIONS.feedTab]: CONDUIT_EVENTS.feedTab,
    [ACTIONS.feedTag]: CONDUIT_EVENTS.feedTag,
    [ACTIONS.feedPage]: CONDUIT_EVENTS.feedPage,
    [ACTIONS.articleFavorite]: CONDUIT_EVENTS.articleFavorite,
    [ACTIONS.articleSave]: CONDUIT_EVENTS.articleSave,
    [ACTIONS.articleDelete]: CONDUIT_EVENTS.articleDelete,
    [ACTIONS.commentAdd]: CONDUIT_EVENTS.commentAdd,
    [ACTIONS.commentRemove]: CONDUIT_EVENTS.commentRemove,
    [ACTIONS.authorFollow]: CONDUIT_EVENTS.authorFollow,
    [ACTIONS.profilePage]: CONDUIT_EVENTS.profilePage,
};

/** Payload of the login action. */
export interface AuthLoginPayload {
    email: string;
    password: string;
}

/** Payload of the registration action. */
export interface AuthRegisterPayload {
    username: string;
    email: string;
    password: string;
}

/** Payload of the settings form. */
export interface SettingsSavePayload {
    username: string;
    email: string;
    password: string;
    bio: string;
    image: string;
}

/** Payload of an article write (create when `slug` is `null`). */
export interface ArticleSavePayload {
    slug: string | null;
    title: string;
    description: string;
    body: string;
    tagList: string[];
}

/** Payload identifying one article. */
export interface ArticleRefPayload {
    slug: string;
}

/** Payload of a favorite toggle: the article and the state to move it to. */
export interface ArticleFavoritePayload {
    slug: string;
    favorited: boolean;
}

/** Payload identifying one comment. */
export interface CommentRefPayload {
    slug: string;
    id: number;
}

/** Payload of a comment write. */
export interface CommentAddPayload {
    slug: string;
    body: string;
}

/** Payload identifying one profile. */
export interface AuthorRefPayload {
    username: string;
}

/** Payload of a profile follow/unfollow action. */
export interface AuthorFollowPayload {
    username: string;
    following: boolean;
}

/** Payload of a feed tab selection. */
export interface FeedTabPayload {
    tab: ConduitFeedTab;
}

/** Payload of a tag filter selection; `null` clears the filter. */
export interface FeedTagPayload {
    tag: string | null;
}

/** Payload of a pagination click. */
export interface PagePayload {
    page: number;
}
